import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';
import { parseCartItem } from '../utils.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: { product: true },
    });
    res.json(items.map(parseCartItem));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId_size_color: {
          userId: req.user!.userId,
          productId,
          size: size || null,
          color: color || null,
        },
      },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user!.userId, productId, quantity, size, color },
      include: { product: true },
    });
    res.json(parseCartItem(item));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
      include: { product: true },
    });
    res.json(parseCartItem(item));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
