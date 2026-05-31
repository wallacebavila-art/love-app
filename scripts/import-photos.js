/**
 * Script para importar fotos para o Firebase Firestore
 * Extraídas do álbum: https://photos.app.goo.gl/nvhKdBFNcfztivt49
 * 
 * Uso:
 * node import-photos.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fotos do álbum compartilhado do Google Fotos (apenas as fotos reais, sem duplicatas/avatar)
const photos = [
  { 
    url: "https://lh3.googleusercontent.com/pw/AP1GczN-dO-VJnD9TRVMVB5Uf0yBcpVoIuxdqrSiHbtqU_yyg4KxNVd6LXnIFVz2T3hSusSdHc3Yscp5Pe2SsUHYgc4ybDR71E7fDUsKD1RncOy-E1JaN8VG=w1200-no", 
    caption: "Nós 💕", 
    order: 0 
  },
  { 
    url: "https://lh3.googleusercontent.com/pw/AP1GczP7AFkDGZL06kP2saBvUIWMAGTRRU0c--HiJ0PipB0vElXahIbH5kGI3CAuZB48UMcSzwUn05b1bM7KMGu2KcG5NuchisN5FHghYd1Zg90YoPulO0Lj=w1200-no", 
    caption: "Momento especial ✨", 
    order: 1 
  },
  { 
    url: "https://lh3.googleusercontent.com/pw/AP1GczP0SynGWWkIfTHRoRwBmCXAdkvdnkhVcF33nL3bvnDdnqeTExbcKOOJ6uQyFVxqljRVvTA0IvdVnSLmAV8iV9tMWi_4C872mNlfzPeFrNR7SwXF3oku=w1200-no", 
    caption: "Juntos 💑", 
    order: 2 
  },
];

// Inicializar o Firebase Admin SDK
try {
  const serviceAccountPath = join(__dirname, 'service-account-key.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Primeiro, limpar todas as fotos existentes
const existing = await db.collection('photos').get();
if (existing.size > 0) {
  const deleteBatch = db.batch();
  let count = 0;
  existing.forEach(doc => {
    deleteBatch.delete(doc.ref);
    count++;
  });
  await deleteBatch.commit();
  console.log(`🗑️ ${count} fotos antigas removidas`);
}

// Importar as novas fotos
let successCount = 0;
let errorCount = 0;

console.log(`📤 Importando ${photos.length} fotos...`);

for (let i = 0; i < photos.length; i++) {
  try {
    const photo = photos[i];
    const photosRef = db.collection('photos');
    await photosRef.add({
      url: photo.url,
      caption: photo.caption || '',
      order: photo.order !== undefined ? photo.order : i,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    successCount++;
    console.log(`✅ [${i + 1}/${photos.length}] ${photo.caption}`);
  } catch (error) {
    errorCount++;
    console.error(`❌ Erro na foto ${i + 1}:`, error.message);
  }
}

console.log('\n🎉 Importação concluída!');
console.log(`✅ ${successCount} fotos importadas`);
console.log(`❌ ${errorCount} erros`);
console.log('');
console.log('📌 Para adicionar mais fotos:');
console.log('1. Edite o array "photos" no início deste arquivo');
console.log('2. Execute novamente: node import-photos.js');

process.exit(0);