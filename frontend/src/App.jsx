import { Route, Routes, Navigate } from "react-router";
import { useState, useEffect } from "react";
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

const App = () => {
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    api.get("/auth/me")
      .then(() => setAuthStatus("ok"))
      .catch(() => setAuthStatus("denied"));
  }, []);

  // Show nothing while checking auth on first load
  if (authStatus === "checking") return null;

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#0000_100%)]" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {authStatus === "ok" ? (
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
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </div>
  );
};

export default App;
