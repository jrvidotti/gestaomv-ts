import { ModuleType } from '@/shared';

const LAST_ACCESSED_MODULE_KEY = 'gestao-last-accessed-module';

/**
 * Obtém o último módulo acessado pelo usuário
 * @returns O ID do último módulo acessado ou null se não houver
 */
export function getLastAccessedModule(): ModuleType | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(LAST_ACCESSED_MODULE_KEY);
    return stored as ModuleType | null;
  } catch (error) {
    console.warn('Erro ao ler último módulo acessado do localStorage:', error);
    return null;
  }
}

/**
 * Armazena o último módulo acessado pelo usuário
 * @param moduleId ID do módulo a ser armazenado
 */
export function setLastAccessedModule(moduleId: ModuleType): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LAST_ACCESSED_MODULE_KEY, moduleId);
  } catch (error) {
    console.warn('Erro ao salvar último módulo acessado no localStorage:', error);
  }
}

/**
 * Remove o último módulo acessado do localStorage
 */
export function clearLastAccessedModule(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LAST_ACCESSED_MODULE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar último módulo acessado do localStorage:', error);
  }
}
