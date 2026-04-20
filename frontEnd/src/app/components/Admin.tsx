import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createCategory,
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  getStoredSession,
  type Category,
  type Product,
} from "../services/backend";

export function Admin() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "0",
    sku: "",
    categoryId: "",
    image_url: "",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let active = true;

    async function loadAdminData() {
      setLoadingCategories(true);
      setLoadingProducts(true);
      setError("");

      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetchCategories(),
          fetchProducts({ limit: 100 }),
        ]);

        if (!active) {
          return;
        }
        setCategories(categoryResponse);
        setProducts(productResponse);

        if (categoryResponse.length > 0) {
          setFormData((current) => ({
            ...current,
            categoryId: current.categoryId || String(categoryResponse[0].id),
          }));
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load admin data");
        }
      } finally {
        if (active) {
          setLoadingCategories(false);
          setLoadingProducts(false);
        }
      }
    }

    loadAdminData();

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length >= 2
      && formData.description.trim().length >= 10
      && Number(formData.price) > 0
      && Number(formData.quantity) >= 0
      && formData.sku.trim().length >= 2
      && Number(formData.categoryId) > 0
    );
  }, [formData]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const searchableText = [product.name, product.description, product.sku, product.category?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [productSearch, products]);

  const adminStats = useMemo(() => {
    const lowStock = products.filter((product) => product.quantity <= 5).length;
    const inactive = products.filter((product) => product.is_active === false).length;

    return {
      products: products.length,
      categories: categories.length,
      lowStock,
      inactive,
    };
  }, [categories.length, products]);

  const refreshData = async () => {
    if (!isAdmin) {
      return;
    }

    setRefreshing(true);
    setError("");

    try {
      const [categoryResponse, productResponse] = await Promise.all([
        fetchCategories(),
        fetchProducts({ limit: 100 }),
      ]);

      setCategories(categoryResponse);
      setProducts(productResponse);

      if (!formData.categoryId && categoryResponse.length > 0) {
        setFormData((current) => ({
          ...current,
          categoryId: String(categoryResponse[0].id),
        }));
      }
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Failed to refresh admin data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!canSubmit) {
      setError("Please fill all required fields with valid values.");
      return;
    }

    setSubmitting(true);

    try {
      const created = await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        sku: formData.sku.trim(),
        categoryId: Number(formData.categoryId),
        image_url: formData.image_url.trim() || undefined,
      });

      setSuccess(`Product \"${created.name}\" created successfully.`);
      setFormData((current) => ({
        ...current,
        name: "",
        description: "",
        price: "",
        quantity: "0",
        sku: "",
        image_url: "",
      }));
      await refreshData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (categoryFormData.name.trim().length < 2 || categoryFormData.description.trim().length < 5) {
      setError("Please provide a category name and description.");
      return;
    }

    setCategorySubmitting(true);

    try {
      const created = await createCategory({
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim(),
        image_url: categoryFormData.image_url.trim() || undefined,
      });

      setSuccess(`Category \"${created.name}\" created successfully.`);
      setCategoryFormData({
        name: "",
        description: "",
        image_url: "",
      });
      await refreshData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create category");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);
    setError("");
    setSuccess("");

    try {
      await deleteProduct(product.id);
      setSuccess(`Product \"${product.name}\" deleted.`);
      await refreshData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 text-white px-3 py-1 text-xs uppercase tracking-[0.2em] mb-4">
            <Shield className="w-3.5 h-3.5" />
            Admin Only
          </div>
          <h2 className="text-2xl mb-4">Admin Access</h2>
          <p className="text-gray-600 mb-6">You need to sign in as an admin to manage products and categories.</p>
          <button
            onClick={() => navigate("/signin")}
            className="bg-slate-950 text-white px-4 py-2 rounded-full hover:bg-slate-800 inline-flex items-center gap-2"
          >
            Go to Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl mb-4">Admin Only</h2>
          <p className="text-gray-600">Your account role is <strong>{session.user.role}</strong>. Only ADMIN users can manage the catalog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(5,150,105,0.08),_transparent_30%),linear-gradient(to_bottom,_#f8fafc,_#f8fafc)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        <section className="rounded-[2rem] bg-slate-950 text-white p-8 sm:p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.2),_transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5" />
                Admin Control Room
              </div>
              <h2 className="text-3xl sm:text-5xl font-semibold leading-tight">Manage the catalog from one place.</h2>
              <p className="text-white/75 text-base sm:text-lg max-w-xl">
                Create products, add categories, and clean up inventory without leaving the frontend.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[240px]">
              <button
                onClick={refreshData}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-950 px-4 py-3 font-medium hover:bg-slate-100 transition-colors"
              >
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh Data
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Products</p>
                <p className="mt-2 text-2xl font-semibold">{adminStats.products}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Categories</p>
                <p className="mt-2 text-2xl font-semibold">{adminStats.categories}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Products", value: adminStats.products, hint: "Loaded from live catalog" },
            { label: "Categories", value: adminStats.categories, hint: "Used by the product form" },
            { label: "Low Stock", value: adminStats.lowStock, hint: "Five items or fewer" },
            { label: "Inactive", value: adminStats.inactive, hint: "Hidden from shoppers" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[1.5rem] bg-white border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm text-gray-500">{stat.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
          <div className="xl:col-span-3 rounded-[1.75rem] bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs uppercase tracking-[0.2em] mb-3">
                  <PackagePlus className="w-3.5 h-3.5" />
                  Inventory
                </div>
                <h3 className="text-2xl font-semibold">Create a product</h3>
                <p className="text-gray-600 mt-1">Push a new item straight into the live catalog.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                Catalog API connected
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950 min-h-28"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Price</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(event) => setFormData({ ...formData, sku: event.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  required
                  disabled={loadingCategories || categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value="">No categories found</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-gray-700">Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  placeholder="https://example.com/product.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-950 text-white py-3.5 hover:bg-slate-800 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  disabled={submitting || loadingCategories || categories.length === 0 || !canSubmit}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? "Creating product..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>

          <div className="xl:col-span-2 space-y-8">
            <section className="rounded-[1.75rem] bg-white border border-gray-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs uppercase tracking-[0.2em] mb-3">
                    <Box className="w-3.5 h-3.5" />
                    Categories
                  </div>
                  <h3 className="text-2xl font-semibold">Create a category</h3>
                  <p className="text-gray-600 mt-1">Keep the catalog organized for shoppers and admins.</p>
                </div>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Category Name</label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(event) => setCategoryFormData({ ...categoryFormData, name: event.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700">Description</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(event) => setCategoryFormData({ ...categoryFormData, description: event.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950 min-h-28"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700">Image URL (optional)</label>
                  <input
                    type="url"
                    value={categoryFormData.image_url}
                    onChange={(event) => setCategoryFormData({ ...categoryFormData, image_url: event.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                    placeholder="https://example.com/category.jpg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-600 text-white py-3.5 hover:bg-emerald-700 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  disabled={categorySubmitting}
                >
                  {categorySubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {categorySubmitting ? "Creating category..." : "Create Category"}
                </button>
              </form>
            </section>

            <section className="rounded-[1.75rem] bg-white border border-gray-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Quick navigation</h3>
                  <p className="text-gray-600 text-sm mt-1">Jump back to the storefront or refresh the admin view.</p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  View Catalog
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <button
                  onClick={refreshData}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 hover:bg-gray-50"
                >
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Refresh
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 hover:bg-gray-50"
                >
                  <Search className="w-4 h-4" />
                  Browse
                </button>
              </div>
            </section>
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] mb-3">
                <Search className="w-3.5 h-3.5" />
                Inventory Browser
              </div>
              <h3 className="text-2xl font-semibold">Manage existing products</h3>
              <p className="text-gray-600 mt-1">Search, inspect, and delete catalog items from the admin console.</p>
            </div>

            <div className="w-full sm:w-80">
              <label className="block text-sm mb-1 text-gray-700">Search products</label>
              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                placeholder="Search by name, SKU, or category"
              />
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 animate-pulse h-40" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
              No products match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const imageUrl = product.image_url ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop";
                const isLowStock = product.quantity <= 5;

                return (
                  <article key={product.id} className="rounded-[1.5rem] border border-gray-100 overflow-hidden bg-white shadow-sm flex flex-col">
                    <img src={imageUrl} alt={product.name} className="h-44 w-full object-cover" />
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">
                              {product.category?.name ?? "Uncategorized"}
                            </p>
                            <h4 className="text-lg font-semibold text-slate-950">{product.name}</h4>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${product.is_active === false ? "bg-gray-100 text-gray-600" : "bg-emerald-50 text-emerald-700"}`}>
                            {product.is_active === false ? "Inactive" : "Active"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{product.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-gray-50 p-3">
                          <p className="text-gray-500 text-xs uppercase tracking-[0.15em]">Price</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">${product.price.toFixed(2)}</p>
                        </div>
                        <div className={`rounded-2xl p-3 ${isLowStock ? "bg-amber-50" : "bg-gray-50"}`}>
                          <p className="text-gray-500 text-xs uppercase tracking-[0.15em]">Stock</p>
                          <p className={`mt-1 text-lg font-semibold ${isLowStock ? "text-amber-700" : "text-slate-950"}`}>
                            {product.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-gray-100 px-3 py-1">SKU: {product.sku}</span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {product.quantity > 0 ? "Available" : "Out of stock"}
                        </span>
                      </div>

                      <div className="mt-auto flex gap-3">
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm hover:bg-gray-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          disabled={deletingProductId === product.id}
                          className="flex-1 rounded-full bg-red-600 text-white px-4 py-2.5 text-sm hover:bg-red-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                          {deletingProductId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
