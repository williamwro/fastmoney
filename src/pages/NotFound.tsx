
import { useLocation, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // If user tries to navigate directly to this component, redirect appropriately
  if (location.pathname === "/404") {
    return isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        {/* Use Link with conditional destination based on auth status */}
        <Link 
          to={isAuthenticated ? "/" : "/login"} 
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
