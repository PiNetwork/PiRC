import React, { createContext, useContext, useEffect, useState, useRef } from "react";

interface User {
  uid: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Using the injected APP_URL environment variable from AI Studio or a relative path
// For relative paths to Express proxy endpoints, we can just use /api/auth
const API_BASE = "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  const authenticateWithPi = async (isAutoAttempt: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window.Pi === "undefined") {
        throw new Error("Pi SDK is not loaded.");
      }

      const withTimeout = <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms))
        ]);
      };

      // 1. Initialize Pi SDK as a Promise
      if (!isInitialized.current) {
        try {
          await withTimeout(
            window.Pi.init({ version: "2.0", sandbox: true }),
            3000,
            "Pi SDK initialization timed out."
          );
          isInitialized.current = true;
        } catch (e: any) {
          console.warn(e.message);
          if (process.env.NODE_ENV !== "production") {
            console.log("Mocking Pi Network Auth for development environment.");
            setUser({ uid: "demo_user_12345", username: "pi_demo_user" });
            setLoading(false);
            return;
          }
          throw new Error("Cannot connect to Pi Network. Please ensure you are running this app inside the Pi Browser.");
        }
      }

      // 2. Define incomplete payment handler (required by Pi SDK but not used in auth scope)
      const onIncompletePaymentFound = (payment: any) => {
        console.log("Incomplete payment found:", payment);
      };

      // 3. Authenticate with "username" scope
      const authTimeout = isAutoAttempt ? 8000 : 30000;
      const authErrorMsg = isAutoAttempt
        ? "Auto-authentication timed out. Popup may have been blocked. Please click 'Sign in with Pi' manually."
        : "Authentication timed out. If using the preview sandbox, try opening the app in a new tab.";

      const auth: any = await withTimeout(
        window.Pi.authenticate(["username"], onIncompletePaymentFound),
        authTimeout,
        authErrorMsg
      );

      // 4. Send the returned access token to the backend for validation
      const authResponse = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });

      if (!authResponse.ok) {
        throw new Error("Failed to validate authentication with server.");
      }

      const authData = await authResponse.json();
      
      if (authData.authenticated) {
        setUser({
          uid: authData.user.uid,
          username: auth.user.username // The username from frontend authenticate scope
        });
      } else {
        throw new Error("Server rejected authentication.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to authenticate with Pi Network");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt automatic authentication on load as specified, flag as auto-attempt
    authenticateWithPi(true);
  }, []);

  const signIn = async () => {
    await authenticateWithPi(false);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
