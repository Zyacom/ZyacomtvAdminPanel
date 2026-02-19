import { useNavigate } from "react-router-dom";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/Button";

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
          <div className="text-6xl font-black text-white mb-2">403</div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Dashboard
          </Button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-500">
          Need access?{" "}
          <button
            onClick={() => navigate("/support")}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
};
