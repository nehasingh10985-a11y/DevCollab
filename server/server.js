import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import dns from "dns";
import session from "express-session";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import snapshotRoutes from "./routes/snapshot.routes.js";
import messageRoutes from "./routes/message.routes.js";
import socketHandler from "./socket/socketHandler.js";
import initPassport from "./config/passport.js"; // ← function import

dns.setServers(["1.1.1.1", "8.8.8.8"]);
connectDB();
initPassport(); // ← dotenv ke baad call karo ✅

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({ message: "DevCollab server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/snapshots", snapshotRoutes);
app.use("/api/messages", messageRoutes);

socketHandler(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
