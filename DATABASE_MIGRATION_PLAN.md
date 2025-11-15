# Database Structure Migration Plan

## Current Structure (OLD)
```
files/
  cours/
    {fileId}/
  td/
    {fileId}/
```

## New Structure (YOUR DATABASE)
```
resources/
  cours/
    year3/
      {module_name}/
        {resource_id}/
    year4/
      {module_name}/
        {resource_id}/
    year5/
      {module_name}/
        {resource_id}/
  td/
    year3/
      {module_name}/
        {resource_id}/
    year4/
      {module_name}/
        {resource_id}/
    year5/
      {module_name}/
        {resource_id}/
seminar/
  {seminar_id}/
users/
  {user_id}/
```

## Key Changes

### 1. Path Structure
- OLD: `files/{type}/{fileId}`
- NEW: `resources/{type}/{year}/{module_name}/{resource_id}`

### 2. Module Names
Instead of generic IDs, you now have actual French module names:
- "Module gestion de produit et qualite"
- "module entrepreunariat et montage de projets"
- "module cadrage et planification de projets"
- "module comportement organisationnel"
- "autre ressources perdagogiques" (catch-all category)

### 3. Resource Fields
Your resources have:
- `id`: unique identifier
- `type`: "file" or "link"
- `created_at`: ISO timestamp
- For files: `file_type`, `location` (gs:// path), `size`
- For links: `url`, `description`

### 4. Seminars
Moved from `resources/seminar` to root level `seminar/`

## Files That Need Updates

1. **src/utils/fileOperations.js** - Core file operations
2. **src/components/FileManager.jsx** - Admin file management
3. **src/components/seminars.jsx** - Fetch from new seminar path
4. **Firebase Database Rules** - Update security rules

## Migration Strategy

### Option A: Update Code to Match New Structure (RECOMMENDED)
- Modify fileOperations.js to use new paths
- Update FileManager to handle module names
- Add module selection in upload UI

### Option B: Keep Dual Support
- Support both old and new structures
- Gradually migrate data
- More complex but safer

I recommend Option A for a clean implementation.
