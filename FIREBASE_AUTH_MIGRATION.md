# Migração para Firebase Authentication

## O que foi feito

1. ✅ AuthContext atualizado para usar Firebase Authentication
2. ✅ Regras do Firestore atualizadas para usar `request.auth`
3. ✅ Script criado para criar usuários no Firebase Auth

## O que você precisa fazer

### Passo 1: Atualizar o arquivo .env

Abra o arquivo `.env` na raiz do projeto e atualize as credenciais:

**ANTES:**
```
VITE_ADMIN_EMAIL=wallace
VITE_ADMIN_PASSWORD=123456
VITE_RAISSA_EMAIL=raissa
VITE_RAISSA_PASSWORD=wallaceteamo
```

**DEPOIS:**
```
VITE_ADMIN_EMAIL=wallace@para-raissa.firebaseapp.com
VITE_ADMIN_PASSWORD=123456
VITE_RAISSA_EMAIL=raissa@para-raissa.firebaseapp.com
VITE_RAISSA_PASSWORD=wallaceteamo
```

### Passo 2: Criar usuários no Firebase Authentication

**Opção A: Usar o script (recomendado)**

1. Instale as dependências do Firebase:
```bash
npm install firebase
```

2. Execute o script:
```bash
node scripts/createFirebaseUsers.js
```

**Opção B: Criar manualmente no Firebase Console**

1. Acesse https://console.firebase.google.com/
2. Selecione o projeto "para-raissa"
3. Vá para Authentication > Users
4. Clique em "Add user"
5. Crie os usuários:
   - Email: `wallace@para-raissa.firebaseapp.com`, Senha: `123456`
   - Email: `raissa@para-raissa.firebaseapp.com`, Senha: `wallaceteamo`

### Passo 3: Atualizar regras do Firestore

1. Acesse Firebase Console > Firestore Database > Rules
2. Copie o conteúdo do arquivo `firestore.rules`
3. Cole no editor de regras
4. Clique em "Publish"

### Passo 4: Reiniciar o servidor de desenvolvimento

```bash
# Pare o servidor atual (Ctrl+C)
# Reinicie
npm run dev
```

### Passo 5: Testar

1. Abra o app no navegador
2. Faça login com as novas credenciais:
   - Admin: `wallace@para-raissa.firebaseapp.com` / `123456`
   - Raíssa: `raissa@para-raissa.firebaseapp.com` / `wallaceteamo`
3. Tente criar/editar mensagens, fotos, etc.
4. Verifique se as permissões estão funcionando corretamente

## Resumo das novas regras de segurança

- **mensagens**: Admin e Raíssa podem escrever
- **verses**: Admin e Raíssa podem escrever
- **photos**: Apenas Admin pode escrever
- **timeline**: Admin e Raíssa podem escrever
- **fcm_tokens**: Usuários autenticados podem registrar seu próprio token
- **notifications**: Apenas Admin pode escrever
- **places**: Admin e Raíssa podem escrever
- **users**: Apenas Admin pode escrever

Todas as coleções permitem leitura pública.

## Solução de problemas

**Erro: "Email ou senha inválidos"**
- Verifique se os usuários foram criados no Firebase Console
- Verifique se o .env foi atualizado corretamente
- Reinicie o servidor de desenvolvimento

**Erro: "Missing or insufficient permissions"**
- Verifique se as regras do Firestore foram publicadas
- Verifique se você está logado com o usuário correto
- Verifique se o email no .env corresponde ao email no Firebase Auth

**Erro: "auth/email-already-in-use"**
- O usuário já existe no Firebase Auth, pode ignorar
