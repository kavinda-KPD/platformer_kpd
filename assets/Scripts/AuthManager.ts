import { _decorator, Component, sys } from "cc";

export class AuthManager {
  private static instance: AuthManager;
  private baseURL: string = "http://localhost:3000";
  private authToken: string | null = null;

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Store token locally
  private saveToken(token: string): void {
    this.authToken = token;
    sys.localStorage.setItem("authToken", token);
  }

  // Retrieve stored token
  private getToken(): string | null {
    if (!this.authToken) {
      this.authToken = sys.localStorage.getItem("authToken");
    }
    return this.authToken;
  }

  // Clear token
  public clearToken(): void {
    this.authToken = null;
    sys.localStorage.removeItem("authToken");
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      const data = await response.json();

      // If registration includes auto-login
      if (data.token) {
        this.saveToken(data.token);
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  public async login(username: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();

      // Save the authentication token
      if (data.token) {
        this.saveToken(data.token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseURL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearToken();
    }
  }

  public async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = this.getToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const defaultOptions: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, mergedOptions);

      if (response.status === 401) {
        // Token expired or invalid
        this.clearToken();
        throw new Error("Authentication expired");
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Authenticated request error:", error);
      throw error;
    }
  }
}
