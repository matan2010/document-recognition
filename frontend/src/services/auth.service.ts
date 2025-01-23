import axios, { AxiosInstance } from 'axios';

interface User {
  id: string;
  email: string;
  role: string;
  companyId: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface BootstrapDto {
  companyName: string;
  adminEmail: string;
  adminPassword: string;
}

interface LoginDto {
  email: string;
  password: string;
}

class AuthService {
  private api: AxiosInstance;
  private static instance: AuthService;

  private constructor() {
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_API_URL}/auth`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              this.setTokens(response.access_token, response.refresh_token);
              originalRequest.headers['Authorization'] = `Bearer ${response.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete this.api.defaults.headers.common['Authorization'];
  }

  public async bootstrap(data: BootstrapDto): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/bootstrap', data);
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error('Bootstrap failed:', error);
      throw error;
    }
  }

  public async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/login', credentials);
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  public async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/refresh', { refresh_token: refreshToken });
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.api.post('/logout');
      this.clearTokens();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  public async verifyToken(): Promise<User> {
    try {
      const response = await this.api.get<User>('/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public getUser(): User | null {
    const token = this.getAccessToken();
    if (token) {
      try {
        // Decode JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
}

export const authService = AuthService.getInstance();
