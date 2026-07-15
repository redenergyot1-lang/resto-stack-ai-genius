import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import RestaurantListing from "./pages/RestaurantListing.jsx";
import RestaurantDetail from "./pages/RestaurantDetail.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { InfoPage, ContactPage } from "./pages/InfoPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { EmptyState } from "./components/Misc.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AiAssistant from "./components/AiAssistant.jsx";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EmptyState title="Page not found" subtitle="The page you're looking for doesn't exist." />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/restaurants" element={<RestaurantListing />} />
      <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/info/:slug" element={<InfoPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <AiAssistant />
    </>
  );
}
