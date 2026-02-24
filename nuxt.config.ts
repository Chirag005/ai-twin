// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  // ── Runtime config ─────────────────────────────────────────────────────
  // Values here are overridden at runtime by matching env vars:
  //   runtimeConfig.groqApiKey        → NUXT_GROQ_API_KEY (server-only)
  //   runtimeConfig.public.supabaseUrl → NUXT_PUBLIC_SUPABASE_URL
  //   runtimeConfig.public.supabaseKey → NUXT_PUBLIC_SUPABASE_KEY
  // Note: @ai-sdk/groq also reads process.env.GROQ_API_KEY directly.
  runtimeConfig: {
    groqApiKey:         process.env.GROQ_API_KEY          || '', // override: NUXT_GROQ_API_KEY
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY  || '', // override: NUXT_SUPABASE_SERVICE_KEY
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || '',
    },
  },

  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    redirect: false,
    redirectOptions: {
      login: '/',
      callback: '/auth/callback',
      exclude: [],
    },
  },
})
