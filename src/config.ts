import dotenv from 'dotenv';
dotenv.config();

export const isProduction = process.env.NODE_ENV === 'production'

// MongoDB URI
export const MONGOURI = isProduction 
  ? process.env.MONGOURI_PROD 
  : process.env.MONGOURI_DEV

// Frontend URL
export const FRONTEND_URLS = isProduction
  ? process.env.FRONTEND_URL_PROD?.split(',')
  : process.env.FRONTEND_URL_DEV?.split(',')

// Google OAuth
export const GOOGLE_CLIENT_ID = isProduction
  ? process.env.GOOGLE_CLIENT_ID_PROD
  : process.env.GOOGLE_CLIENT_ID_DEV

export const GOOGLE_CLIENT_SECRET = isProduction
  ? process.env.GOOGLE_CLIENT_SECRET_PROD
  : process.env.GOOGLE_CLIENT_SECRET_DEV

export const GOOGLE_REDIRECT_URL = isProduction
  ? process.env.GOOGLE_REDIRECT_URL_PROD
  : process.env.GOOGLE_REDIRECT_URL_DEV

// Github OAuth
export const GITHUB_TOKEN_URL = isProduction
  ? process.env.GITHUB_TOKEN_URL_PROD
  : process.env.GITHUB_TOKEN_URL_DEV

export const GITHUB_EMAIL_URL = process.env.GITHUB_EMAIL_URL ?? 'https://api.github.com/user/emails'
export const GITHUB_USER_URL = process.env.GITHUB_USER_URL ?? 'https://api.github.com/user'