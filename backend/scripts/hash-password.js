// Prints a bcrypt hash to paste into .env as ADMIN_PASSWORD_HASH.
// Usage: npm run hash-password -- "your password here"
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your password here"');
  process.exit(1);
}
console.log('Put this in .env:');
console.log(`ADMIN_PASSWORD_HASH=${bcrypt.hashSync(password, 10)}`);
