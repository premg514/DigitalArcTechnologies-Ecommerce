export interface OrderItem {
    product: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
}

export interface ShippingAddress {
    fullName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
}

export interface PaymentDetails {
    method: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: 'pending' | 'completed' | 'failed';
    paidAt?: string;
}

export interface Order {
    _id: string;
    user: string;
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentDetails: PaymentDetails;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderData {
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
}

export interface OrdersResponse {
    success: boolean;
    count: number;
    total: number;
    page: number;
    pages: number;
    data: Order[];
}
