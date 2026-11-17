import type { Role } from '../types/auth';

export const STAFF_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'BURSAR'];
export const MANAGEMENT_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'];
export const FINANCE_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'BURSAR'];
export const ACADEMIC_STAFF_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'];
export const PORTAL_ROLES: Role[] = ['STUDENT', 'PARENT'];

export function hasAnyRole(userRoles: Role[] | undefined, allowed: Role[]) {
  return Boolean(userRoles?.some(role => allowed.includes(role)));
}

export function isStudent(userRoles: Role[] | undefined) {
  return Boolean(userRoles?.includes('STUDENT'));
}

export function isParent(userRoles: Role[] | undefined) {
  return Boolean(userRoles?.includes('PARENT'));
}
