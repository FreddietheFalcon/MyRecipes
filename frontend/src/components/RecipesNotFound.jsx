import { Link } from 'react-router';
import { UtensilsCrossedIcon } from "lucide-react";

const RecipesNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
      <div className="bg-primary/10 rounded-full p-8">
        <UtensilsCrossedIcon className="size-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No recipes yet</h3>
      <p className="text-base-content/70">
        Start building your recipe collection! Add your first keeper or a recipe you want to try.
      </p>
      <Link to="/create" className="btn btn-primary">
        Add Your First Recipe
      </Link>
    </div>
  );
};

export default RecipesNotFound;
