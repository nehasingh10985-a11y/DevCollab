// client/src/features/auth/AuthCallback.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "./authSlice";

const AuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userRaw = params.get("user");

    if (token && userRaw) {
      try {
        // 🔥 Try-catch add kiya taaki JSON parse kabhi crash na ho
        const user = JSON.parse(decodeURIComponent(userRaw));

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch(loginSuccess({ token, user }));
        navigate("/dashboard"); // Aapke dashboard par smoothly chala jayega
      } catch (error) {
        console.error("Failed to parse user data:", error);
        navigate("/login?error=data_parsing_failed");
      }
    } else {
      navigate("/login?error=google_failed");
    }
  }, [dispatch, navigate]); // 🔥 ESLint warning se bachne ke liye dependencies add kiye

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-sm animate-pulse">
        Google se login ho raha hai...
      </div>
    </div>
  );
};

export default AuthCallback;
