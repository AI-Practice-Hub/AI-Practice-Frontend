"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        router.push("/chat");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700 dark:text-purple-300">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-md bg-blue-700 dark:bg-purple-600 text-white font-semibold hover:bg-blue-800 dark:hover:bg-purple-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account? <a href="/signup" className="text-blue-700 dark:text-purple-300 hover:underline">Sign Up</a>
        </div>
      </form>
    </div>
  );
}
