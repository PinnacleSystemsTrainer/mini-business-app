const bcrypt = require("bcryptjs");

const prisma = require("../src/lib/prisma");

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin user ready: admin@example.com / admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
