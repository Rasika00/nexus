# 🖥️ Nexus — Frontend Web Application

The modern, responsive user interface for the **Nexus Project & Task Management Platform**. Built with React 19, Vite, and custom CSS design tokens.

---

## 🏗️ Architecture & Component Overview

```
frontend/src/
├── components/
│   ├── Navbar.jsx          # Top user profile bar and navigation header
│   └── Sidebar.jsx         # Collapsible sidebar with Lucide icon navigation
├── pages/
│   ├── Dashboard.jsx       # Real-time Task Manager Dashboard (KPIs, Kanban, Sprints)
│   ├── Dashboard.css       # Dashboard layout, metrics grid, and Kanban column styling
│   ├── Projects.jsx        # Projects management view (CRUD operations)
│   ├── Tasks.jsx           # Tasks table view (CRUD operations)
│   ├── Management.jsx      # Users management view (CRUD operations)
│   ├── Management.css      # Shared data table, toolbar, and modal styles
│   ├── Login.jsx           # Secure authentication view with DotLottie animation
│   └── Login.css           # Authentication screen styling & effects
├── App.jsx                 # Client-side router and protected layout wrapper
├── App.css                 # Application window frame and responsive shell
├── index.css               # Global design tokens, color palette, typography & animations
└── main.jsx                # Application root mount point
```

---

## 🎨 Design System

- **Design Philosophy**: High-contrast, dark glassmorphism tailored for task monitoring.
- **Palette**: Dark slate backgrounds (`#0A0A0C`, `#18181B`) with glowing purple/pink accent hues (`#C38EC4`, `#E3BBE4`).
- **Typography**: Inter (content) and Poppins (headings), imported via Google Fonts.
- **Icons**: Lucide React icons for lightweight rendering.

---

## ⚙️ Available Scripts

From `frontend/` directory:

```bash
# Start Vite development server
npm run dev

# Build production bundle
npm run build

# Run Oxlint code inspection
npm run lint

# Preview production build locally
npm run preview
```
