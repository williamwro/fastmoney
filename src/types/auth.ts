
export type UserData = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

export type AuthContextType = {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<any>; // Changed from Promise<void> to Promise<any>
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  resendConfirmationEmail: (email: string) => Promise<void>;
};
