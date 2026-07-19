export {};

export type Roles = "admin" | "contributor";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: Roles;
    };
  }
}
