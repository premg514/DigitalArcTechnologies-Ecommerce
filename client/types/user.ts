export interface Address {
    _id?: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    isDefault: boolean;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    addresses: Address[];
    phone?: string;
    avatar: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        email: string;
        role: 'user' | 'admin';
        token: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface UpdateProfileData {
    name?: string;
    email?: string;
    phone?: string;
    address?: Address;
}
