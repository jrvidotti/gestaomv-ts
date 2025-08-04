import { cookies } from 'next/headers';
import { SIDEBAR_COOKIE_NAME } from './cookies';

/**
 * Lê o estado da sidebar dos cookies (apenas servidor)
 * Para uso em Server Components
 */
export async function getSidebarStateServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sidebarState = cookieStore.get(SIDEBAR_COOKIE_NAME);
    return sidebarState?.value === 'true';
  } catch {
    // Fallback caso cookies() não esteja disponível
    return true; // Estado padrão
  }
}
