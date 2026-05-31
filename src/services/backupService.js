import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Exporta todos os dados do Firestore para JSON
 * @returns {Promise<Object>} Objeto com todos os dados
 */
export const exportAllData = async () => {
  try {
    const collections = ['mensagens', 'verses', 'photos', 'timeline', 'notifications', 'places'];
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {}
    };

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        const documents = [];
        
        snapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });

        backupData.data[collectionName] = documents;
        console.log(`✅ Exportados ${documents.length} documentos da coleção ${collectionName}`);
      } catch (error) {
        console.error(`❌ Erro ao exportar coleção ${collectionName}:`, error);
        backupData.data[collectionName] = [];
      }
    }

    return backupData;
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    throw error;
  }
};

/**
 * Importa dados de JSON para o Firestore
 * @param {Object} backupData - Dados de backup para importar
 * @param {Object} options - Opções de importação
 * @param {boolean} options.overwrite - Se deve sobrescrever documentos existentes
 * @param {boolean} options.clearBeforeImport - Se deve limpar a coleção antes de importar
 * @returns {Promise<Object>} Resultado da importação
 */
export const importAllData = async (backupData, options = { overwrite: false, clearBeforeImport: false }) => {
  try {
    const { overwrite, clearBeforeImport } = options;
    const result = {
      success: true,
      imported: {},
      errors: [],
      timestamp: new Date().toISOString()
    };

    if (!backupData || !backupData.data) {
      throw new Error('Dados de backup inválidos');
    }

    const collections = Object.keys(backupData.data);

    for (const collectionName of collections) {
      try {
        const documents = backupData.data[collectionName];
        const collectionRef = collection(db, collectionName);

        // Limpar coleção antes de importar se solicitado
        if (clearBeforeImport) {
          const existingSnapshot = await getDocs(collectionRef);
          const deletePromises = existingSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
          console.log(`🗑️ Limpa coleção ${collectionName}`);
        }

        let importedCount = 0;
        let skippedCount = 0;

        for (const docData of documents) {
          try {
            const docId = docData.id;
            const { id, ...dataWithoutId } = docData;

            if (overwrite) {
              // Sobrescrever documento existente
              await setDoc(doc(db, collectionName, docId), dataWithoutId);
              importedCount++;
            } else {
              // Verificar se documento já existe
              const docRef = doc(db, collectionName, docId);
              const docSnapshot = await getDoc(docRef);
              
              if (docSnapshot.exists()) {
                skippedCount++;
              } else {
                await setDoc(doc(db, collectionName, docId), dataWithoutId);
                importedCount++;
              }
            }
          } catch (error) {
            console.error(`Erro ao importar documento ${docData.id}:`, error);
            result.errors.push({
              collection: collectionName,
              documentId: docData.id,
              error: error.message
            });
          }
        }

        result.imported[collectionName] = {
          imported: importedCount,
          skipped: skippedCount,
          total: documents.length
        };

        console.log(`✅ Importados ${importedCount} documentos na coleção ${collectionName} (pulados: ${skippedCount})`);
      } catch (error) {
        console.error(`❌ Erro ao importar coleção ${collectionName}:`, error);
        result.errors.push({
          collection: collectionName,
          error: error.message
        });
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    return result;
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    throw error;
  }
};

/**
 * Faz download do backup como arquivo JSON
 * @param {Object} backupData - Dados de backup
 */
export const downloadBackup = (backupData) => {
  const dataStr = JSON.stringify(backupData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `love-app-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Lê arquivo de backup JSON
 * @param {File} file - Arquivo de backup
 * @returns {Promise<Object>} Dados do backup
 */
export const readBackupFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Arquivo de backup inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};
