import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"

function App() {

  return (
    <div className="font-manrope">
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
      </Routes>
    </div>
  )
}

export default App
