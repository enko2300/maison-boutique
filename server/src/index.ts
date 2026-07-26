import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';
import { apiLimiter, authLimiter, contactLimiter } from './rateLimit.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import promoRoutes from './routes/promo.js';
import reviewRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const prisma = new PrismaClient();

// Auto-initialize and seed database
async function initDatabase() {
  try {
    logger.info('Initializing database...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    logger.info('Database schema synced');

    // Check if database is empty and seed if needed
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      logger.info('Database empty — seeding...');
      await seedDatabase();
      logger.info('Database seeded successfully');
    } else {
      logger.info(`Database has ${userCount} users, skipping seed`);
    }
  } catch (e) {
    logger.error('Database initialization failed:', e);
  }
}

async function seedDatabase() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  await prisma.user.createMany({
    data: [
      { email: 'admin@boutique.com', password: adminPass, name: 'Admin', role: 'ADMIN' },
      { email: 'user@boutique.com', password: userPass, name: 'Client Test', role: 'USER' },
    ],
  });

  const products = [
    { name: 'T-shirt Oversize Blanc', description: 'T-shirt oversize en coton bio, coupe décontractée et confortable. Parfait pour un look streetwear.', price: 39.99, image: 'https://picsum.photos/seed/tshirt1/400/500', category: 'T-shirts', sizes: '["S","M","L","XL"]', colors: '["Blanc","Noir","Gris"]', stock: 50, featured: true },
    { name: 'Jean Slim Noir', description: 'Jean slim fit en denim stretch, taille haute. Coupe ajustée et confortable au quotidien.', price: 79.99, image: 'https://picsum.photos/seed/jean1/400/500', category: 'Pantalons', sizes: '["38","40","42","44"]', colors: '["Noir","Bleu foncé"]', stock: 30, featured: true },
    { name: 'Sweat à Capuche Gris', description: 'Sweat capuche en molleton doux, intérieur gratté. Idéal pour les journées fraîches.', price: 59.99, image: 'https://picsum.photos/seed/hoodie1/400/500', category: 'Sweats', sizes: '["S","M","L","XL","XXL"]', colors: '["Gris","Noir","Marine"]', stock: 40, featured: true },
    { name: 'Robe Midi Florale', description: 'Robe midi à imprimé floral, tissu fluide et léger. Parfaite pour le printemps-été.', price: 89.99, image: 'https://picsum.photos/seed/robe1/400/500', category: 'Robes', sizes: '["34","36","38","40","42"]', colors: '["Floral bleu","Floral rose"]', stock: 25, featured: true },
    { name: 'Veste en Jean', description: 'Veste en denim classique, fermeture boutonnée. Un intemporel de la garde-robe.', price: 99.99, image: 'https://picsum.photos/seed/veste1/400/500', category: 'Vestes', sizes: '["S","M","L","XL"]', colors: '["Bleu","Noir"]', stock: 20, featured: true },
    { name: 'Chemise Lin Blanche', description: "Chemise en lin naturel, coupe relaxed. Élégante et respirante pour l'été.", price: 69.99, image: 'https://picsum.photos/seed/chemise1/400/500', category: 'Chemises', sizes: '["S","M","L","XL"]', colors: '["Blanc","Beige","Bleu clair"]', stock: 35, featured: false },
    { name: 'Pantalon Cargo Vert', description: 'Pantalon cargo en coton robuste, poches latérales. Style utilitaire et tendance.', price: 74.99, image: 'https://picsum.photos/seed/cargo1/400/500', category: 'Pantalons', sizes: '["S","M","L","XL"]', colors: '["Vert kaki","Noir","Beige"]', stock: 28, featured: false },
    { name: 'Pull Col Roulé Crème', description: 'Pull en maille fine à col roulé, mélange laine-cachemire. Doux et chaud.', price: 89.99, image: 'https://picsum.photos/seed/pull1/400/500', category: 'Sweats', sizes: '["S","M","L","XL"]', colors: '["Crème","Noir","Bordeaux"]', stock: 22, featured: true },
    { name: 'Mini Jupe Cuir Noir', description: 'Mini jupe en cuir vegan, taille haute. Look edgy et féminin.', price: 64.99, image: 'https://picsum.photos/seed/jupe1/400/500', category: 'Jupes', sizes: '["34","36","38","40"]', colors: '["Noir","Marron"]', stock: 18, featured: false },
    { name: 'Blazer Structuré Marine', description: 'Blazer cintré à épaules structurées, doublure satinée. Chic et professionnel.', price: 129.99, image: 'https://picsum.photos/seed/blazer1/400/500', category: 'Vestes', sizes: '["36","38","40","42","44"]', colors: '["Marine","Noir","Gris"]', stock: 15, featured: true },
    { name: 'Polo Rayé Bretagne', description: 'Polo en piqué de coton, rayures marinières. Style décontracté chic.', price: 49.99, image: 'https://picsum.photos/seed/polo1/400/500', category: 'T-shirts', sizes: '["S","M","L","XL"]', colors: '["Bleu/Blanc","Rouge/Blanc"]', stock: 32, featured: false },
    { name: 'Robe Soirée Noire', description: 'Robe de soirée élégante en crêpe, découpe asymétrique. Pour les grandes occasions.', price: 149.99, image: 'https://picsum.photos/seed/soiree1/400/500', category: 'Robes', sizes: '["34","36","38","40"]', colors: '["Noir","Bordeaux"]', stock: 12, featured: false },
  ];

  await prisma.product.createMany({ data: products });
}

const app = express();
app.use(cors({
  origin: [
    'https://bouclor.com',
    'https://www.bouclor.com',
    'https://maison-boutique.pages.dev',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/contact', contactLimiter);

// Serve static files (invoices, uploads)
app.use('/invoices', express.static(path.join(process.cwd(), 'invoices')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

// Start server after database initialization
initDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
