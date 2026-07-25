import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:filename', authMiddleware, (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    const filePath = path.join(process.cwd(), 'uploads', String(req.params.filename));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
