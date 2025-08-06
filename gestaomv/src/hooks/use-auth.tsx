import type { UserRoleType } from "@/constants";
import { trpcClient } from "@/providers/root-provider";
import { createContext, useContext, useEffect, useState } from "react";

// Tipos inferidos automaticamente do tRPC
type UserProfile = NonNullable<
	Awaited<ReturnType<typeof trpcClient.auth.profile.query>>
>;
type LoginInput = Parameters<typeof trpcClient.auth.login.mutate>[0];
type TagOneLoginInput = Parameters<
	typeof trpcClient.auth.loginWithTagOne.mutate
>[0];
type RegisterInput = Parameters<typeof trpcClient.auth.register.mutate>[0];

interface AuthContextType {
	user: UserProfile | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (credentials: LoginInput) => Promise<void>;
	loginWithTagOne: (credentials: TagOneLoginInput) => Promise<void>;
	register: (data: RegisterInput) => Promise<void>;
	logout: () => Promise<void>;
	hasRole: (role: UserRoleType | string) => boolean;
	hasAnyRole: (roles: readonly (UserRoleType | string)[]) => boolean;
	getAllRoles: () => UserRoleType[];
	getUserRoles: (userId: number) => Promise<UserRoleType[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				if (token) {
					const userProfile = await trpcClient.auth.profile.query();
					if (userProfile) {
						setUser(userProfile);
					}
				}
			} catch (error) {
				console.error("Erro ao carregar perfil:", error);
				localStorage.removeItem("auth_token");
				localStorage.removeItem("user");
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	const login = async (credentials: LoginInput) => {
		setIsLoading(true);
		try {
			const response = await trpcClient.auth.login.mutate(credentials);

			// Armazenar token e dados do usuário
			localStorage.setItem("auth_token", response.access_token);
			localStorage.setItem("user", JSON.stringify(response.user));

			setUser(response.user as UserProfile);
		} finally {
			setIsLoading(false);
		}
	};

	const loginWithTagOne = async (credentials: TagOneLoginInput) => {
		setIsLoading(true);
		try {
			const response =
				await trpcClient.auth.loginWithTagOne.mutate(credentials);

			// Armazenar token e dados do usuário
			localStorage.setItem("auth_token", response.access_token);
			localStorage.setItem("user", JSON.stringify(response.user));

			setUser(response.user as UserProfile);
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (data: RegisterInput) => {
		setIsLoading(true);
		try {
			const response = await trpcClient.auth.register.mutate(data);

			// Armazenar token e dados do usuário
			localStorage.setItem("auth_token", response.access_token);
			localStorage.setItem("user", JSON.stringify(response.user));

			setUser(response.user as UserProfile);
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		setIsLoading(true);
		try {
			await trpcClient.auth.logout.mutate();
		} catch (error) {
			// Ignorar erros de logout
		} finally {
			localStorage.removeItem("auth_token");
			localStorage.removeItem("user");
			setUser(null);
			setIsLoading(false);
			window.location.href = "/login";
		}
	};

	// Verifica se o usuário tem uma role específica (principal ou adicional)
	const hasRole = (role: UserRoleType | string): boolean => {
		if (!user) return false;
		return user.roles?.some((userRole) => userRole.toString() === role);
	};

	// Verifica se o usuário tem pelo menos uma das roles especificadas
	const hasAnyRole = (roles: readonly (UserRoleType | string)[]): boolean => {
		if (!user) return false;
		return roles.some((role) => hasRole(role));
	};

	// Retorna todas as roles do usuário (principal + adicionais)
	const getAllRoles = (): UserRoleType[] => {
		if (!user) return [];
		const allRoles: UserRoleType[] = [];
		if (user.roles) {
			for (const role of user.roles) {
				if (!allRoles.includes(role)) {
					allRoles.push(role);
				}
			}
		}
		return allRoles;
	};

	// Busca roles de um usuário específico (para admins)
	const getUserRoles = async (userId: number): Promise<UserRoleType[]> => {
		try {
			return await trpcClient.auth.getUserRoles.query({ userId });
		} catch (error) {
			console.error("Erro ao buscar roles do usuário:", error);
			return [];
		}
	};

	const value = {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		loginWithTagOne,
		register,
		logout,
		hasRole,
		hasAnyRole,
		getAllRoles,
		getUserRoles,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth deve ser usado dentro de um AuthProvider");
	}
	return context;
}
