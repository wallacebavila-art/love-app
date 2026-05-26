// Google Apps Script para upload de fotos no Google Drive + Firestore
// Deploy como Web App para usar como API

// Configurações do Firebase
const FIREBASE_PROJECT_ID = 'para-raissa';
const FIREBASE_API_KEY = 'AIzaSyBPpMEAe3yMYl8Y49btaV4lUiZLN_ZQEBo'; // Obter no Firebase Console

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const base64Data = data.image;
    const fileName = data.fileName || 'photo.jpg';
    const mimeType = data.mimeType || 'image/jpeg';
    const caption = data.caption || '';
    const order = data.order || 0;
    
    // Converter base64 para blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      fileName
    );
    
    // Criar pasta se não existir
    const folderName = 'Love App Photos';
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    // Fazer upload do arquivo
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Obter URL de compartilhamento
    const webViewLink = file.getUrl();
    
    // Salvar metadados no Firestore
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/photos?key=${FIREBASE_API_KEY}`;
    
    const firestorePayload = {
      fields: {
        url: { stringValue: webViewLink },
        caption: { stringValue: caption },
        order: { integerValue: order },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    };
    
    const firestoreResponse = UrlFetchApp.fetch(firestoreUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(firestorePayload),
      muteHttpExceptions: true
    });
    
    if (firestoreResponse.getResponseCode() !== 200) {
      console.error('Erro ao salvar no Firestore:', firestoreResponse.getContentText());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      webViewLink: webViewLink
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Função para listar arquivos (opcional)
function doGet(e) {
  try {
    const folderName = 'Love App Photos';
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (!folders.hasNext()) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        files: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const folder = folders.next();
    const files = folder.getFiles();
    const fileList = [];
    
    while (files.hasNext()) {
      const file = files.next();
      fileList.push({
        id: file.getId(),
        name: file.getName(),
        url: file.getDownloadUrl(),
        webViewLink: file.getUrl(),
        createdAt: file.getDateCreated().toISOString()
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      files: fileList
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
