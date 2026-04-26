# DevCollab 🚀

<div align="center">

**Real-time Collaborative Code Editor**

_Code together. Chat together. Build together._

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.0-black?style=for-the-badge&logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

<br/>

### 💻 Main Workspace

![Main UI](./assets/Dashboard.png)

<br/>

<table border="0">
  <tr>
    <td width="50%">
      <img src="./assets/Collaboration.png" alt="Live Cursors" width="100%">
      <p align="center"><b>Live Cursor Sync</b></p>
    </td>
    <td width="50%">
      <img src="./assets/Chat.png" alt="Real-time Chat" width="100%">
      <p align="center"><b>Chat with Seen Status</b></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./assets/AI-Helper.png" alt="AI Helper" width="100%">
      <p align="center"><b>AI Code Explanation</b></p>
    </td>
    <td width="50%">
      <img src="./assets/Diff-View.png" alt="Diff Viewer" width="100%">
      <p align="center"><b>Side-by-side Diff View</b></p>
    </td>
  </tr>
</table>

</div>

## ✨ Features

### 🔐 Authentication

- Email & Password login/register
- **Google OAuth** — one click sign in
- JWT secured sessions

### 💻 Code Editor

- **Monaco Editor** — same as VS Code
- Supports **JavaScript, Python, C++, Java**
- Dark theme, auto-complete, syntax highlighting
- **Run code** directly in browser (Judge0 API)

### ⚡ Real-time Collaboration

- **Live code sync** — type and everyone sees instantly
- **Live cursors** — see where others are typing (color coded)
- **Active users bar** — who's online right now

### 💬 Chat

- Real-time messaging inside the room
- Messages persist across sessions
- **Seen ✓✓** status like WhatsApp
- **AI reply assist** — rewrite your message with AI 🤖

### 📸 Code Snapshots

- Save named versions of your code
- **Diff view** — compare snapshot vs current code side by side
- Restore any snapshot instantly

### 🤖 AI Helper

- **Explain Code** — understand what the code does
- **Fix Bug** — AI suggests fixes for errors
- Powered by **Groq + LLaMA 3** (ultra fast)

### 🔔 Extra

- Toast notifications for every action
- Auto-save every 30 seconds
- Copy Room ID with one click
- Disconnect warning before leaving

---

## 🛠️ Tech Stack

```
Frontend        →  React 18, Redux Toolkit, Tailwind CSS
Editor          →  Monaco Editor (@monaco-editor/react)
Real-time       →  Socket.io (WebSockets)
Backend         →  Node.js, Express.js
Auth            →  JWT, bcrypt, Passport.js (Google OAuth)
Database        →  MongoDB Atlas
Code Execution  →  Judge0 API
AI              →  Groq API (LLaMA 3)
```

---

## 📁 Project Structure

```
devcollab/
├── client/                       # React Frontend
│   └── src/
│       ├── features/
│       │   ├── auth/             # Login, Register, Google OAuth
│       │   ├── rooms/            # Dashboard, Room cards
│       │   ├── editor/           # Monaco, AI Helper, Diff View
│       │   └── chat/             # Chat sidebar
│       ├── hooks/
│       │   └── useSocket.js      # Socket.io custom hook
│       └── components/
│           └── LiveCursor.jsx    # Real-time cursors
│
└── server/                       # Node.js Backend
    ├── config/
    │   ├── db.js                 # MongoDB connection
    │   └── passport.js           # Google OAuth
    ├── models/                   # User, Room, Message, Snapshot
    ├── routes/                   # auth, rooms, snapshots, messages
    ├── middleware/
    │   └── authMiddleware.js     # JWT verification
    └── socket/
        └── socketHandler.js      # All Socket.io events
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/devcollab.git
cd devcollab
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_GROQ_KEY=your_groq_api_key
VITE_JUDGE0_KEY=your_judge0_key
```

```bash
npm run dev
```

### 4. Open browser

```
http://localhost:5173
```

---

## 🌐 API Endpoints

```
POST   /api/auth/register          →  Register
POST   /api/auth/login             →  Login
GET    /api/auth/google            →  Google OAuth

POST   /api/rooms/create           →  Create room
POST   /api/rooms/join/:roomId     →  Join room
GET    /api/rooms/my-rooms         →  My rooms

POST   /api/snapshots              →  Save snapshot
GET    /api/snapshots/:roomId      →  Get snapshots

GET    /api/messages/:roomId       →  Chat history
```

---

## ⚡ Socket Events

```
join-room        →  Join a coding room
code-change      →  Broadcast code to all users
cursor-move      →  Share cursor position
send-message     →  Send chat message
save-code        →  Auto-save code to DB
mark-seen        →  Mark messages as read
leave-room       →  Leave the room
```

---

## 🚢 Deployment

```
Frontend  →  Vercel  (npm run build → deploy /dist)
Backend   →  Render  (supports WebSockets, free tier)
Database  →  MongoDB Atlas (free M0 cluster)
```

---

## 👩‍💻 Author

**Neha Singh**

[![GitHub](https://img.shields.io/badge/GitHub-nehasingh-181717?style=flat&logo=github)](https://github.com/nehasingh)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Neha_Singh-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/nehasingh)

---

## 📄 License

MIT License — feel free to use and modify.

---

<div align="center">
  <b>Built with ❤️ for developers who love to collaborate</b>
  <br/>
  <sub>Give it a ⭐ if you found it useful!</sub>
</div>
