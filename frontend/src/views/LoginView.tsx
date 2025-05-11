import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { UserDto } from "../types/UserDto"
import Icon from "../assets/icon.png"
import { getAllUsers } from "../api/userService"

const LoginView = () => {
  const [users, setUsers] = useState<UserDto[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => console.error("Error fetching users:", err))
  }, [])

  const handleLogin = (email: string, password: string) => {
    // Clear previous errors
    setEmailError(false)
    setPasswordError(false)
    setErrorMessage("")

    if (!password) {
      setPasswordError(true)
      setErrorMessage("Please enter the password")
      return
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    )

    if (user) {
      setUser({ id: user.id, email: user.email })
      navigate("/search")
    } else {
      setEmailError(true)
      setPasswordError(true)
      setErrorMessage("Email or password invalid")
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="w-full bg-gray-100 py-6 mb-8 mt-10">
        <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto px-4">
          <img src={Icon} alt="GenDevNet Logo" className="w-32 h-auto" />
          <h1 className="text-5xl font-bold leading-[3.5rem] text-gray-800">GenDevNet</h1>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {/* Email Input */}
        <div className="mb-6 relative">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="example@email.com"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
              emailError ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-indigo-500"
            }`}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6 relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="********"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
              passwordError ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-indigo-500"
            }`}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 text-center text-red-600 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Button */}
        <div className="flex justify-center">
          <button
            onClick={() => handleLogin(emailInput, passwordInput)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginView
