export type Role = "SUPER_ADMIN" | "ADMIN" | "PRINCIPAL" | "VICE_PRINCIPAL" | "TEACHER" | "BURSAR" | "STUDENT" | "PARENT";
export interface User { id: string; username: string; email: string; firstName: string; lastName: string; phone?: string; roles: Role[]; }
export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { accessToken: string; tokenType: string; expiresIn: number; user: User; }
export interface ApiResponse<T> { success: boolean; message: string; data: T; }
