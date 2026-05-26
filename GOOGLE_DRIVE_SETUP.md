# Configuração do Google Drive + Firestore para Upload de Fotos

## Solução: Google Drive + Google Apps Script + Firestore

Esta solução contorna o problema de CORS do Firebase Storage usando Google Drive para armazenar as fotos e o Google Apps Script para salvar a URL diretamente no Firestore.

### Passo 1: Obter API Key do Firebase

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto `para-raissa`
3. Clique no ícone de engrenagem ⚙️ → **Configurações do projeto**
4. Vá para a aba **Geral**
5. Role até **Seus apps** → **SDK setup and configuration**
6. Copie a **API Key** (começa com `AIza...`)

### Passo 2: Criar o Google Apps Script

1. Acesse: https://script.google.com/
2. Clique em **"Novo projeto"**
3. Copie o conteúdo do arquivo `google-drive-upload-script.gs`
4. Cole no editor do Google Apps Script
5. **IMPORTANTE**: Substitua `SUA_API_KEY_DO_FIREBASE_AQUI` pela API Key copiada no passo 1
6. Salve o projeto

### Passo 3: Deploy como Web App

1. No Google Apps Script, clique em **"Implantar"** → **"Nova implantação"**
2. Selecione **"Aplicativo Web"**
3. Configure:
   - **Descrição**: Upload de Fotos Love App
   - **Executar como**: Eu (seu email)
   - **Quem tem acesso**: Qualquer pessoa (Anyone)
4. Clique em **"Implantar"**
5. Copie a **URL do aplicativo web** gerada

### Passo 4: Configurar no photoService.js

1. Abra `src/services/photoService.js`
2. Procure a linha:
   ```javascript
   const SCRIPT_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
   ```
3. Substitua pela URL que você copiou no passo 3

### Passo 5: Configurar Regras do Firestore

1. No Firebase Console, vá em **Firestore Database** → **Regras**
2. Certifique-se que as regras permitem escrita:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /photos/{document=**} {
      allow read: if true;
      allow write: if true; // Permite escrita do Google Apps Script
    }
  }
}
```

3. Clique em **Publicar**

### Como Funciona

1. O app envia a foto para o Google Apps Script
2. O script faz upload para o Google Drive
3. O script salva a URL da foto diretamente no Firestore
4. O app recarrega as fotos do Firestore
5. As fotos são exibidas na galeria

### Vantagens

- ✅ Sem problemas de CORS
- ✅ Fotos ficam no seu Google Drive
- ✅ Metadados no Firestore
- ✅ Funciona imediatamente após configuração

### Limitações

- ❌ Requer configuração manual do Google Apps Script
- ❌ Depende da API Key do Firebase
- ❌ O script precisa ter permissão de escrita no Firestore

### Fallback

Se o Google Drive falhar, o sistema tenta automaticamente:
1. Firebase Storage (se CORS estiver resolvido)
2. Imgur (como último fallback)

### Testar

Após configurar:
1. Tente fazer upload de uma foto
2. Verifique o console para logs
3. Aguarde 2-3 segundos para o script salvar no Firestore
4. Recarregue a galeria para ver a foto
