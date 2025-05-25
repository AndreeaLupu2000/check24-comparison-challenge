// views/SignupView.tsx
// React
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Services
import { createUser, getAllUsers } from "../api/userService";
// Assets
import Icon from "../assets/icon.png";
import bcrypt from "bcryptjs";

interface SignupViewProps {
  errors?: {
    email?: string;
    password?: string;
  };

  onFieldChange?: (field: "email" | "password") => void;
}

const SignupView: React.FC<SignupViewProps> = ({
  onFieldChange,
}) => {
  // Local state for the email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Local state for the form errors
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  // Navigation
  const navigate = useNavigate();

  // Handle the signup
  const handleSignup = async () => {
    // Check if the email and password are filled
    if (!email) {
      setFormErrors(prev => ({ ...prev, email: "Please enter the email" }));
      return;
    }

    if (!password) {
      setFormErrors(prev => ({ ...prev, password: "Please enter the password" }));
      return;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormErrors(prev => ({ ...prev, email: "Invalid email format" }));
      return;
    }


    try {
      // Create the user
      const user = await getAllUsers();

      if (user.find((user) => user.email === email)) {
        setFormErrors(prev => ({ ...prev, email: "User already exists" }));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await createUser({ email, password: hashedPassword });

      // Redirect to login page
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormErrors(prev => ({ ...prev, email: err.message }));
        return;
      } else {
        setFormErrors(prev => ({ ...prev, email: "Error creating account" }));
        return;
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ------------------ Back to Login Button (Top-Left) ------------------ */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline text-md font-semibold bg-white px-3 py-1 rounded shadow"
        >
          Back to Login
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
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        {/* ------------------ Email Input ------------------ */}
        <div className="mb-6 relative">
          <label
            htmlFor="email"
            className="block text-lg font-medium text-gray-700 h-5"
          >
            Email
          </label>

          {/* ------------------ Error message for Email ------------------ */}
          <span
            className={`text-xs h-4 ${formErrors.email ? "text-red-500" : "text-transparent"}`}
          >
            {formErrors.email || "No error"}
          </span>

          {/* ------------------ Input Field ------------------ */}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors(prev => ({ ...prev, email: "" }));
              onFieldChange?.("email");
            }}
            placeholder="Email"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
              formErrors.email
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
          />
        </div>

        {/* ------------------ Password Input ------------------ */}
        <div className="mb-6 relative">
          <label
            htmlFor="password"
            className="block text-lg font-medium text-gray-700 h-5"
          >
            Password
          </label>

          {/* ------------------ Error message for Password ------------------ */}
          <span
            className={`text-xs h-4 ${formErrors.password ? "text-red-500" : "text-transparent"}`}
          >
            {formErrors.password || "No error"}
          </span>

          {/* ------------------ Input Field ------------------ */}
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors(prev => ({ ...prev, password: "" }));
              onFieldChange?.("password");
            }}
            placeholder="********"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
              formErrors.password
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
          />
        </div>

        {/* ------------------ Create Account Button ------------------ */}
        <div className="flex justify-center">
          <button
            onClick={handleSignup}
            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupView;
