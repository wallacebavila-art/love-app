# Bom dia, Raíssa

Um aplicativo React com Vite, Tailwind CSS e Firebase para enviar mensagens diárias com temas dinâmicos baseados no horário do dia.

## ✨ Funcionalidades

- **Temas Dinâmicos com Imagens Personalizadas**: O aplicativo muda automaticamente conforme o horário usando imagens personalizadas como background:
  - **Manhã (5h - 12h)**: Imagem screen.png com saudação "Bom dia" e ícone de sol animado
  - **Tarde (12h - 18h)**: Imagem screen (2).png com saudação "Boa tarde" e ícone de sol animado
  - **Noite (18h - 5h)**: Imagem screen (3).png com saudação "Boa noite" e ícone de lua animado
  
  Design responsivo para mobile e desktop com cards translúcidos, backdrop blur e excelente contraste.

- **Simulador de Tempo**: Painel flutuante para testar os diferentes temas sem esperar o horário real mudar:
  - Clique em "Ativar" para iniciar a simulação
  - Arraste o slider para mudar o horário
  - Use os botões de atalho (06:00, 12:00, 20:00) para testar rapidamente
  - Clique em "Ativado" para desativar e voltar ao horário real

- **Integração com Firebase**: Todas as edições são salvas automaticamente no Firestore:
  - Mensagens diárias são salvas e carregadas do banco
  - Marcos da timeline são salvos e carregados do banco
  - Dias personalizados são salvos e carregados do banco

- **Timeline Interativa**: Clique em "Nossa Jornada" para ver a linha do tempo:
  - Edite título, descrição e data de cada marco
  - Arraste os marcos para reordenar
  - Todas as alterações são salvas no Firebase

- **Edição de Mensagens**: Clique no lápis ✏️ para editar a mensagem do dia
- **Contador de Dias**: Mostra quantos dias vocês estão juntos (editável)
- **PWA**: Progressive Web App instalável

## 🔧 Configuração do Firebase

Para usar o salvamento automático no banco de dados, você precisa configurar o Firebase:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Copie as credenciais do seu projeto
4. Edite o arquivo `src/services/firebaseConfig.js` e substitua os placeholders:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

5. Configure as regras do Firestore para permitir leitura e escrita (para desenvolvimento):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🚀 Como Executar

### Instalação das Dependências
As dependências já foram instaladas. Se precisar reinstalar:
```bash
npm install
```

### Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Ou execute o arquivo `start.bat`

O aplicativo estará disponível em: http://localhost:5173/

### Build para Produção
```bash
npm run build
```

## 📁 Estrutura do Projeto

```
love-app/
├── src/
│   ├── components/          # Componentes React
│   │   ├── StatusBarSpacer.jsx
│   │   ├── Header.jsx
│   │   ├── JourneyCard.jsx
│   │   ├── DailyMessageCard.jsx
│   │   └── BottomNav.jsx
│   ├── services/            # Configurações e serviços
│   │   ├── firebaseConfig.js
│   │   └── messageService.js
│   ├── utils/               # Funções auxiliares
│   │   └── dateUtils.js
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Ponto de entrada
│   └── index.css            # Estilos globais
├── public/                  # Arquivos estáticos
├── index.html               # HTML principal
├── tailwind.config.js       # Configuração do Tailwind
├── vite.config.js           # Configuração do Vite com PWA
└── package.json             # Dependências
```

## 🔧 Configuração do Firebase

1. Abra o arquivo `src/services/firebaseConfig.js`
2. Substitua os placeholders pelas suas credenciais reais do Firebase:
   - `YOUR_API_KEY`
   - `YOUR_AUTH_DOMAIN`
   - `YOUR_PROJECT_ID`
   - `YOUR_STORAGE_BUCKET`
   - `YOUR_MESSAGING_SENDER_ID`
   - `YOUR_APP_ID`

## 📦 Estrutura do Firestore

O aplicativo busca mensagens na coleção `mensagens` onde o ID do documento é a data no formato `YYYY-MM-DD`.

Exemplo de documento:
```
Coleção: mensagens
Documento ID: 2024-05-24
Campo: mensagem (string)
Valor: "Sua mensagem personalizada aqui"
```

## 🎨 Personalização

### Data Inicial do Namoro
Edite o arquivo `src/utils/dateUtils.js` e altere a data padrão na função `calculateDaysTogether`:
```javascript
export const calculateDaysTogether = (startDate = "2021-01-01") => {
  // Altere "2021-01-01" para sua data
```

### Ícones do PWA
Substitua os arquivos de ícone na pasta `public/`:
- `pwa-192x192.png`
- `pwa-512x512.png`

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Firebase** - Backend e banco de dados
- **vite-plugin-pwa** - Configuração PWA

## 📱 PWA

O aplicativo está configurado como PWA (Progressive Web App). Após o build, ele pode ser instalado como um aplicativo nativo em dispositivos móveis.
"# love-app" 
"# love-app" 
