import { Route, Routes, Navigate, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import api from "./lib/axios";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import AddIngredientPage from "./pages/AddIngredientPage";
import EditIngredientPage from "./pages/EditIngredientPage";
import InventoryPage from "./pages/InventoryPage";
import TrashPage from "./pages/TrashPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FriendsPage from "./pages/FriendsPage";
import FriendRecipesPage from "./pages/FriendRecipesPage";
import FriendRecipeDetailPage from "./pages/FriendRecipeDetailPage";
import CopyRequestsPage from "./pages/CopyRequestsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

const AppRoutes = ({ isLoggedIn }) => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    {isLoggedIn ? (
      <>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/add" element={<AddIngredientPage />} />
        <Route path="/inventory/edit/:id" element={<EditIngredientPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/friends/:friendId/recipes" element={<FriendRecipesPage />} />
        <Route path="/friends/:friendId/recipes/:recipeId" element={<FriendRecipeDetailPage />} />
        <Route path="/copy-requests" element={<CopyRequestsPage />} />
      </>
    ) : (
      <Route path="*" element={<Navigate to="/login" replace />} />
    )}
  </Routes>
);

const App = () => {
  const [authStatus, setAuthStatus] = useState("checking");
  const location = useLocation();
  const checkedRef = useRef(false);
  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  useEffect(() => {
    // Only run the auth check once on initial load
    if (checkedRef.current) return;
    checkedRef.current = true;

    if (isPublic) {
      setAuthStatus("public");
      return;
    }

    api.get("/auth/me")
      .then(() => setAuthStatus("ok"))
      .catch(() => setAuthStatus("denied"));
  }, []); // empty deps — runs only once

  if (isPublic || authStatus === "ok" || authStatus === "denied") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#0000_100%)]" />
        <AppRoutes isLoggedIn={authStatus === "ok"} />
      </div>
    );
  }

  return <div style={{ minHeight: "100vh", background: "#f5f5f5" }} />;
};

export default App;
