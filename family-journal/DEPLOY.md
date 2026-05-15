# 🌐 Instrukcja wdrożenia (hosting za darmo)

## Opcja 1: Vercel (frontend) + Render (backend)

### Backend na Render.com

1. Wejdź na https://render.com i załóż darmowe konto
2. Kliknij **"New +"** → **"Web Service"**
3. Połącz z repozytorium GitHub (lub wrzuć kod)
4. Konfiguracja:
   - **Name:** `dziennik-rodzinny-api`
   - **Root Directory:** `family-journal/backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Dodaj zmienne środowiskowe (Environment Variables):
   - `GOOGLE_CLIENT_ID` = twój client id
   - `GOOGLE_CLIENT_SECRET` = twój secret
   - `GOOGLE_CALLBACK_URL` = `https://dziennik-rodzinny-api.onrender.com/auth/google/callback`
   - `SESSION_SECRET` = losowy ciąg znaków
   - `CLIENT_URL` = adres URL frontendu (dodasz po deployu frontendu)
   - `NODE_ENV` = `production`
6. Kliknij **"Create Web Service"**
7. Zanotuj URL: `https://dziennik-rodzinny-api.onrender.com`

### Frontend na Vercel

1. Wejdź na https://vercel.com i załóż konto (GitHub)
2. Kliknij **"New Project"**
3. Zaimportuj repozytorium GitHub
4. Konfiguracja:
   - **Root Directory:** `family-journal/frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Dodaj zmienną środowiskową:
   - `VITE_API_URL` = `https://dziennik-rodzinny-api.onrender.com`
6. Kliknij **"Deploy"**
7. Zanotuj URL: np. `https://dziennik-rodzinny.vercel.app`

### Aktualizacja po deployu

1. Na **Render** ustaw `CLIENT_URL` na adres Vercela
2. W **Google Cloud Console** dodaj do "Autoryzowane URI przekierowania":
   - `https://dziennik-rodzinny-api.onrender.com/auth/google/callback`
3. W **Google Cloud Console** dodaj do "Autoryzowane domeny":
   - `onrender.com`
   - `vercel.app`

---

## Opcja 2: Railway (backend + frontend razem)

1. Wejdź na https://railway.app
2. Połącz z GitHub
3. Dodaj serwis z folderu `backend/`
4. Dodaj serwis statyczny z folderu `frontend/` (build)
5. Ustaw zmienne środowiskowe analogicznie

---

## ⚠️ Uwagi dotyczące darmowych planów

### Render (free tier):
- Usługa "zasypia" po 15 minutach nieaktywności
- Pierwsze ładowanie po uśpieniu trwa ~30-60 sekund
- 750h/miesiąc (wystarczy na ciągłe działanie)

### Vercel (free tier):
- Nieograniczone deploye
- 100GB bandwidth/miesiąc
- Idealne dla frontendów SPA

### Alternatywy:
- **Fly.io** – darmowy plan z "always on"
- **Deta.space** – świetne do małych projektów
- **Netlify** – jak Vercel, dla frontendu
