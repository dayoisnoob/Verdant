export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface UserApi {
  user: UserData;
  accessToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface RefreshTokenApi {
  accessToken: string;
}
