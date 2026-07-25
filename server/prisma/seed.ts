import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

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
  console.log('Seed terminé : 2 utilisateurs, 12 produits');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
