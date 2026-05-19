import { Router } from 'express'
import passport from 'passport'

const router = Router()

// Rozpocznij logowanie Google
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'https://www.googleapis.com/auth/youtube.readonly'
  ],
  accessType: 'offline',
  prompt: 'consent',
}))

// Callback po zalogowaniu
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000')
  }
)

// Pobierz aktualnego użytkownika
router.get('/current-user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nie zalogowany' })
  }
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
  })
})

// Debug: sprawdź scope tokena
router.get('/debug-token', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nie zalogowany' })
  }
  // Sprawdź jakie scope ma token
  fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${req.user.accessToken}`)
    .then(r => r.json())
    .then(data => res.json({ tokenInfo: data, userScopes: data.scope }))
    .catch(err => res.json({ error: err.message }))
})

// Wyloguj
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Błąd wylogowania' })
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000')
  })
})

export default router
