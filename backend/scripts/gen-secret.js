// Prints a random secret to paste into .env as JWT_SECRET.
import { randomBytes } from 'node:crypto';

console.log('Put this in .env:');
console.log(`JWT_SECRET=${randomBytes(48).toString('base64url')}`);
