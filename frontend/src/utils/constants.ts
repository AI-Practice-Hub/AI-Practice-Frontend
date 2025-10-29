// Application-wide constants

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000';

// File Upload Limits (in bytes)
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
export const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_AUDIO_SIZE = 2 * 1024 * 1024; // 2MB

// Audio Recording
export const MAX_AUDIO_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CHAT: '/chat',
} as const;
