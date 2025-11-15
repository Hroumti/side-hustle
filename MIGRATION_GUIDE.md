# Firebase RTDB Schema Migration Guide

## Overview
This guide documents the migration from the old Firebase RTDB schema to the new schema that uses Firebase Push Keys for all list nodes.

## Schema Changes

### 1. Users Path: `/users/[user_id]`

#### Old Schema
```
/users/[user_id]
  - username
  - role
  - year
  - created_at
  - hashed_password
  - isActive
```

#### New Schema
```
/users/[PUSH_KEY]
  - username
  - role
  - year
  - created_at
  - hashed_pwd        ← RENAMED from hashed_password
  - isActive
```

**Key Changes:**
- `hashed_password` → `hashed_pwd` (MANDATORY field rename)
- User IDs are now Firebase Push Keys
- Removed `/login_credentials` separate path (consolidated into `/users`)

### 2. Resources Pathing

#### Old Schema
```
/files/cours/[fileId]
/files/td/[fileId]
```

#### New Schema
```
/resources/seminar/[PUSH_KEY]
/resources/cours/[year]/[module_name]/[PUSH_KEY]
/resources/td/[year]/[module_name]/[PUSH_KEY]
```

**Key Changes:**
- `files` → `resources` (path rename)
- Added hierarchical structure for cours/td: year → module → resources
- All resources use Firebase Push Keys as IDs
- Added `seminar` resource type with flat structure

## Implementation Details

### Data Transformation on Read

When reading resources from Firebase, the client must transform the data:

```javascript
function transformSnapshotToArray(snapshot) {
  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();
  const result = [];

  // Iterate over Firebase push keys
  for (const pushKey in data) {
    result.push({
      id: pushKey, // Assign push key as ID
      ...data[pushKey]
    });
  }

  return result;
}
```

### Data Transformation on Write (Users)

When creating or updating users, include the `hashed_pwd` field:

```javascript
const newUser = {
  username: 'john_doe',
  role: 'student',
  year: '3eme',
  hashed_pwd: await hashPassword(rawPassword), // MANDATORY
  created_at: new Date().toISOString(),
  isActive: true
};
```

## Migration Steps

### Step 1: Update Database Utilities

Replace `src/utils/db-utils.js` with `src/utils/db-utils-refactored.js`:

```bash
# Backup old file
mv src/utils/db-utils.js src/utils/db-utils-old.js

# Use refactored version
mv src/utils/db-utils-refactored.js src/utils/db-utils.js
```

**Changes in db-utils.js:**
- Updated `findUserForLogin()` to use `hashed_pwd` field
- Updated `addUser()` to use `hashed_pwd` instead of `hashed_password`
- Updated `updateUser()` to use `hashed_pwd`
- Removed `login_credentials` path logic
- All functions now work with `/users/[PUSH_KEY]` structure

### Step 2: Update File Operations

Replace `src/utils/fileOperations.js` with `src/utils/fileOperations-refactored.js`:

```bash
# Backup old file
mv src/utils/fileOperations.js src/utils/fileOperations-old.js

# Use refactored version
mv src/utils/fileOperations-refactored.js src/utils/fileOperations.js
```

**Changes in fileOperations.js:**
- New `getResourcesPath()` function for path construction
- New `transformSnapshotToArray()` for data transformation
- New `getAllResources()` to handle hierarchical structure
- Updated `uploadFile()` to use new paths with push keys
- Updated `deleteFile()` to work with new structure
- Updated `getFiles()` to read from new paths
- Added `getResourcesByYearAndModule()` helper

### Step 3: Update Firebase Security Rules

Update your Firebase Realtime Database rules:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$userId": {
        ".validate": "newData.hasChildren(['username', 'role', 'hashed_pwd', 'created_at', 'isActive'])"
      }
    },
    "resources": {
      "seminar": {
        ".read": true,
        ".write": "auth != null",
        "$pushKey": {
          ".validate": "newData.hasChildren(['name', 'url', 'size', 'uploadedAt'])"
        }
      },
      "cours": {
        ".read": true,
        ".write": "auth != null",
        "$year": {
          "$moduleName": {
            "$pushKey": {
              ".validate": "newData.hasChildren(['name', 'url', 'size', 'year', 'module'])"
            }
          }
        }
      },
      "td": {
        ".read": true,
        ".write": "auth != null",
        "$year": {
          "$moduleName": {
            "$pushKey": {
              ".validate": "newData.hasChildren(['name', 'url', 'size', 'year', 'module'])"
            }
          }
        }
      }
    }
  }
}
```

### Step 4: Data Migration Script

Create a migration script to move existing data to the new schema:

```javascript
// migration-script.js
import { database } from './src/firebase.js';
import { ref, get, set, push } from 'firebase/database';

