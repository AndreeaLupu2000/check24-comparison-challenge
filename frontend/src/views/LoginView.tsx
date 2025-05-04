import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserDto } from "../types/UserDto";
import Icon from "../assets/icon.png";
import { getAllUsers } from "../api/userService";
//import { createUser } from "../api/userService";

const LoginView = () => {
  const [users, setUsers] = useState<UserDto[]>([]);

  const { email, setEmail, password, setPassword } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleLogin = (email: string, password: string) => {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
      navigate("/search");
    } else {
      const userExists = users.some((u) => u.email === email);
      if (userExists) {
        alert("Invalid password");
      } else {
        alert("Invalid email");
      }
    }
  };

  /*
    const handleSignUp = async(email: string, password: string) => {
        const checkUser = users.find(u => u.email === email);
        if (checkUser) {
            alert("User already exists");
            return;
        }
        else {
            await createUser({ email, password }).catch((err) => console.error('Error creating user:', err));
            setEmail(email);
            setPassword(password);
            navigate("/search");
        }
    }
*/

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header - logo and title */}
      <div className="w-full bg-gray-100 py-6 mb-8 mt-10">
        <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto px-4">
          <img src={Icon} alt="GenDevNet Logo" className="w-32 h-auto" />
          <h1 className="text-5xl font-bold leading-[3.5rem] text-gray-800">GenDevNet</h1>
        </div>
      </div>

      {/* White Login Card */}
      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {/* 1) Email Input */}
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
            placeholder="example@email.com"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 2) Password Input */}
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
            placeholder="********"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 3) Login Button */}
        <div className="flex justify-center">
          <button
            onClick={() => handleLogin(email, password)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>

        {/* 4) Register Button 
                <div className="flex justify-center"
                onClick={() => handleSignUp(email, password)}
                style={{
                    borderTop: '2px solid #000',
                    paddingTop: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
                >
                Sign Up
                </div> */}
      </div>
    </div>
  );
};

export default LoginView;
