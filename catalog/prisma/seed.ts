import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding catalog database...");

  // Clear existing data
  await prisma.rating.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      description: "Electronic devices and gadgets",
      image_url: "https://via.placeholder.com/300?text=Electronics",
    },
  });

  const books = await prisma.category.create({
    data: {
      name: "Books",
      description: "Physical and digital books",
      image_url: "https://via.placeholder.com/300?text=Books",
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Wireless Headphones",
        description: "High quality wireless headphones with noise cancellation",
        price: 99.99,
        quantity: 50,
        sku: "WH001",
        categoryId: electronics.id,
        image_url: "https://via.placeholder.com/300?text=Headphones",
      },
    }),
    prisma.product.create({
      data: {
        name: "USB-C Cable",
        description: "Fast charging USB-C cable 2 meters",
        price: 15.99,
        quantity: 200,
        sku: "USB001",
        categoryId: electronics.id,
        image_url: "https://via.placeholder.com/300?text=USB-C",
      },
    }),
    prisma.product.create({
      data: {
        name: "The Clean Code",
        description: "Clean Code: A Handbook of Agile Software Craftsmanship",
        price: 44.99,
        quantity: 30,
        sku: "BOOK001",
        categoryId: books.id,
        image_url: "https://via.placeholder.com/300?text=Clean+Code",
      },
    }),
    prisma.product.create({
      data: {
        name: "Design Patterns",
        description: "Design Patterns: Elements of Reusable Object-Oriented Software",
        price: 49.99,
        quantity: 25,
        sku: "BOOK002",
        categoryId: books.id,
        image_url: "https://via.placeholder.com/300?text=Design+Patterns",
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);
  console.log("🎉 Seeding completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