async function migrateUsers() {
  const oldUsersRef = ref(database, 'users');
  const snapshot = await get(oldUsersRef);
  
  if (!snapshot.exists()) return;
  
  const users = snapshot.val();
  
  for (const userId in users) {
    const user = users[userId];
    
    // Rename hashed_password to hashed_pwd
    if (user.hashed_password) {
      user.hashed_pwd = user.hashed_password;
      delete user.hashed_password;
    }
    
    // Update user at same path
    await set(ref(database, `users/${userId}`), user);
  }
  
  console.log('Users migrated successfully');
}

async function migrateResources() {
  // Migrate cours
  const oldCoursRef = ref(database, 'files/cours');
  const coursSnapshot = await get(oldCoursRef);
  
  if (coursSnapshot.exists()) {
    const coursFiles = coursSnapshot.val();
    
    for (const fileId in coursFiles) {
      const file = coursFiles[fileId];
      const year = file.year || '3eme';
      const module = file.module || 'general';
      
      const newPath = `resources/cours/${year}/${module}`;
      const newRef = ref(database, newPath);
      const pushKey = push(newRef).key;
      
      await set(ref(database, `${newPath}/${pushKey}`), file);
    }
  }
  
  // Migrate td (similar logic)
  const oldTdRef = ref(database, 'files/td');
  const tdSnapshot = await get(oldTdRef);
  
  if (tdSnapshot.exists()) {
    const tdFiles = tdSnapshot.val();
    
    for (const fileId in tdFiles) {
      const file = tdFiles[fileId];
      const year = file.year || '3eme';
      const module = file.module || 'general';
      
      const newPath = `resources/td/${year}/${module}`;
      const newRef = ref(database, newPath);
      const pushKey = push(newRef).key;
      
      await set(ref(database, `${newPath}/${pushKey}`), file);
    }
  }
  
  console.log('Resources migrated successfully');
}

// Run migrations
async function runMigration() {
  try {
    await migrateUsers();
    await migrateResources();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
```

### Step 5: Update Components (No Changes Required)

The React components (`cours.jsx`, `td.jsx`, `UserManager.jsx`) do not need changes because they use the abstracted utility functions. The refactored utilities handle all schema differences internally.

## Testing Checklist

After migration, test the following:

### User Management
- [ ] User login works with new `hashed_pwd` field
- [ ] Creating new users stores data at `/users/[PUSH_KEY]`
- [ ] Updating users preserves `hashed_pwd` field
- [ ] Deleting users removes from correct path
- [ ] User list displays correctly with push keys as IDs

### Resource Management (Cours/TD)
- [ ] Uploading files creates entries at `/resources/[type]/[year]/[module]/[PUSH_KEY]`
- [ ] File list displays correctly with push keys as IDs
- [ ] Downloading files works with new structure
- [ ] Deleting files removes from correct path
- [ ] Filtering by year works correctly

### Seminar Resources
- [ ] Uploading seminars creates entries at `/resources/seminar/[PUSH_KEY]`
- [ ] Seminar list displays correctly
- [ ] Downloading seminars works

## Rollback Plan

If issues occur, rollback by:

1. Restore old utility files:
```bash
mv src/utils/db-utils-old.js src/utils/db-utils.js
mv src/utils/fileOperations-old.js src/utils/fileOperations.js
```

2. Restore old Firebase rules

3. Restore database from backup (if data migration was performed)

## Benefits of New Schema

1. **Scalability**: Hierarchical structure for cours/td allows better organization
2. **Consistency**: All lists use Firebase Push Keys
3. **Flexibility**: Easy to add new resource types (like seminars)
4. **Performance**: Better query performance with structured paths
5. **Maintainability**: Clearer data organization

## Support

For issues or questions during migration, refer to:
- Firebase Documentation: https://firebase.google.com/docs/database
- Project README.md
- Contact: development team
