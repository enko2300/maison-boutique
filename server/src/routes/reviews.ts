import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get reviews for a product
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const productId = String(req.params.productId);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    res.json({ reviews, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Get review stats for a product
router.get('/products/:productId/review-stats', async (req, res) => {
  try {
    const productId = String(req.params.productId);
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    res.json({ avg: Math.round(avg * 10) / 10, count, distribution });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Create a review (auth required)
router.post('/products/:productId/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user!.userId;
    const productId = String(req.params.productId);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Note invalide (1-5)' });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      return res.status(400).json({ error: 'Vous avez déjà avisé ce produit' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });

    const review = await prisma.review.create({
      data: { userId, productId, rating, comment: comment || null },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json(review);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Delete own review (auth required)
router.delete('/reviews/:id', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id);
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: 'Avis introuvable' });
    if (review.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres avis' });
    }
    await prisma.review.delete({ where: { id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
