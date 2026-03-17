import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon, LoaderIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { formatDate } from "../lib/utils";

const TrashPage = () => {
  const [trashedRecipes, setTrashedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const res = await api.get("/recipes/trash");
        setTrashedRecipes(res.data);
      } catch (error) {
        console.log("Error fetching trash:", error);
        toast.error("Failed to load trash");
      } finally {
        setLoading(false);
      }
    };

    fetchTrash();
  }, []);

  const handleRestore = async (id, title) => {
    setRestoringId(id);
    try {
      await api.put(`/recipes/${id}/restore`);
      setTrashedRecipes((prev) => prev.filter((r) => r._id !== id));
      toast.success(`"${title}" has been restored!`);
    } catch (error) {
      console.log("Error restoring recipe:", error);
      toast.error("Failed to restore recipe");
    } finally {
      setRestoringId(null);
    }
  };

  // Badge color based on days remaining urgency
  const urgencyClass = (days) => {
    if (days <= 3)  return "badge badge-error";
    if (days <= 7)  return "badge badge-warning";
    return "badge badge-ghost";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2 text-base-content/60">
              <Trash2Icon className="size-5" />
              <span className="font-semibold">Trash</span>
            </div>
          </div>

          {/* Info banner */}
          <div className="alert mb-6">
            <span className="text-sm">
              Deleted recipes are kept for <strong>30 days</strong> before being
              permanently removed. Restore a recipe any time before it expires.
            </span>
          </div>

          {/* Empty state */}
          {trashedRecipes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <div className="bg-base-content/10 rounded-full p-8">
                <Trash2Icon className="size-10 text-base-content/40" />
              </div>
              <h3 className="text-2xl font-bold">Trash is empty</h3>
              <p className="text-base-content/60">
                Deleted recipes will appear here for 30 days.
              </p>
            </div>
          )}

          {/* Trashed recipe cards */}
          {trashedRecipes.length > 0 && (
            <div className="flex flex-col gap-4">
              {trashedRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="card bg-base-100 border-t-4 border-error/40 opacity-80"
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="card-title text-base-content line-through decoration-error/50">
                          {recipe.title}
                        </h3>
                        <p className="text-base-content/50 line-clamp-2 mt-1 text-sm">
                          {recipe.content}
                        </p>
                      </div>

                      {/* Restore button */}
                      <button
                        className="btn btn-outline btn-success btn-sm shrink-0"
                        disabled={restoringId === recipe._id}
                        onClick={() => handleRestore(recipe._id, recipe.title)}
                      >
                        {restoringId === recipe._id ? (
                          <LoaderIcon className="animate-spin size-4" />
                        ) : (
                          <>
                            <RotateCcwIcon className="size-4" />
                            Restore
                          </>
                        )}
                      </button>
                    </div>

                    {/* Footer: deleted date + days remaining */}
                    <div className="card-actions justify-between items-center mt-3">
                      <span className="text-xs text-base-content/40">
                        Deleted {formatDate(new Date(recipe.deletedAt))}
                      </span>
                      <span className={urgencyClass(recipe.daysRemaining)}>
                        {recipe.daysRemaining === 0
                          ? "Deleting soon"
                          : `${recipe.daysRemaining}d left`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TrashPage;
