# 🌟 Nasz Dziennik Rodzinny

Prywatna strona internetowa do prowadzenia dziennika rodzinnego – zdjęcia, filmy, kamienie milowe i wspomnienia. Wszystkie dane przechowywane na Twoim Dysku Google!

## 🎯 Funkcje

- 📸 **Oś czasu** – chronologiczna lista wspomnień ze zdjęciami
- 📅 **Kalendarz** – przeglądaj wspomnienia na kalendarzu
- 🖼️ **Galeria** – wszystkie zdjęcia w jednym miejscu z filtrowaniem
- 👶🐕 **Profile** – profil dziecka i psa z kamieniami milowymi
- ⭐ **Kamienie milowe** – oznaczaj ważne momenty
- 🔒 **Prywatność** – dostęp tylko dla zalogowanych
- ☁️ **Google Drive** – bezpieczne przechowywanie na Twoim dysku

## 🛠️ Technologie

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Autentykacja:** Google OAuth 2.0
- **Dane:** Google Drive API (zdjęcia + pliki JSON z metadanymi)
- **Hosting:** Vercel (frontend) + Render (backend) – darmowe!

## 🚀 Uruchomienie lokalne

### 1. Skonfiguruj Google Cloud (patrz: SETUP.md)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edytuj .env wpisując swoje klucze
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Otwórz http://localhost:3000

## 📁 Struktura na Google Drive

Po uruchomieniu aplikacja automatycznie tworzy na Twoim dysku:

```
DziennikRodzinny/
├── entries.json     (wpisy dziennika)
├── profiles.json    (profile dziecka i psa)
├── 2025-01/         (zdjęcia ze stycznia 2025)
│   ├── foto1.jpg
│   └── foto2.mp4
├── 2025-02/         (zdjęcia z lutego 2025)
└── ...
```

## 🌐 Darmowy Hosting

- **Frontend** → [Vercel](https://vercel.com) (darmowy plan)
- **Backend** → [Render](https://render.com) (darmowy plan)

Szczegóły w pliku DEPLOY.md.
