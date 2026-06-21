# ⚡ THUNDER HACKATHON 3.0 — System Inspector 🖥️📊

> A modern full-stack **system monitoring & workspace management dashboard** built with **Vanilla JavaScript, Node.js, and Express.js**.

---

## 🌐 Live Demo

🚀 **Deployed on Vercel**

👉 **https://your-project-link.vercel.app**

---

## 🚀 Overview

**System Inspector** is a developer-focused tool that provides real-time system insights and workspace management capabilities.

### It allows developers to:

- 📊 Monitor system performance in real-time
- 🌐 Inspect environment variables securely
- 📁 Manage files & folders (CRUD operations)
- 📈 Generate system analytics reports
- 🧠 Analyze code structure & project statistics

Built with a **VS Code-inspired dark UI**, it delivers a modern SaaS-like experience without relying on heavy frameworks like React or Tailwind.

---

## ✨ Features

### 🖥️ System Monitoring

- Operating system details
- Hostname, platform & architecture
- CPU details and live usage
- RAM usage (total, used, free)
- System uptime & boot time
- Disk usage analysis
- Network interface information
- Battery status (if available)

### 🔐 Environment Variables Inspector

- View all environment variables
- Track important keys (`PATH`, `NODE_ENV`, etc.)
- Search and filter variables
- Automatically mask sensitive data

### 📁 File Manager (CRUD System)

- Create and delete files/folders
- Rename files and directories
- Tree-based file explorer 🌳
- Built-in code editor 💻
- Search files within workspace

### 📊 Code Analytics Engine

- Total files and folders statistics
- Project size analysis
- Lines of code analysis
- Function & class detection
- File-level insights

### 📈 System Health Score

| Score | Rating |
|--------|---------|
| 85–100 | 🟢 Excellent |
| 70–84 | 🟡 Good |
| 50–69 | 🟠 Average |
| 0–49 | 🔴 Poor |

### 📑 Reports & Activity Logs

- Generate system reports
- Export reports as JSON 📤
- Track file operations and activity logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Core Modules** | os, fs, path, child_process, dotenv, cors |

---

## 📂 Project Structure

```text
system-inspector/
│
├── public/                     # 🌐 Frontend UI
│   ├── css/                    # 🎨 Styles
│   ├── js/                     # ⚙️ Frontend Logic
│   │   ├── api/                # 🔌 API Handlers
│   │   ├── components/         # 🧩 UI Components
│   │   ├── pages/              # 📄 Application Pages
│   │   └── app.js              # 🚀 Entry Point
│   └── index.html
│
├── server/                     # 🖥️ Backend (MVC)
│   ├── controllers/            # 🎮 Request Handlers
│   ├── routes/                 # 🧭 API Routes
│   ├── services/               # 🧠 Business Logic
│   ├── utils/                  # 🛠️ Helper Functions
│   ├── config/                 # ⚙️ Configuration
│   ├── data/                   # 📊 Logs & Reports
│   ├── app.js
│   └── server.js
│
├── workspace/                  # 📁 Sandboxed Workspace
├── .env.example                # 🔐 Environment Variables
├── .gitignore                  # 🚫 Ignored Files
├── package.json
└── README.md
