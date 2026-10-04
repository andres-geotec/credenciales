// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'SERVIPREL | Servicios de Limpieza y Mantenimiento en México',
      link: [
        {
          rel: 'icon',
          href: '/img/Diseno-sin-titulo-150x150.png',
          sizes: '32x32',
        },
        {
          rel: 'icon',
          href: '/img/Diseno-sin-titulo-300x300.png',
          sizes: '192x192',
        },
        {
          rel: 'apple-touch-icon',
          href: '/img/Diseno-sin-titulo-300x300.png',
        },
      ],
      meta: [
        {
          name: 'description',
          content:
            'Somos una empresa mexicana con más de 25 años de experiencia en servicios especializados de limpieza para empresas, centros comerciales y compactado de cartón.',
        },
        {
          name: 'msapplication-TileImage',
          content: '/img/Diseno-sin-titulo-300x300.png',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/supabase', '@nuxt/eslint'],

  runtimeConfig: {
    public: {
      supabaseUrl: import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.NUXT_PUBLIC_SUPABASE_KEY,
      emailAdmin: import.meta.env.NUXT_EMAIL_ADMIN,
      bucketImg: import.meta.env.NUXT_BUCKET_IMG,
    },
  },

  supabase: {
    redirect: false,
  },

  vite: {
    plugins: [
      // tailwindcss()
    ],
  },
})
