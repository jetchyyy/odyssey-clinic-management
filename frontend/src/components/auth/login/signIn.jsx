import { useState } from "react";
import { Navigate } from "react-router-dom";
import { doSignInWithEmailAndPassword } from "../../../firebase/auth";
import { useAuth } from "../../../context/authContext/authContext";
import bgImage from "../../../assets/logo.jpg";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";

const SignIn = () => {
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);

    setErrorMessage("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    
    try {
      // Firebase handles encryption over HTTPS
      await doSignInWithEmailAndPassword(email, password);
      
      // Clear sensitive data from memory after successful login
      setPassword("");
      setEmail("");
    } catch (error) {
      let message = "An error occurred. Please try again.";
      if (error.code === "auth/invalid-credential") {
        message = "Invalid password or email.";
      } else if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      }
      
      setErrorMessage(message);
      
      // Clear password on error for security
      setPassword("");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 flex">
      {userLoggedIn && <Navigate to={"/dashboard"} replace={true} />}

      {/* Left: Image */}
      <div className="relative w-1/2 h-screen hidden lg:block overflow-hidden">
        <img
          src={bgImage}
          alt="OddySys"
          className="object-cover w-full h-full scale-105 transition-transform duration-700 hover:scale-100"
        />
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent mb-3">
              Login
            </h1>
            <p className="text-gray-400 text-lg">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form Card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl shadow-orange-500/10">
            <form onSubmit={onSubmit} className="space-y-6" autoComplete="on">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-white font-medium text-sm tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  autoComplete="email"
                  required
                  disabled={isSigningIn}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-white font-medium text-sm tracking-wide">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    autoComplete="current-password"
                    required
                    disabled={isSigningIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm backdrop-blur-sm">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSigningIn}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  isSigningIn
                    ? "bg-slate-800/50 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 active:scale-95"
                }`}
              >
                <span className="flex items-center justify-center">
                  {isSigningIn && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSigningIn ? "Signing In..." : "Sign In"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/forgot-password")}
                className="text-orange-300 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-orange-300"
                disabled={isSigningIn}
              >
                Forgot Password?
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              🔒 Secure login protected by HTTPS encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;