/**
 * Auth Feature - Type Definitions
 * DTOs and interfaces for authentication
 */

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: UserResponse;
    token: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
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
