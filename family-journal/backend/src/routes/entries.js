import { Router } from 'express'
import multer from 'multer'
import { isAuthenticated } from '../middleware/auth.js'
import {
  createDriveClient,
  getOrCreateFolder,
  getOrCreateSubfolder,
  uploadFile,
  getMetadataFile,
  saveMetadataFile
} from '../services/googleDrive.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

// Pobierz wpisy
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    const metadata = await getMetadataFile(drive, folderId, 'entries.json')

    if (!metadata) {
      return res.json([])
    }

    let entries = metadata.data
    if (typeof entries === 'string') {
      entries = JSON.parse(entries)
    }

    // Filtrowanie po miesiącu/roku jeśli podano
    const { month, year } = req.query
    if (month && year) {
      entries = entries.filter(e => {
        const d = new Date(e.date)
        return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year)
      })
    }

    // Sortuj od najnowszych
    entries.sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json(entries)
  } catch (err) {
    console.error('Błąd pobierania wpisów:', err)
    res.status(500).json({ error: 'Nie udało się pobrać wpisów' })
  }
})

// Dodaj nowy wpis
router.post('/', isAuthenticated, upload.single('media'), async (req, res) => {
  try {
    const drive = createDriveClient(req.user)
    const rootFolderId = await getOrCreateFolder(drive)

    let imageData = null

    // Upload pliku jeśli jest
    if (req.file) {
      const date = new Date(req.body.date || Date.now())
      const monthFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const mediaFolderId = await getOrCreateSubfolder(drive, rootFolderId, monthFolder)

      const fileName = `${Date.now()}-${req.file.originalname}`
      imageData = await uploadFile(
        drive,
        mediaFolderId,
        fileName,
        req.file.mimetype,
        req.file.buffer
      )
    }

    // Stwórz wpis
    const entry = {
      id: `entry-${Date.now()}`,
      title: req.body.title || '',
      description: req.body.description || '',
      date: req.body.date || new Date().toISOString().split('T')[0],
      profile: req.body.profile || 'child',
      profileName: req.body.profile === 'dog' ? '🐕 Pies' : '👶 Dziecko',
      profileEmoji: req.body.profile === 'dog' ? '🐕' : '👶',
      milestone: req.body.milestone || null,
      imageUrl: imageData?.imageUrl || null,
      thumbnailUrl: imageData?.thumbnailUrl || null,
      fileId: imageData?.fileId || null,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    }

    // Pobierz istniejące wpisy
    const existingMeta = await getMetadataFile(drive, rootFolderId, 'entries.json')
    let entries = []
    if (existingMeta) {
      entries = typeof existingMeta.data === 'string' ? JSON.parse(existingMeta.data) : existingMeta.data
    }

    entries.push(entry)

    // Zapisz zaktualizowane wpisy
    await saveMetadataFile(drive, rootFolderId, entries, 'entries.json')

    // Jeśli to kamień milowy, zaktualizuj profil
    if (entry.milestone) {
      await addMilestoneToProfile(drive, rootFolderId, entry.profile, {
        title: entry.milestone,
        date: entry.date,
        entryId: entry.id,
      })
    }

    res.status(201).json(entry)
  } catch (err) {
    console.error('Błąd dodawania wpisu:', err)
    res.status(500).json({ error: 'Nie udało się dodać wpisu' })
  }
})

// Pomocnicza - dodaj kamień milowy do profilu
async function addMilestoneToProfile(drive, rootFolderId, profileType, milestone) {
  const metadata = await getMetadataFile(drive, rootFolderId, 'profiles.json')
  let profiles = {
    child: { name: '', birthDate: '', emoji: '👶', milestones: [] },
    dog: { name: '', birthDate: '', emoji: '🐕', milestones: [] },
  }

  if (metadata) {
    profiles = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
  }

  if (!profiles[profileType].milestones) {
    profiles[profileType].milestones = []
  }
  profiles[profileType].milestones.push(milestone)

  await saveMetadataFile(drive, rootFolderId, profiles, 'profiles.json')
}

export default router
