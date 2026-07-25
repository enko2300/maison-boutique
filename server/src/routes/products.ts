import { Router } from 'express';
import { prisma } from '../index.js';
import { parseProduct } from '../utils.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, page = '1', limit = '12' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (search) where.name = { contains: String(search) };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    res.json({ products: products.map(parseProduct), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ where: { featured: true }, take: 8 });
    res.json(products.map(parseProduct));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    res.json(categories.map(c => c.category));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/autocomplete', async (req, res) => {
  try {
    const { q, limit = '6' } = req.query;
    if (!q || String(q).length < 2) return res.json([]);

    const products = await prisma.product.findMany({
      where: { name: { contains: String(q) } },
      take: Number(limit),
      select: { id: true, name: true, price: true, image: true, category: true },
    });
    res.json(products);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(parseProduct(product));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
