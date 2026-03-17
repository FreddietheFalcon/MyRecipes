//import React from 'react'
import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import AddIngredientPage from "./pages/AddIngredientPage";
import EditIngredientPage from "./pages/EditIngredientPage";
import InventoryPage from "./pages/InventoryPage";
import TrashPage from "./pages/TrashPage";

const App = () => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#0000_100%)]" />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/add" element={<AddIngredientPage />} />
        <Route path="/inventory/edit/:id" element={<EditIngredientPage />} />
        <Route path="/trash" element={<TrashPage />} />
      </Routes>
    </div>
  );
};

export default App;
