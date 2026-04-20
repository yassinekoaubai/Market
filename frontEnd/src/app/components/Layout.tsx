import { Link, Outlet } from "react-router";
import { ShoppingBag, ShoppingCart, LogIn, LogOut, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { clearSession, getStoredSession } from "../services/backend";

export function Layout() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const { cartCount } = useCart();

  useEffect(() => {
    const syncSession = () => {
      const session = getStoredSession();
      setUserEmail(session?.user.email ?? "");
      setUserName(session?.user.name ?? "");
      setUserRole(session?.user.role ?? "");
    };

    syncSession();
    window.addEventListener("market-auth-changed", syncSession);

    return () => {
      window.removeEventListener("market-auth-changed", syncSession);
    };
  }, []);

  const handleSignOut = () => {
    clearSession();
    setUserEmail("");
    setUserName("");
    setUserRole("");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            <span className="font-semibold">ShopNow</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Catalog
            </Link>
            <Link
              to="/cart"
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Orders
            </Link>
            {userRole === "ADMIN" && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin
              </Link>
            )}

            {userEmail ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{userName || userEmail}</span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/signin"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
