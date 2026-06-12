/**
 * Script para verificar a data calculada pelo getMessageDateString
 */

const MESSAGES_START_DATE = '2026-06-12';

function getMessageDateString(startDate = MESSAGES_START_DATE) {
  const now = new Date();
  const start = new Date(startDate);
  
  console.log('📅 Data atual:', now.toISOString());
  console.log('📅 Data de início:', start.toISOString());
  
  // Se a data atual for antes da data de início, retorna null
  if (now < start) {
    console.log('❌ Data atual é antes da data de início');
    return null;
  }
  
  // Calcula a diferença em dias usando UTC para evitar problemas de fuso horário
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  console.log('⏱️ Diferença em dias:', diffDays);
  
  // Retorna a data correspondente usando UTC
  const resultDate = new Date(start.getTime() + diffDays * 24 * 60 * 60 * 1000);
  
  const year = resultDate.getUTCFullYear();
  const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getUTCDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  console.log('✅ Data calculada:', result);
  
  return result;
}

console.log('=== Verificação da Data Calculada ===\n');
getMessageDateString();
