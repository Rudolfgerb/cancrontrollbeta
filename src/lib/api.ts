const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  player?: any;
  error?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'An error occurred');
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Authentication
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  // Player
  async getProfile() {
    return this.request('/player/profile');
  }

  async getInventory() {
    return this.request('/player/inventory');
  }

  async buyTool(toolId: string) {
    return this.request('/player/buy-tool', {
      method: 'POST',
      body: JSON.stringify({ toolId }),
    });
  }

  async buyColor(colorId: string, quantity: number = 100) {
    return this.request('/player/buy-color', {
      method: 'POST',
      body: JSON.stringify({ colorId, quantity }),
    });
  }

  async getStats() {
    return this.request('/player/stats');
  }

  // Spots
  async getNearbySpots(lat: number, lng: number, radius: number = 5) {
    return this.request(`/spots/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  async generateSpots(lat: number, lng: number, count: number = 10) {
    return this.request('/spots/generate', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, count }),
    });
  }

  async getSpot(spotId: string) {
    return this.request(`/spots/${spotId}`);
  }

  async getSpotStreetView(spotId: string) {
    return this.request(`/spots/${spotId}/streetview`);
  }

  // Graffiti
  async startGraffiti(spotId: string, backgroundImage: string, canvasData: any) {
    return this.request('/graffiti/start', {
      method: 'POST',
      body: JSON.stringify({ spotId, backgroundImage, canvasData }),
    });
  }

  async addStroke(graffitiId: string, stroke: any) {
    return this.request(`/graffiti/${graffitiId}/stroke`, {
      method: 'PUT',
      body: JSON.stringify({ stroke }),
    });
  }

  async completeGraffiti(graffitiId: string, finalImage: string, wasSuccessful: boolean, escaped: boolean) {
    return this.request(`/graffiti/${graffitiId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ finalImage, wasSuccessful, escaped }),
    });
  }

  async getGallery(page: number = 1, limit: number = 20) {
    return this.request(`/graffiti/gallery?page=${page}&limit=${limit}`);
  }

  // Game
  async generateRiskEvent() {
    return this.request('/game/risk-event', {
      method: 'POST',
    });
  }

  async calculateRisk(spotId: string, activeModifiers: any[] = []) {
    return this.request('/game/calculate-risk', {
      method: 'POST',
      body: JSON.stringify({ spotId, activeModifiers }),
    });
  }

  async processArrest(spotId: string) {
    return this.request('/game/arrest', {
      method: 'POST',
      body: JSON.stringify({ spotId }),
    });
  }

  async processEscape() {
    return this.request('/game/escape', {
      method: 'POST',
    });
  }

  async getGameConstants() {
    return this.request('/game/constants');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
