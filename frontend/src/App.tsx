import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginView from "./views/LoginView"
import SearchView from "./views/SearchView"
import SharedView from "./views/SharedView"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/search" element={<SearchView />} />
        <Route path="/share/:id" element={<SharedView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
