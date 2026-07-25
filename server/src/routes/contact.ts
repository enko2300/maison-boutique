import { Router } from 'express';
import { emailService } from '../services/email.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Send auto-reply
    emailService.sendContactReply(email, subject, message);

    console.log('=== Nouveau message de contact ===');
    console.log(`Nom: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Message: ${message}`);
    console.log('==================================');

    res.json({ success: true, message: 'Message envoyé avec succès' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
