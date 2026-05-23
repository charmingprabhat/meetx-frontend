import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import MeetingRoom from "./pages/MeetingRoom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Home />
              : <Navigate to="/login" />
          }
        />

        {/* DYNAMIC ROOM */}
        <Route
          path="/room/:roomId"
          element={
            isLoggedIn
              ? <MeetingRoom />
              : <Navigate to="/login" />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;