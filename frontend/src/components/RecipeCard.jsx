import { PenSquareIcon, Trash2Icon } from 'lucide-react';
import { Link } from 'react-router';
import { formatDate } from '../lib/utils';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const RecipeCard = ({ recipe, setRecipes }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault(); // prevent navigation

    if (!window.confirm("Are you sure you want to delete this recipe?"))
      return;

    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      toast.success("Recipe deleted successfully");
    } catch (error) {
      console.log("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
    }
  };

  return (
    <Link
      to={`/recipe/${recipe._id}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-solid border-[#00FF9D]"
    >
      <div className="card-body">
        {/* Title + status badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base-content">{recipe.name}</h3>
          <span
            className={`badge text-xs font-bold shrink-0 ${
              recipe.status === "keeper"
                ? "badge-success"
                : "badge-warning"
            }`}
          >
            {recipe.status === "keeper" ? "⭐ Keeper" : "🕐 Want to Try"}
          </span>
        </div>

        {/* Servings + ingredient count */}
        <p className="text-base-content/70 text-sm">
          {recipe.servings ? `👥 ${recipe.servings} servings` : ""}
          {recipe.servings && recipe.ingredients?.length ? " · " : ""}
          {recipe.ingredients?.length
            ? `🥘 ${recipe.ingredients.length} ingredients`
            : ""}
        </p>

        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(recipe.createdAt))}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" />
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, recipe._id)}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
