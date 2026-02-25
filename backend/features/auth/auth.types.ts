/**
 * Auth Feature - Type Definitions
 * DTOs and interfaces for authentication
 */

export interface RegisterDto {
    name: string;
    phone: string;
    password: string;
}

export interface LoginDto {
    phone: string;
    password: string;
}

export interface GuestCheckoutDto {
    name: string;
    phone: string;
}

export interface GoogleAuthDto {
    credential?: string; // Google ID token from frontend (implicit popup)
    accessToken?: string; // Google Access token (redirect/useGoogleLogin)
}

export interface AuthResponse {
    user: UserResponse;
    token: string;
}

export interface UserResponse {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    avatar: string | null;
    points: number;
    role: string;
    tier: string;
    lastLogin?: Date | null;
    createdAt: Date;
}

export interface TokenPayload {
    userId: string;
    role: string;
}
