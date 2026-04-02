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

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    api.get("/auth/me")
      .then(() => setStatus("ok"))
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "checking") return null;
  if (status === "denied") return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#0000_100%)]" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
        <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/inventory/add" element={<ProtectedRoute><AddIngredientPage /></ProtectedRoute>} />
        <Route path="/inventory/edit/:id" element={<ProtectedRoute><EditIngredientPage /></ProtectedRoute>} />
        <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/friends/:friendId/recipes" element={<ProtectedRoute><FriendRecipesPage /></ProtectedRoute>} />
        <Route path="/friends/:friendId/recipes/:recipeId" element={<ProtectedRoute><FriendRecipeDetailPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

export default App;
