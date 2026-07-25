import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || 'MAISON. <noreply@maison-boutique.com>';

function orderConfirmationHtml(userName: string, orderId: string, items: any[], total: number, discount: number, invoiceUrl: string) {
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#666;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right;">${i.price.toFixed(2)} €</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#FAF8F5;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:28px;font-weight:300;color:#1A1A1A;letter-spacing:-0.5px;">MAISON<span style="color:#C9A96E;">.</span></h1>
        </div>
        <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <h2 style="font-size:20px;font-weight:500;color:#1A1A1A;margin:0 0 8px;">Merci pour votre commande !</h2>
          <p style="font-size:14px;color:#666;margin:0 0 24px;">Bonjour ${userName}, votre commande a été confirmée.</p>
          <p style="font-size:12px;color:#999;margin:0 0 16px;">Commande n° ${orderId.slice(-8).toUpperCase()}</p>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px 0;border-bottom:2px solid #1A1A1A;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Produit</th>
                <th style="text-align:center;padding:8px 0;border-bottom:2px solid #1A1A1A;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Qté</th>
                <th style="text-align:right;padding:8px 0;border-bottom:2px solid #1A1A1A;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          ${discount > 0 ? `<div style="margin-top:16px;text-align:right;font-size:14px;color:#16a34a;">Réduction : -${discount.toFixed(2)} €</div>` : ''}
          <div style="margin-top:16px;padding-top:16px;border-top:2px solid #1A1A1A;text-align:right;">
            <span style="font-size:18px;font-weight:600;color:#1A1A1A;">Total : ${total.toFixed(2)} €</span>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${invoiceUrl}" style="display:inline-block;background:#1A1A1A;color:white;padding:12px 24px;border-radius:24px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Voir la facture</a>
          </div>
        </div>
        <p style="text-align:center;font-size:12px;color:#999;margin-top:24px;">MAISON. — Boutique de mode haut de gamme</p>
      </div>
    </body>
    </html>
  `;
}

export const emailService = {
  async sendOrderConfirmation(
    to: string,
    userName: string,
    orderId: string,
    items: any[],
    total: number,
    discount: number,
    invoiceUrl: string
  ) {
    try {
      const fullUrl = `${process.env.BASE_URL || 'http://localhost:5173'}${invoiceUrl}`;
      await transporter.sendMail({
        from: FROM,
        to,
        subject: `MAISON. — Confirmation de commande n°${orderId.slice(-8).toUpperCase()}`,
        html: orderConfirmationHtml(userName, orderId, items, total, discount, fullUrl),
      });
    } catch (e) {
      console.error('Email send failed:', e);
    }
  },

  async sendContactReply(to: string, subject: string, message: string) {
    try {
      await transporter.sendMail({
        from: FROM,
        to,
        subject: `MAISON. — Nous avons reçu votre message`,
        html: `
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;font-family:'Helvetica Neue',Arial,sans-serif;">
            <h2 style="font-size:20px;color:#1A1A1A;">Merci pour votre message</h2>
            <p style="font-size:14px;color:#666;">Nous avons bien reçu votre demande concernant "${subject}". Notre équipe vous répondra sous 24h.</p>
            <p style="font-size:12px;color:#999;margin-top:24px;">MAISON. — Boutique de mode</p>
          </div>
        `,
      });
    } catch (e) {
      console.error('Contact email failed:', e);
    }
  },
};
