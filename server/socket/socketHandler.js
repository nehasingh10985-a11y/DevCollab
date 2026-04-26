import Message from "../models/Message.js";
import Room from "../models/Room.js";

const activeUsersMap = {}; // roomId → [users]

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ==========================================
    // 1. JOIN ROOM (Ghost User Fix Ke Sath)
    // ==========================================
    socket.on("join-room", ({ roomId, user }) => {
      socket.join(roomId);

      // Active users track karo
      if (!activeUsersMap[roomId]) activeUsersMap[roomId] = [];

      // MongoDB format ke liye fallback (_id ya id)
      const userId = user?._id || user?.id;

      // Is user ke saare purane 'Ghost' connections ko pehle hi delete kar do
      activeUsersMap[roomId] = activeUsersMap[roomId].filter(
        (u) => (u._id || u.id) !== userId,
      );

      // Ab naya, fresh socket add karo
      activeUsersMap[roomId].push({ ...user, socketId: socket.id });

      // Sab ko nayi active users list bhejo
      io.to(roomId).emit("active-users", activeUsersMap[roomId]);

      // Dusron ko batao koi join hua
      socket.broadcast.to(roomId).emit("user-joined", {
        user,
        activeUsers: activeUsersMap[roomId],
      });

      // Room join hote hi saved code bhejo
      Room.findOne({ roomId }).then((room) => {
        if (room) {
          socket.emit("code-update", {
            code: room.code,
            user: { id: "system" },
          });
          socket.emit("language-update", room.language);
        }
      });
    });

    // ==========================================
    // 2. EDITOR EVENTS (Code, Language, Cursor, Run)
    // ==========================================
    socket.on("code-change", ({ roomId, code, user }) => {
      socket.to(roomId).emit("code-update", { code, user });
    });

    socket.on("language-change", ({ roomId, language }) => {
      socket.to(roomId).emit("language-update", language);
    });

    socket.on("cursor-move", ({ roomId, user, position }) => {
      // console.log("Cursor move received:", user.name, position);
      socket.to(roomId).emit("cursor-update", { user, position });
    });

    socket.on("save-code", async ({ roomId, code, language }) => {
      try {
        await Room.findOneAndUpdate({ roomId }, { code, language });
        console.log(`Code saved for room: ${roomId}`);
      } catch (err) {
        console.error(err);
      }
    });

    // Code Run ka event
    socket.on("code-run", ({ roomId, user }) => {
      socket.to(roomId).emit("notify-run", user);
    });

    // ==========================================
    // 3. CHAT MESSAGE & SEEN EVENT
    // ==========================================
    socket.on("send-message", async (data) => {
      const { roomId, user, text } = data;

      // 🕵️‍♀️ Validation: Check karo data poora aa raha hai ya nahi
      if (!roomId || !text || !user) {
        return console.log("🚨 Data missing hai:", { roomId, text, user });
      }

      try {
        const newMessage = new Message({
          roomId,
          user: {
            id: String(user.id || user._id), // Safe ID conversion
            name: user.name,
          },
          text,
          seen: false,
        });

        const savedMsg = await newMessage.save();

        // ✅ Yeh log terminal mein aana chahiye!
        console.log(`✅ Message saved for room ${roomId}:`, savedMsg.text);

        // 📤 Dusre users ko message bhejo
        io.to(roomId).emit("receive-message", savedMsg);
      } catch (err) {
        // 🚨 Agar database crash ho raha hai toh yahan pata chalega
        console.error("🚨 DB SAVE FAIL:", err.message);
      }
    });

    // Seen Event (Instagram jaisa feature)
    socket.on("mark-seen", async ({ roomId, userId }) => {
      try {
        // Database mein un messages ko 'seen: true' karo jo Maine nahi bheje
        await Message.updateMany(
          {
            roomId,
            "user.id": { $ne: userId }, // Mere alaawa baaki sab ke messages
            seen: false,
          },
          { $set: { seen: true } },
        );

        // Samne wale ko signal bhejo ki messages dekh liye gaye hain
        socket.to(roomId).emit("messages-seen");
      } catch (err) {
        console.error("Seen update error:", err);
      }
    });

    // ==========================================
    // 4. LEAVE ROOM (Normal Back Button / Leave)
    // ==========================================
    socket.on("leave-room", ({ roomId, user }) => {
      socket.leave(roomId);

      if (activeUsersMap[roomId]) {
        activeUsersMap[roomId] = activeUsersMap[roomId].filter(
          (u) => u.socketId !== socket.id,
        );
      }

      socket.to(roomId).emit("user-left", {
        user,
        activeUsers: activeUsersMap[roomId] || [],
      });

      // Update sabko bhejo
      io.to(roomId).emit("active-users", activeUsersMap[roomId] || []);
    });

    // ==========================================
    // 5. DISCONNECT (Tab Close Fix)
    // ==========================================
    socket.on("disconnect", () => {
      console.log("User disconnected (Tab closed):", socket.id);

      // Saare rooms check karo
      for (const roomId in activeUsersMap) {
        // Check karo ki jo user gaya hai, kya wo is room mein tha?
        const isUserInRoom = activeUsersMap[roomId].some(
          (u) => u.socketId === socket.id,
        );

        if (isUserInRoom) {
          // 1. User ko list se hatao
          activeUsersMap[roomId] = activeUsersMap[roomId].filter(
            (u) => u.socketId !== socket.id,
          );

          // 2. Baaki bache hue logon ko nayi list turant bhejo!
          io.to(roomId).emit("active-users", activeUsersMap[roomId]);

          // Optional Cleanup: Agar room khali ho gaya toh memory bacha lo
          if (activeUsersMap[roomId].length === 0) {
            delete activeUsersMap[roomId];
          }
        }
      }
    });
  });
};

export default socketHandler;
