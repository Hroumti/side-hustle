# Quick Fix Guide for Firebase Authentication Errors

## Immediate Steps to Fix Errors

### Error: `auth/admin-restricted-operation`

**This means Anonymous Authentication is disabled in Firebase Console.**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method** tab
4. Find **Anonymous** in the providers list
5. Click **Enable**
6. Click **Save**
7. **Try logging in again**

### Error: `PERMISSION_DENIED` when adding users

**This happens when:**
1. Anonymous auth is not enabled (fix above)
2. The `auth_mapping` wasn't created during login
3. Database rules aren't updated

**Fix steps:**
1. Make sure Anonymous auth is enabled (see above)
2. **Log out and log back in** - this will create the `auth_mapping`
3. Update your Database rules with the new rules from `firebase-database-rules.json`
4. Check browser console for "✓ Auth mapping created" message after login

### After Fixing

1. **Update Database Rules:**
   - Go to Firebase Console → Realtime Database → Rules
   - Copy rules from `firebase-database-rules.json`
   - Paste and click **Publish**

2. **Verify Auth Mapping:**
   - After logging in, check Firebase Console → Realtime Database → Data
   - You should see `auth_mapping/{firebaseAuthUid}` with your `dbUid` and `role`

3. **Test Admin Operations:**
   - Try adding a user in the dashboard
   - Should work without permission errors

## How to Verify It's Working

1. Login as admin
2. Check browser console - should see:
   - "User signed in anonymously to Firebase Auth: [uid]"
   - "✓ Auth mapping created: [firebaseAuthUid] -> [dbUid] role: admin"
3. Check Firebase Console → Realtime Database → Data
   - Should see `auth_mapping` entry
4. Try adding a user - should work

