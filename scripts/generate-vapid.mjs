// Genera un parell de claus VAPID per a les notificacions web push.
//
// Ús:
//   node scripts/generate-vapid.mjs
//
// Copia les claus mostrades al teu .env.local (i a les variables d'entorn del
// proveïdor d'allotjament en producció):
//
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>
//   VAPID_PRIVATE_KEY=<privateKey>
//   VAPID_SUBJECT=mailto:el-teu-correu@example.com

import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log("Claus VAPID generades. Afegeix-les al teu .env.local:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
console.log("VAPID_SUBJECT=mailto:el-teu-correu@example.com");
