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

export interface AuthResponse {
    user: UserResponse;
    token: string;
}

export interface UserResponse {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    avatar: string | null;
    points: number;
    role: string;
    tier: string;
    lastLogin?: Date;
    createdAt: Date;
}

export interface TokenPayload {
    userId: string;
    role: string;
}
