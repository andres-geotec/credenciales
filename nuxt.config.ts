import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase'
  ],

  runtimeConfig: {
    public: {
      supabaseUrl: import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.NUXT_PUBLIC_SUPABASE_KEY,
      emailAdmin: import.meta.env.NUXT_EMAIL_ADMIN,
      bucketImg: import.meta.env.NUXT_BUCKET_IMG,
    }
  },
  
  supabase: {
    redirect: false
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
