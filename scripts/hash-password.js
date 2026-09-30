const bcrypt = require("bcryptjs");

const password = process.argv[2] || "Admin@12345";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error generating hash:", err);
    process.exit(1);
  }
  console.log("\n========================================================");
  console.log(`Password: ${password}`);
  console.log(`ADMIN_PASSWORD_HASH: ${hash}`);
  console.log("========================================================\n");
  console.log("Copy the hash above into your .env or Vercel Environment Variables as ADMIN_PASSWORD_HASH.");
});
