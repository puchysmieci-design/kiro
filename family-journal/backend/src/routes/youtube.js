import { Router } from 'express'
import { isAuthenticated } from '../middleware/auth.js'
import {
  createDriveClient,
  getOrCreateFolder,
  getMetadataFile,
  saveMetadataFile
} from '../services/googleDrive.js'

const router = Router()

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3'

// Pobierz filmy z kanału PUCZATOR (lub innego skonfigurowanego)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Pobierz kanał po handle @PUCZATOR (lub z env)
    const channelHandle = process.env.YOUTUBE_CHANNEL_HANDLE || '@PUCZATOR'
    const channelRes = await fetch(`${YOUTUBE_API}/channels?part=contentDetails,snippet&forHandle=${channelHandle}`, {
      headers: { 'Authorization': `Bearer ${req.user.accessToken}` }
    })

    if (!channelRes.ok) {
      const err = await channelRes.json()
      console.error('YouTube channels error:', err)
      return res.status(channelRes.status).json({ error: 'Nie udało się pobrać danych kanału' })
    }

    const channelData = await channelRes.json()
    if (!channelData.items || channelData.items.length === 0) {
      return res.json([])
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

    // Pobierz filmy z playlisty "uploads"
    const videosRes = await fetch(
      `${YOUTUBE_API}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
      { headers: { 'Authorization': `Bearer ${req.user.accessToken}` } }
    )

    if (!videosRes.ok) {
      return res.status(videosRes.status).json({ error: 'Nie udało się pobrać filmów' })
    }

    const videosData = await videosRes.json()

    // Pobierz dodatkowe info o filmach (views, duration)
    const videoIds = (videosData.items || []).map(item => item.contentDetails.videoId).join(',')
    
    let videoDetails = {}
    if (videoIds) {
      const detailsRes = await fetch(
        `${YOUTUBE_API}/videos?part=statistics,contentDetails&id=${videoIds}`,
        { headers: { 'Authorization': `Bearer ${req.user.accessToken}` } }
      )
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json()
        detailsData.items?.forEach(item => {
          videoDetails[item.id] = {
            views: formatViews(item.statistics?.viewCount),
            duration: formatDuration(item.contentDetails?.duration),
          }
        })
      }
    }

    // Formatuj odpowiedź
    const videos = (videosData.items || []).map(item => {
      const videoId = item.contentDetails.videoId
      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description?.slice(0, 200) || '',
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        views: videoDetails[videoId]?.views || '0',
        duration: videoDetails[videoId]?.duration || '',
      }
    })

    res.json(videos)
  } catch (err) {
    console.error('Błąd YouTube:', err)
    res.status(500).json({ error: 'Błąd połączenia z YouTube' })
  }
})

// Dodaj film z YouTube do dziennika
router.post('/add-to-journal', isAuthenticated, async (req, res) => {
  try {
    const { videoId, title, description, date, profile, thumbnailUrl, youtubeUrl } = req.body

    const drive = createDriveClient(req.user)
    const rootFolderId = await getOrCreateFolder(drive)

    const entry = {
      id: `entry-${Date.now()}`,
      title: title || '',
      description: description || '',
      date: date || new Date().toISOString().split('T')[0],
      profile: profile || 'child',
      profileName: profile === 'dog' ? '🐕 Pies' : '👶 Dziecko',
      profileEmoji: profile === 'dog' ? '🐕' : '👶',
      milestone: null,
      imageUrl: thumbnailUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      youtubeUrl: youtubeUrl || null,
      videoId: videoId || null,
      source: 'youtube',
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
    console.error('Błąd dodawania filmu do dziennika:', err)
    res.status(500).json({ error: 'Nie udało się dodać filmu do dziennika' })
  }
})

// Helpers
function formatViews(count) {
  if (!count) return '0'
  const num = parseInt(count)
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return count
}

function formatDuration(iso8601) {
  if (!iso8601) return ''
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = match[1] ? `${match[1]}:` : ''
  const m = match[2] ? match[2].padStart(h ? 2 : 1, '0') : '0'
  const s = match[3] ? match[3].padStart(2, '0') : '00'
  return `${h}${m}:${s}`
}

export default router
