# 🔧 Konfiguracja Google Cloud – krok po kroku

## Krok 1: Utwórz projekt Google Cloud

1. Wejdź na https://console.cloud.google.com/
2. Kliknij na **"Wybierz projekt"** (góra strony) → **"Nowy projekt"**
3. Nazwa: `DziennikRodzinny` (lub dowolna)
4. Kliknij **"Utwórz"**

## Krok 2: Włącz Google Drive API

1. W menu bocznym: **API i usługi** → **Biblioteka**
2. Wyszukaj: `Google Drive API`
3. Kliknij na wynik → **"Włącz"**

## Krok 3: Skonfiguruj ekran zgody OAuth

1. Menu: **API i usługi** → **Ekran zgody OAuth**
2. Wybierz typ: **Zewnętrzny** → **Utwórz**
3. Wypełnij:
   - Nazwa aplikacji: `Nasz Dziennik Rodzinny`
   - E-mail pomocy technicznej: Twój email
   - Autoryzowane domeny: (pomiń na razie)
   - Email programisty: Twój email
4. Kliknij **"Zapisz i kontynuuj"**
5. Na stronie "Zakresy" kliknij **"Dodaj lub usuń zakresy"**:
   - Znajdź: `https://www.googleapis.com/auth/drive.file`
   - Zaznacz i **"Zaktualizuj"**
6. **"Zapisz i kontynuuj"**
7. Na stronie "Użytkownicy testowi" → **"Dodaj użytkowników"**
   - Wpisz swój email i emaile rodziny (osoby, które mają mieć dostęp)
8. **"Zapisz i kontynuuj"**

## Krok 4: Utwórz dane uwierzytelniające (klucze)

1. Menu: **API i usługi** → **Dane uwierzytelniające**
2. Kliknij **"Utwórz dane uwierzytelniające"** → **"Identyfikator klienta OAuth"**
3. Typ aplikacji: **Aplikacja internetowa**
4. Nazwa: `Dziennik Backend`
5. **Autoryzowane URI przekierowania** – dodaj:
   - `http://localhost:5000/auth/google/callback` (dla dev)
   - `https://TWOJA-DOMENA-BACKEND.onrender.com/auth/google/callback` (po deploymencie)
6. Kliknij **"Utwórz"**
7. **WAŻNE:** Zanotuj:
   - **Client ID** (coś jak: `123456789.apps.googleusercontent.com`)
   - **Client Secret** (coś jak: `GOCSPX-xxxxxxxxxxx`)

## Krok 5: Skonfiguruj plik .env

W folderze `backend/` skopiuj plik `.env.example` do `.env` i wpisz:

```env
GOOGLE_CLIENT_ID=twoj-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-twoj-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=wygeneruj-losowy-ciag-32-znakow
CLIENT_URL=http://localhost:3000
PORT=5000
DRIVE_FOLDER_NAME=DziennikRodzinny
```

### Jak wygenerować SESSION_SECRET?

Wpisz w terminalu:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Krok 6: Testowanie

1. Uruchom backend: `cd backend && npm run dev`
2. Uruchom frontend: `cd frontend && npm run dev`
3. Otwórz http://localhost:3000
4. Kliknij "Zaloguj się przez Google"
5. Wybierz konto Google z listy użytkowników testowych
6. Zaakceptuj uprawnienia

## ⚠️ Ważne uwagi

- **Użytkownicy testowi:** Dopóki aplikacja jest w trybie "Testowanie", tylko dodani użytkownicy testowi mogą się logować. Aby wszyscy mogli się logować, trzeba przejść weryfikację Google (ale do użytku rodzinnego tryb testowy wystarczy!)
- **Drive API File scope:** Aplikacja ma dostęp TYLKO do plików, które sama utworzyła – nie widzi żadnych innych plików na Twoim dysku.
- **Limit Google Cloud darmowy:** 1 miliard zapytań API dziennie – w zupełności wystarczający.

## 🔄 Odświeżanie tokenów

Aplikacja automatycznie prosi o `refresh_token` przy pierwszym logowaniu (dzięki `prompt: 'consent'`). Dzięki temu sesja jest ważna nawet po wygaśnięciu access tokena.
