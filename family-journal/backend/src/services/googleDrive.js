import { google } from 'googleapis'

/**
 * Tworzy klienta Google Drive z tokenem użytkownika
 */
export function createDriveClient(user) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  })
  return google.drive({ version: 'v3', auth })
}

/**
 * Pobierz lub utwórz główny folder dziennika
 */
export async function getOrCreateFolder(drive, folderName = null) {
  const name = folderName || process.env.DRIVE_FOLDER_NAME || 'DziennikRodzinny'
  
  // Szukaj istniejącego folderu
  const response = await drive.files.list({
    q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  })

  if (response.data.files.length > 0) {
    return response.data.files[0].id
  }

  // Utwórz nowy folder
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  })

  return folder.data.id
}

/**
 * Pobierz lub utwórz podfolder (np. "2025-01" dla zdjęć z danego miesiąca)
 */
export async function getOrCreateSubfolder(drive, parentId, subfolderName) {
  const response = await drive.files.list({
    q: `name='${subfolderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  })

  if (response.data.files.length > 0) {
    return response.data.files[0].id
  }

  const folder = await drive.files.create({
    requestBody: {
      name: subfolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })

  return folder.data.id
}

/**
 * Upload pliku na Google Drive
 */
export async function uploadFile(drive, folderId, fileName, mimeType, buffer) {
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: bufferToStream(buffer),
    },
    fields: 'id, webViewLink, webContentLink, thumbnailLink',
  })

  // Ustaw uprawnienia aby był dostępny przez link
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
    imageUrl: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${response.data.id}&sz=w400`,
  }
}

/**
 * Pobierz plik metadanych (JSON) z folderu
 */
export async function getMetadataFile(drive, folderId, fileName = 'metadata.json') {
  const response = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
  })

  if (response.data.files.length === 0) {
    return null
  }

  const file = await drive.files.get({
    fileId: response.data.files[0].id,
    alt: 'media',
  })

  return {
    id: response.data.files[0].id,
    data: file.data,
  }
}

/**
 * Utwórz lub zaktualizuj plik metadanych (JSON)
 */
export async function saveMetadataFile(drive, folderId, data, fileName = 'metadata.json') {
  const content = JSON.stringify(data, null, 2)
  
  // Sprawdź czy plik już istnieje
  const existing = await getMetadataFile(drive, folderId, fileName)

  if (existing) {
    // Zaktualizuj
    await drive.files.update({
      fileId: existing.id,
      media: {
        mimeType: 'application/json',
        body: content,
      },
    })
    return existing.id
  }

  // Utwórz nowy
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/json',
    },
    media: {
      mimeType: 'application/json',
      body: content,
    },
    fields: 'id',
  })

  return response.data.id
}

/**
 * Konwertuj Buffer na readable stream
 */
import { Readable } from 'stream'

function bufferToStream(buffer) {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}
