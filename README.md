⚡ THUNDER HACKATHON 3.0 — System Inspector 🖥️📊

A modern full-stack system monitoring & workspace management dashboard built with
Vanilla JavaScript + Node.js + Express.js

🌐 Live Demo

🚀 Deployed on Vercel
👉 https://your-project-link.vercel.app

🚀 Overview

System Inspector is a developer-focused tool that provides real-time system insights and workspace control.

It helps you:

📊 Monitor system performance in real-time
🌐 Inspect environment variables securely
📁 Manage files & folders (CRUD system)
📈 Generate system analytics reports
🧠 Analyze code structure & project stats

Built with a VS Code-inspired UI, it delivers a lightweight SaaS-like experience without frameworks like React or Tailwind.

✨ Features

🖥️ System Monitoring
OS, hostname, platform, architecture
CPU details & live usage
RAM usage (total, used, free)
System uptime & boot time
Disk usage analysis
Network interface info
Battery status (if available)

🔐 Environment Variables Inspector

View system environment variables
Track important keys (PATH, NODE_ENV, etc.)
Search & filter variables
Mask sensitive data automatically 🔒

📁 File Manager (CRUD System)

Create / delete files & folders
Rename files & directories
Tree-based explorer 🌳
Built-in code editor 💻
Search workspace files

📊 Code Analytics Engine

Total files, folders, size stats
Lines of code analysis
Function & class detection
File-level insights

📈 System Health Score

Score	Rating
85–100	🟢 Excellent
70–84	🟡 Good
50–69	🟠 Average
0–49	🔴 Poor

📑 Reports & Activity Logs

System reports generation
JSON export 📤
Activity tracking (file operations, edits, deletions)

🛠️ Tech Stack

Layer	Technology
Frontend	HTML5, CSS3, Vanilla JavaScript
Backend	Node.js, Express.js
Core Modules	os, fs, path, child_process, dotenv, cors

📂 Project Structure

system-inspector/
│
├── public/                 # 🌐 Frontend UI
│   ├── css/                # 🎨 Styles
│   ├── js/                 # ⚙️ Frontend logic
│   │   ├── api/            # 🔌 API handlers
│   │   ├── components/     # 🧩 UI components
│   │   ├── pages/          # 📄 Application pages
│   │   └── app.js          # 🚀 Entry point
│   └── index.html
│
├── server/                # 🖥️ Backend (MVC architecture)
│   ├── controllers/       # 🎮 Request handlers
│   ├── routes/            # 🧭 API routes
│   ├── services/          # 🧠 Business logic
│   ├── utils/             # 🛠️ Helper functions
│   ├── config/            # ⚙️ Configuration
│   ├── data/              # 📊 Logs & reports
│   ├── app.js
│   └── server.js
│
├── workspace/             # 📁 Sandboxed file system
├── .env.example          # 🔐 Environment config
├── .gitignore            # 🚫 Ignored files
├── package.json
└── README.md

⚙️ Installation (Local Setup)

📌 Requirements:

Node.js (v18+)
npm

📥 Steps:

git clone https://github.com/yourusername/system-inspector.git
cd system-inspector
npm install

🔌 API Endpoints

| Method | Endpoint       | Description           |
| ------ | -------------- | --------------------- |
| GET    | /api/system    | System information    |
| GET    | /api/env       | Environment variables |
| GET    | /api/health    | System health score   |
| GET    | /api/files     | File manager          |
| GET    | /api/analytics | Code analytics        |
| GET    | /api/logs      | Activity logs         |

🧠 Architecture Flow

Request → Routes → Controllers → Services → Utils → Response

Breakdown:

📍 Routes → API mapping
🎮 Controllers → Request handling
🧠 Services → Core logic
🛠️ Utils → System helpers

🔒 Security

📦 Workspace sandboxed
🔐 Sensitive environment variables masked
🚫 No external system access outside scope

📱 Cross Platform

✔ Windows
✔ Linux
✔ macOS

🚀 Future Improvements

🔐 Authentication system
🌐 Cloud sync dashboard
⚡ Real-time monitoring (WebSockets)
🧠 AI-based system insights

👨‍💻 Author

Abhishek Mehra
Built for ⚡ Thunder Hackathon 3.0

📜 License

This project is licensed under the MIT License

⚡ Final Tagline

Inspect. Manage. Analyze. Build like a pro.

