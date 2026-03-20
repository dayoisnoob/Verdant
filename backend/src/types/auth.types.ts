export interface DeviceInfo {
  ip: string | undefined;
  userAgent: string | undefined;
  deviceId: string | null;
}

export interface RegisterResult {
  message: string;
  data: {
    firstName: string;
    lastName: string | null;
    email: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  passwordHash: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface JwtPayload {
  id: string;
  role: string;
  email: string;
  isActive: boolean;
}
