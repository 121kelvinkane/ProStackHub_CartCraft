const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');
  
  await prisma.product.createMany({
    data: [
      { name: 'Wireless Headphones', price: 9999, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', stock: 10 },
      { name: 'Smart Watch', price: 19999, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', stock: 5 },
      { name: 'Mechanical Keyboard', price: 12999, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', stock: 8 },
      { name: 'Ergonomic Mouse', price: 4999, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', stock: 15 },
    ],
  });
  
  console.log('? Products seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });