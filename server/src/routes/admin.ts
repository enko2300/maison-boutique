import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { parseProduct } from '../utils.js';

const router = Router();
router.use(authMiddleware);
router.use(adminMiddleware);

function parseOrder(o: any) {
  return {
    ...o,
    items: o.items?.map((i: any) => ({ ...i, product: parseProduct(i.product) })),
  };
}

function prepareProductData(data: any) {
  const out = { ...data };
  if (Array.isArray(out.sizes)) out.sizes = JSON.stringify(out.sizes);
  if (Array.isArray(out.colors)) out.colors = JSON.stringify(out.colors);
  // Remove fields that shouldn't be set directly
  delete out.id;
  delete out.createdAt;
  return out;
}

// ═══════════════════════════════════════════════════════
// PRODUCTS — Full CRUD + Search + Batch
// ═══════════════════════════════════════════════════════

// LIST with filters
router.get('/products', async (req, res) => {
  try {
    const { search, category, featured, lowStock, sort, order } = req.query;

    const where: any = {};
    if (search) where.name = { contains: String(search) };
    if (category && category !== 'all') where.category = String(category);
    if (featured === 'true') where.featured = true;
    if (lowStock === 'true') where.stock = { lte: 5 };

    const orderBy: any = {};
    if (sort) orderBy[String(sort)] = order === 'asc' ? 'asc' : 'desc';
    else orderBy.createdAt = 'desc';

    const products = await prisma.product.findMany({ where, orderBy });
    res.json(products.map(parseProduct));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(parseProduct(product));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE
router.post('/products', async (req, res) => {
  try {
    const data = prepareProductData(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json(parseProduct(product));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE (partial)
router.put('/products/:id', async (req, res) => {
  try {
    const data = prepareProductData(req.body);
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(parseProduct(product));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH (alias for update)
router.patch('/products/:id', async (req, res) => {
  try {
    const data = prepareProductData(req.body);
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(parseProduct(product));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE single
router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// BATCH DELETE
router.post('/products/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array requis' });
    }
    const result = await prisma.product.deleteMany({ where: { id: { in: ids } } });
    res.json({ success: true, deleted: result.count });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// BATCH UPDATE — update multiple products at once
router.post('/products/batch-update', async (req, res) => {
  try {
    const { ids, data } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array requis' });
    }
    const updateData = prepareProductData(data);
    const result = await prisma.product.updateMany({ where: { id: { in: ids } }, data: updateData });
    res.json({ success: true, updated: result.count });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// BATCH STOCK ADJUST — add/subtract stock for multiple products
router.post('/products/batch-stock', async (req, res) => {
  try {
    const { ids, adjustment } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array requis' });
    }
    if (typeof adjustment !== 'number') {
      return res.status(400).json({ error: 'adjustment number requis' });
    }
    // Use raw update to atomically adjust stock
    for (const id of ids) {
      await prisma.product.update({
        where: { id },
        data: { stock: { increment: adjustment } },
      });
    }
    res.json({ success: true, adjusted: ids.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// TOGGLE FEATURED
router.post('/products/:id/toggle-featured', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { featured: !product.featured },
    });
    res.json(parseProduct(updated));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DUPLICATE a product
router.post('/products/:id/duplicate', async (req, res) => {
  try {
    const original = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!original) return res.status(404).json({ error: 'Produit introuvable' });
    const { id, createdAt, ...data } = original as any;
    data.name = `${data.name} (copie)`;
    data.stock = 0;
    const product = await prisma.product.create({ data });
    res.status(201).json(parseProduct(product));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════
// ORDERS — Management
// ═══════════════════════════════════════════════════════

// LIST with filters
router.get('/orders', async (req, res) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== 'all') where.status = String(status);

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let filtered = orders.map(parseOrder);
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(o =>
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET single order
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(parseOrder(order));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Statut invalide. Valeurs: ${validStatuses.join(', ')}` });
    }
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════
// USERS — List & manage
// ═══════════════════════════════════════════════════════

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════
// STATS — Enhanced
// ═══════════════════════════════════════════════════════

router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, revenue, lowStockCount, outOfStockCount, categories] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
      prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.groupBy({ by: ['category'], _count: true }),
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      revenue: revenue._sum.total || 0,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      categories: categories.map(c => ({ name: c.category, count: c._count })),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════

router.get('/categories', async (req, res) => {
  try {
    const cats = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
      _avg: { price: true },
      _sum: { stock: true },
    });
    res.json(cats.map(c => ({
      name: c.category,
      count: c._count,
      avgPrice: Math.round((c._avg.price || 0) * 100) / 100,
      totalStock: c._sum.stock || 0,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
