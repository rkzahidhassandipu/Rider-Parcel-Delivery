import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider } from "react-router";
import { router } from "./Router/Router.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import AuthProvider from "./Context/AuthContext/AuthProvider.jsx";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
AOS.init();

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer position="top-right" autoClose={3000} />
    <div className="urbanist-uniquifier bg-gray-100">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      </QueryClientProvider>
    </div>
  </StrictMode>
);
