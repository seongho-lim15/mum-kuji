export interface AuthContextType {
    user: string | null;
    login: (email: string, token?: string) => void;
    logout: () => void;
    isLoading: boolean;
}
