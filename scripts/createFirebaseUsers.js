// Script para criar usuários no Firebase Authentication
// Execute: node scripts/createFirebaseUsers.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPpMEAe3yMYl8Y49btaV4lUiZLN_ZQEBo",
  authDomain: "para-raissa.firebaseapp.com",
  projectId: "para-raissa",
  storageBucket: "para-raissa.firebasestorage.app",
  messagingSenderId: "372214287601",
  appId: "1:372214287601:web:75eb749127035cb7d9ad50",
  databaseURL: "https://para-raissa-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createUsers() {
  try {
    console.log('Criando usuários no Firebase Authentication...');

    // Criar usuário admin
    try {
      const adminUser = await createUserWithEmailAndPassword(
        auth,
        'wallace@para-raissa.firebaseapp.com',
        '123456'
      );
      console.log('✅ Usuário admin criado:', adminUser.user.email);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Usuário admin já existe');
      } else {
        console.error('❌ Erro ao criar usuário admin:', error.message);
      }
    }

    // Criar usuário raissa
    try {
      const raissaUser = await createUserWithEmailAndPassword(
        auth,
        'raissa@para-raissa.firebaseapp.com',
        'wallaceteamo'
      );
      console.log('✅ Usuário raissa criado:', raissaUser.user.email);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Usuário raissa já existe');
      } else {
        console.error('❌ Erro ao criar usuário raissa:', error.message);
      }
    }

    console.log('\n✨ Processo concluído!');
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createUsers();
