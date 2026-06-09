import type { User } from "@/types";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  user: User | null;
  children: React.ReactNode;
};

/**
 * A wrapper component that restricts access to authenticated routes.
 * If the user is not logged in, they are immediately redirected to the root path ("/").
 * The 'replace' prop ensures the redirect overrides the current history state,
 * preventing infinite redirect loops if the user clicks the browser's back button.
 *
 * @param user - The currently authenticated User object, or null if logged out.
 * @param children - The protected React elements to render if authenticated.
 * @returns The children elements if user logged in, or redirect to root
 */
const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;