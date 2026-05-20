import { config } from "dotenv";
config({ path: ".env.local" });

import readline from "readline";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { hashPassword } from "../lib/auth";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\nCreate a new admin user\n");

  const name = (await ask("Name: ")).trim();
  const email = (await ask("Email: ")).trim().toLowerCase();
  const password = await ask("Password (min 8 chars): ");
  rl.close();

  if (!name || !email || !password) {
    console.error("\nAll fields are required.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("\nPassword must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  try {
    await db.insert(users).values({ name, email, passwordHash });
    console.log(`\n✓ Admin user created: ${email}\n`);
    process.exit(0);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      console.error("\nThat email is already registered.");
    } else {
      console.error("\nFailed to create user:", err);
    }
    process.exit(1);
  }
}

main();
