declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    NODE_ENV: 'development' | 'production' | 'test'
  }
}
