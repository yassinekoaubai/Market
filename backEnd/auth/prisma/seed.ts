import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PasswordService } from "../src/services/password.service.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.refreshTokens.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await PasswordService.hashPassword("AdminPass123");
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      phone: "+1234567890",
      password_hash: adminPassword,
      role: "ADMIN",
      email_verified: true,
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create regular user
  const userPassword = await PasswordService.hashPassword("UserPass123");
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Regular User",
      phone: "+0987654321",
      password_hash: userPassword,
      role: "USER",
      email_verified: true,
    },
  });

  console.log(`✅ Created regular user: ${user.email}`);

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
