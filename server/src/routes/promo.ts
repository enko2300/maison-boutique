import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';
import { parseProduct } from '../utils.js';

const router = Router();

// Validate a promo code (public)
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Code promo requis' });

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) return res.status(404).json({ error: 'Code promo introuvable' });
    if (!promo.active) return res.status(400).json({ error: 'Code promo désactivé' });
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Code promo expiré' });
    }
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ error: 'Code promo déjà utilisé' });
    }
    if (subtotal < promo.minOrder) {
      return res.status(400).json({
        error: `Montant minimum : ${promo.minOrder.toFixed(2)} €`,
      });
    }

    let discount = 0;
    if (promo.discountType === 'percent') {
      discount = (subtotal * promo.discount) / 100;
    } else {
      discount = Math.min(promo.discount, subtotal);
    }

    res.json({
      valid: true,
      code: promo.code,
      discount: Math.round(discount * 100) / 100,
      discountType: promo.discountType,
      finalTotal: Math.round((subtotal - discount) * 100) / 100,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Admin routes
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Accès interdit' });
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(promos);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/admin', authMiddleware, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Accès interdit' });
    const { code, discount, discountType, minOrder, maxUses, expiresAt } = req.body;

    if (!code || !discount) return res.status(400).json({ error: 'Code et discount requis' });

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discount,
        discountType: discountType || 'percent',
        minOrder: minOrder || 0,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    res.status(201).json(promo);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Ce code existe déjà' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Accès interdit' });
    const id = String(req.params.id);
    await prisma.promoCode.delete({ where: { id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
