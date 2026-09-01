import { supabase, isSupabaseConfigured } from './supabase'
import { taskService } from './taskService'

const TABLE = 'user_data'

/**
 * Estratégia simples de sincronização:
 * - Ao logar, puxa o payload da nuvem e restaura no dispositivo
 *   (se a nuvem tiver dados). Se não tiver, envia o local como base.
 * - A cada mudança, empurra o payload completo para a nuvem.
 */
export const syncService = {
  async pull(userId) {
    if (!userId || !isSupabaseConfigured()) return { data: null, error: null }
    const { data, error } = await supabase
      .from(TABLE)
      .select('payload')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return { data: null, error }
    return { data: data ? data.payload : null, error: null }
  },

  async push(userId) {
    if (!userId || !isSupabaseConfigured()) return { error: null }
    const payload = taskService.dump()
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ user_id: userId, payload, updated_at: new Date().toISOString() })
    return { data, error }
  },

  async syncOnLogin(userId) {
    if (!isSupabaseConfigured()) return { applied: true, error: null }
    if (!userId) return { applied: true, error: null }

    const { data: cloud, error } = await this.pull(userId)
    if (error) return { applied: false, error }

    const local = taskService.dump()
    const localHasData =
      (local.tasks && local.tasks.length > 0) ||
      (local.events && local.events.length > 0)

    if (cloud && Object.keys(cloud).length > 0) {
      // Nuvem tem dados → restaura no dispositivo (a nuvem é a fonte da verdade
      // quando há conteúdo). Dispositivo pode estar sem dados ou velho.
      taskService.restore(cloud)
      return { applied: true, direction: 'cloud', error: null }
    }

    if (localHasData) {
      // Dispositivo tem dados e nuvem vazia → envia o local para a nuvem.
      await this.push(userId)
      return { applied: true, direction: 'local', error: null }
    }

    return { applied: true, direction: 'none', error: null }
  },
}
