export default defineNuxtConfig({
  compatibilityDate: '2025-12-13',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'mask-icon', href: '/favicon.svg', color: '#161616' }
      ]
    }
  },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      rds: {
        clusterArn: process.env.RDS_CLUSTER_ARN,
        secretArn: process.env.RDS_SECRET_ARN,
        database: process.env.RDS_DATABASE_NAME || 'gym_tracker'
      }
    },
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  }
})
