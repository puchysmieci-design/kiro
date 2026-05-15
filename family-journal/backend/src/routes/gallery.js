import { Router } from 'express'
import { isAuthenticated } from '../middleware/auth.js'
import {
  createDriveClient,
  getOrCreateFolder,
  getMetadataFile
} from '../services/googleDrive.js'

const router = Router()

// Pobierz galerię (wszystkie zdjęcia z wpisów)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    const metadata = await getMetadataFile(drive, folderId, 'entries.json')

    if (!metadata) {
      return res.json([])
    }

    let entries = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data

    // Filtruj tylko wpisy ze zdjęciami
    const images = entries
      .filter(entry => entry.imageUrl)
      .map(entry => ({
        id: entry.id,
        imageUrl: entry.imageUrl,
        thumbnailUrl: entry.thumbnailUrl,
        title: entry.title,
        date: entry.date,
        profile: entry.profile,
        profileEmoji: entry.profileEmoji,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json(images)
  } catch (err) {
    console.error('Błąd ładowania galerii:', err)
    res.status(500).json({ error: 'Nie udało się pobrać galerii' })
  }
})

export default router
