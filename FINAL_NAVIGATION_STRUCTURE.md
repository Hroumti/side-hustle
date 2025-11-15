# Final Navigation Structure

## Overview

The navigation now works as follows:
1. **Navbar Dropdown** → Select Year (3ème, 4ème, 5ème)
2. **Module Selection Page** → Shows modules from Firebase for that year
3. **Resources Page** → Shows files/links when you click a module

## User Flow

### Cours Navigation

```
Navbar → Cours ▾
  ├── 3ème année ENCG → /cours/3eme
  │   └── Shows modules for year3
  │       ├── Module gestion de produit et qualite
  │       ├── module entrepreunariat et montage de projets
  │       └── autre ressources perdagogiques  ← SHOWS IN COURS
  │           └── Click module → Shows resources
  │
  ├── 4ème année ENCG → /cours/4eme
  │   └── Shows modules for year4
  │
  └── 5ème année ENCG → /cours/5eme
      └── Shows modules for year5
```

### TDs Navigation

```
Navbar → TD ▾
  ├── 3ème année ENCG → /td/3eme
  │   └── Shows modules for year3 (FILTERED)
  │       ├── Module gestion de produit et qualite
  │       └── module entrepreunariat et montage de projets
  │           (NO "autre ressources perdagogiques")
  │           └── Click module → Shows TDs
  │
  ├── 4ème année ENCG → /td/4eme
  │   └── Shows modules for year4 (FILTERED)
  │
  └── 5ème année ENCG → /td/5eme
      └── Shows modules for year5 (FILTERED)
```

## Routes

```javascript
/cours              → Shows "Select year from menu" message
/cours/3eme         → Shows modules for 3ème année
/cours/4eme         → Shows modules for 4ème année
/cours/5eme         → Shows modules for 5ème année

/td                 → Shows "Select year from menu" message
/td/3eme            → Shows modules for 3ème année (filtered)
/td/4eme            → Shows modules for 4ème année (filtered)
/td/5eme            → Shows modules for 5ème année (filtered)
```

## Components

### CoursNew.jsx
- Reads `year` from URL params (`useParams`)
- Maps URL year to Firebase year:
  - `3eme` → `year3`
  - `4eme` → `year4`
  - `5eme` → `year5`
- Shows all modules including "autre ressources perdagogiques"
- Two views:
  1. **Module Selection**: Grid of module cards
  2. **Resources View**: List of files/links in selected module

### TdNew.jsx
- Same structure as CoursNew
- **Filters out modules containing "autre"**
- Shows only regular modules to students

### Navbar
- Cours dropdown with 3 year options
- TD dropdown with 3 year options
- Each option links to `/cours/:year` or `/td/:year`

## Database Structure

```
resources/
├── cours/
│   ├── year3/
│   │   ├── Module gestion de produit et qualite/
│   │   │   └── {resource_id}/
│   │   ├── module entrepreunariat et montage de projets/
│   │   │   └── {resource_id}/
│   │   └── autre ressources perdagogiques/  ← VISIBLE IN COURS
│   │       └── {resource_id}/
│   ├── year4/
│   └── year5/
│
└── td/
    ├── year3/
    │   ├── Module gestion de produit et qualite/
    │   │   └── {resource_id}/
    │   └── module entrepreunariat et montage de projets/
    │       └── {resource_id}/
    │       (autre ressources perdagogiques filtered out)
    ├── year4/
    └── year5/
```

## Key Features

1. **Year Selection in Navbar**: Dropdown menus for easy access
2. **Module Grid View**: Visual cards for each module
3. **Filtered TDs**: Automatically hides "autre ressources perdagogiques"
4. **Responsive Design**: Works on mobile and desktop
5. **Login Protection**: Login modal for unauthenticated users
6. **Color Coding**: 
   - Cours: Green, Blue, Orange
   - TDs: Purple, Pink, Red

## Example User Journey

### Student wants to access 3ème année Cours:

1. Click **Cours ▾** in navbar
2. Click **3ème année ENCG**
3. Browser navigates to `/cours/3eme`
4. Page shows modules:
   - Module gestion de produit et qualite
   - module entrepreunariat et montage de projets
   - autre ressources perdagogiques
5. Click **Module gestion de produit et qualite**
6. Page shows all files/links in that module
7. Click **Télécharger** to download a file

### Student wants to access 4ème année TDs:

1. Click **TD ▾** in navbar
2. Click **4ème année ENCG**
3. Browser navigates to `/td/4eme`
4. Page shows modules (WITHOUT "autre ressources perdagogiques"):
   - module cadrage et planification de projets
5. Click **module cadrage et planification de projets**
6. Page shows all TDs in that module
7. Click **Télécharger** to download a TD

## Admin Dashboard

Dashboard remains unchanged:
- FileManagerV2 allows creating/editing/deleting modules
- Admins can create "autre ressources perdagogiques" in both Cours and TDs
- Students will only see it in Cours (filtered out in TDs)

## Styling

### Module Cards
```css
.module-card-view {
  - White background
  - Rounded corners
  - Folder icon with year color
  - Module name
  - Arrow indicator
  - Hover: slide right + highlight
  - Click anywhere to navigate
}
```

### Resources Cards
```css
.cours-card {
  - File/link icon
  - Resource name
  - Metadata (date, size)
  - Download/Open button
  - Same styling as before
}
```

## Benefits

1. **Familiar Navigation**: Dropdown menus like before
2. **Clear Hierarchy**: Year → Module → Resources
3. **Filtered Content**: TDs don't show "autre ressources perdagogiques"
4. **Flexible**: Easy to add new modules via dashboard
5. **Consistent**: Same pattern for Cours and TDs
6. **Mobile Friendly**: Responsive design

## Testing Checklist

- [ ] Navbar shows Cours dropdown with 3 years
- [ ] Navbar shows TD dropdown with 3 years
- [ ] Click Cours → 3ème année → Shows modules
- [ ] Cours shows "autre ressources perdagogiques"
- [ ] Click TD → 3ème année → Shows modules
- [ ] TDs does NOT show "autre ressources perdagogiques"
- [ ] Click module → Shows resources
- [ ] Download button works
- [ ] Login modal appears for unauthenticated users
- [ ] Responsive on mobile

## Migration Notes

- Old Cours.jsx and Td.jsx can be deleted
- Routes updated to use CoursNew and TdNew
- Navbar restored to dropdown style
- No database changes required
