import React, { useState } from "react";
import { supabase } from "../supabase";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 font-body">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-[0_8px_30px_rgb(107,78,46,0.06)] border border-[#EEEDE9]">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-[#6B4E2E] tracking-tight font-display">
            Cake 4 All
          </h2>
          <div className="h-0.5 w-12 bg-[#6B4E2E]/20 mx-auto rounded-full mt-1"></div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#8C8275] pt-1">
            Management Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-700 border border-red-100 text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B4E2E]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#D8CFC3] bg-[#FDFBF7] px-4 py-3 text-base text-[#4A3422] placeholder-gray-400 focus:border-[#6B4E2E] focus:ring-2 focus:ring-[#6B4E2E]/10 focus:outline-none transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-[#6B4E2E]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#D8CFC3] bg-[#FDFBF7] pl-4 pr-12 py-3 text-base text-[#4A3422] focus:border-[#6B4E2E] focus:ring-2 focus:ring-[#6B4E2E]/10 focus:outline-none transition-all duration-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C8275] hover:text-[#6B4E2E] focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6B4E2E] py-3.5 font-semibold text-white tracking-wide transition-all duration-150 hover:bg-[#543D24] hover:shadow-lg active:scale-[0.985] disabled:opacity-50 shadow-md shadow-[#6B4E2E]/10 mt-2 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying Details...
              </span>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
