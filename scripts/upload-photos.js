/**
 * Script para baixar fotos do Google Fotos e fazer upload para o Firebase Storage
 * 
 * Uso:
 * node upload-photos.js
 * 
 * PRÉ-REQUISITOS:
 * npm install firebase-admin
 * service-account-key.json na raiz do projeto
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fotos do álbum do Google Fotos
const photos = [
  { 
    url: "https://lh3.googleusercontent.com/pw/AP1GczN-dO-VJnD9TRVMVB5Uf0yBcpVoIuxdqrSiHbtqU_yyg4KxNVd6LXnIFVz2T3hSusSdHc3Yscp5Pe2SsUHYgc4ybDR71E7fDUsKD1RncOy-E1JaN8VG", 
    filename: "foto1.jpg",
    caption: "Nós 💕", 
    order: 0 
  },
  { 
    url: "https://lh3.googleusercontent.com/pw/AP1GczP7AFkDGZL06kP2saBvUIWMAGTRRU0c--HiJ0PipB0vElXahIbH5kGI3CAuZB48UMcSzwUn05b1bM7KMGu2KcG5NuchisN5FHghYd1Zg90YoPulO0Lj", 
    filename: "foto2.jpg",
    caption: "Momento especial ✨", 
    order: 1 
  },
  { 
    url: "https://lh3.googleusercontent.com/pw/AP1GczP0SynGWWkIfTHRoRwBmCXAdkvdnkhVcF33nL3bvnDdnqeTExbcKOOJ6uQyFVxqljRVvTA0IvdVnSLmAV8iV9tMWi_4C872mNlfzPeFrNR7SwXF3oku", 
    filename: "foto3.jpg",
    caption: "Juntos 💑", 
    order: 2 
  },
];

// Inicializar o Firebase Admin SDK
try {
  const serviceAccountPath = join(__dirname, 'service-account-key.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "para-raissa.firebasestorage.app"
  });
  console.log('✅ Firebase Admin SDK inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin SDK:', error.message);
  process.exit(1);
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

// Criar pasta temporária para downloads
const tempDir = join(__dirname, 'temp_photos');
if (!existsSync(tempDir)) {
  mkdirSync(tempDir);
}

console.log('📥 Baixando e enviando fotos...\n');

for (let i = 0; i < photos.length; i++) {
  const photo = photos[i];
  const localPath = join(tempDir, photo.filename);
  
  try {
    // Baixar a foto
    console.log(`📥 [${i + 1}/${photos.length}] Baixando ${photo.caption}...`);
    const response = await fetch(photo.url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) {
      console.log(`   ⚠️  Status HTTP: ${response.status}, tentando método alternativo...`);
      // Tentar com a URL completa
      const response2 = await fetch(photo.url + '=w1200', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!response2.ok) {
        throw new Error(`Falha ao baixar: HTTP ${response2.status}`);
      }
      const buffer = Buffer.from(await response2.arrayBuffer());
      writeFileSync(localPath, buffer);
    } else {
      const buffer = Buffer.from(await response.arrayBuffer());
      writeFileSync(localPath, buffer);
    }
    
    console.log(`   ✅ Baixado (${(writeFileSync(localPath).length || '?')})`);
    
  } catch (error) {
    console.log(`   ❌ Erro ao baixar: ${error.message}`);
    console.log(`   🔗 URL: ${photo.url}`);
    console.log(`   Vou tentar usar a URL diretamente como fallback...`);
    continue;
  }
}

// Fazer upload para o Firebase Storage e salvar no Firestore
console.log('\n📤 Enviando para o Firebase Storage...');

// Limpar fotos antigas do Firestore
const existing = await db.collection('photos').get();
if (existing.size > 0) {
  const deleteBatch = db.batch();
  existing.forEach(doc => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();
  console.log(`🗑️ ${existing.size} registros antigos removidos`);
}

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < photos.length; i++) {
  const photo = photos[i];
  const localPath = join(tempDir, photo.filename);
  
  try {
    if (existsSync(localPath)) {
      // Fazer upload para o Firebase Storage
      const destination = `photos/${photo.filename}`;
      await bucket.upload(localPath, {
        destination: destination,
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            caption: photo.caption,
            order: photo.order
          }
        }
      });
      
      // Tornar o arquivo público
      await bucket.file(destination).makePublic();
      
      // Obter URL pública
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      
      // Salvar no Firestore
      await db.collection('photos').add({
        url: publicUrl,
        caption: photo.caption,
        order: photo.order,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      console.log(`✅ [${i + 1}/${photos.length}] ${photo.caption} -> Firebase Storage`);
      successCount++;
    } else {
      throw new Error('Arquivo não baixado');
    }
  } catch (error) {
    console.log(`❌ [${i + 1}/${photos.length}] ${photo.caption}: ${error.message}`);
    console.log(`   Usando URL original como fallback...`);
    
    // Fallback: salvar a URL original no Firestore
    await db.collection('photos').add({
      url: photo.url,
      caption: photo.caption,
      order: photo.order,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    errorCount++;
  }
}

console.log('\n🎉 Processo concluído!');
console.log(`✅ ${successCount} fotos no Firebase Storage`);
console.log(`⚠️  ${errorCount} fotos com fallback (URL original)`);

// Limpar arquivos temporários
import { rmSync } from 'fs';
rmSync(tempDir, { recursive: true, force: true });
console.log('🧹 Arquivos temporários removidos');

process.exit(0);