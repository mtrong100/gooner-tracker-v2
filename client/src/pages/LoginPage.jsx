import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userSignin } from "../api/userApi";
import { User, Lock } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await userSignin({ username, password });
      // Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/"); // Điều hướng về Home
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md bg-gray-900/80 rounded-2xl shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Sign In
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
              <User size={20} className="text-gray-400" />
              <input
                type="text"
                className="flex-1 bg-transparent text-white outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
              <Lock size={20} className="text-gray-400" />
              <input
                type="password"
                className="flex-1 bg-transparent text-white outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
