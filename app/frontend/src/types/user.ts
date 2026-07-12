export type Role = 'organizer' | 'buyer'

export interface AuthUser {
  id: string
  role: Role
}
