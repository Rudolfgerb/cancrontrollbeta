# 🔐 Supabase Authentication Setup Guide

## 📋 Database Setup

Führe die folgenden SQL-Befehle in deinem Supabase SQL Editor aus:

### 1. Player Profiles Table erstellen

```sql
-- Create player_profiles table
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

-- Enable Row Level Security
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.player_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.player_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS player_profiles_user_id_idx ON public.player_profiles(user_id);
CREATE INDEX IF NOT EXISTS player_profiles_username_idx ON public.player_profiles(username);
```

### 2. Auto Profile Creation Trigger

```sql
-- Function to create player profile on user signup
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

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Updated Timestamp Trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS on_player_profile_updated ON public.player_profiles;
CREATE TRIGGER on_player_profile_updated
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 4. Inventory Tables (Optional - für spätere Erweiterung)

```sql
-- Create inventory table
CREATE TABLE IF NOT EXISTS public.player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.player_profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT player_inventory_unique UNIQUE (player_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own inventory"
  ON public.player_inventory
  FOR SELECT
  USING (player_id IN (
    SELECT id FROM public.player_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own inventory"
  ON public.player_inventory
  FOR ALL
  USING (player_id IN (
    SELECT id FROM public.player_profiles WHERE user_id = auth.uid()
  ));
```

## 🔧 Supabase Dashboard Konfiguration

### Email Templates anpassen

Gehe zu: **Authentication** → **Email Templates**

#### Confirm Signup Template
```html
<h2>Willkommen bei CanControl!</h2>
<p>Bestätige deine Email-Adresse um loszulegen:</p>
<p><a href="{{ .ConfirmationURL }}">Email bestätigen</a></p>
```

#### Reset Password Template
```html
<h2>Passwort zurücksetzen</h2>
<p>Du hast eine Passwort-Zurücksetzen-Anfrage gestellt.</p>
<p><a href="{{ .ConfirmationURL }}">Neues Passwort setzen</a></p>
```

### URL Configuration

Gehe zu: **Authentication** → **URL Configuration**

Füge folgende URLs hinzu:
- **Site URL**: `http://localhost:5173` (Development) oder deine Production URL
- **Redirect URLs**:
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/auth/reset-password`
  - Deine Production URLs

### Email Auth aktivieren

Gehe zu: **Authentication** → **Providers**

Stelle sicher, dass **Email** aktiviert ist:
- ✅ Enable Email provider
- ✅ Confirm email (empfohlen für Production)
- ✅ Secure email change

## 🧪 Testing

### 1. Registrierung testen

```bash
npm run dev
```

Gehe zu: `http://localhost:5173/auth/register`

- Registriere einen neuen User
- Prüfe dein Email-Postfach (oder Supabase Auth Logs)
- Bestätige die Email
- Automatisch wird ein Player Profile angelegt

### 2. Database Überprüfung

Gehe zu: **Table Editor** → **player_profiles**

Du solltest den neuen User mit:
- ✅ username
- ✅ money: 500
- ✅ reputation: 0
- ✅ level: 1
- ✅ experience: 0

## 🔐 Security Checklist

- ✅ Row Level Security (RLS) aktiviert
- ✅ Policies für user-specific data
- ✅ Email verification aktiviert
- ✅ Secure password requirements
- ✅ Auto profile creation via trigger
- ✅ CASCADE delete für user cleanup

## 📊 Monitoring

### Supabase Dashboard

- **Auth** → **Users**: Alle registrierten User
- **Table Editor** → **player_profiles**: Player Daten
- **Logs** → **Authentication**: Auth Events
- **API** → **RPC**: Custom Functions

### Important Queries

```sql
-- Check all users
SELECT * FROM auth.users ORDER BY created_at DESC;

-- Check all player profiles
SELECT * FROM public.player_profiles ORDER BY created_at DESC;

-- Check user with profile
SELECT
  u.email,
  p.username,
  p.money,
  p.reputation,
  p.level
FROM auth.users u
LEFT JOIN public.player_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;
```

## 🚀 Production Deployment

Vor dem Deployment:

1. **Environment Variables** in Production setzen:
   ```env
   VITE_SUPABASE_URL=your_production_url
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   ```

2. **Redirect URLs** updaten in Supabase Dashboard

3. **Email Templates** für Production anpassen

4. **Rate Limiting** aktivieren (Supabase Settings)

5. **Database Backups** einrichten

## 🆘 Troubleshooting

### Email wird nicht versendet
- Prüfe Supabase Auth Logs
- Prüfe Spam-Ordner
- In Development: Disable "Confirm email" für schnellere Tests

### Profile wird nicht erstellt
```sql
-- Manuell testen
SELECT public.handle_new_user();

-- Logs prüfen
SELECT * FROM pg_stat_statements;
```

### RLS Policies funktionieren nicht
```sql
-- Policy testen
SELECT * FROM public.player_profiles WHERE auth.uid() = user_id;
```

## 📚 Weitere Informationen

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**Setup abgeschlossen!** 🎉 Dein Auth-System ist bereit für Production.
