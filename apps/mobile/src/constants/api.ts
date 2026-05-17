// API Configuration

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const API_TIMEOUT = 30000; // 30 seconds

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
  },

  // Users
  users: {
    me: '/users/me',
    stats: '/users/me/stats',
    updateAvatar: '/users/avatar',
  },

  // Courts
  courts: {
    list: '/courts',
    search: '/courts/search',
    detail: (id: string) => `/courts/${id}`,
    availability: (id: string) => `/courts/${id}/availability`,
    reviews: (id: string) => `/courts/${id}/reviews`,
  },

  // Sports
  sports: {
    list: '/sports',
    detail: (id: string) => `/sports/${id}`,
  },

  // Amenities
  amenities: {
    list: '/amenities',
  },

  // Bookings
  bookings: {
    my: '/bookings/my',
    create: '/bookings',
    detail: (id: string) => `/bookings/${id}`,
    cancel: (id: string) => `/bookings/${id}/cancel`,
    availability: '/bookings/availability',
  },

  // Payments
  payments: {
    create: '/payments',
    detail: (id: string) => `/payments/${id}`,
    confirm: (id: string) => `/payments/${id}/confirm`,
    vnpayReturn: '/payments/vnpay/return',
  },

  // Reviews
  reviews: {
    create: '/reviews',
    user: (userId: string) => `/reviews/user/${userId}`,
  },

  // Matches
  matches: {
    list: '/matches',
    search: '/matches/search',
    discover: '/matches/discover',
    detail: (id: string) => `/matches/${id}`,
    create: '/matches',
    update: (id: string) => `/matches/${id}`,
    join: (id: string) => `/matches/${id}/join`,
    leave: (id: string) => `/matches/${id}/leave`,
  },

  // Chat
  chat: {
    conversations: '/chat/conversations',
    messages: (conversationId: string) => `/chat/${conversationId}/messages`,
    conversation: (conversationId: string) => `/chat/${conversationId}`,
    createConversation: '/chat/conversations',
  },

  // Notifications
  notifications: {
    list: '/notifications',
    unread: '/notifications/unread/count',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    settings: '/notifications/settings',
  },
};
