import { DatabaseRecord, SoftDeleteRecord } from "./common";

export type UserType = "gym_owner" | "trainer" | "member";
export type Gender = "male" | "female" | "other";

export interface User extends SoftDeleteRecord {
  email: string;
  password_hash: string;
  user_type: UserType;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  gender?: Gender;
  profile_image_url?: string;
  email_verified: boolean;
  last_login?: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  user_type: UserType;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  profile_image_url?: string;
}

export interface UserProfile extends Omit<User, "password_hash"> {
  // Additional profile fields can be added here
}
