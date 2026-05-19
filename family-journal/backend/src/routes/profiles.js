import { Router } from 'express'
import { isAuthenticated } from '../middleware/auth.js'
import {
  createDriveClient,
  getOrCreateFolder,
  getMetadataFile,
  saveMetadataFile
} from '../services/googleDrive.js'

const router = Router()

// Pobierz profile
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    const metadata = await getMetadataFile(drive, folderId, 'profiles.json')

    if (!metadata) {
      return res.json({
        child: { name: '', birthDate: '', emoji: '👶', milestones: [] },
        dog: { name: '', birthDate: '', emoji: '🐕', milestones: [] },
      })
    }

    const profiles = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    res.json(profiles)
  } catch (err) {
    console.error('Błąd pobierania profili:', err)
    res.status(500).json({ error: 'Nie udało się pobrać profili' })
  }
})

// Zaktualizuj profil
router.put('/:type', isAuthenticated, async (req, res) => {
  try {
    const { type } = req.params
    if (!['child', 'dog'].includes(type)) {
      return res.status(400).json({ error: 'Nieprawidłowy typ profilu' })
    }

    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    
    // Pobierz istniejące profile
    const metadata = await getMetadataFile(drive, folderId, 'profiles.json')
    let profiles = {
      child: { name: '', birthDate: '', emoji: '👶', milestones: [] },
      dog: { name: '', birthDate: '', emoji: '🐕', milestones: [] },
    }

    if (metadata) {
      profiles = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    }

    // Zachowaj milestones
    const existingMilestones = profiles[type]?.milestones || []
    
    profiles[type] = {
      ...profiles[type],
      ...req.body,
      milestones: req.body.milestones || existingMilestones,
    }

    await saveMetadataFile(drive, folderId, profiles, 'profiles.json')
    res.json(profiles[type])
  } catch (err) {
    console.error('Błąd aktualizacji profilu:', err)
    res.status(500).json({ error: 'Nie udało się zaktualizować profilu' })
  }
})

export default router
