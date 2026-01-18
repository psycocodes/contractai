const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('jwtToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Content-Type for JSON requests
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth endpoints
  async register(email: string, password: string, organizationName?: string) {
    return this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, organizationName }),
    });
  }

  async login(email: string, password: string) {
    return this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/api/auth/me');
  }

  // Organization endpoints
  async getOrganizations() {
    return this.request<any>('/api/organizations');
  }

  async createOrganization(name: string) {
    return this.request<any>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async switchOrganization(organizationId: string) {
    return this.request<any>('/api/organizations/switch', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });
  }

  async getOrganization(organizationId: string) {
    return this.request<any>(`/api/organizations/${organizationId}`);
  }

  // Invite endpoints
  async inviteUser(email: string, role: string) {
    return this.request<any>('/api/invites', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async getPendingInvites() {
    return this.request<any>('/api/invites/pending');
  }

  async acceptInvite(inviteId: string) {
    return this.request<any>(`/api/invites/${inviteId}/accept`, {
      method: 'POST',
    });
  }

  async getOrganizationInvites(organizationId: string) {
    return this.request<any>(`/api/organizations/${organizationId}/invites`);
  }

  // Contract endpoints
  async getContracts() {
    return this.request<any>('/api/contracts');
  }

  async uploadContract(file: File, contractId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (contractId) {
      formData.append('contractId', contractId);
    }

    return this.request<any>('/api/contracts/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getContract(contractId: string) {
    return this.request<any>(`/api/contracts/${contractId}`);
  }

  async getContractVersions(contractId: string) {
    return this.request<any>(`/api/contracts/${contractId}/versions`);
  }

  async getVersion(versionId: string) {
    return this.request<any>(`/api/versions/${versionId}`);
  }

  async getCanonicalText(versionId: string) {
    return this.request<any>(`/api/versions/${versionId}/canonical`);
  }

  async analyzeContract(versionId: string) {
    return this.request<any>(`/api/versions/${versionId}/analyze`, {
      method: 'POST',
    });
  }

  async getAnalysis(versionId: string) {
    return this.request<any>(`/api/versions/${versionId}/analysis`);
  }

  async generateAnnotations(versionId: string) {
    return this.request<any>(`/api/versions/${versionId}/annotate`, {
      method: 'POST',
    });
  }

  async getAnnotations(versionId: string) {
    return this.request<any>(`/api/versions/${versionId}/annotations`);
  }

  async verifyContract(file: File, contractId: string, versionId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contractId', contractId);
    if (versionId) {
      formData.append('versionId', versionId);
    }

    return this.request<any>('/api/contracts/verify', {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
