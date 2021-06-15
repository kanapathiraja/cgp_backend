import { Users } from "./entities/users.entity";

export interface UsersData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface UserRO {
  user: Users;
}

export interface UsersRO {
  users: Users[];
}