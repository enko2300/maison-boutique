import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const INK = '#111111';
const MUTED = '#666666';
const LIGHT = '#DDDDDD';
const ACCENT = '#1A1A1A';
const FAINT = '#F5F5F5';

interface InvoiceItem {
  name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  total: number;
}

function drawRule(doc: PDFKit.PDFDocument, x1: number, y: number, x2: number, color = LIGHT, width = 0.5) {
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(width).strokeColor(color).stroke();
}

export function generateInvoice(data: InvoiceData): Promise<string> {
  return new Promise((resolve, reject) => {
    const invoicesDir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const fileName = `facture-${data.orderId.slice(-8)}.pdf`;
    const filePath = path.join(invoicesDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const pageW = 595;
    const M = 50; // margin
    const contentW = pageW - M * 2;
    let y = M;

    // ═══════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════

    // Brand
    doc.font('Helvetica-Bold').fontSize(28).fillColor(INK);
    doc.text('BOUCLOR', M, y, { continued: true });
    doc.font('Helvetica').fontSize(28).fillColor(MUTED);
    doc.text('', { continued: false });

    y += 36;
    doc.font('Helvetica').fontSize(7).fillColor(MUTED);
    doc.text('MODE  ·  VÊTEMENTS  ·  ACCESSOIRES', M, y, { characterSpacing: 3 });

    // Thin accent line under brand
    y += 18;
    drawRule(doc, M, y, M + 40, INK, 1.2);

    y += 28;

    // ═══════════════════════════════════════════════════════
    // INVOICE TITLE + META
    // ═══════════════════════════════════════════════════════

    // Left: FACTURE
    doc.font('Helvetica-Bold').fontSize(18).fillColor(INK);
    doc.text('FACTURE', M, y);

    // Right: Invoice details
    const rightX = pageW - M - 160;
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('N° de facture', rightX, y + 2, { width: 80, align: 'left' });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(INK);
    doc.text(data.orderId.slice(-8).toUpperCase(), rightX + 82, y + 1, { width: 80, align: 'right' });

    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('Date', rightX, y + 18, { width: 80, align: 'left' });
    doc.font('Helvetica').fontSize(9).fillColor(INK);
    doc.text(data.date, rightX + 82, y + 17, { width: 80, align: 'right' });

    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('Statut', rightX, y + 34, { width: 80, align: 'left' });
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#166534');
    doc.text('PAYÉ', rightX + 82, y + 33, { width: 80, align: 'right' });

    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('Échéance', rightX, y + 50, { width: 80, align: 'left' });
    doc.font('Helvetica').fontSize(9).fillColor(INK);
    doc.text('Immédiate', rightX + 82, y + 49, { width: 80, align: 'right' });

    y += 72;

    // ═══════════════════════════════════════════════════════
    // FROM / TO
    // ═══════════════════════════════════════════════════════

    drawRule(doc, M, y, pageW - M, LIGHT, 0.25);
    y += 16;

    // FROM
    doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED);
    doc.text('EXPÉDITEUR', M, y, { characterSpacing: 2 });
    y += 14;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(INK);
    doc.text('BOUCLOR', M, y);
    y += 13;
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('12 Rue de la Paix', M, y);
    y += 11;
    doc.text('75002 Paris, France', M, y);
    y += 11;
    doc.text('contact@bouclor.com', M, y);
    y += 11;
    doc.text('+33 1 23 45 67 89', M, y);

    // TO
    const toY = y - 48;
    doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED);
    doc.text('DESTINATAIRE', M + 250, toY, { characterSpacing: 2 });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(INK);
    doc.text(data.customerName, M + 250, toY + 14);
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text(data.customerEmail, M + 250, toY + 27);

    y += 24;

    // ═══════════════════════════════════════════════════════
    // TABLE
    // ═══════════════════════════════════════════════════════

    y += 8;
    drawRule(doc, M, y, pageW - M, LIGHT, 0.25);
    y += 14;

    // Table header
    const col = { desc: M, qty: M + 280, unit: M + 340, total: M + 430 };

    doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED);
    doc.text('DÉSIGNATION', col.desc, y, { characterSpacing: 1 });
    doc.text('QTÉ', col.qty, y, { width: 40, align: 'right' });
    doc.text('PRIX UNIT.', col.unit, y, { width: 70, align: 'right' });
    doc.text('TOTAL', col.total, y, { width: 70, align: 'right' });

    y += 12;
    drawRule(doc, M, y, pageW - M, LIGHT, 0.5);
    y += 10;

    // Items
    for (const item of data.items) {
      const lineTotal = item.price * item.quantity;

      doc.font('Helvetica').fontSize(9).fillColor(INK);
      let desc = item.name;
      if (item.size || item.color) {
        const parts = [item.size, item.color].filter(Boolean).join(' · ');
        desc += `  —  ${parts}`;
      }
      doc.text(desc, col.desc, y, { width: 260 });

      doc.font('Helvetica').fontSize(9).fillColor(MUTED);
      doc.text(String(item.quantity), col.qty, y, { width: 40, align: 'right' });
      doc.text(`${item.price.toFixed(2)} €`, col.unit, y, { width: 70, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(9).fillColor(INK);
      doc.text(`${lineTotal.toFixed(2)} €`, col.total, y, { width: 70, align: 'right' });

      y += 20;
      drawRule(doc, M, y, pageW - M, '#F0F0F0', 0.25);
      y += 6;
    }

    // ═══════════════════════════════════════════════════════
    // TOTALS
    // ═══════════════════════════════════════════════════════

    y += 6;

    // Subtotal
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('Sous-total HT', col.unit - 10, y, { width: 80, align: 'left' });
    doc.text(`${data.total.toFixed(2)} €`, col.total, y, { width: 70, align: 'right' });
    y += 16;

    // TVA
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('TVA (0%)', col.unit - 10, y, { width: 80, align: 'left' });
    doc.text('0,00 €', col.total, y, { width: 70, align: 'right' });
    y += 18;

    // Total line
    drawRule(doc, col.unit - 10, y, pageW - M, INK, 0.75);
    y += 10;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(INK);
    doc.text('TOTAL TTC', col.unit - 10, y, { width: 80, align: 'left' });
    doc.font('Helvetica-Bold').fontSize(13).fillColor(INK);
    doc.text(`${data.total.toFixed(2)} €`, col.total - 5, y - 2, { width: 80, align: 'right' });

    y += 30;

    // ═══════════════════════════════════════════════════════
    // PAYMENT INFO
    // ═══════════════════════════════════════════════════════

    drawRule(doc, M, y, pageW - M, LIGHT, 0.25);
    y += 16;

    doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED);
    doc.text('INFORMATIONS DE PAIEMENT', M, y, { characterSpacing: 2 });
    y += 16;

    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('Mode de paiement', M, y, { width: 120 });
    doc.font('Helvetica').fontSize(8).fillColor(INK);
    doc.text('Carte bancaire (simulation)', M + 120, y);

    y += 14;
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('Référence', M, y, { width: 120 });
    doc.font('Helvetica').fontSize(8).fillColor(INK);
    doc.text(`TXN-${data.orderId.slice(-8).toUpperCase()}`, M + 120, y);

    y += 14;
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text('Statut', M, y, { width: 120 });
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#166534');
    doc.text('Paiement reçu', M + 120, y);

    y += 28;

    // ═══════════════════════════════════════════════════════
    // TERMS
    // ═══════════════════════════════════════════════════════

    drawRule(doc, M, y, pageW - M, LIGHT, 0.25);
    y += 14;

    doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED);
    doc.text('CONDITIONS', M, y, { characterSpacing: 2 });
    y += 14;

    doc.font('Helvetica').fontSize(7).fillColor(MUTED);
    doc.text('• Retours acceptés sous 30 jours. Article non porté avec étiquette d\'origine.', M, y, { width: contentW });
    y += 11;
    doc.text('• Livraison gratuite dès 50€ d\'achat. Délai de livraison : 3 à 5 jours ouvrés.', M, y, { width: contentW });
    y += 11;
    doc.text('• Pour toute question, contactez-nous à contact@bouclor.com ou au +33 1 23 45 67 89.', M, y, { width: contentW });

    // ═══════════════════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════════════════

    const footerY = pageW > 800 ? 760 : 760;

    drawRule(doc, M, footerY, pageW - M, LIGHT, 0.25);
    y = footerY + 14;

    doc.font('Helvetica').fontSize(7).fillColor(MUTED);
    doc.text('BOUCLOR — 12 Rue de la Paix, 75002 Paris — SIRET 123 456 789 00012', M, y, { width: contentW, align: 'center' });
    y += 11;
    doc.text('www.bouclor.com — contact@bouclor.com', M, y, { width: contentW, align: 'center' });

    y += 20;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(INK);
    doc.text('Merci pour votre confiance.', M, y, { width: contentW, align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}
