export const PRODUCT_CATEGORIES = [
    'Rice',
    'Jaggery',
    'Nuts',
] as const;

export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
} as const;

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
} as const;

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
] as const;

export const ITEMS_PER_PAGE = 12;

export const TAX_RATE = 0.18; // 18% GST

export const SHIPPING_CHARGES = {
    FREE_SHIPPING_THRESHOLD: 500,
    STANDARD_CHARGE: 0,
} as const;

export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',

    // Products
    PRODUCTS: '/products',
    CATEGORIES: '/products/categories',
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,

    // Orders
    ORDERS: '/orders',
    ORDER_BY_ID: (id: string) => `/orders/${id}`,
    MY_ORDERS: '/orders/my-orders',

    // Payment
    CREATE_PAYMENT: '/payment/create-order',
    VERIFY_PAYMENT: '/payment/verify',

    // Admin
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_USERS: '/admin/users',
    ADMIN_ANALYTICS: '/admin/analytics',
} as const;

export const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

export const CONTACT_CONFIG = {
    PHONE: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+91 98765 43210',
    EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@amrutha.com',
    WHATSAPP_PHONE: process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/[\s\+]/g, '') || '919876543210',
} as const;
