import Login from "@/components/auth/Login.jsx";
import Signup from "@/components/auth/Signup.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import PrivateRoute from "@/components/PrivateRoute.jsx";
import Home from "@/components/Home.jsx";
import BookListing from "@/components/BookListing.jsx";
import BookExchange from "@/components/BookExchange.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        reverseOrder={true}
        toastOptions={{ duration: 2000 }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute element={<Home />} />} />
          <Route
            path="/my-books"
            element={<PrivateRoute element={<BookListing />} />}
          />
          <Route
            path="/exchange"
            element={<PrivateRoute element={<BookExchange />} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
