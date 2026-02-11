# 🚀 Production Readiness Guide

## Table of Contents
- [Environment Variables](#environment-variables)
- [Production Checklist](#production-checklist)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Deployment Guide](#deployment-guide)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)

---

## Environment Variables

### 🔧 Server Environment Variables (`.env`)

All server environment variables should be configured in `server/.env` file.

#### **Required Variables**

| Variable | Description | Example | Production Notes |
|----------|-------------|---------|------------------|
| `PORT` | Server port number | `5000` | Use port provided by hosting service |
| `NODE_ENV` | Environment mode | `production` | **MUST** be set to `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Use MongoDB Atlas for production |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_jwt_key_min_32_characters` | **CRITICAL**: Use strong random string (min 32 chars) |
| `JWT_EXPIRE` | JWT token expiration | `7d` | Consider shorter duration for production (e.g., `1d`) |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | `rzp_live_xxxxxxxxxxxxxxxx` | **Use LIVE keys** (not test keys) |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | `your_razorpay_secret_key` | **Keep SECRET** - never expose |
| `CLIENT_URL` | Frontend application URL | `https://yourdomain.com` | Production frontend URL for CORS |

#### **Optional Variables**

| Variable | Description | Example | Production Notes |
|----------|-------------|---------|------------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` | Required if using Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxxxx` | Required if using Google OAuth |
| `SERVER_URL` | Backend server URL | `https://api.yourdomain.com` | Required for OAuth callbacks |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` | Required for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` | Required for image uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` | Required for image uploads |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` | For order confirmation emails |
| `SMTP_PORT` | Email SMTP port | `587` | Standard SMTP port |
| `SMTP_SECURE` | Use TLS/SSL | `false` | Set to `true` for port 465 |
| `SMTP_USER` | Email account username | `your_email@gmail.com` | Email sender account |
| `SMTP_PASS` | Email account password | `your_app_password` | Use app-specific password |
| `EMAIL_FROM` | Email sender name | `E-Commerce <noreply@yourdomain.com>` | Display name for emails |

#### **Server `.env` Template for Production**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=GENERATE_STRONG_RANDOM_STRING_MIN_32_CHARACTERS_HERE
JWT_EXPIRE=1d

# Razorpay Configuration (LIVE KEYS)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_razorpay_secret_key

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
SERVER_URL=https://api.yourdomain.com

# Cloudinary Configuration (Optional but Recommended)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=E-Commerce <noreply@yourdomain.com>

# Frontend URL (for CORS)
CLIENT_URL=https://yourdomain.com
```

---

### 🎨 Client Environment Variables (`.env.local`)

All client environment variables should be configured in `client/.env.local` file.

#### **Required Variables**

| Variable | Description | Example | Production Notes |
|----------|-------------|---------|------------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.yourdomain.com/api` | Production API endpoint |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (public) | `rzp_live_xxxxxxxxxxxxxxxx` | **Use LIVE keys** (not test keys) |

#### **Client `.env.local` Template for Production**

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Razorpay Configuration (LIVE KEY)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
```

> **⚠️ IMPORTANT**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive secrets in client environment variables.

---

## Production Checklist

### ✅ Pre-Deployment Checklist

#### **1. Environment Configuration**
- [ ] All required environment variables are set
- [ ] `NODE_ENV=production` in server `.env`
- [ ] JWT_SECRET is strong and unique (min 32 characters)
- [ ] Razorpay LIVE keys are configured (not test keys)
- [ ] MongoDB Atlas connection string is correct
- [ ] CLIENT_URL points to production frontend domain
- [ ] SERVER_URL points to production backend domain
- [ ] All `.env` files are added to `.gitignore`

#### **2. Database**
- [ ] MongoDB Atlas cluster is created and configured
- [ ] Database user has appropriate permissions
- [ ] IP whitelist is configured (or set to 0.0.0.0/0 for cloud deployments)
- [ ] Database backups are enabled
- [ ] Indexes are created for performance (User.email, Product.category, Order.user)

#### **3. Security**
- [ ] CORS is properly configured with production CLIENT_URL
- [ ] Rate limiting is enabled (currently set to 100 requests per 10 minutes)
- [ ] Helmet security headers are enabled
- [ ] MongoDB sanitization is re-enabled (currently disabled - see `server/app.js`)
- [ ] All passwords are hashed with bcrypt
- [ ] JWT tokens have reasonable expiration time
- [ ] HTTPS is enforced on production domain
- [ ] Sensitive data is not logged in production

#### **4. Payment Integration**
- [ ] Razorpay account is verified and activated
- [ ] Live API keys are obtained from Razorpay dashboard
- [ ] Payment webhook is configured (if needed)
- [ ] Test payments work in production environment
- [ ] Refund functionality is tested

#### **5. Code Quality**
- [ ] All console.log statements are removed or replaced with proper logging
- [ ] Error handling is comprehensive
- [ ] No hardcoded credentials in code
- [ ] TypeScript compilation has no errors (client)
- [ ] ESLint warnings are resolved

#### **6. Performance**
- [ ] Next.js production build is optimized (`npm run build`)
- [ ] Images are optimized and served via CDN (Cloudinary recommended)
- [ ] Database queries are optimized with proper indexes
- [ ] API response times are acceptable
- [ ] Caching strategies are implemented where appropriate

#### **7. Testing**
- [ ] User registration and login work
- [ ] Google OAuth works (if configured)
- [ ] Product browsing and filtering work
- [ ] Cart functionality works
- [ ] Checkout process works end-to-end
- [ ] Payment processing works with live keys
- [ ] Order creation and retrieval work
- [ ] Admin panel is accessible and functional
- [ ] Email notifications work (if configured)

---

## Security Considerations

### 🔒 Critical Security Issues to Address

#### **1. MongoDB Sanitization (Currently Disabled)**

**Location**: `server/app.js` (lines 40-47)

```javascript
// CURRENTLY DISABLED - MUST RE-ENABLE FOR PRODUCTION
// app.use(mongoSanitize({
//   replaceWith: '_',
//   onSanitize: ({ req, key }) => {
//     console.warn(`Sanitized ${key} in request`);
//   },
// }));
```

> **⚠️ WARNING**: MongoDB sanitization is currently disabled. This leaves the application vulnerable to NoSQL injection attacks. Re-enable before production deployment.

**Action Required**:
1. Test Google OAuth with sanitization enabled
2. If issues persist, configure sanitization to exclude OAuth routes
3. Never deploy to production without this protection

#### **2. JWT Secret Strength**

**Current**: `your_super_secret_jwt_key_min_32_characters_change_in_production`

**Action Required**:
- Generate a cryptographically secure random string
- Use at least 32 characters
- Never reuse across environments
- Store securely (use secret management service)

**Generate secure secret**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

#### **3. Rate Limiting**

**Current Configuration**: 100 requests per 10 minutes per IP

**Recommendations**:
- Adjust based on expected traffic patterns
- Consider different limits for different routes
- Implement stricter limits for authentication endpoints
- Add distributed rate limiting for multi-server deployments

#### **4. CORS Configuration**

**Current**: Allows credentials from CLIENT_URL

**Verify**:
- CLIENT_URL matches production frontend domain exactly
- No wildcard (*) origins in production
- Credentials are only allowed for trusted domains

#### **5. Sensitive Data Exposure**

**Check for**:
- API keys in client-side code (only NEXT_PUBLIC_ vars should be there)
- Passwords in logs
- User data in error messages
- Database credentials in version control

---

## Performance Optimization

### ⚡ Production Performance Checklist

#### **1. Frontend (Next.js)**

- [ ] Run production build: `npm run build`
- [ ] Enable Next.js image optimization
- [ ] Implement lazy loading for components
- [ ] Use React Query caching effectively
- [ ] Minimize bundle size (check with `npm run build`)
- [ ] Enable compression (gzip/brotli)
- [ ] Use CDN for static assets
- [ ] Implement service worker for offline support (optional)

#### **2. Backend (Express)**

- [ ] Enable compression middleware
- [ ] Implement response caching where appropriate
- [ ] Use connection pooling for MongoDB
- [ ] Optimize database queries (use `.lean()` for read-only operations)
- [ ] Add database indexes:
  ```javascript
  // User model
  User.index({ email: 1 }, { unique: true });
  
  // Product model
  Product.index({ category: 1 });
  Product.index({ price: 1 });
  Product.index({ name: 'text', description: 'text' });
  
  // Order model
  Order.index({ user: 1 });
  Order.index({ createdAt: -1 });
  ```

#### **3. Database**

- [ ] Use MongoDB Atlas M10+ cluster for production
- [ ] Enable connection pooling
- [ ] Configure appropriate read/write concerns
- [ ] Set up database monitoring
- [ ] Implement query performance monitoring

#### **4. Images & Media**

- [ ] Set up Cloudinary for image hosting
- [ ] Configure automatic image optimization
- [ ] Use appropriate image formats (WebP, AVIF)
- [ ] Implement lazy loading for images
- [ ] Set up CDN for faster delivery

---

## Deployment Guide

### 🌐 Recommended Deployment Platforms

#### **Frontend (Next.js)**
- **Vercel** (Recommended - built by Next.js creators)
- Netlify
- AWS Amplify
- DigitalOcean App Platform

#### **Backend (Express)**
- **Railway** (Recommended for Node.js)
- Render
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

#### **Database**
- **MongoDB Atlas** (Recommended)

### 📦 Deployment Steps

#### **1. Deploy Database (MongoDB Atlas)**

1. Create MongoDB Atlas account
2. Create a new cluster (M10+ for production)
3. Create database user with strong password
4. Configure IP whitelist (0.0.0.0/0 for cloud platforms)
5. Get connection string
6. Update `MONGODB_URI` in server environment variables

#### **2. Deploy Backend**

**Example: Railway**

1. Create Railway account
2. Create new project
3. Connect GitHub repository
4. Select `server` directory as root
5. Add all environment variables from server `.env`
6. Deploy
7. Note the deployment URL (e.g., `https://your-app.railway.app`)

**Environment Variables to Set**:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://your-app.railway.app
```

#### **3. Deploy Frontend**

**Example: Vercel**

1. Create Vercel account
2. Import GitHub repository
3. Select `client` directory as root
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
   ```
5. Deploy
6. Configure custom domain (optional)

#### **4. Post-Deployment**

1. Update `CLIENT_URL` in backend environment to match frontend URL
2. Update Google OAuth redirect URIs (if using OAuth)
3. Test all functionality end-to-end
4. Set up monitoring and alerts
5. Configure DNS (if using custom domain)

---

## Monitoring & Logging

### 📊 Production Monitoring

#### **1. Application Monitoring**

**Recommended Tools**:
- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Session replay and error tracking
- **New Relic** - Full-stack monitoring
- **Datadog** - Infrastructure and application monitoring

**Implementation**:
```javascript
// server/app.js
if (process.env.NODE_ENV === 'production') {
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}
```

#### **2. Logging Strategy**

**Current**: Using `morgan` for HTTP logging in development

**Production Recommendations**:
- Use structured logging (Winston, Pino)
- Log to external service (Loggly, Papertrail, CloudWatch)
- Implement log levels (error, warn, info, debug)
- Never log sensitive data (passwords, tokens, credit cards)

**Example Winston Setup**:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

#### **3. Health Checks**

**Current**: `/health` endpoint exists

**Enhancements**:
- Add database connectivity check
- Add external service checks (Razorpay, Cloudinary)
- Implement readiness and liveness probes
- Monitor response times

#### **4. Metrics to Monitor**

- **Application**:
  - Response times
  - Error rates
  - Request throughput
  - Memory usage
  - CPU usage

- **Business**:
  - Order completion rate
  - Payment success rate
  - User registration rate
  - Cart abandonment rate
  - Average order value

- **Database**:
  - Query performance
  - Connection pool usage
  - Slow queries
  - Database size

---

## Backup & Recovery

### 💾 Backup Strategy

#### **1. Database Backups**

**MongoDB Atlas** (Recommended):
- Enable automated backups (included in M10+ clusters)
- Configure backup frequency (continuous backups recommended)
- Set retention period (7-30 days minimum)
- Test restore procedures regularly

**Manual Backup**:
```bash
# Export database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" --out=./backup

# Restore database
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" ./backup
```

#### **2. Code Backups**

- Use Git for version control
- Push to remote repository (GitHub, GitLab, Bitbucket)
- Tag production releases
- Maintain separate branches (main, staging, development)

#### **3. Environment Variables**

- Store securely in password manager (1Password, LastPass)
- Document all variables in this file
- Keep encrypted backups
- Never commit to version control

#### **4. Disaster Recovery Plan**

1. **Database Failure**:
   - Restore from latest MongoDB Atlas backup
   - Verify data integrity
   - Update connection strings if needed

2. **Application Failure**:
   - Rollback to previous deployment
   - Check logs for root cause
   - Fix and redeploy

3. **Complete Infrastructure Failure**:
   - Deploy to new infrastructure
   - Restore database from backup
   - Update DNS records
   - Verify all services

---

## Additional Production Considerations

### 🔐 SSL/TLS Certificates

- Use HTTPS for all production traffic
- Most platforms (Vercel, Railway) provide free SSL certificates
- For custom domains, use Let's Encrypt or platform-provided certificates

### 📧 Email Configuration

If implementing email notifications:
- Use dedicated email service (SendGrid, Mailgun, AWS SES)
- Configure SPF, DKIM, DMARC records
- Implement email templates
- Handle bounces and complaints

### 🌍 CDN Configuration

- Use Cloudinary for images
- Consider CloudFlare for additional CDN and DDoS protection
- Enable caching for static assets
- Configure cache invalidation strategy

### 📱 Mobile Responsiveness

- Test on real devices
- Verify payment flow on mobile
- Check performance on slow networks
- Ensure touch targets are appropriate size

### ♿ Accessibility

- Run accessibility audits (Lighthouse, axe)
- Ensure keyboard navigation works
- Verify screen reader compatibility
- Check color contrast ratios

### 🌐 Internationalization (Future)

- Plan for multi-currency support
- Consider multi-language support
- Handle timezone differences
- Support international payment methods

---

## Quick Reference

### 🚨 Critical Actions Before Production

1. ✅ Change `NODE_ENV` to `production`
2. ✅ Generate strong `JWT_SECRET`
3. ✅ Switch to Razorpay LIVE keys
4. ✅ Re-enable MongoDB sanitization
5. ✅ Update all URLs to production domains
6. ✅ Enable HTTPS
7. ✅ Set up monitoring and logging
8. ✅ Configure database backups
9. ✅ Test complete user journey
10. ✅ Review security checklist

### 📞 Support & Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html

---

**Last Updated**: 2026-02-11  
**Version**: 1.0.0
