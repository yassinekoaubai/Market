
  # Ecommerce app with signup

  This is a code bundle for Ecommerce app with signup. The original project is available at https://www.figma.com/design/WOAyF7qyyVWptnqNDxczBV/Ecommerce-app-with-signup.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Docker

  Build and run the containerized frontend with:

  ```bash
  docker compose up --build
  ```

  The container serves the app on port 4173 and bakes the backend API URLs into the Vite build. Override `VITE_AUTH_API_URL`, `VITE_CATALOG_API_URL`, and `VITE_ORDERS_API_URL` if your backend is not running on the local default ports.
  