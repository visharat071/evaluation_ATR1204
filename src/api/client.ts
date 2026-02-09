import { API_CONFIG } from './config';

interface RequestOptions extends RequestInit {
    data?: any;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;
    public onUnauthorized: (() => void) | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
            ...options.headers,
        };

        const config: RequestInit = {
            ...options,
            headers,
        };

        if (options.data) {
            config.body = JSON.stringify(options.data);
        }

        // Logging Request
        console.log(`[API REQUEST] ${options.method || 'GET'} ${url}`, config.body ? config.body : '');

        try {
            const response = await fetch(url, config);

            // Logging Response
            console.log(`[API RESPONSE] ${response.status} ${url}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`[API ERROR] ${response.status} ${url}`, errorData);

                if (response.status === 401 && this.onUnauthorized) {
                    console.log(`[API 401] Unauthorized detected on ${url}, triggering logout`);
                    this.onUnauthorized();
                }

                throw { status: response.status, data: errorData };
            }

            const data = await response.json();
            console.log(`[API DATA] ${url}`, data);
            return data;
        } catch (error) {
            console.error(`[API NETWORK ERROR] ${url}`, error);
            throw error;
        }
    }

    get<T>(endpoint: string, headers?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'GET', headers });
    }

    post<T>(endpoint: string, data: any, headers?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'POST', data, headers });
    }

    put<T>(endpoint: string, data: any, headers?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'PUT', data, headers });
    }

    delete<T>(endpoint: string, headers?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'DELETE', headers });
    }

    setToken(token: string | null) {
        this.token = token;
    }
}

export const api = new ApiClient(API_CONFIG.BASE_URL);
