import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = Router();
router.use(authMiddleware);

// Serve invoice PDF - owner or admin can access
router.get('/:filename', async (req, res) => {
  try {
    const filename = String(req.params.filename);
    const isAdmin = req.user!.role === 'ADMIN';

    // Extract order ID from filename: facture-{last8chars}.pdf
    const match = filename.match(/^facture-([a-z0-9]+)\.pdf$/);
    if (!match) {
      return res.status(400).json({ error: 'Nom de fichier invalide' });
    }

    const orderIdSuffix = match[1];

    // Admin can access any invoice, regular user only their own
    let matchingOrder;
    if (isAdmin) {
      const allOrders = await prisma.order.findMany({ select: { id: true } });
      matchingOrder = allOrders.find(o => o.id.endsWith(orderIdSuffix));
    } else {
      const userOrders = await prisma.order.findMany({
        where: { userId: req.user!.userId },
        select: { id: true },
      });
      matchingOrder = userOrders.find(o => o.id.endsWith(orderIdSuffix));
    }

    if (!matchingOrder) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Serve the file
    const filePath = path.join(process.cwd(), 'invoices', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
