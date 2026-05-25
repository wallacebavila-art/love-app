/**
 * Script para extrair fotos do álbum Google Fotos e importar para o Firebase
 * 
 * Uso: node import-fotos-google.mjs
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ALBUM_URL = 'https://photos.app.goo.gl/nvhKdBFNcfztivt49';

async function extractGooglePhotosUrls(url) {
  console.log('🔗 Acessando álbum:', url);
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  
  const html = await response.text();
  console.log('📄 HTML carregado:', html.length, 'caracteres');
  
  // Extrair todas as URLs de imagem do Google
  const regex = /https:\/\/lh3\.googleusercontent\.com\/[^"'<\s]+/g;
  const matches = html.match(regex) || [];
  const unique = [...new Set(matches)];
  
  console.log('🔍 URLs brutas encontradas:', unique.length);
  
  // Filtrar: remover avatares (s32) e manter apenas imagens grandes (pw/)
  const imageUrls = [];
  for (const u of unique) {
    // Pular avatares de perfil
    if (u.includes('s32') || u.includes('s96')) continue;
    // Pular URLs sem /pw/ (não são fotos do álbum)
    if (!u.includes('/pw/')) continue;
    
    // Usar a URL como está, sem modificar parâmetros
    // Remover apenas parametros de tamanho se existirem
    const cleanUrl = u.replace(/=w\d+(-[a-z0-9]+)?(\?.*)?$/, '');
    
    // Verificar duplicata
    if (!imageUrls.find(existing => existing.split('?')[0] === cleanUrl.split('?')[0])) {
      imageUrls.push(cleanUrl);
    }
  }
  
  console.log('📸 URLs de fotos únicas:', imageUrls.length);
  imageUrls.forEach((url, i) => console.log(`  ${i + 1}. ${url.substring(0, 70)}...`));
  
  return imageUrls;
}

async function testUrls(urls) {
  console.log('\n🔍 Testando URLs...');
  const working = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const resp = await fetch(urls[i], { method: 'HEAD' });
      if (resp.ok) {
        working.push(urls[i]);
        console.log(`  ✅ [${i + 1}/${urls.length}] HTTP ${resp.status}`);
      } else {
        console.log(`  ❌ [${i + 1}/${urls.length}] HTTP ${resp.status} - ${urls[i].substring(0, 50)}`);
      }
    } catch (e) {
      console.log(`  ❌ [${i + 1}/${urls.length}] Erro: ${e.message}`);
    }
  }
  
  return working;
}

async function main() {
  // 1. Extrair URLs do Google Fotos
  const urls = await extractGooglePhotosUrls(ALBUM_URL);
  
  if (urls.length === 0) {
    console.log('❌ Nenhuma foto encontrada!');
    process.exit(1);
  }
  
  // 2. Testar URLs
  const workingUrls = await testUrls(urls);
  
  if (workingUrls.length === 0) {
    console.log('❌ Nenhuma URL funcionou!');
    process.exit(1);
  }
  
  console.log(`\n✅ ${workingUrls.length} URLs funcionando de ${urls.length}`);
  
  // 3. Salvar backup
  const backupData = workingUrls.map((url, i) => ({
    url,
    caption: `Foto ${i + 1}`,
    order: i
  }));
  writeFileSync('fotos_google_backup.json', JSON.stringify(backupData, null, 2));
  console.log('💾 Backup salvo em fotos_google_backup.json');
  
  // 4. Inicializar Firebase
  try {
    const serviceAccountPath = join(__dirname, 'service-account-key.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('✅ Firebase Admin SDK inicializado');
  } catch (error) {
    console.error('❌ Erro Firebase:', error.message);
    process.exit(1);
  }
  
  const db = admin.firestore();
  
  // 5. Remover fotos antigas
  const existing = await db.collection('photos').get();
  if (existing.size > 0) {
    const batch = db.batch();
    existing.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`🗑️ ${existing.size} fotos antigas removidas`);
  }
  
  // 6. Importar novas fotos
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < workingUrls.length; i++) {
    try {
      await db.collection('photos').add({
        url: workingUrls[i],
        caption: `Foto ${i + 1}`,
        order: i,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      success++;
      console.log(`✅ [${i + 1}/${workingUrls.length}] Foto ${i + 1} importada`);
    } catch (e) {
      errors++;
      console.log(`❌ [${i + 1}/${workingUrls.length}] Erro: ${e.message}`);
    }
  }
  
  console.log('\n🎉 Importação concluída!');
  console.log(`✅ ${success} fotos importadas`);
  console.log(`❌ ${errors} erros`);
  
  process.exit(0);
}

main();