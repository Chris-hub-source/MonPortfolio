import "dotenv/config";
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  }),
});

function ask(question: string, hidden = false) {
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    process.stdout.write(question);
    if (hidden) {
      // Coupe l'affichage des caractères tapés (mot de passe)
      (rl as unknown as { _writeToOutput: () => void })._writeToOutput = () => {};
    }
    rl.question("", (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const email = (await ask("Email admin : ")).trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Email invalide.");

  const existing = await prisma.adminUser.findFirst();
  if (existing && existing.email !== email) {
    throw new Error(
      `Un admin existe déjà (${existing.email}). Réutilise cet email pour changer son mot de passe.`,
    );
  }

  const password = await ask("Mot de passe (12 caractères minimum) : ", true);
  const confirm = await ask("Confirmer le mot de passe : ", true);
  if (password.length < 12) throw new Error("Mot de passe trop court (12 minimum).");
  if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Compte admin prêt : ${email}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());