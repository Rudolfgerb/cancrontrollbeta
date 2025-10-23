# ✅ Testing Checklist - Auth System

## 🎯 Quick Test (5 Minutes)

### Setup
- [ ] Run SQL script in Supabase
- [ ] Configure Supabase URLs
- [ ] `npm run dev`
- [ ] Open http://localhost:5173

### Critical Path Test
1. **Registration**
   - [ ] Go to homepage → Click "Registrieren"
   - [ ] Fill form (username, email, password)
   - [ ] Submit → See success screen
   - [ ] **Verify**: Supabase → player_profiles table has new entry

2. **Login**
   - [ ] Go to `/auth/login`
   - [ ] Enter credentials
   - [ ] Submit → Redirect to `/game`
   - [ ] **Verify**: User is logged in

3. **Protected Route**
   - [ ] Clear cookies/localStorage (logout)
   - [ ] Try to access `/game`
   - [ ] **Verify**: Redirected to `/auth/login`

---

## 🧪 Complete Test Suite

### 1. Homepage Tests
- [ ] Visit `/`
- [ ] **Not logged in:**
  - [ ] See "Login" button
  - [ ] See "Registrieren" button
  - [ ] Click "Get Started" → Redirects to login
- [ ] **Logged in:**
  - [ ] See "Game" button
  - [ ] See "Crew" button
  - [ ] See "Profil" button
  - [ ] See "Map" button

### 2. Registration Flow
- [ ] Navigate to `/auth/register`
- [ ] **UI Check:**
  - [ ] Form has username, email, password fields
  - [ ] Form has "Passwort bestätigen" field
  - [ ] "Registrieren" button visible
  - [ ] Link to login page visible
- [ ] **Validation:**
  - [ ] Try short password (< 6 chars) → Error shown
  - [ ] Try short username (< 3 chars) → Error shown
  - [ ] Try mismatched passwords → Error shown
- [ ] **Success Path:**
  - [ ] Fill valid data
  - [ ] Submit
  - [ ] See success screen
  - [ ] "Zum Login" button works
- [ ] **Database Check:**
  - [ ] Supabase → auth.users has new user
  - [ ] Supabase → player_profiles has:
    - [ ] Correct username
    - [ ] money: 500
    - [ ] reputation: 0
    - [ ] level: 1
    - [ ] experience: 0
    - [ ] user_id matches auth.users

### 3. Email Verification (If Enabled)
- [ ] After registration, check email
- [ ] Click verification link
- [ ] Redirected to `/auth/callback`
- [ ] Then redirected to `/game`
- [ ] Login works after verification

### 4. Login Flow
- [ ] Navigate to `/auth/login`
- [ ] **UI Check:**
  - [ ] Email field
  - [ ] Password field
  - [ ] "Anmelden" button
  - [ ] "Passwort vergessen?" link
  - [ ] "Jetzt registrieren" link
- [ ] **Invalid Credentials:**
  - [ ] Try wrong email → Error shown
  - [ ] Try wrong password → Error shown
- [ ] **Valid Credentials:**
  - [ ] Enter correct email/password
  - [ ] Submit
  - [ ] Toast "Login erfolgreich!"
  - [ ] Redirect to `/game`
- [ ] **Session Persistence:**
  - [ ] Reload page
  - [ ] Still logged in
  - [ ] Navigate to other pages
  - [ ] Session persists

### 5. Password Reset Flow
- [ ] Navigate to `/auth/forgot-password`
- [ ] **UI Check:**
  - [ ] Email input field
  - [ ] "Reset-Link senden" button
  - [ ] "Zurück zum Login" button
- [ ] **Invalid Email:**
  - [ ] Try non-existent email → Error shown
- [ ] **Valid Email:**
  - [ ] Enter registered email
  - [ ] Submit
  - [ ] See success screen
  - [ ] Check email inbox
- [ ] **Email Link:**
  - [ ] Click reset link in email
  - [ ] Redirected to `/auth/reset-password`
  - [ ] Form has 2 password fields
- [ ] **Reset Password:**
  - [ ] Enter new password (min 6 chars)
  - [ ] Confirm password
  - [ ] Submit
  - [ ] See success screen
  - [ ] Auto-redirect to login
  - [ ] Login with new password works

### 6. Protected Routes
- [ ] **While Logged In:**
  - [ ] Navigate to `/game` → Accessible
  - [ ] Navigate to `/profile` → Accessible
  - [ ] Navigate to `/crew` → Accessible
  - [ ] Navigate to `/settings` → Accessible
- [ ] **While Logged Out:**
  - [ ] Clear localStorage/cookies
  - [ ] Try `/game` → Redirect to `/auth/login`
  - [ ] Try `/profile` → Redirect to `/auth/login`
  - [ ] Try `/crew` → Redirect to `/auth/login`
  - [ ] Try `/settings` → Redirect to `/auth/login`
