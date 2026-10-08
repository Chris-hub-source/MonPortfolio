import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  }),
});

async function main() {
  if ((await prisma.availabilityRule.count()) > 0) {
    console.log("Des disponibilités existent déjà, rien à faire.");
    return;
  }
  // Lundi à vendredi, 9h–12h et 14h–17h (weekday : 0 = dimanche … 6 = samedi)
  const data = [1, 2, 3, 4, 5].flatMap((weekday) => [
    { weekday, startTime: "09:00", endTime: "12:00" },
    { weekday, startTime: "14:00", endTime: "17:00" },
  ]);
  await prisma.availabilityRule.createMany({ data });
  console.log("Disponibilités par défaut créées (lun–ven, 9h–12h et 14h–17h).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());