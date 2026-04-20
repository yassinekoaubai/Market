import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Catalog } from "./components/Catalog";
import { Signup } from "./components/Signup";
import { Signin } from "./components/Signin";
import { Orders } from "./components/Orders";
import { ProductDetail } from "./components/ProductDetail";
import { Cart } from "./components/Cart";
import { Admin } from "./components/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Catalog },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "signup", Component: Signup },
      { path: "signin", Component: Signin },
      { path: "orders", Component: Orders },
      { path: "admin", Component: Admin },
    ],
  },
]);
