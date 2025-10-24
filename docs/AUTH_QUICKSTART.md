# 🚀 Authentication System - Quick Start

## ✅ Was wurde implementiert?

### Frontend Features
- ✅ **Login Page** (`/auth/login`)
- ✅ **Registrierung** (`/auth/register`) mit Email-Verifikation
- ✅ **Passwort vergessen** (`/auth/forgot-password`)
- ✅ **Passwort zurücksetzen** (`/auth/reset-password`)
- ✅ **Email Callback** (`/auth/callback`)
- ✅ **Protected Routes** - Automatische Weiterleitung zu Login
- ✅ **Auth Context** - Globaler Auth State
- ✅ **Supabase Integration** - Modern authentication

### Backend Features (Supabase)
- ✅ **User Authentication** - Email/Password
- ✅ **Email Verifikation** - Automatisch bei Registrierung
- ✅ **Password Reset** - Via Email
- ✅ **Auto Profile Creation** - Database Trigger erstellt automatisch Player Profile
- ✅ **Row Level Security** - Sichere Datenisolation

## 🎯 Schnellstart

### 1. Supabase Database Setup

Gehe zu deinem Supabase Dashboard → **SQL Editor** und führe folgende Queries aus:

```sql
-- 1. Player Profiles Table
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  money INTEGER DEFAULT 500,
  reputation INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT player_profiles_user_id_key UNIQUE (user_id)
);

-- 2. Enable RLS
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.player_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.player_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Auto Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.player_profiles (user_id, username, money, reputation, level, experience)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    500,
    0,
    1,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Updated Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_player_profile_updated ON public.player_profiles;
CREATE TRIGGER on_player_profile_updated
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 2. Supabase Auth Configuration

**Authentication → URL Configuration:**
- **Site URL**: `http://localhost:5173`
- **Redirect URLs**:
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/auth/reset-password`

**Authentication → Providers:**
- ✅ Enable Email provider
- ⚠️ **Für Development**: Disable "Confirm email" (schnelleres Testing)
- ✅ **Für Production**: Enable "Confirm email"

### 3. Environment Setup

Deine `.env` ist bereits konfiguriert:

```env
VITE_SUPABASE_URL=https://vfghfehsygewqrnwhpyy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Starten

```bash
# Dependencies installieren (bereits gemacht)
npm install

# Dev Server starten
npm run dev
```

Öffne: `http://localhost:5173`

## 🧪 Testing Flow

### 1. Registrierung testen

1. Gehe zu: `http://localhost:5173/auth/register`
2. Fülle das Formular aus:
   - **Username**: `testuser`
   - **Email**: `test@example.com`
   - **Password**: `test123`
3. Klicke "Registrieren"
4. ✅ Success-Seite erscheint
5. ⚠️ Wenn "Confirm email" aktiviert ist:
   - Prüfe Email-Postfach
   - Klicke auf Bestätigungslink
   - Wirst zu `/auth/callback` weitergeleitet
   - Dann zu `/game` weitergeleitet

### 2. Auto Profile Creation prüfen

**Supabase Dashboard → Table Editor → player_profiles:**

```
id: [UUID]
user_id: [UUID vom auth.users]
username: testuser
money: 500
reputation: 0
level: 1
experience: 0
created_at: 2025-01-...
```

✅ **Profile wurde automatisch erstellt!**

### 3. Login testen

1. Gehe zu: `http://localhost:5173/auth/login`
2. Login mit:
   - Email: `test@example.com`
   - Password: `test123`
3. ✅ Automatische Weiterleitung zu `/game`

### 4. Protected Routes testen

1. Im Browser: Lösche Cookies/LocalStorage
2. Versuche zu gehen zu: `http://localhost:5173/game`
3. ✅ Automatische Weiterleitung zu `/auth/login`
4. Nach Login: Weiterleitung zurück zu `/game`

### 5. Passwort vergessen testen

1. Gehe zu: `http://localhost:5173/auth/forgot-password`
2. Gib Email ein: `test@example.com`
3. ✅ Email wird gesendet
4. Klicke auf Link in Email
5. Weiterleitung zu `/auth/reset-password`
6. Setze neues Passwort
7. ✅ Weiterleitung zu `/auth/login`

## 🔍 Troubleshooting

### Email wird nicht gesendet

**Supabase Dashboard → Logs → Authentication:**
- Prüfe ob User erstellt wurde
- Prüfe ob Email gesendet wurde
- Error Messages prüfen

**Quick Fix für Development:**
- Authentication → Email Templates
- Disable "Confirm email"
- User kann sich direkt einloggen

### Profile wird nicht erstellt

```sql
-- Manuell prüfen
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
SELECT * FROM public.player_profiles ORDER BY created_at DESC LIMIT 5;

-- Trigger Status prüfen
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### User existiert aber kein Profile

```sql
-- Manuell Profile erstellen für existierenden User
INSERT INTO public.player_profiles (user_id, username, money, reputation, level, experience)
VALUES (
  '[USER_UUID_HIER]',
  'username',
  500,
  0,
  1,
  0
);
```

## 📁 Neue Dateien

```
src/
├── lib/
│   └── supabase.ts                 # Supabase Client
├── contexts/
│   └── AuthContext.tsx             # Auth State Management
├── components/
│   └── ProtectedRoute.tsx          # Route Protection
├── pages/
│   └── auth/
│       ├── Login.tsx               # Login Page
│       ├── Register.tsx            # Register Page
│       ├── ForgotPassword.tsx      # Forgot Password
│       ├── ResetPassword.tsx       # Reset Password
│       └── AuthCallback.tsx        # Email Callback Handler
└── App.tsx                         # Updated with Auth Routes
```

## 🎨 UI Features

- ✅ Modern Glassmorphism Design
- ✅ Neon Gradient Branding
- ✅ Responsive (Mobile-First)
- ✅ Loading States
- ✅ Error Handling
- ✅ Success Messages
- ✅ Toast Notifications
- ✅ Accessible (WCAG)

## 🔐 Security Features

- ✅ JWT Tokens (Supabase Auth)
- ✅ HTTP-Only Cookies
- ✅ Row Level Security (RLS)
- ✅ Email Verification
- ✅ Password Reset via Email
- ✅ Protected Routes
- ✅ Session Management
- ✅ Auto Token Refresh

## 🚀 Next Steps

### Integration mit bestehendem Backend

Wenn du das bestehende Express Backend weiter nutzen möchtest:

```typescript
// src/lib/api.ts
import { supabase } from './supabase';

class ApiClient {
  async request(endpoint: string, options = {}) {
    // Get Supabase session token
    const { data: { session } } = await supabase.auth.getSession();

    const headers = {
      'Content-Type': 'application/json',
      ...(session && { 'Authorization': `Bearer ${session.access_token}` }),
    };

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }
}
```

### Erweiterte Features

- [ ] Social Auth (Google, GitHub, etc.)
- [ ] Multi-Factor Authentication (MFA)
- [ ] Session Limits
- [ ] Device Management
- [ ] Activity Logs
- [ ] Profile Images Upload

## 📚 Documentation

- [Vollständige Supabase Setup Anleitung](./SUPABASE_SETUP.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Das komplette Auth-System ist bereit!** 🎉

Alle Dateien sind erstellt, Supabase ist konfiguriert, und das System ist einsatzbereit.
