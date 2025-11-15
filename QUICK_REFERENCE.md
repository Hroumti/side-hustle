# Quick Reference Guide - New Firebase RTDB Schema

## 🎯 Schema at a Glance

### Users
```
/users/[PUSH_KEY]
  ├── username: string
  ├── role: "admin" | "student"
  ├── year: "3eme" | "4eme" | "5eme"
  ├── hashed_pwd: string (64 chars)  ← RENAMED from hashed_password
  ├── created_at: ISO string
  └── isActive: boolean
```

### Resources
```
/resources
  ├── /seminar/[PUSH_KEY]
  │     ├── name, url, size, uploadedAt, ext, type, firebasePath
  │
  ├── /cours/[year]/[module_name]/[PUSH_KEY]
  │     ├── name, url, size, uploadedAt, year, module, ext, type, firebasePath
  │
  └── /td/[year]/[module_name]/[PUSH_KEY]
        ├── name, url, size, uploadedAt, year, module, ext, type, firebasePath
```

## 🔑 Key Changes

| Aspect | Old | New |
|--------|-----|-----|
| User password field | `hashed_password` | `hashed_pwd` |
| Resources root | `/files` | `/resources` |
| Cours/TD structure | Flat | Hierarchical (year/module) |
| Seminar support | ❌ | ✅ |
| Push keys as IDs | Implicit | Explicit |

## 💻 Code Snippets

### User Operations

```javascript
import { dbUtils } from './utils/db-utils.js';

// Login
const user = await dbUtils.findUserForLogin('username', 'password');

// Create user
const userId = await dbUtils.addUser({
  username: 'john_doe',
  role: 'student',
  year: '3eme',
  rawPassword: 'password123'
});

// Update user
await dbUtils.updateUser(userId, {
  year: '4eme',
  rawPassword: 'newPassword' // optional
});

// Delete user
await dbUtils.deleteUser(userId);

// Toggle status
await dbUtils.toggleUserStatus(userId, false);

// Listen to changes
const unsubscribe = dbUtils.onUsersChange(
  (users) => console.log('Users:', users),
  (error) => console.error('Error:', error)
);
```

### Resource Operations

```javascript
import { fileOperations } from './utils/fileOperations.js';

// Upload cours file
const result = await fileOperations.uploadFile(
  file,              // File object
  'Chapitre 1.pdf',  // filename
  '3eme',            // year
  'cours',           // type
  'mathematiques'    // module name
);
console.log('Uploaded with ID:', result.id);

// Upload TD file
await fileOperations.uploadFile(
  file,
  'TD 1.pdf',
  '4eme',
  'td',
  'physique'
);

// Upload seminar (no year/module needed)
await fileOperations.uploadFile(
  file,
  'Seminar.pdf',
  null,              // year not used
  'seminar',
  null               // module not used
);

// Get all files of a type
const coursFiles = await fileOperations.getFiles('cours');
coursFiles.forEach(f => {
  console.log(`${f.name} - Year: ${f.year}, Module: ${f.module}, ID: ${f.id}`);
});

// Get public files (no auth)
const publicFiles = await fileOperations.getPublicFiles('cours');

// Get specific year/module
const files = await fileOperations.getResourcesByYearAndModule(
  'cours',
  '3eme',
  'mathematiques'
);

// Delete file
await fileOperations.deleteFile(
  fileId,            // push key
  '3eme',            // year
  'cours',           // type
  'mathematiques'    // module
);
```

## 🔧 Migration Commands

```bash
# Dry run (test without changes)
node scripts/migrate-database.js --dry-run

# Run migration
node scripts/migrate-database.js

# Run with cleanup (removes old data)
node scripts/migrate-database.js --cleanup
```

## 🛡️ Firebase Rules Summary

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "resources": {
      "seminar": {
        ".read": true,
        ".write": "auth != null"
      },
      "cours": {
        ".read": true,
        ".write": "auth != null"
      },
      "td": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

## 🚨 Common Pitfalls

### ❌ Wrong: Using old field name
```javascript
const user = {
  username: 'test',
  hashed_password: 'abc123'  // WRONG!
};
```

### ✅ Correct: Using new field name
```javascript
const user = {
  username: 'test',
  hashed_pwd: 'abc123'  // CORRECT!
};
```

### ❌ Wrong: Old path structure
```javascript
const path = 'files/cours/fileId';  // WRONG!
```

### ✅ Correct: New path structure
```javascript
const path = 'resources/cours/3eme/mathematiques/pushKey';  // CORRECT!
```

### ❌ Wrong: Missing module name
```javascript
await fileOperations.uploadFile(file, name, year, 'cours');  // WRONG!
```

### ✅ Correct: Including module name
```javascript
await fileOperations.uploadFile(file, name, year, 'cours', 'general');  // CORRECT!
```

## 📋 Pre-Migration Checklist

- [ ] Backup database (Export JSON from Firebase Console)
- [ ] Review current data structure
- [ ] Test migration script with --dry-run
- [ ] Verify Firebase credentials in .env
- [ ] Ensure no active users during migration
- [ ] Have rollback plan ready

## 📋 Post-Migration Checklist

- [ ] Verify users have `hashed_pwd` field
- [ ] Check resources are at `/resources/` paths
- [ ] Test user login
- [ ] Test file upload
- [ ] Test file download
- [ ] Test file deletion
- [ ] Update Firebase Security Rules
- [ ] Deploy updated application code
- [ ] Monitor for errors
- [ ] Clean up old data (optional)

## 🔍 Debugging Tips

### Check if migration completed
```javascript
// In browser console or Node script
import { ref, get } from 'firebase/database';

// Check user structure
const userRef = ref(database, 'users');
const snapshot = await get(userRef);
const users = snapshot.val();
console.log('First user:', Object.values(users)[0]);
// Should have 'hashed_pwd', not 'hashed_password'

// Check resource structure
const coursRef = ref(database, 'resources/cours');
const coursSnapshot = await get(coursRef);
console.log('Cours structure:', coursSnapshot.val());
// Should have year/module hierarchy
```

### Verify push keys
```javascript
// All resources should have 'id' field
const files = await fileOperations.getFiles('cours');
files.forEach(f => {
  if (!f.id) {
    console.error('Missing ID:', f);
  }
});
```

## 📞 Getting Help

1. **Check logs**: Browser console and Firebase Console logs
2. **Review docs**: See `MIGRATION_GUIDE.md` and `REFACTORING_README.md`
3. **Verify rules**: Check Firebase Security Rules tab
4. **Test queries**: Use Firebase Console Data tab to manually query
5. **Contact team**: Provide error messages and steps to reproduce

## 🔗 Related Files

- `MIGRATION_GUIDE.md` - Detailed migration instructions
- `REFACTORING_README.md` - Complete refactoring documentation
- `src/utils/db-utils-refactored.js` - User management utilities
- `src/utils/fileOperations-refactored.js` - Resource management utilities
- `scripts/migrate-database.js` - Migration script
- `firebase-rules-new-schema.json` - Updated security rules

---

**Quick Tip**: Keep this file open while working with the new schema! 🚀
