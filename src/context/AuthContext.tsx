import { createContext, useContext, ReactNode } from "react";
import { User } from "../../shared/schema";
import { useToast } from "../hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static version of AuthProvider that doesn't use real authentication
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Always return not authenticated for the static version
  const user = null;
  const isAuthenticated = false;

  // These functions will just show notification messages but won't actually login/register
  const login = async (username: string, password: string): Promise<boolean> => {
    toast({
      title: "Static Website Mode",
      description: "Authentication is disabled in this static version of the site.",
    });
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    toast({
      title: "Static Website Mode",
      description: "Registration is disabled in this static version of the site.",
    });
    return false;
  };

  const logout = () => {
    toast({
      title: "Static Website Mode",
      description: "You're already in guest mode in this static version of the site.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
