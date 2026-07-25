import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';
import { parseProduct } from '../utils.js';

const router = Router();
router.use(authMiddleware);

// Get user's wishlist
router.get('/', async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map(i => ({ ...i, product: parseProduct(i.product) })));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Add to wishlist
router.post('/', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId requis' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user!.userId, productId } },
    });
    if (existing) return res.json(existing);

    const item = await prisma.wishlistItem.create({
      data: { userId: req.user!.userId, productId },
      include: { product: true },
    });
    res.status(201).json({ ...item, product: parseProduct(item.product) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Remove from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.userId, productId: req.params.productId },
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Check which products are in wishlist (bulk)
router.get('/check', async (req, res) => {
  try {
    const { productIds } = req.query;
    if (!productIds) return res.json([]);
    const ids = String(productIds).split(',').filter(Boolean);
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.userId, productId: { in: ids } },
      select: { productId: true },
    });
    res.json(items.map(i => i.productId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
