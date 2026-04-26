import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyRooms, createRoom, joinRoom } from "./roomSlice";
import { logout } from "../auth/authSlice";
import RoomCard from "./RoomCard";
import toast from "react-hot-toast";

const SkeletonCard = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-800 rounded w-12"></div>
    </div>
    <div className="h-3 bg-gray-800 rounded w-1/2 mb-4"></div>
    <div className="flex justify-between">
      <div className="h-3 bg-gray-800 rounded w-1/4"></div>
      <div className="h-3 bg-gray-800 rounded w-1/4"></div>
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rooms, loading } = useSelector((state) => state.rooms);
  const { user } = useSelector((state) => state.auth);

  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    dispatch(fetchMyRooms());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await dispatch(createRoom({ name: roomName, language }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Room created! 🚀");
      setShowCreate(false);
      setRoomName("");
      navigate(`/room/${res.payload.roomId}`);
    } else {
      toast.error("Room create nahi hua!");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinId.trim()) return toast.error("Room ID daalo!");
    const res = await dispatch(joinRoom(joinId.trim()));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Room join ho gaya! ✅");
      navigate(`/room/${joinId.trim()}`);
    } else {
      toast.error("Room nahi mila — ID check karo!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">DevCollab</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">
            Hi, {user?.name || "Developer"} 👋
          </span>
          <button
            onClick={() => {
              dispatch(logout());
              toast("Logged out!", { icon: "👋" });
            }}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">My Rooms</h2>
            <p className="text-gray-400 text-sm mt-1">
              Create ya join karo ek room
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New Room
          </button>
        </div>

        {/* Join Room */}
        <form onSubmit={handleJoin} className="flex gap-2 mb-8">
          <input
            type="text"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Room ID paste karo..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition whitespace-nowrap"
          >
            Join Room
          </button>
        </form>

        {/* Create Room Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">New Room</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. DSA Practice"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 transition"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-3">💻</p>
            <p className="text-lg">Koi room nahi hai abhi</p>
            <p className="text-sm mt-1">
              New Room banao ya Room ID se join karo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
