// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      supabaseUrl: import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.NUXT_PUBLIC_SUPABASE_KEY,
      emailAdmin: import.meta.env.NUXT_EMAIL_ADMIN,
    }
  },

  modules: [
    '@nuxtjs/supabase'
  ],
  
  supabase: {
    redirect: false
  },
})
