# VERIMERGE — Frontend Client (HackFest 2026)

> **Multi-Source Document Ingestion, Verification, and Contradiction Resolution Platform**  
> Built for HackFest 2026.

---

## 🌟 Overview

**Verimerge** solves the critical problem of multi-source document ingestion: when multiple documents contain overlapping, duplicate, incomplete, or conflicting information, Verimerge extracts verifiable claims, tracks physical source provenance, detects factual contradictions without arbitrary resolution, and synthesizes one verified document with clickable citations.

This repository contains the complete frontend web application for Verimerge.

---

## 🚀 Key Features

- **Interactive 2D + 3D Verification Visual**: Immersive 3D trust and evidence visualization powered by React Three Fiber / Three.js, rendering document layers, verified agreement states, and discrepancy alerts.
- **Verification Command Center**: Real-time metrics tracking total documents, corroborated claims, single-source matches, active contradictions, and items under review.
- **Evidence Viewer Modal**: Clickable citations that highlight verbatim source excerpts, physical document locations (e.g. Page 1, Line 12; Row 3), and extraction confidence.
- **Contradiction Resolution Workbench**: Side-by-side opposing claim comparisons with audit trails preserving historical review decisions.
- **Evidence-Grounded AI Assistant**: Multi-document Q&A interface strictly grounded in ingested evidence with file provenance citations.
- **Multi-Format Export Hub**: Export synthesis reports directly to formatted PDF, DOCX, and CSV ledgers.

---

## 🛠️ Technology Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Glassmorphic UI theme, Lucide Icons
- **3D Visualization**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Routing**: React Router DOM (Declarative client-side routing)
- **HTTP Client**: Axios (with JWT interceptors and base API URL configuration)

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Iranna-143/VERIMERGE-HACKFEST-2026.git
   cd VERIMERGE-HACKFEST-2026
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your backend API endpoint:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

### Development

Run the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### Production Build

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 📁 Project Structure

```text
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── 3d/             # Three.js 3D verification visualizer
│   │   ├── EvidenceViewerModal.tsx
│   │   └── Navbar.tsx
│   ├── layouts/            # Page layouts (DashboardLayout, etc.)
│   ├── lib/                # API client, types, and utility functions
│   ├── pages/              # Application views
│   │   ├── dashboard/      # Analysis, Conflicts, Documents, Reports, Chat
│   │   ├── AuthPage.tsx
│   │   └── LandingPage.tsx
│   ├── App.tsx             # Route definitions and layout providers
│   ├── index.css           # Tailwind CSS directives and custom styling
│   └── main.tsx            # Application entry point
├── index.html              # HTML shell
├── tailwind.config.js      # Design tokens and styling configurations
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and plugin configuration
```

---

## 👥 HackFest 2026 Team

- **Author**: Iranna ([@Iranna-143](https://github.com/Iranna-143))
- **Project**: VERIMERGE — Single Verifiable Document Synthesis
