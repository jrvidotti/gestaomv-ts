import { useAuth } from "@/hooks/use-auth";
import { MODULES_DATA, type ModuleType, MODULES } from "@/constants";
import { USER_ROLES } from "@/modules/core/enums";

interface UsePermissionsReturn {
	canAccessModule: (moduleId: ModuleType) => boolean;
	canAccessPage: (pageUrl: string) => boolean;
	getAccessibleModules: () => typeof MODULES_DATA;
	hasModuleAccess: (moduleId: ModuleType) => boolean;
	getDefaultAccessibleModule: () => (typeof MODULES_DATA)[0] | null;
	isAdmin: boolean;
}

export function usePermissions(): UsePermissionsReturn {
	const { user, hasRole, hasAnyRole } = useAuth();

	const isAdmin = hasRole(USER_ROLES.ADMIN);

	const canAccessModule = (moduleId: ModuleType): boolean => {
		// Admin tem acesso a tudo
		if (isAdmin) return true;

		// Se usuário não está logado
		if (!user) return false;

		// Buscar dados do módulo
		const moduleData = MODULES_DATA.find((m) => m.module === moduleId);
		if (!moduleData) return false;

		// Se módulo não tem roles definidas, qualquer usuário autenticado pode acessar
		if (!moduleData.roles || moduleData.roles.length === 0) return true;

		// Verificar se usuário tem alguma das roles do módulo
		return hasAnyRole(moduleData.roles);
	};

	const canAccessPage = (pageUrl: string): boolean => {
		// Admin tem acesso a tudo
		if (isAdmin) return true;

		// Se usuário não está logado
		if (!user) return false;

		// Páginas especiais que todos usuários autenticados podem acessar
		const publicAdminPages = [
			"/admin",
			"/admin/user/profile",
			"/admin/user/alterar-senha",
		];
		if (publicAdminPages.includes(pageUrl)) return true;

		// Extrair módulo da URL
		const urlParts = pageUrl.split("/");
		if (urlParts.length < 3) return false;

		const moduleId = urlParts[2] as ModuleType;

		// Verificar se é um módulo válido
		if (!Object.values(MODULES).includes(moduleId)) return false;

		const moduleData = MODULES_DATA.find((m) => m.module === moduleId);
		if (!moduleData) return false;

		// Se é a página principal do módulo, usar as roles do módulo
		if (pageUrl === moduleData.url) {
			return canAccessModule(moduleId);
		}

		// Buscar item específico nas subpáginas do módulo
		const pageItem = moduleData.items?.find((item) => item.url === pageUrl);

		if (pageItem) {
			// Se a página tem roles específicas, usar essas
			if (pageItem.roles && pageItem.roles.length > 0) {
				return hasAnyRole(pageItem.roles);
			}

			// Se não tem roles específicas, herdar do módulo
			return canAccessModule(moduleId);
		}

		// Se chegou até aqui, verificar acesso ao módulo pai
		return canAccessModule(moduleId);
	};

	const getAccessibleModules = () => {
		return MODULES_DATA.filter((module) => canAccessModule(module.module));
	};

	const hasModuleAccess = (moduleId: ModuleType): boolean => {
		return canAccessModule(moduleId);
	};

	const getDefaultAccessibleModule = () => {
		const accessibleModules = getAccessibleModules();
		return accessibleModules.length > 0 ? accessibleModules[0] : null;
	};

	return {
		canAccessModule,
		canAccessPage,
		getAccessibleModules,
		hasModuleAccess,
		getDefaultAccessibleModule,
		isAdmin,
	};
}
