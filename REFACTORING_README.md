# Firebase RTDB Schema Refactoring - Complete Guide

## 📋 Overview

This refactoring adapts the React application to work with a new Firebase Realtime Database (RTDB) schema that uses Firebase Push Keys for all list nodes and implements a hierarchical structure for resources.

## 🎯 Key Changes

### 1. User Schema Changes
- **Field Rename**: `hashed_password` → `hashed_pwd` (MANDATORY)
- **Path**: `/users/[PUSH_KEY]` (unchanged, but now explicitly using push keys)
- **Removed**: Separate `/login_credentials` path (consolidated into `/users`)

### 2. Resources Schema Changes
- **Old Path**: `/files/[type]/[fileId]`
- **New Paths**:
  - Seminars: `/resources/seminar/[PUSH_KEY]`
  - Cours: `/resources/cours/[year]/[module_name]/[PUSH_KEY]`
  - TD: `/resources/td/[year]/[module_name]/[PUSH_KEY]`

## 📁 Refactored Files

### Core Utilities

#### 1. `src/utils/db-utils-refactored.js`
**Purpose**: User management with new schema

**Key Functions**:
```javascript
// Login with new hashed_pwd field
findUserForLogin(username, rawPassword)

// Create user with hashed_pwd
addUser(userData)

// Update user with hashed_pwd
updateUser(uid, userData)

// Delete user
deleteUser(uid)

// Toggle user status
toggleUserStatus(uid, isActive)

// Real-time user listener
onUsersChange(callback, errorCallback)
```

**Changes**:
- Uses `hashed_pwd` instead of `hashed_password`
- Removed `login_credentials` path logic
- All operations work directly with `/users/[PUSH_KEY]`

#### 2. `src/utils/fileOperations-refactored.js`
**Purpose**: Resource management with hierarchical structure

**Key Functions**:
```javascript
// Upload file with new path structure
uploadFile(file, fileName, year, type, moduleName)

// Delete file using push key
deleteFile(fileId, year, type, moduleName)

// Get all files of a type
getFiles(type)

// Get public files (no auth required)
getPublicFiles(type)

// Get resources by year and module
getResourcesByYearAndModule(type, year, moduleName)
```

**New Helper Functions**:
```javascript
// Construct resource paths
getResourcesPath(type, year, moduleName)

// Transform Firebase snapshots to arrays with IDs
transformSnapshotToArray(snapshot)

// Get all resources with hierarchical traversal
getAllResources(type)
```

**Changes**:
- New path construction for hierarchical structure
- Automatic push key to ID transformation
- Support for year/module organization
- Added seminar resource type

### Migration Tools

#### 3. `scripts/migrate-database.js`
**Purpose**: Automated data migration script

**Features**:
- Migrates users (renames `hashed_password` to `hashed_pwd`)
- Migrates resources from `/files` to `/resources`
- Dry-run mode for testing
- Cleanup mode for removing old data
- Detailed logging and error handling

**Usage**:
```bash
# Dry run (no changes)
node scripts/migrate-database.js --dry-run

# Actual migration
node scripts/migrate-database.js

# With cleanup (removes old data)
node scripts/migrate-database.js --cleanup
```

#### 4. `firebase-rules-new-schema.json`
**Purpose**: Updated Firebase Security Rules

**Features**:
- Validates `hashed_pwd` field (64 characters)
- Enforces hierarchical structure for cours/td
- Validates year format (3eme, 4eme, 5eme)
- Public read access for resources
- Authenticated write access

### Documentation

#### 5. `MIGRATION_GUIDE.md`
**Purpose**: Step-by-step migration instructions

**Contents**:
- Schema comparison (old vs new)
- Implementation details
- Migration steps
- Testing checklist
- Rollback plan
- Benefits of new schema

#### 6. `REFACTORING_README.md` (this file)
**Purpose**: Complete refactoring documentation

## 🚀 Implementation Steps

### Step 1: Review Current Schema

Before starting, document your current database structure:

```bash
# Export current database (Firebase Console)
# Database → Export JSON
```

