# Amrutha - E-Commerce Platform

A full-stack MERN e-commerce application with Next.js frontend and Express.js backend, featuring Razorpay payment integration.

## 🚀 Features

### Customer Features
- Browse products with advanced filtering (category, price, search)
- Product details with image gallery and reviews
- Shopping cart with quantity management
- Secure checkout with Razorpay payment gateway
- User authentication (Email/Password + Google OAuth)
- Order history and tracking
- Social login with Google

### Admin Panel Features
- **Dashboard**: Real-time analytics, revenue stats, and sales charts
- **Product Management**: Create, edit, delete products with image handling
- **Order Management**: Process orders, update status, print invoices
- **User Management**: View customers and manage roles
- **Analytics**: Detailed reports on sales, products, and customers

### Technical Highlights
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Node.js, Express, MongoDB
- **State Management**: React Query + Zustand
- **Styling**: Tailwind CSS v4
- **Payment**: Razorpay API-based verification
- **Authentication**: JWT + Google OAuth 2.0
- **Type Safety**: Full TypeScript implementation
- **Responsive**: Mobile-first design

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Razorpay account (for payment processing)
- Google OAuth credentials (optional, for social login)

## 🛠️ Installation

### Clone the repository

```bash
git clone https://github.com/premg514/DigitalArcTechnologies-Ecommerce.git
cd DigitalArcTechnologies-Ecommerce
```

### Backend Setup

```bash
cd server
npm install
```

Copy the example environment file and configure it:

```bash
cp .env.example .env
```
*Note for Cloud Engineers: Please review `.env.example` for the required production environment variables such as MongoDB Atlas URI, strong JWT secrets, and Live payment gateway keys.*

### Frontend Setup

```bash
cd client
npm install
```

Copy the example environment file and configure it:

```bash
cp .env.local.example .env.local
```
*Note for Cloud Engineers: Ensure `NEXT_PUBLIC_API_URL` points to the deployed backend URL.*

## 🚀 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server runs on `http://localhost:5000`

### Start Frontend Server

```bash
cd client
npm run dev
```

Client runs on `http://localhost:3000`

## 📁 Project Structure

```
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and constants
│   ├── providers/        # Context providers
│   └── types/            # TypeScript types
│
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
```

## 🔑 Key Technologies

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Razorpay** - Payment gateway
- **Bcrypt** - Password hashing
- **Helmet** - Security headers

## 🎨 UI Components

All UI components are built with:
- Tailwind CSS for styling
- Class Variance Authority for variants
- Radix UI for accessibility
- Responsive design patterns

## 🔒 Security Features

- JWT-based authentication
- Google OAuth 2.0 integration
- Password hashing with bcrypt
- MongoDB injection protection
- Rate limiting
- CORS configuration
- Helmet security headers
- API-based payment verification

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1440px+)

## 🧪 Testing

### Manual Testing Checklist

1. Start MongoDB server
2. Start backend server
3. Start frontend server
4. Test product browsing
5. Test cart functionality
6. Test checkout process
7. Test payment integration (Razorpay test mode)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products/:id/reviews` - Add review

### Orders
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Admin
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/analytics` - View analytics

## 🌟 Future Enhancements

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Order tracking
- [ ] Multiple payment methods
- [ ] Admin dashboard
- [ ] Product search autocomplete
- [ ] Social media integration

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@amrutha.com or create an issue in the repository.

---

Built with ❤️ using MERN Stack
