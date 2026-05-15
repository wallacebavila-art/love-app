import { db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Popula o banco de dados com mensagens de exemplo a partir de 12/01/2026
 */
export const populateSampleMessages = async () => {
  const startDate = new Date(2026, 0, 12); // 12 de janeiro de 2026
  const today = new Date();
  const messages = [];

  // Gerar mensagens para cada dia a partir de 12/01/2026 até hoje
  let currentDate = new Date(startDate);
  let dayCount = 1;

  while (currentDate <= today) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`; // Formato YYYY-MM-DD

    messages.push({
      date: dateKey,
      message: `mensagem do dia ${dayCount}`
    });

    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }

  // Salvar no Firestore
  for (const msg of messages) {
    try {
      const messageDoc = doc(db, 'mensagens', msg.date);
      await setDoc(messageDoc, { mensagem: msg.message });
      console.log(`✅ Mensagem salva: ${msg.date} - ${msg.message}`);
    } catch (error) {
      console.error(`❌ Erro ao salvar mensagem para ${msg.date}:`, error);
    }
  }

  console.log(`🎉 ${messages.length} mensagens populadas com sucesso!`);
  return messages.length;
};

// Para executar: chamar populateSampleMessages() no console do navegador