### Step 2: Backup Database

**CRITICAL**: Always backup before migration!

```bash
# In Firebase Console:
# 1. Go to Realtime Database
# 2. Click "..." menu
# 3. Select "Export JSON"
# 4. Save backup file
```

### Step 3: Test Migration (Dry Run)

```bash
# Install dependencies if needed
npm install

# Run dry-run migration
node scripts/migrate-database.js --dry-run
```

Review the output to understand what will change.

### Step 4: Run Migration

```bash
# Run actual migration
node scripts/migrate-database.js
```

Monitor the console output for errors.

### Step 5: Verify Data

Check Firebase Console to verify:
- [ ] Users have `hashed_pwd` field (not `hashed_password`)
- [ ] Resources are at `/resources/[type]/...` paths
- [ ] All push keys are preserved
- [ ] No data loss occurred

### Step 6: Update Application Code

```bash
# Backup old files
mv src/utils/db-utils.js src/utils/db-utils-old.js
mv src/utils/fileOperations.js src/utils/fileOperations-old.js

# Use refactored versions
mv src/utils/db-utils-refactored.js src/utils/db-utils.js
mv src/utils/fileOperations-refactored.js src/utils/fileOperations.js
```

### Step 7: Update Firebase Rules

```bash
# In Firebase Console:
# 1. Go to Realtime Database → Rules
# 2. Copy content from firebase-rules-new-schema.json
# 3. Publish rules
```

### Step 8: Test Application

Test all functionality:

**User Management**:
- [ ] Login works
- [ ] Create new user
- [ ] Update user
- [ ] Delete user
- [ ] Toggle user status

**Resource Management**:
- [ ] Upload cours file
- [ ] Upload TD file
- [ ] View file lists
- [ ] Download files
- [ ] Delete files
- [ ] Filter by year

### Step 9: Cleanup Old Data (Optional)

After thorough testing:

```bash
# Remove old data structures
node scripts/migrate-database.js --cleanup
```

### Step 10: Deploy

```bash
# Build application
npm run build

# Deploy to hosting
firebase deploy
```

## 🔍 Code Examples

### Creating a User (New Schema)

```javascript
import { dbUtils } from './utils/db-utils.js';

const userData = {
  username: 'john_doe',
  role: 'student',
  year: '3eme',
  rawPassword: 'securePassword123'
};

// Automatically adds hashed_pwd field
const userId = await dbUtils.addUser(userData);
console.log('User created with ID:', userId);
```

### Uploading a Resource (New Schema)

```javascript
import { fileOperations } from './utils/fileOperations.js';

const file = document.getElementById('fileInput').files[0];

// Upload cours file
await fileOperations.uploadFile(
  file,
  'Chapitre 1.pdf',
  '3eme',        // year
  'cours',       // type
  'mathematiques' // module name
);

// Stored at: /resources/cours/3eme/mathematiques/[PUSH_KEY]
```

### Reading Resources (New Schema)

```javascript
import { fileOperations } from './utils/fileOperations.js';

// Get all cours files
const coursFiles = await fileOperations.getFiles('cours');

// Each file has 'id' field (push key)
coursFiles.forEach(file => {
  console.log(`${file.name} (ID: ${file.id})`);
});

// Get specific year/module
const mathFiles = await fileOperations.getResourcesByYearAndModule(
  'cours',
  '3eme',
  'mathematiques'
);
```

## 🧪 Testing

### Unit Tests

Create tests for refactored utilities:

```javascript
// tests/db-utils.test.js
import { dbUtils } from '../src/utils/db-utils.js';

describe('User Management', () => {
  test('addUser creates user with hashed_pwd', async () => {
    const userData = {
      username: 'test_user',
      role: 'student',
      year: '3eme',
      rawPassword: 'password123'
    };
    
    const userId = await dbUtils.addUser(userData);
    expect(userId).toBeDefined();
    
    // Verify hashed_pwd field exists
    const user = await getUser(userId);
    expect(user.hashed_pwd).toBeDefined();
    expect(user.hashed_pwd).toHaveLength(64);
  });
});
```

