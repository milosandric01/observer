// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      title: 'Observer',
      htmlAttrs: {
        style: 'background:#010102'
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#08090a' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Observer – Understand why visitors leave' },
        { property: 'og:description', content: 'Observer records what visitors see, what they click, and every error they hit. One script, privacy-first, works with any stack.' },
        { property: 'og:url', content: 'https://tryobserver.dev/' },
        { property: 'og:site_name', content: 'Observer' },
        { property: 'og:image', content: 'https://tryobserver.dev/og.png?v=2' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Observer – Understand why visitors leave' },
        { name: 'twitter:description', content: 'See why people leave, fix what\'s broken, and stop losing conversions you already paid for.' },
        { name: 'twitter:image', content: 'https://tryobserver.dev/og.png?v=2' },
        { name: 'twitter:image:alt', content: 'Observer – Understand why visitors leave without becoming customers' }
      ]
    }
  },

  routeRules: {
    '/o.js': {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    },
    '/api/track': {
      cors: true
    }
  }
})
