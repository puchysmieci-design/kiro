import { Router } from 'express'
import { isAuthenticated } from '../middleware/auth.js'
import {
  createDriveClient,
  getOrCreateFolder,
  getMetadataFile,
  saveMetadataFile
} from '../services/googleDrive.js'

const router = Router()

// Pobierz członków rodziny
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    const metadata = await getMetadataFile(drive, folderId, 'family.json')

    if (!metadata) {
      // Zwróć właściciela (aktualnie zalogowanego)
      return res.json([{
        id: `owner-${req.user.id}`,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        relation: 'rodzic',
        role: 'editor',
        isOwner: true,
        addedAt: new Date().toISOString(),
      }])
    }

    let members = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data

    // Upewnij się że właściciel jest na liście
    const ownerExists = members.some(m => m.isOwner)
    if (!ownerExists) {
      members.unshift({
        id: `owner-${req.user.id}`,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        relation: 'rodzic',
        role: 'editor',
        isOwner: true,
        addedAt: new Date().toISOString(),
      })
    }

    res.json(members)
  } catch (err) {
    console.error('Błąd pobierania rodziny:', err)
    res.status(500).json({ error: 'Nie udało się pobrać listy rodziny' })
  }
})

// Dodaj członka rodziny (zaproś)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { email, name, relation, role } = req.body

    if (!email || !name) {
      return res.status(400).json({ error: 'Email i imię są wymagane' })
    }

    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)

    // Pobierz istniejących członków
    const metadata = await getMetadataFile(drive, folderId, 'family.json')
    let members = []
    if (metadata) {
      members = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    } else {
      // Dodaj właściciela jako pierwszy element
      members.push({
        id: `owner-${req.user.id}`,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        relation: 'rodzic',
        role: 'editor',
        isOwner: true,
        addedAt: new Date().toISOString(),
      })
    }

    // Sprawdź czy już istnieje
    if (members.some(m => m.email === email)) {
      return res.status(400).json({ error: 'Ta osoba jest już dodana' })
    }

    const newMember = {
      id: `member-${Date.now()}`,
      name,
      email,
      avatar: null,
      relation: relation || 'inny',
      role: role || 'viewer',
      isOwner: false,
      addedAt: new Date().toISOString(),
    }

    members.push(newMember)
    await saveMetadataFile(drive, folderId, members, 'family.json')

    res.status(201).json(newMember)
  } catch (err) {
    console.error('Błąd dodawania członka rodziny:', err)
    res.status(500).json({ error: 'Nie udało się dodać osoby' })
  }
})

// Zaktualizuj rolę członka
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    const metadata = await getMetadataFile(drive, folderId, 'family.json')

    if (!metadata) {
      return res.status(404).json({ error: 'Nie znaleziono' })
    }

    let members = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    const memberIndex = members.findIndex(m => m.id === id)

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Nie znaleziono osoby' })
    }

    if (members[memberIndex].isOwner) {
      return res.status(403).json({ error: 'Nie można zmienić roli właściciela' })
    }

    members[memberIndex] = { ...members[memberIndex], role }
    await saveMetadataFile(drive, folderId, members, 'family.json')

    res.json(members[memberIndex])
  } catch (err) {
    console.error('Błąd aktualizacji:', err)
    res.status(500).json({ error: 'Nie udało się zaktualizować' })
  }
})

// Usuń członka rodziny
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params

    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    const metadata = await getMetadataFile(drive, folderId, 'family.json')

    if (!metadata) {
      return res.status(404).json({ error: 'Nie znaleziono' })
    }

    let members = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    const member = members.find(m => m.id === id)

    if (!member) {
      return res.status(404).json({ error: 'Nie znaleziono osoby' })
    }

    if (member.isOwner) {
      return res.status(403).json({ error: 'Nie można usunąć właściciela' })
    }

    members = members.filter(m => m.id !== id)
    await saveMetadataFile(drive, folderId, members, 'family.json')

    res.json({ message: 'Osoba usunięta' })
  } catch (err) {
    console.error('Błąd usuwania:', err)
    res.status(500).json({ error: 'Nie udało się usunąć' })
  }
})

export default router
