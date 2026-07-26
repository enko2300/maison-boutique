import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = Router();
router.use(authMiddleware);

// Serve invoice PDF - only if user owns the order
router.get('/:filename', async (req, res) => {
  try {
    const filename = String(req.params.filename);
    
    // Extract order ID from filename: facture-{last8chars}.pdf
    const match = filename.match(/^facture-([a-z0-9]+)\.pdf$/);
    if (!match) {
      return res.status(400).json({ error: 'Nom de fichier invalide' });
    }

    const orderIdSuffix = match[1];

    // Find the order that matches this invoice
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });

    const matchingOrder = orders.find(o => o.id.endsWith(orderIdSuffix));
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
