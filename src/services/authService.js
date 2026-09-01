import { supabase, isSupabaseConfigured } from './supabase'

const NOT_CONFIGURED = 'Servidor ainda não configurado.'

export const authService = {
  async getSession() {
    if (!isSupabaseConfigured()) return { session: null, error: NOT_CONFIGURED }
    const { data, error } = await supabase.auth.getSession()
    if (error) return { session: null, error }
    return { session: data.session, error: null }
  },
  async onAuthStateChange(callback) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabase.auth.onAuthStateChange((_event, session) => callback(session))
  },
  async signUp(email, password) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error(NOT_CONFIGURED) }
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  },
  async signIn(email, password) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error(NOT_CONFIGURED) }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },
  async signOut() {
    if (!isSupabaseConfigured()) return { error: null }
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  async getCurrentUserId() {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user.id
  },
}
