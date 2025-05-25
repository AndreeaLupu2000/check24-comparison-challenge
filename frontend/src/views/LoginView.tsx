// views/LoginView.tsx
// React
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Contexts
import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";
// Dtos
import { UserDto } from "../types/UserDto";
// Services
import { getAllUsers } from "../api/userService";
// Assets
import Icon from "../assets/icon.png";
import bcrypt from "bcryptjs";

interface LoginViewProps {
  errors?: {
    email?: string;
    password?: string;
  };

  onFieldChange?: (field: "email" | "password") => void;
}

const LoginView: React.FC<LoginViewProps> = ({ 
  onFieldChange,
}) => {
  // Context for the address
  const { setAddress } = useAddress();

  // Local state for all users
  const [users, setUsers] = useState<UserDto[]>([]);

  // Local states for the login form
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Context of the current user
  const { setUser } = useAuth();

  // Navigation to other views
  const navigate = useNavigate();

  // Add this state at the top with other states
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: ""
  });

  // Effect to fetch all users from the database
  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Function to handle the login process
  const handleLogin = async (email: string, password: string) => {
    // Clear previous errors
    setFormErrors({ email: "", password: "" });

    // Check if email is empty
    if (!email) {
      setFormErrors(prev => ({ ...prev, email: "Please enter the email" }));
      return;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormErrors(prev => ({ ...prev, email: "Invalid email format" }));
      return;
    }

    // Check if password is empty
    if (!password) {
      setFormErrors(prev => ({ ...prev, password: "Please enter the password" }));
      return;
    }

    // Check if email is valid
    const foundUser = users.find((user) => user.email === email);
    if (!foundUser) {
      setFormErrors(prev => ({ ...prev, email: "Email not found" }));
      return;
    }

    // Check if password matches using await
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      setFormErrors(prev => ({ ...prev, password: "Password is invalid" }));
      return;
    }

    // If we get here, both email and password are valid
    setUser({ id: foundUser.id, email: foundUser.email });
    setAddress({
      street: "",
      houseNumber: "",
      plz: "",
      city: "",
    });
    navigate("/search");
  };

  // ------------------------ JSX: Login View Layout ------------------------
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* ------------------ Login Card ------------------ */}
      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

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
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setFormErrors(prev => ({ ...prev, email: "" }));
              onFieldChange?.("email");
            }}
            placeholder="example@email.com"
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
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
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

        {/* ------------------ Login Button ------------------ */}
        <div className="flex justify-center">
          <button
            onClick={() => handleLogin(emailInput, passwordInput)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>

        {/* ------------------ Sign Up Link ------------------ */}
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Don't have an account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline ml-1 text-sm"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
