# Church Management System - Frontend & Desktop Application

## Overview
This repository contains the client-side application for the Church Management System[cite: 3]. Built as a modern, responsive Single Page Application (SPA) with cross-platform native desktop capabilities, it provides a highly intuitive and secure interface for managing the administrative, financial, and pastoral operations of a religious institution.

This project demonstrates expertise in building scalable frontend architectures, managing complex client-side state, implementing Role-Based Access Control (RBAC) at the routing level, and delivering a native desktop experience using modern web technologies.

## Application Previews

*(Note to recruiter/reviewer: Below are previews of the system's core interfaces)*

### Dashboard & Analytics
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/803c8176-6771-4525-94f8-33079109465f" />
*> Overview of system metrics, recent activities, and financial summaries.*

### Financial Ledger & Accounting
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/697872da-f525-4edb-b4bb-32c4e7c3f7cb" />
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/47c22aea-85cb-479e-a49f-25479bd132bc" />
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/9eb9d50c-65b5-4943-88d7-606519487230" />
*> Double-entry journal interface and dynamic financial reports.*

### Calendar & Scheduling
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/8c9e7099-f7f0-4964-9035-6e69d060aa86" />
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/078e2f1f-1004-45c9-823f-8d67fa6ab7e0" />
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/6c43cf72-a6ab-4b4d-a7cc-3bbe7cf179df" />
*> Custom-built scheduling interface with synchronization status.*

### Member Management & Pastoral Notes
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/f373d7f5-195e-48a7-abc3-4452ea7eda16" />
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/2b5de804-4633-461e-9410-8c011b804a62" />
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/c2de2b34-3546-4d60-b3bd-a1653bc50f01" />

*> Detailed member records featuring secure, role-restricted pastoral notes.*

---

## Tech Stack
The frontend ecosystem leverages a modern, performance-oriented stack to ensure maintainability and a seamless user experience:

* **Core Framework:** React, TypeScript, Vite[cite: 3]
* **Desktop Framework:** Tauri (Rust-based, providing cross-platform native desktop builds with a minimal resource footprint)[cite: 3]
* **State Management:** 
  * Redux Toolkit (for global UI state: themes, sidebar, auth, notifications)[cite: 3]
  * TanStack Query / React Query (for asynchronous server state, caching, and data synchronization)[cite: 3]
* **Routing & Security:** React Router DOM with custom `ProtectedRoute` and `RoleGuard` wrappers for granular access control[cite: 3].
* **UI & Styling:** Tailwind CSS, Shadcn UI (accessible, unstyled components), Radix UI primitives[cite: 3].
* **API Communication:** Axios interceptors and WebSocket integration (`useSocket.ts`) for real-time system updates[cite: 3].

## Architecture and Best Practices
The codebase strictly adheres to a **Feature-Sliced Architecture**, ensuring high cohesion and low coupling. This makes the system highly scalable as new requirements are introduced:

* **Feature Modules (`src/features/`):** Business logic is isolated into specific domains (e.g., `accounts`, `appointments`, `members`, `sacraments`)[cite: 3]. Each feature encapsulates its own components, hooks, modals, pages, services, and TypeScript definitions[cite: 3].
* **Custom Hooks (`src/hooks/`):** Reusable logic such as `usePermissions`, `usePagination`, `useSocket`, and `useDebounce`[cite: 3].
* **Component Library (`src/components/ui/`):** A centralized, highly customizable UI kit built on top of Tailwind CSS, ensuring visual consistency across the entire application[cite: 3].
* **Centralized Error Handling:** Global toast notifications and standardized API error parsing[cite: 3].

## Core Features and Modules
The user interface handles complex business requirements divided into specific modules:

1. **Accounting & Financial Reports (`features/accounts`, `features/reports`, `features/journal`):**
   * Hierarchical tree selection for the Chart of Accounts[cite: 3].
   * Double-entry bookkeeping interface (Journal Entries)[cite: 3].
   * Real-time generation of financial reports (Balance Sheet, Income Statement, Trial Balance, Ledger)[cite: 3].
   * Cash closing mechanisms and fiscal period management[cite: 3].

2. **Calendar & Scheduling (`features/appointments`, `features/schedule`):**
   * Custom-built interactive calendar views (Day, Week, Grid)[cite: 3].
   * Visual badges reflecting synchronization status with external calendar APIs[cite: 3].
   * Multi-member selection for complex event scheduling[cite: 3].

3. **Member & Sacrament Management (`features/members`, `features/sacraments`):**
   * Comprehensive member profiles including family relationships and demographic data[cite: 3].
   * Pastoral notes module (`features/pastoral-notes`) with strict visual indicators for sensitive information (`SensitiveBadge.tsx`)[cite: 3].
   * Tracking and management of religious sacraments[cite: 3].

4. **Security & Administration (`features/users`, `features/roles`, `features/config`):**
   * Dynamic Permission Matrix UI for assigning granular access rights to user roles[cite: 3].
   * System configuration panel including manual triggering of secure database backups[cite: 3].

## Local Setup and Development

### Prerequisites
* **Node.js (v20+)** installed on the host machine.
* **Rust and Cargo** (Required only if building the Tauri desktop application).
* A running instance of the **Church Management System Backend API**.

### Installation Steps
1. **Clone the repository and install dependencies:**
```bash
  git clone [repository-url]
  cd church-frontend
  npm install
```
### Configure the environment variables by creating a .env file in the root directory:
```bash
  VITE_API_BASE_URL=http://localhost:3000/api/v1
  VITE_SOCKET_URL=http://localhost:3000
```
### Start the development server (Web Browser):
```bash
`npm run dev
```
### Start the development server (Tauri Desktop App):
```bash
  npm run tauri dev
```
## Building for Production
### To build the application for web deployment:
```bash
  npm run build
```
### To compile the native desktop executable (Windows/macOS/Linux):
```bash
  npm run tauri build
```
## Ecosystem and Future Roadmap
This frontend application is designed to consume the Church Management System REST API.

* ***Backend Repository:*** https://github.com/Enma586/church-backend.git

### Next Steps (Tauri Desktop Enhancements)
As the application scales, the development roadmap focuses on maximizing the native desktop capabilities provided by Tauri's Rust backend:

* ***Native Auto-Updater:*** Implementing Tauri's built-in updater mechanism to deliver seamless, over-the-air (OTA) binary updates directly to desktop users without manual downloads.

* ***Offline-First Architecture (Local State):*** Leveraging tauri-plugin-sql (SQLite) via Rust to cache critical data locally. This will allow administrative read/write capabilities during internet outages, with a background synchronization queue that processes when the connection is restored.

* ***Deep OS Integration:*** Utilizing native APIs to implement System Tray controls, custom protocol deep-linking (e.g., churchapp://), and native OS notifications for upcoming appointments and pastoral alerts.

* ***Hardware Peripheral IPC:*** Expanding the Inter-Process Communication (IPC) bridge to allow the React frontend to communicate securely with local hardware via Rust commands (e.g., thermal receipt printers for tithes/offerings or barcode scanners for event attendance).
