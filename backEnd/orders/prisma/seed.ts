import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding orders database...");

  // Clear existing data
  await prisma.orderHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();

  // Create orders with a manual transaction
  const order1 = await prisma.order.create({
    data: {
      order_number: "ORD-001",
      user_id: 1,
      total_amount: 115.98,
      status: "CONFIRMED",
      payment_status: "PAID",
      items: {
        create: [
          {
            product_id: 1,
            quantity: 1,
            unit_price: 99.99,
            subtotal: 99.99,
          },
          {
            product_id: 2,
            quantity: 1,
            unit_price: 15.99,
            subtotal: 15.99,
          },
        ],
      },
      history: {
        create: {
          status: "CONFIRMED",
          note: "Order confirmed",
        },
      },
    },
  });

  // Create a cart
  const cart = await prisma.cart.create({
    data: {
      user_id: 2,
      items: {
        create: [
          {
            product_id: 3,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 1 order and 1 cart`);
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
