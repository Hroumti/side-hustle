# FileManager Update Complete ✅

## Changes Made

### 1. Updated FileManager.jsx

#### New Features:
- ✅ **Module Selection**: Added dropdown to select module when uploading files or links
- ✅ **Link Support**: New "Ajouter Lien" button to add external link resources
- ✅ **Year Format**: Changed from "3eme" to "year3" format to match database
- ✅ **File Size Handling**: Now properly handles both string formats ("5.2 MB") and numeric bytes

#### Updated Upload Flow:
```javascript
// OLD: uploadFile(file, fileName, year, type)
// NEW: uploadFile(file, fileName, year, type, moduleName)
```

#### Updated Delete Flow:
```javascript
// OLD: deleteFile(fileName, year, type)
// NEW: deleteResource(resourceId, year, type, moduleName)
```

#### New UI Elements:
1. **Module Dropdown**: Shows available modules for selected year
2. **Add Link Modal**: Form to add external links with URL and description
3. **Resource Type Icons**: 
   - 🔗 for links
   - 📄 for PDFs
   - 📝 for docs
   - etc.

### 2. Updated fileOperations.js

#### File Size Handling:
- **Upload**: Stores size as numeric bytes (double)
- **Display**: Converts bytes to human-readable format (KB, MB, GB)
- **Parse**: Handles both string formats from database and numeric values

```javascript
// Size stored in database as number (bytes)
size: 5452595  // 5.2 MB in bytes

// Displayed as formatted string
"5.2 MB"
```

#### Size Conversion Logic:
```javascript
// String "5.2 MB" → 5452595 bytes
// Number 5452595 → "5.2 MB"
```

### 3. Module Management

Available modules by year:

**Year 3 (year3):**
- Module gestion de produit et qualite
- module entrepreunariat et montage de projets
- autre ressources perdagogiques

**Year 4 (year4):**
- module cadrage et planification de projets
- autre ressources perdagogiques

**Year 5 (year5):**
- module comportement organisationnel
- autre ressources perdagogiques

## How to Use

### Upload a File:
1. Click "Ajouter Fichier"
2. Enter file name
3. Select year (3ème, 4ème, or 5ème année)
4. Select module from dropdown
5. Choose file
6. Click "Télécharger"

### Add a Link:
1. Click "Ajouter Lien"
2. Enter URL (e.g., https://example.com/resource)
3. Enter description
4. Select year
5. Select module
6. Click "Ajouter"

### Delete Resources:
- **Single**: Click "Supprimer" on any resource
- **Bulk**: Check multiple resources, then click "Supprimer (X)"

## File Size Format

### In Database:
```json
{
  "size": 5452595  // Always stored as bytes (number)
}
```

### In UI:
```
5.2 MB  // Formatted for display
```

### Conversion Examples:
- 1024 bytes → "1 KB"
- 1048576 bytes → "1 MB"
- 5452595 bytes → "5.2 MB"
- 1073741824 bytes → "1 GB"

## Testing Checklist

- [ ] Upload a PDF file
- [ ] Upload a PowerPoint file
- [ ] Add an external link
- [ ] View file sizes displayed correctly
- [ ] Delete a single resource
- [ ] Delete multiple resources (bulk)
- [ ] Switch between years
- [ ] Verify module dropdown updates when year changes
- [ ] Check that files appear in cours.jsx and td.jsx pages

## Database Structure Example

```json
{
  "resources": {
    "cours": {
      "year3": {
        "Module gestion de produit et qualite": {
          "-Mb1z-COURS-A1": {
            "id": "-Mb1z-COURS-A1",
            "type": "file",
            "file_type": "pdf",
            "location": "gs://bucket/path/file.pdf",
            "size": 5452595,
            "created_at": "2025-10-21T10:30:00Z",
            "name": "intro_slides.pdf"
          }
        },
        "autre ressources perdagogiques": {
          "-Mc0a-COURS-B1": {
            "id": "-Mc0a-COURS-B1",
            "type": "link",
            "url": "https://example.com/tutorial",
            "description": "External tutorial",
            "created_at": "2025-10-22T08:00:00Z"
          }
        }
      }
    }
  }
}
```

## Notes

- File sizes are always stored as bytes (numeric) in the database
- The UI automatically converts bytes to human-readable format
- Links don't have a size field
- Module names are case-sensitive and must match exactly
- The "autre ressources perdagogiques" module is available for all years as a catch-all category
