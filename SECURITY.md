# Segurança e Variáveis de Ambiente

## Visão Geral

Este projeto foi atualizado para usar variáveis de ambiente para proteger credenciais sensíveis. Todas as API keys e credenciais foram movidas para variáveis de ambiente para melhorar a segurança.

## Configuração

### 1. Criar arquivo .env

Copie o arquivo `.env.example` e renomeie para `.env`:

```bash
cp .env.example .env
```

### 2. Preencher as variáveis de ambiente

Edite o arquivo `.env` e substitua os valores placeholder com suas credenciais reais:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url_here

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# YouTube Data API
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# OpenWeatherMap API
VITE_OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here

# Imgur API
VITE_IMGUR_CLIENT_ID=your_imgur_client_id_here

# Google Apps Script URL
VITE_GOOGLE_APPS_SCRIPT_URL=your_google_apps_script_url_here

# FCM VAPID Key
VITE_FCM_VAPID_KEY=your_fcm_vapid_key_here

# iCloud Calendar URL
VITE_ICLOUD_CALENDAR_URL=your_icloud_calendar_url_here

# Admin Credentials (RECOMENDADO: Usar Firebase Authentication em produção)
VITE_ADMIN_EMAIL=your_admin_email_here
VITE_ADMIN_PASSWORD=your_admin_password_here
VITE_RAISSA_EMAIL=your_raissa_email_here
VITE_RAISSA_PASSWORD=your_raissa_password_here
```

### 3. Adicionar .env ao .gitignore

Certifique-se de que o arquivo `.env` está no `.gitignore` para não commitar credenciais:

```
.env
.env.local
.env.*.local
```

## Variáveis de Ambiente

### Firebase

- `VITE_FIREBASE_API_KEY`: Chave de API do Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: Domínio de autenticação do Firebase
- `VITE_FIREBASE_PROJECT_ID`: ID do projeto Firebase
- `VITE_FIREBASE_STORAGE_BUCKET`: Bucket do Firebase Storage
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Sender ID do Firebase Cloud Messaging
- `VITE_FIREBASE_APP_ID`: App ID do Firebase
- `VITE_FIREBASE_DATABASE_URL`: URL do Firebase Realtime Database

### APIs Externas

- `VITE_GOOGLE_MAPS_API_KEY`: Chave de API do Google Maps
- `VITE_YOUTUBE_API_KEY`: Chave de API do YouTube Data API
- `VITE_OPENWEATHERMAP_API_KEY`: Chave de API do OpenWeatherMap
- `VITE_IMGUR_CLIENT_ID`: Client ID da API do Imgur
- `VITE_GOOGLE_APPS_SCRIPT_URL`: URL do Google Apps Script para upload
- `VITE_FCM_VAPID_KEY`: VAPID Key para Firebase Cloud Messaging
- `VITE_ICLOUD_CALENDAR_URL`: URL do calendário iCloud

### Credenciais de Login

- `VITE_ADMIN_EMAIL`: Email do administrador
- `VITE_ADMIN_PASSWORD`: Senha do administrador
- `VITE_RAISSA_EMAIL`: Email da Raíssa
- `VITE_RAISSA_PASSWORD`: Senha da Raíssa

⚠️ **AVISO:** As credenciais de login são usadas apenas para o sistema de autenticação customizado atual. Para produção, recomenda-se implementar Firebase Authentication real.

## Regras do Firestore

As regras atuais do Firestore são permissivas por design, pois o app usa autenticação customizada (localStorage) em vez de Firebase Authentication.

Para melhorar a segurança em produção:

1. Implemente Firebase Authentication real
2. Atualize as regras do Firestore para usar `request.auth != null`
3. Adicione validação de dados nas regras
4. Limite escrita apenas para usuários autenticados

## Boas Práticas de Segurança

1. **Nunca commitar o arquivo .env**: O arquivo `.env` deve estar sempre no `.gitignore`
2. **Usar valores diferentes para desenvolvimento e produção**: Mantenha credenciais separadas para cada ambiente
3. **Rotacionar chaves regularmente**: Altere API keys periodicamente
4. **Monitorar uso de APIs**: Acompanhe o consumo das APIs para detectar uso anormal
5. **Implementar rate limiting**: Adicione limites de taxa para prevenir abuso
6. **Usar Firebase Authentication**: Substitua o sistema de autenticação customizado por Firebase Authentication real

## Arquivos Modificados

Os seguintes arquivos foram atualizados para usar variáveis de ambiente:

- `src/utils/googleMapsLoader.js`
- `src/services/youtubeService.js`
- `src/services/weatherService.js`
- `src/services/firebaseConfig.js`
- `src/services/photoService.js`
- `src/contexts/AuthContext.jsx`

## Suporte

Se você tiver problemas com a configuração das variáveis de ambiente, verifique:

1. Se o arquivo `.env` existe na raiz do projeto
2. Se as variáveis estão prefixadas com `VITE_` (necessário para Vite)
3. Se o servidor de desenvolvimento foi reiniciado após criar/modificar o `.env`
4. Se o `.env` está no `.gitignore`
