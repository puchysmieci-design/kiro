import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import authRoutes from './routes/auth.js'
import entriesRoutes from './routes/entries.js'
import profilesRoutes from './routes/profiles.js'
import galleryRoutes from './routes/gallery.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session (z zapamiętywaniem - 30 dni)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dni
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/drive.file'
  ]
}, (accessToken, refreshToken, profile, done) => {
  // Przechowujemy tokeny w sesji
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails?.[0]?.value,
    avatar: profile.photos?.[0]?.value,
    accessToken,
    refreshToken,
  }
  return done(null, user)
}))

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

// Routes
app.use('/auth', authRoutes)
app.use('/api/entries', entriesRoutes)
app.use('/api/profiles', profilesRoutes)
app.use('/api/gallery', galleryRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serwer działa!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`)
})
