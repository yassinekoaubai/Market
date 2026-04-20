import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Search, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { fetchProducts, type Product } from "../services/backend";

export function Catalog() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const results = await fetchProducts({ search });
        if (active) {
          setProducts(results);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load catalog");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [search]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch((current) => current.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">Catalog</p>
          <h1 className="text-3xl sm:text-4xl font-semibold">Product Catalog</h1>
          <p className="text-gray-600 mt-2">Browse live products from the catalog service.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-slate-950 text-white px-5 py-3 inline-flex items-center gap-2"
          >
            Search
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[360px] rounded-3xl bg-white/70 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          No products match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageUrl = product.image_url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop";

            return (
              <div key={product.id} className="group bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-xl transition-all">
                <div onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                  <img src={imageUrl} alt={product.name} className="w-full h-56 object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">{product.category?.name ?? "Catalog"}</p>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
                      <p className="text-sm text-gray-500">{product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}</p>
                    </div>
                    <button
                      onClick={() => addToCart(product.id, product.name, product.price, imageUrl)}
                      disabled={product.quantity === 0}
                      className="bg-slate-950 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
