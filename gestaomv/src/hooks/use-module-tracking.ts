import { useEffect } from "react";

/**
 * Hook para rastrear automaticamente a navegação entre módulos
 * e atualizar o localStorage com o último módulo acessado
 */
export function useModuleTracking() {
	const pathname = usePathname();

	useEffect(() => {
		// Verificar se está em uma página de módulo admin
		if (!pathname.startsWith("/admin/")) return;

		// Extrair o módulo da URL
		const pathParts = pathname.split("/");
		if (pathParts.length < 3) return;

		const moduleFromPath = pathParts[2] as ModuleType;

		// Verificar se é um módulo válido
		const isValidModule = Object.values(MODULES).includes(moduleFromPath);
		if (!isValidModule) return;

		// Não rastrear a página /admin (redirect) nem /admin/profile
		if (pathname === "/admin/profile") return;

		// Atualizar o último módulo acessado
		setLastAccessedModule(moduleFromPath);
	}, [pathname]);
}
