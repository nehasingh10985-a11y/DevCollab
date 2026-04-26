import { useNavigate } from "react-router-dom";

const langColors = {
  javascript: "bg-yellow-500/10 text-yellow-400",
  python: "bg-blue-500/10 text-blue-400",
  cpp: "bg-purple-500/10 text-purple-400",
  java: "bg-orange-500/10 text-orange-400",
};

const RoomCard = ({ room }) => {
  const navigate = useNavigate();

  const copyRoomId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.roomId);
    alert("Room ID copied!");
  };

  return (
    <div
      onClick={() => navigate(`/room/${room.roomId}`)}
      className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white">{room.name}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-md font-medium ${langColors[room.language] || "bg-gray-700 text-gray-300"}`}
        >
          {room.language}
        </span>
      </div>

      <p className="text-gray-500 text-xs mb-4 font-mono truncate">
        {room.roomId}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">
          {room.participants?.length || 1} member(s)
        </span>
        <button
          onClick={copyRoomId}
          className="text-xs text-gray-400 hover:text-white transition"
        >
          Copy ID
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
