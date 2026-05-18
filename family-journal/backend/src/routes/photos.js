import { Router } from 'express'
import { isAuthenticated } from '../middleware/auth.js'

const router = Router()

const PHOTOS_API = 'https://photoslibrary.googleapis.com/v1'

// Pobierz zdjęcia z Google Photos (najnowsze)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { pageToken, pageSize = 50 } = req.query

    const body = {
      pageSize: parseInt(pageSize),
    }
    if (pageToken) body.pageToken = pageToken

    const response = await fetch(`${PHOTOS_API}/mediaItems:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Photos API error:', error)
      return res.status(response.status).json({ error: 'Nie udało się pobrać zdjęć z Google Photos' })
    }

    const data = await response.json()

    // Formatuj odpowiedź
    const photos = (data.mediaItems || []).map(item => ({
      id: item.id,
      filename: item.filename,
      mimeType: item.mimeType,
      description: item.description || '',
      createdAt: item.mediaMetadata?.creationTime,
      width: item.mediaMetadata?.width,
      height: item.mediaMetadata?.height,
      // URL z parametrami rozmiaru (Google Photos wymaga =w i =h)
      thumbnailUrl: `${item.baseUrl}=w300-h300-c`,
      fullUrl: `${item.baseUrl}=w1200-h1200`,
      originalUrl: `${item.baseUrl}=d`, // do pobrania oryginału
      isVideo: item.mimeType?.startsWith('video/'),
      videoDuration: item.mediaMetadata?.video?.status === 'READY' 
        ? item.mediaMetadata.video.duration 
        : null,
    }))

    res.json({
      photos,
      nextPageToken: data.nextPageToken || null,
    })
  } catch (err) {
    console.error('Błąd Google Photos:', err)
    res.status(500).json({ error: 'Błąd połączenia z Google Photos' })
  }
})

// Dodaj zdjęcie z Google Photos do dziennika (kopiuje na Google Drive)
router.post('/add-to-journal', isAuthenticated, async (req, res) => {
  try {
    const { photoId, photoUrl, title, description, date, profile, milestone } = req.body

    if (!photoUrl) {
      return res.status(400).json({ error: 'Brak URL zdjęcia' })
    }

    // Pobierz zdjęcie z Google Photos
    const photoResponse = await fetch(`${photoUrl}=d`)
    if (!photoResponse.ok) {
      return res.status(400).json({ error: 'Nie udało się pobrać zdjęcia' })
    }

    const photoBuffer = Buffer.from(await photoResponse.arrayBuffer())
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg'

    // Import serwisu Google Drive
    const { createDriveClient, getOrCreateFolder, getOrCreateSubfolder, uploadFile, getMetadataFile, saveMetadataFile } = await import('../services/googleDrive.js')

    const drive = createDriveClient(req.user)
    const rootFolderId = await getOrCreateFolder(drive)

    // Upload na Google Drive
    const entryDate = new Date(date || Date.now())
    const monthFolder = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`
    const mediaFolderId = await getOrCreateSubfolder(drive, rootFolderId, monthFolder)

    const fileName = `gphoto-${Date.now()}-${photoId?.slice(0, 8) || 'img'}.jpg`
    const imageData = await uploadFile(drive, mediaFolderId, fileName, contentType, photoBuffer)

    // Stwórz wpis w dzienniku
    const entry = {
      id: `entry-${Date.now()}`,
      title: title || '',
      description: description || '',
      date: date || entryDate.toISOString().split('T')[0],
      profile: profile || 'child',
      profileName: profile === 'dog' ? '🐕 Pies' : '👶 Dziecko',
      profileEmoji: profile === 'dog' ? '🐕' : '👶',
      milestone: milestone || null,
      imageUrl: imageData?.imageUrl || null,
      thumbnailUrl: imageData?.thumbnailUrl || null,
      fileId: imageData?.fileId || null,
      source: 'google-photos',
      sourcePhotoId: photoId,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    }

    // Dodaj do entries.json
    const existingMeta = await getMetadataFile(drive, rootFolderId, 'entries.json')
    let entries = []
    if (existingMeta) {
      entries = typeof existingMeta.data === 'string' ? JSON.parse(existingMeta.data) : existingMeta.data
    }
    entries.push(entry)
    await saveMetadataFile(drive, rootFolderId, entries, 'entries.json')

    res.status(201).json(entry)
  } catch (err) {
    console.error('Błąd dodawania z Google Photos:', err)
    res.status(500).json({ error: 'Nie udało się dodać zdjęcia do dziennika' })
  }
})

export default router
