import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router";
import { fetchOrders, getStoredSession, type Order } from "../services/backend";

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      const session = getStoredSession();

      if (!session) {
        if (active) {
          setLoading(false);
          setError("Sign in to see your orders.");
        }
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetchOrders(session.user.id);
        if (active) {
          setOrders(result);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load orders");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">Loading orders...</div>;
  }

  if (error && orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl mb-8">My Orders</h1>
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          <p className="mb-4">{error}</p>
          <button onClick={() => navigate("/signin")} className="text-blue-600 hover:underline">
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{order.order_number}</span>
                </div>
                <p className="text-sm text-gray-600">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl">${order.total_amount.toFixed(2)}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm mt-1 ${
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : order.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Items:</p>
              <ul className="list-disc list-inside">
                {order.items.map((item) => (
                  <li key={item.id} className="text-gray-700">
                    Product #{item.product_id} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">No orders yet. Place one through checkout to see it here.</p>
        </div>
      )}
    </div>
  );
}
