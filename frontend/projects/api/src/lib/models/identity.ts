export interface JoinRequest {
  name: string;
  email: string;
  password: string;
  agreedToCodeOfConduct: boolean;
}

export interface SignInRequest {
  email: string;
  password: string;
}

/** The signed-in account, as `GET /api/v1/session` reports it. */
export interface MemberSession {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}
