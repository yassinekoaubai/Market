import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart, Star, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { fetchProduct, type Product } from "../services/backend";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (!id) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetchProduct(Number(id));
        if (active) {
          setProduct(result);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load product");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl mb-4">{error || "Product not found"}</h2>
        <button onClick={() => navigate("/")} className="text-blue-600 hover:underline">
          Return to catalog
        </button>
      </div>
    );
  }

  const ratings = product.ratings ?? [];
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length).toFixed(1)
    : 0;

  const handleAddToCart = () => {
    addToCart(
      product.id,
      product.name,
      product.price,
      product.image_url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {product.category?.name ?? "Catalog"}
            </span>
          </div>

          <h1 className="text-3xl mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(Number(averageRating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {averageRating} ({ratings.length} reviews)
            </span>
          </div>

          <p className="text-4xl mb-6">${product.price.toFixed(2)}</p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-4 h-4" />
              <span>SKU: {product.sku}</span>
            </div>
            <div className={`flex items-center gap-2 ${product.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
              <span className="font-medium">
                {product.quantity > 0 ? `In Stock (${product.quantity} available)` : "Out of Stock"}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl mb-6">Customer Reviews</h2>

            {ratings.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating.score
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{rating.created_at ?? "Recently"}</span>
                </div>
                {rating.review && (
                  <p className="text-gray-700">{rating.review}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
