/**
 * Script para extrair fotos de um álbum compartilhado do Google Fotos
 * e importá-las para o Firebase Firestore
 * 
 * Uso:
 * node extract-google-photos.js <LINK_DO_ALBUM>
 * 
 * Exemplo:
 * node extract-google-photos.js https://photos.app.goo.gl/nvhKdBFNcfztivt49
 * 
 * PRÉ-REQUISITOS:
 * npm install firebase-admin
 * service-account-key.json na raiz do projeto
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('❌ Uso correto:');
  console.log('node extract-google-photos.js <LINK_DO_ALBUM>');
  console.log('Exemplo:');
  console.log('node extract-google-photos.js https://photos.app.goo.gl/nvhKdBFNcfztivt49');
  process.exit(1);
}

const albumUrl = args[0];
console.log('🔗 Acessando álbum:', albumUrl);

// Função para extrair URLs de imagem do HTML da página do Google Fotos
async function extractPhotosFromGoogleAlbum(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`📄 Página carregada (${html.length} caracteres)`);
    
    // Procurar por URLs de imagens no formato do Google Fotos
    // As URLs geralmente contêm "googleusercontent.com" ou "lh3.googleusercontent.com"
    const photoUrls = new Set();
    
    // Padrão 1: URLs de imagem completas no HTML
    const urlPattern1 = /https?:\/\/lh3\.googleusercontent\.com\/[^\s"']+/g;
    let match;
    while ((match = urlPattern1.exec(html)) !== null) {
      let imgUrl = match[0];
      // Remover parâmetros de tamanho para pegar imagem grande
      imgUrl = imgUrl.replace(/=w\d+(-h\d+)?/, '=w1200');
      photoUrls.add(imgUrl);
    }
    
    // Padrão 2: Procurar no JSON embutido na página
    const jsonPattern = /"https:\/\/lh3\.googleusercontent\.com\/[^"]+"/g;
    while ((match = jsonPattern.exec(html)) !== null) {
      let imgUrl = match[0].replace(/"/g, '');
      imgUrl = imgUrl.replace(/=w\d+(-h\d+)?/, '=w1200');
      photoUrls.add(imgUrl);
    }
    
    console.log(`📸 ${photoUrls.size} fotos encontradas no álbum`);
    
    return Array.from(photoUrls);
  } catch (error) {
    console.error('❌ Erro ao acessar o álbum:', error.message);
    console.log('\n⚙️ Tentando método alternativo...');
    
    // Método alternativo: usar redirecionamento
    try {
      const response2 = await fetch(url, { 
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const html2 = await response2.text();
      
      const urls = new Set();
      const pattern = /https?:\/\/lh3\.googleusercontent\.com\/[^\s"']+/g;
      let m;
      while ((m = pattern.exec(html2)) !== null) {
        urls.add(m[0].replace(/=w\d+(-h\d+)?/, '=w1200'));
      }
      
      console.log(`📸 ${urls.size} fotos encontradas (método alternativo)`);
      return Array.from(urls);
    } catch (e2) {
      console.error('❌ Método alternativo também falhou:', e2.message);
      return [];
    }
  }
}

// Extrair as fotos
const photoUrls = await extractPhotosFromGoogleAlbum(albumUrl);

if (photoUrls.length === 0) {
  console.log('\n❌ Não foi possível extrair as fotos automaticamente.');
  console.log('📌 Solução alternativa:');
  console.log('1. Acesse o álbum manualmente: ' + albumUrl);
  console.log('2. Abra cada foto individualmente');
  console.log('3. Clique com botão direito > "Copiar endereço da imagem"');
  console.log('4. Cole as URLs no arquivo photos.json');
  process.exit(1);
}

// Mostrar as URLs encontradas
console.log('\n📋 URLs das fotos encontradas:');
photoUrls.forEach((url, i) => {
  console.log(`  ${i + 1}. ${url}`);
});

// Perguntar se quer importar
console.log('\n💾 Deseja importar estas fotos para o Firebase?');
console.log('As fotos serão salvas na coleção "photos" com captions genéricas.');

// Importar para o Firebase
try {
  const serviceAccountPath = join(__dirname, 'service-account-key.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK inicializado com sucesso');
  
  const db = admin.firestore();
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`📤 Importando ${photoUrls.length} fotos para o Firestore...`);
  
  for (let i = 0; i < photoUrls.length; i++) {
    try {
      const photosRef = db.collection('photos');
      await photosRef.add({
        url: photoUrls[i],
        caption: `Foto ${i + 1}`,
        order: i,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      successCount++;
      console.log(`✅ [${i + 1}/${photoUrls.length}] Foto ${i + 1} importada`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Erro ao importar foto ${i + 1}:`, error.message);
    }
  }
  
  console.log('\n🎉 Importação concluída!');
  console.log(`✅ Sucesso: ${successCount} fotos`);
  console.log(`❌ Erros: ${errorCount} fotos`);
  
  // Salvar também as URLs em um arquivo JSON como backup
  const { writeFileSync } = await import('fs');
  writeFileSync(
    join(__dirname, 'photos_backup.json'),
    JSON.stringify(photoUrls.map((url, i) => ({
      url,
      caption: `Foto ${i + 1}`,
      order: i
    })), null, 2)
  );
  console.log('💾 Backup salvo em photos_backup.json');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.log('\n📌 Para importar manualmente:');
  console.log('1. Salve as URLs acima em um arquivo');
  console.log('2. Edite o script import-photos.js com as URLs');
  console.log('3. Execute: node import-photos.js');
}

process.exit(0);