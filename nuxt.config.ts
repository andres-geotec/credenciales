// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      supabaseUrl: import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  },
})
