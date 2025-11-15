# Restructured Navigation System

## Overview

The Cours and TDs pages have been completely restructured to show a hierarchical navigation:
1. **Year Selection** → 2. **Module Selection** → 3. **Resources View**

## Changes Made

### 1. New Components

**CoursNew.jsx**
- Three-level navigation: Years → Modules → Resources
- Shows "autre ressources pédagogiques" module (only in Cours)
- Color-coded year cards (Green, Blue, Orange)
- Displays all modules from Firebase for each year

**TdNew.jsx**
- Same three-level navigation as Cours
- **Filters out "autre ressources pédagogiques"** (TDs only show regular modules)
- Color-coded year cards (Purple, Pink, Red)
- Displays only non-"autre" modules

### 2. Updated Files

**App.jsx**
- Changed routes from `Cours` to `CoursNew`
- Changed routes from `Td` to `TdNew`
- Removed `:year` parameter routes (no longer needed)

**navbar.jsx**
- Simplified Cours link (no dropdown)
- Simplified TDs link (no dropdown)
- Year selection now happens inside the pages

### 3. Database Structure

```
resources/
├── cours/
│   ├── year3/
│   │   ├── Module gestion de produit et qualite/
│   │   ├── module entrepreunariat et montage de projets/
│   │   └── autre ressources perdagogiques/  ← ONLY IN COURS
│   ├── year4/
│   │   ├── module cadrage et planification de projets/
│   │   └── autre ressources perdagogiques/  ← ONLY IN COURS
│   └── year5/
│       ├── module comportement organisationnel/
│       └── autre ressources perdagogiques/  ← ONLY IN COURS
│
└── td/
    ├── year3/
    │   ├── Module gestion de produit et qualite/
    │   └── module entrepreunariat et montage de projets/
    │       (NO "autre ressources perdagogiques")
    ├── year4/
    │   └── module cadrage et planification de projets/
    │       (NO "autre ressources perdagogiques")
    └── year5/
        └── module comportement organisationnel/
            (NO "autre ressources perdagogiques")
```

## User Flow

### Cours Page

1. **Landing**: User sees 3 year cards
   - 3ème année (Green)
   - 4ème année (Blue)
   - 5ème année (Orange)

2. **Click Year**: Shows all modules for that year
   - Module gestion de produit et qualite
   - module entrepreunariat et montage de projets
   - autre ressources perdagogiques
   - (etc.)

3. **Click Module**: Shows all resources in that module
   - Files (PDF, DOC, PPT, etc.)
   - Links (external URLs)
   - Download/Open buttons

4. **Back Button**: Returns to previous level

### TDs Page

1. **Landing**: User sees 3 year cards
   - 3ème année (Purple)
   - 4ème année (Pink)
   - 5ème année (Red)

2. **Click Year**: Shows modules (WITHOUT "autre ressources perdagogiques")
   - Module gestion de produit et qualite
   - module entrepreunariat et montage de projets
   - (NO "autre ressources perdagogiques")

3. **Click Module**: Shows all TDs in that module
   - Files and links
   - Download/Open buttons

4. **Back Button**: Returns to previous level

## Dashboard Behavior

The dashboard FileManagerV2 component remains unchanged and allows admins to:
- Create modules in any year
- Upload resources to modules
- Delete modules and resources

**Important**: 
- Admins CAN create "autre ressources perdagogiques" in TDs via dashboard
- But TdNew.jsx will FILTER IT OUT from student view
- Only Cours will show "autre ressources perdagogiques" to students

## Styling

### Year Cards
- Large folder icon with year-specific color
- Year label (3ème, 4ème, 5ème année)
- Module count
- Hover effect: lift and shadow
- Click anywhere to navigate

### Module Cards
- Folder icon with year color
- Module name
- Arrow indicator
- Hover effect: slide right and highlight
- Click anywhere to navigate

### Resource Cards
- File/link icon
- Resource name
- Metadata (date, size, URL)
- Download/Open button
- Same styling as before

## Navigation Elements

### Back Button
- Appears in header when not on landing page
- "← Retour" text
- Returns to previous level
- Gray background, hover effect

### Breadcrumb (Implicit)
- Title shows current context
- "Cours" → "3ème année" → "Module Name"
- Subtitle shows parent context

## Key Features

1. **Hierarchical Navigation**: Clear 3-level structure
2. **Visual Distinction**: Different colors for Cours vs TDs
3. **Filtered Content**: TDs don't show "autre ressources perdagogiques"
4. **Responsive Design**: Works on mobile and desktop
5. **Consistent UX**: Same navigation pattern for both Cours and TDs
6. **Login Protection**: Login modal appears if not authenticated

## Module Name Handling

The system handles various module name formats:
- `Module gestion de produit et qualite` (with spaces)
- `module entrepreunariat et montage de projets` (lowercase)
- `autre ressources perdagogiques` (special case)

**Filter Logic for TDs**:
```javascript
modulesData[year] = allModules.filter(
  module => !module.toLowerCase().includes('autre')
);
```

This filters out any module with "autre" in the name from TDs view.

## Benefits

1. **Cleaner Navigation**: No more dropdown menus in navbar
2. **Better Organization**: Clear hierarchy of years → modules → resources
3. **Flexible Structure**: Easy to add new years or modules
4. **Consistent Experience**: Same pattern for Cours and TDs
5. **Mobile Friendly**: Touch-friendly large cards
6. **Visual Feedback**: Color coding and hover effects
7. **Filtered Content**: TDs only show relevant modules

## Migration Notes

- Old `Cours.jsx` and `Td.jsx` components are still in the codebase
- Can be deleted once new system is verified
- No database changes required
- Routes simplified (no `:year` parameter)
- Navbar simplified (no dropdowns)

## Testing Checklist

- [ ] Cours page shows 3 year cards
- [ ] Click year shows all modules (including "autre ressources perdagogiques")
- [ ] Click module shows resources
- [ ] Back button works at each level
- [ ] TDs page shows 3 year cards
- [ ] Click year shows modules (WITHOUT "autre ressources perdagogiques")
- [ ] Click module shows TDs
- [ ] Download/Open buttons work
- [ ] Login modal appears for unauthenticated users
- [ ] Responsive on mobile devices
- [ ] Colors are correct (Cours: green/blue/orange, TDs: purple/pink/red)

## Future Enhancements

- Search within modules
- Filter by file type
- Sort by date/name
- Favorites/bookmarks
- Recently viewed
- Download statistics