### Integration Tests

Test complete workflows:

```javascript
// tests/integration/file-upload.test.js
describe('File Upload Workflow', () => {
  test('uploads and retrieves cours file', async () => {
    // Upload
    const file = new File(['content'], 'test.pdf');
    const result = await fileOperations.uploadFile(
      file, 'test.pdf', '3eme', 'cours', 'test-module'
    );
    
    expect(result.id).toBeDefined();
    
    // Retrieve
    const files = await fileOperations.getFiles('cours');
    const uploaded = files.find(f => f.id === result.id);
    
    expect(uploaded).toBeDefined();
    expect(uploaded.name).toBe('test.pdf');
    expect(uploaded.year).toBe('3eme');
    expect(uploaded.module).toBe('test-module');
  });
});
```

## 🐛 Troubleshooting

### Issue: "Permission Denied" errors

**Solution**: Update Firebase Security Rules with new schema rules

```bash
# Copy rules from firebase-rules-new-schema.json
# Apply in Firebase Console
```

### Issue: Users can't login after migration

**Cause**: `hashed_pwd` field not migrated correctly

**Solution**: Run migration script again or manually update users:

```javascript
// Manual fix script
const usersRef = ref(database, 'users');
const snapshot = await get(usersRef);
const users = snapshot.val();

for (const userId in users) {
  const user = users[userId];
  if (user.hashed_password && !user.hashed_pwd) {
    await update(ref(database, `users/${userId}`), {
      hashed_pwd: user.hashed_password
    });
  }
}
```

### Issue: Files not appearing after migration

**Cause**: Path structure mismatch

**Solution**: Verify resource paths in Firebase Console:
- Should be: `/resources/cours/3eme/general/[PUSH_KEY]`
- Not: `/files/cours/[fileId]`

### Issue: "Module name required" error

**Cause**: Missing module name parameter

**Solution**: Always provide module name when uploading:

```javascript
// Correct
await fileOperations.uploadFile(file, name, year, type, 'general');

// Incorrect (will fail)
await fileOperations.uploadFile(file, name, year, type);
```

## 📊 Performance Considerations

### Indexing

Add indexes for better query performance:

```json
{
  "rules": {
    "resources": {
      "cours": {
        ".indexOn": ["year", "module"]
      },
      "td": {
        ".indexOn": ["year", "module"]
      }
    }
  }
}
```

### Caching

Implement client-side caching:

```javascript
// Cache resources for 5 minutes
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

async function getCachedResources(type) {
  const cached = cache.get(type);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fileOperations.getFiles(type);
  cache.set(type, { data, timestamp: Date.now() });
  return data;
}
```

## 🔐 Security Best Practices

1. **Never expose `hashed_pwd` to client**: Already handled in utilities
2. **Validate all inputs**: Sanitization included in `dbUtils.sanitizeInput()`
3. **Use Firebase Auth**: Current implementation uses anonymous auth
4. **Rate limiting**: Implement for login attempts
5. **Audit logging**: Track all write operations

## 📚 Additional Resources

- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/database/security)
- [React Firebase Integration](https://firebase.google.com/docs/web/setup)

## 🤝 Support

For questions or issues:
1. Check `MIGRATION_GUIDE.md` for detailed steps
2. Review Firebase Console for data structure
3. Check browser console for error messages
4. Contact development team

## ✅ Checklist

Before considering migration complete:

- [ ] Database backed up
- [ ] Migration script tested (dry-run)
- [ ] Migration executed successfully
- [ ] Data verified in Firebase Console
- [ ] Application code updated
- [ ] Firebase rules updated
- [ ] All features tested
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Old data cleaned up (optional)
- [ ] Documentation updated
- [ ] Team notified

## 📝 Version History

- **v1.0.0** (2024): Initial refactoring for new schema
  - Added `hashed_pwd` field
  - Implemented hierarchical resource structure
  - Created migration tools
  - Updated security rules

---

**Last Updated**: 2024
**Maintained By**: Development Team
