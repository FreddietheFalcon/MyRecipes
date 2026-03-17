import { Link } from "react-router";
import { PlusIcon, Trash2Icon } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">
            ThinkBoard
          </h1>
          <div className="flex items-center gap-4">
            {/* Trash link — subtle ghost style so it doesn't compete with New Note */}
            <Link to="/trash" className="btn btn-ghost btn-sm text-base-content/50">
              <Trash2Icon className="size-4" />
              <span className="hidden sm:inline">Trash</span>
            </Link>

            <Link to="/create" className="btn btn-primary">
              <PlusIcon className="size-5" />
              <span>New Note</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
