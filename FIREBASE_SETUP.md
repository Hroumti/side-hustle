# Firebase Security Setup Guide

This guide will help you implement proper security rules for your Firebase project to ensure only admins can modify data while allowing users to read files.

## 1. Firebase Realtime Database Rules

Copy the rules from `firebase-database-rules.json` and apply them in your Firebase Console:

1. Go to Firebase Console → Realtime Database → Rules
2. Replace the existing rules with the content from `firebase-database-rules.json`
3. Click "Publish"

### Key Features:
- `login_credentials`: Public read access for authentication, no write access
- `user_roles`: Maps Firebase Auth UIDs to user roles
- `users`: Only admins can read/write user data
- `files`: Everyone can read file metadata, only admins can write
- `admin`: Admin-only sections

## 2. Firebase Storage Rules

Copy the rules from `firebase-storage-rules.txt` and apply them in your Firebase Console:

1. Go to Firebase Console → Storage → Rules
2. Replace the existing rules with the content from `firebase-storage-rules.txt`
3. Click "Publish"

### Key Features:
- PDF, PowerPoint, and public materials: Public read access, admin-only write/delete
- Admin folders: Admin-only access
- All other paths: Denied by default

## 3. Firebase Authentication Setup

Enable the following authentication methods in Firebase Console:

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Enable "Anonymous" provider (as fallback)
4. Save changes

## 4. Database Structure

Your database should have this structure:

```
{
  "login_credentials": {
    "user_uid_1": {
      "username": "admin",
      "hashed_password": "...",
      "role": "admin",
      "isActive": true
    },
    "user_uid_2": {
      "username": "user1",
      "hashed_password": "...",
      "role": "user",
      "isActive": true
    }
  },
  "user_roles": {
    "firebase_auth_uid_1": {
      "role": "admin",
      "dbUid": "user_uid_1",
      "username": "admin",
      "timestamp": 1234567890
    }
  },
  "users": {
    "user_uid_1": {
      "username": "admin",
      "role": "admin",
      "isActive": true,
      // ... other user data
    }
  },
  "files": {
    "cours": {
      "encoded_filename_1": {
        "name": "Course 1.pdf",
        "originalName": "Course 1.pdf",
        "url": "...",
        "year": "3eme",
        // ... other file metadata
      }
    }
  }
}
```

## 5. User Permissions

### Admin Users:
- Can access dashboard
- Can upload, delete, and modify files
- Can manage users
- Can read all data

### Regular Users:
- Cannot access dashboard
- Can only read and download files
- Cannot modify any data
- Cannot manage users

## 6. Testing the Setup

1. Create an admin user through your existing interface
2. Create a regular user
3. Test login with both accounts
4. Verify that:
   - Admin can access dashboard and modify files
   - Regular user cannot access dashboard
   - Regular user can still view and download files
   - File operations work correctly with the new security rules

## 7. Migration Steps

If you have existing data, you may need to:

1. Backup your current database
2. Apply the new rules
3. Test with a few users first
4. Migrate existing user data to the new structure if needed

## 8. Troubleshooting

### Common Issues:

1. **Permission Denied Errors**: 
   - Check that Firebase Auth is properly initialized
   - Verify user roles are correctly set in `user_roles` path
   - Ensure the user is authenticated before making requests

2. **File Upload Failures**:
   - Verify Storage rules are applied correctly
   - Check that user has admin role
   - Ensure Firebase Auth user is signed in

3. **Database Read/Write Failures**:
   - Check Realtime Database rules
   - Verify user role mapping exists
   - Ensure proper authentication state

### Debug Commands:

```javascript
// Check current auth state
// authService.getCurrentUser();

// Check user role
// authService.userRole;

// Check if admin
// authService.isAdmin();
```

## 9. Security Best Practices

1. **Never store sensitive data in client-side code**
2. **Always validate user permissions on the server side (Firebase rules)**
3. **Use HTTPS for all communications**
4. **Regularly audit user permissions**
5. **Monitor Firebase usage and security reports**
6. **Keep Firebase SDK updated**

## 10. Next Steps

After implementing these rules:

1. Test thoroughly with different user types
2. Monitor Firebase logs for any permission errors
3. Consider implementing additional security measures like rate limiting
4. Set up monitoring and alerts for suspicious activity