import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';
import { mockCheckout } from '../services/payment.js';
import { generateInvoice } from '../services/invoice.js';
import { emailService } from '../services/email.js';
import { parseProduct } from '../utils.js';

const router = Router();
router.use(authMiddleware);

function parseOrder(o: any) {
  return {
    ...o,
    items: o.items?.map((i: any) => ({ ...i, product: parseProduct(i.product) })),
  };
}

router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map(parseOrder));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const { promoCode } = req.body;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) return res.status(400).json({ error: 'Panier vide' });

    // Check stock for each item
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuffisant pour "${item.product.name}" (${item.product.stock} restant${item.product.stock > 1 ? 's' : ''})`,
        });
      }
    }

    let subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;
    let promoCodeId = null;

    // Apply promo code if provided
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      });

      if (promo && promo.active) {
        const notExpired = !promo.expiresAt || new Date(promo.expiresAt) >= new Date();
        const notMaxed = !promo.maxUses || promo.usedCount < promo.maxUses;
        const minMet = subtotal >= promo.minOrder;

        if (notExpired && notMaxed && minMet) {
          if (promo.discountType === 'percent') {
            discount = (subtotal * promo.discount) / 100;
          } else {
            discount = Math.min(promo.discount, subtotal);
          }
          discount = Math.round(discount * 100) / 100;
          promoCodeId = promo.id;

          // Increment used count
          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const total = Math.round((subtotal - discount) * 100) / 100;

    // Decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId: req.user!.userId,
          total,
          discount,
          promoCodeId,
          status: 'PAID',
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });

    // Generate invoice PDF
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const parsedOrder = parseOrder(order);

    const invoicePath = await generateInvoice({
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      customerName: user?.name || 'Client',
      customerEmail: user?.email || '',
      items: parsedOrder.items.map((i: any) => ({
        name: i.product.name,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.price,
      })),
      total,
    });

    const invoiceFile = invoicePath.split('/').pop();
    const payment = mockCheckout(
      cartItems.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }))
    );

    res.json({
      order: parsedOrder,
      payment,
      invoiceUrl: `/invoices/${invoiceFile}`,
      discount,
      promoCode: promoCode ? promoCode.toUpperCase() : null,
    });

    // Send confirmation email (fire and forget)
    if (user?.email) {
      emailService.sendOrderConfirmation(
        user.email,
        user.name,
        order.id,
        parsedOrder.items.map((i: any) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total,
        discount,
        `/invoices/${invoiceFile}`
      );
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