- [ ] **Login Redirect:**
  - [ ] Try to access `/game` while logged out
  - [ ] Redirected to login
  - [ ] After login → Redirect back to `/game` ✅

### 7. Logout Flow
- [ ] While logged in, clear localStorage manually
- [ ] Reload page
- [ ] Verify logged out
- [ ] Protected routes redirect to login

### 8. Auth Context Tests
- [ ] `user` is null when logged out
- [ ] `user` is populated when logged in
- [ ] `profile` contains player data
- [ ] `loading` is true initially
- [ ] `loading` is false after auth check

### 9. UI/UX Tests
- [ ] **Loading States:**
  - [ ] Login button shows spinner during request
  - [ ] Register button shows spinner
  - [ ] Protected routes show loading screen
- [ ] **Error Messages:**
  - [ ] Form validation errors are clear
  - [ ] API errors are displayed
  - [ ] Toast notifications work
- [ ] **Success Messages:**
  - [ ] Login success toast
  - [ ] Registration success screen
  - [ ] Password reset success
- [ ] **Navigation:**
  - [ ] All links work
  - [ ] Back buttons work
  - [ ] Logo links to home

### 10. Responsive Design
- [ ] **Mobile (< 640px):**
  - [ ] Login form readable
  - [ ] Register form readable
  - [ ] Buttons accessible
  - [ ] Navigation works
- [ ] **Tablet (640px - 1024px):**
  - [ ] Layouts adapt properly
  - [ ] Forms centered
- [ ] **Desktop (> 1024px):**
  - [ ] Optimal layout
  - [ ] All features accessible

---

## 🔒 Security Tests

### Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Password requirements enforced
- [ ] Email format validated

### Session Management
- [ ] Tokens stored securely
- [ ] Auto token refresh works
- [ ] Session expires properly
- [ ] Multiple devices supported

### Route Protection
- [ ] No direct access to protected routes
- [ ] Auth state verified server-side (Supabase RLS)
- [ ] Unauthorized requests rejected

---

## ⚡ Performance Tests

- [ ] **Initial Load:**
  - [ ] Page loads < 2s
  - [ ] No layout shifts
- [ ] **Auth Operations:**
  - [ ] Login < 1s
  - [ ] Registration < 2s
  - [ ] Logout instant
- [ ] **Navigation:**
  - [ ] Route transitions smooth
  - [ ] No unnecessary re-renders

---

## 🌐 Cross-Browser Tests

- [ ] **Chrome:**
  - [ ] All features work
- [ ] **Firefox:**
  - [ ] All features work
- [ ] **Safari:**
  - [ ] All features work
- [ ] **Edge:**
  - [ ] All features work
- [ ] **Mobile Browsers:**
  - [ ] iOS Safari works
  - [ ] Android Chrome works

---

## 📊 Database Tests

### Supabase Tables
- [ ] `auth.users` populated correctly
- [ ] `player_profiles` created automatically
- [ ] Trigger `on_auth_user_created` fires
- [ ] RLS policies enforce user isolation

### Data Integrity
- [ ] user_id correctly linked
- [ ] No orphaned records
- [ ] Cascade delete works
- [ ] Default values correct

---

## 🐛 Edge Cases

- [ ] Register with existing email → Error
- [ ] Register with existing username → Error
- [ ] Very long username (> 20 chars) → Error
- [ ] Special characters in username → Handled
- [ ] Email with + sign → Works
- [ ] Unicode characters in name → Works
- [ ] Rapid login attempts → Rate limited
- [ ] Concurrent sessions → Supported
- [ ] Network errors → Handled gracefully

---

## ✅ Final Verification

Before marking as complete:
- [ ] All critical paths tested
- [ ] No console errors
- [ ] No broken links
- [ ] Database triggers working
- [ ] Email system tested
- [ ] Mobile responsive
- [ ] Documentation reviewed
- [ ] Ready for production

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Critical Tests: PASS / FAIL
- Registration: ___________
- Login: ___________
- Protected Routes: ___________
- Password Reset: ___________

Issues Found:
1. ___________
2. ___________

Overall Status: PASS / FAIL

Notes:
___________
```

---

## 🚀 Production Testing

After deployment:
1. [ ] Test with real email addresses
2. [ ] Verify SSL/HTTPS
3. [ ] Test from different networks
4. [ ] Monitor Supabase logs
5. [ ] Check error tracking
6. [ ] Verify analytics
7. [ ] Test peak load

---

**Testing Status:** Ready for QA 🟢

**Estimated Test Time:**
- Quick Test: 5 minutes
- Full Test: 30 minutes
- Edge Cases: 15 minutes
- **Total: ~50 minutes**

**Priority Order:**
1. Critical Path (Registration, Login, Protected Routes)
2. Password Reset
3. UI/UX
4. Edge Cases
5. Cross-browser
