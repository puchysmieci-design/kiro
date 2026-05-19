import { Router } from 'express'
import { isAuthenticated } from '../middleware/auth.js'
import {
  createDriveClient,
  getOrCreateFolder,
  getMetadataFile,
  saveMetadataFile
} from '../services/googleDrive.js'

const router = Router()

// Pobierz wszystkie fotoksiążki
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)
    const metadata = await getMetadataFile(drive, folderId, 'photobooks.json')

    if (!metadata) {
      return res.json([])
    }

    const books = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    res.json(books)
  } catch (err) {
    console.error('Błąd pobierania fotoksiążek:', err)
    res.status(500).json({ error: 'Nie udało się pobrać fotoksiążek' })
  }
})

// Utwórz nową fotoksiążkę
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)

    const newBook = {
      id: `book-${Date.now()}`,
      title: req.body.title,
      description: req.body.description || '',
      pages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Pobierz istniejące fotoksiążki
    const metadata = await getMetadataFile(drive, folderId, 'photobooks.json')
    let books = []
    if (metadata) {
      books = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    }

    books.push(newBook)
    await saveMetadataFile(drive, folderId, books, 'photobooks.json')

    res.status(201).json(newBook)
  } catch (err) {
    console.error('Błąd tworzenia fotoksiążki:', err)
    res.status(500).json({ error: 'Nie udało się utworzyć fotoksiążki' })
  }
})

// Zaktualizuj fotoksiążkę (dodaj/usuń strony, zmień dane)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)

    const metadata = await getMetadataFile(drive, folderId, 'photobooks.json')
    if (!metadata) {
      return res.status(404).json({ error: 'Nie znaleziono fotoksiążek' })
    }

    let books = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    const bookIndex = books.findIndex(b => b.id === id)

    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Nie znaleziono fotoksiążki' })
    }

    books[bookIndex] = {
      ...books[bookIndex],
      ...req.body,
      id, // zachowaj oryginalne ID
      updatedAt: new Date().toISOString(),
    }

    await saveMetadataFile(drive, folderId, books, 'photobooks.json')
    res.json(books[bookIndex])
  } catch (err) {
    console.error('Błąd aktualizacji fotoksiążki:', err)
    res.status(500).json({ error: 'Nie udało się zaktualizować fotoksiążki' })
  }
})

// Usuń fotoksiążkę
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const drive = createDriveClient(req.user)
    const folderId = await getOrCreateFolder(drive)

    const metadata = await getMetadataFile(drive, folderId, 'photobooks.json')
    if (!metadata) {
      return res.status(404).json({ error: 'Nie znaleziono fotoksiążek' })
    }

    let books = typeof metadata.data === 'string' ? JSON.parse(metadata.data) : metadata.data
    books = books.filter(b => b.id !== id)

    await saveMetadataFile(drive, folderId, books, 'photobooks.json')
    res.json({ message: 'Fotoksiążka usunięta' })
  } catch (err) {
    console.error('Błąd usuwania fotoksiążki:', err)
    res.status(500).json({ error: 'Nie udało się usunąć fotoksiążki' })
  }
})

export default router
