<<<<<<< HEAD
# System Inspector

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**System Inspector** is a professional full-stack dashboard for monitoring system resources, inspecting environment variables, managing workspace files, and generating exportable reports — built with **Vanilla JavaScript** on the frontend and **Node.js + Express** on the backend.

Designed with a VS Code–inspired dark theme, it delivers a modern SaaS experience without React, Tailwind, or Bootstrap.

![System Inspector Dashboard](https://via.placeholder.com/1200x630/0F172A/3B82F6?text=System+Inspector)

---

## Features

### System Monitoring
- Computer name, hostname, OS, platform, and architecture
- CPU model, cores, and live usage percentage
- Memory (total, used, free, usage %)
- System uptime, boot time, and timezone
- Process monitoring (total, top, high memory, high CPU)
- Disk storage (total, used, free, per-drive breakdown)
- Network interfaces and connection status
- Battery info (or "Battery Not Available" on desktop PCs)

### Environment Variables
- View all runtime environment variables
- Tracked keys: `PATH`, `HOME`, `TEMP`, `USERNAME`, `NODE_ENV`, `PORT`
- Search and filter (All, Tracked, Sensitive, Other)
- Automatic masking of sensitive values (passwords, tokens, secrets)

### File Manager
- Full CRUD on workspace files
- Create / delete folders
- Rename files and folders
- Tree explorer with breadcrumb navigation
- In-browser code editor with save
- File search across workspace

### Code Analytics
- **Project:** total files, folders, JS/HTML/CSS counts, size distribution
- **Per file:** lines, blank lines, comments, functions, classes, size, last modified

### System Health Score
Weighted score from CPU, RAM, disk, and battery (when available):

| Score   | Rating    |
|---------|-----------|
| 85–100  | Excellent |
| 70–84   | Good      |
| 50–69   | Average   |
| 0–49    | Poor      |

### Reports & Activity Logs
- Generate **System**, **Analytics**, and **Environment** reports
- Export reports as JSON
- Activity log (file create/update/delete, folder ops, report generation)

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript     |
| Backend  | Node.js, Express.js                 |
| Modules  | `os`, `fs/promises`, `path`, `child_process`, `dotenv`, `cors` |

**Not used:** React, Vue, Tailwind, Bootstrap, jQuery

---

## Project Structure

```
system-inspector/
├── public/                  # Frontend (static assets)
│   ├── css/
│   │   ├── variables.css    # Design tokens
│   │   ├── base.css         # Reset & globals
│   │   ├── layout.css       # App shell layout
│   │   ├── components.css   # UI components
│   │   └── pages.css        # Page-specific styles
│   ├── js/
│   │   ├── api.js           # API client
│   │   ├── utils.js         # Shared utilities
│   │   ├── app.js           # SPA router & init
│   │   ├── components/      # Navbar, sidebar, modal, toast
│   │   └── pages/           # Dashboard, system, env, files, etc.
│   └── index.html
├── server/
│   ├── server.js            # Entry point
│   ├── app.js               # Express configuration
│   ├── config/              # Environment config
│   ├── controllers/         # Request handlers (MVC)
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── utils/               # Helpers & analyzers
│   └── data/                # Activity logs (JSON)
├── workspace/               # File manager root (sandboxed)
├── package.json
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18.0.0** or higher
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/system-inspector.git
cd system-inspector

# Install dependencies
npm install

# Copy environment config (optional — defaults work out of the box)
cp .env.example .env
```

### Run

```bash
npm start
```

Open **http://localhost:3000** in your browser.

Development mode with auto-restart:

```bash
npm run dev
```

---

## Configuration

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
WORKSPACE_PATH=./workspace
```

| Variable         | Default       | Description                          |
|------------------|---------------|--------------------------------------|
| `PORT`           | `3000`        | HTTP server port                     |
| `NODE_ENV`       | `development` | Runtime environment                  |
| `WORKSPACE_PATH` | `./workspace` | Sandboxed directory for file manager |

---

## API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint                    | Description                |
|--------|-----------------------------|----------------------------|
| GET    | `/status`                   | API health check           |
| GET    | `/system`                   | Full system information    |
| GET    | `/env`                      | Environment variables      |
| GET    | `/health`                   | System health score        |
| GET    | `/logs`                     | Activity logs              |
| GET    | `/reports/dashboard`        | Dashboard aggregate data   |
| GET    | `/reports/:type`            | Generate report (`system`, `analytics`, `environment`) |
| GET    | `/files`                    | List directory             |
| GET    | `/files/tree`               | File tree                  |
| GET    | `/files/search?q=`          | Search files               |
| GET    | `/files/read/:path`         | Read file                  |
| POST   | `/files/file`               | Create file                |
| PUT    | `/files/file/:path`         | Update file                |
| DELETE | `/files/file/:path`         | Delete file                |
| PATCH  | `/files/rename/:path`       | Rename file/folder         |
| POST   | `/files/folder`             | Create folder              |
| DELETE | `/files/folder/:path`       | Delete folder              |
| GET    | `/analytics`                | Analytics overview         |
| GET    | `/analytics/project`        | Project statistics         |
| GET    | `/analytics/file/:path`     | Single file analytics      |

### Example

```bash
curl http://localhost:3000/api/system
curl http://localhost:3000/api/health
curl "http://localhost:3000/api/env?filter=tracked&mask=true"
```

---

## UI Pages

1. **Dashboard** — Overview, health score, quick stats, recent activity  
2. **System Info** — Hardware, processes, disk, network, battery  
3. **Environment Variables** — Search, filter, mask sensitive values  
4. **File Manager** — Tree explorer, editor, CRUD operations  
5. **Analytics** — Project and file-level code metrics  
6. **Reports** — Generate and export JSON reports  
7. **Settings** — Preferences and app information  

---

## Architecture

The backend follows **MVC**:

```
Request → Route → Controller → Service → Response
                      ↓
                 Activity Logger
```

- **Routes** — HTTP mapping only  
- **Controllers** — Parse requests, send responses, error forwarding  
- **Services** — System calls, file I/O, analytics, report generation  
- **Utils** — Formatters, file analyzer, activity logger  

The frontend is a lightweight **SPA** using hash routing (`#dashboard`, `#files`, etc.) with ES modules.

---

## Security Notes

This project is a **local development / hackathon tool**, not production middleware.

- File operations are **sandboxed** to `WORKSPACE_PATH` — paths outside the workspace are rejected  
- `child_process` is used only for read-only system queries (process list, disk, battery)  
- Sensitive environment variables are masked in the UI and reports  
- Do not expose this application to the public internet without authentication  

---

## Cross-Platform Support

| Feature   | Windows | Linux | macOS |
|-----------|---------|-------|-------|
| System    | ✅      | ✅    | ✅    |
| Processes | ✅      | ✅    | ✅    |
| Disk      | ✅      | ✅    | ✅    |
| Battery   | ✅      | ✅    | ✅    |
| Network   | ✅      | ✅    | ✅    |

On desktop PCs without a battery, the dashboard displays **"Battery Not Available"**.

---

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm start`   | Start production server  |
| `npm run dev` | Start with `--watch`     |

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m 'Add amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request  

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built for JavaScript hackathons and developers who want a clean, framework-free system dashboard with real utility — no bloat, no placeholders, production-quality structure.

**System Inspector** — *Inspect. Manage. Report.*
=======
# System-Inspector
>>>>>>> 630085c6e78cb023b0f5e804918bd83481697a93
