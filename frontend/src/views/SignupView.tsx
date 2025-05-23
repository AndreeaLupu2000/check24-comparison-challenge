// views/SignupView.tsx
// React
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Services
import { createUser } from "../api/userService";
// Assets
import Icon from "../assets/icon.png";
import bcrypt from "bcryptjs";

const SignupView = () => {
  // Local state for the email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Local state for the error message
  const [error, setError] = useState("");

  // Navigation
  const navigate = useNavigate();

  // Handle the signup
  const handleSignup = async () => {
    // Check if the email and password are filled
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      // Create the user

      const hashedPassword = await bcrypt.hash(password, 10);

      await createUser({ email, password: hashedPassword });

      // Redirect to login page
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error creating account");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ------------------ Back to Login Button (Top-Left) ------------------ */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate("/")}
          className="text-indigo-600 hover:underline text-sm bg-white px-3 py-1 rounded shadow"
        >
          ← Back to Login
        </button>
      </div>

      {/* ------------------ Header ------------------ */}
      <div className="w-full bg-gray-100 py-6 mb-8 mt-10">
        {/* ------------------ Logo and title ------------------ */}
        <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto px-4">
          <img src={Icon} alt="GenDevNet Logo" className="w-32 h-auto" />
          <h1 className="text-5xl font-bold leading-[3.5rem] text-gray-800">
            GenDevNet
          </h1>
        </div>
      </div>

      {/* ------------------ Sign Up Card ------------------ */}
      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h1 className="text-xl font-bold mb-4 text-center">Sign Up</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* ------------------ Email Input ------------------ */}
        <div className="mb-6 relative">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-indigo-500"
          />
        </div>

        {/* ------------------ Password Input ------------------ */}
        <div className="mb-6 relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-indigo-500"
          />
        </div>

        {/* ------------------ Create Account Button ------------------ */}
        <div className="flex justify-center">
          <button
            onClick={handleSignup}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupView;
