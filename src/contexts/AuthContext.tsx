import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  sessionId: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a saved session
    const savedSessionId = localStorage.getItem("sessionId");
    const savedUsername = localStorage.getItem("username");
    
    if (savedSessionId && savedUsername) {
      setSessionId(savedSessionId);
      setUsername(savedUsername);
      // Check auth with the saved sessionId
      checkAuthWithSessionId(savedSessionId);
    }
  }, []);

  const checkAuthWithSessionId = async (sessionIdToCheck: string) => {
    if (!sessionIdToCheck) return;
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      const response = await fetch(`${backendUrl}/api/auth/check`, {
        headers: {
          Authorization: `Bearer ${sessionIdToCheck}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setSessionId(null);
        setUsername(null);
        localStorage.removeItem("sessionId");
        localStorage.removeItem("username");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    }
  };

  const checkAuth = async () => {
    if (!sessionId) return;
    await checkAuthWithSessionId(sessionId);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      console.log('Attempting login to:', `${backendUrl}/api/auth/login`);
      console.log('Username:', username);
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include", // Include credentials for Safari
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, sessionId:', data.sessionId);
        setSessionId(data.sessionId);
        setUsername(data.username);
        setIsAuthenticated(true);
        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("username", data.username);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    if (sessionId) {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    setSessionId(null);
    setUsername(null);
    setIsAuthenticated(false);
    localStorage.removeItem("sessionId");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        sessionId,
        username,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

