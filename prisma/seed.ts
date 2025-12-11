import { hash } from "bcryptjs";
import { PrismaClient, Rank } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@checkmate.app";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: "admin",
      name: "Admin",
      password: await hash("admin", 12),
      role: "ADMIN",
      rank: Rank.GRANDMASTER,
      rankPoints: 80,
      settings: {
        create: {},
      },
    },
  });

  console.log("Seeded admin user", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
