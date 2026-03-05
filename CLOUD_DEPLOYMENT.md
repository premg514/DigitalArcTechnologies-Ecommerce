# ☁️ AWS Deployment Guide — Amrutha E-Commerce

> For cloud engineers deploying this MERN stack application on AWS.
> Stack: **Next.js (AWS Amplify)** + **Express.js (AWS Elastic Beanstalk / EC2)** + **MongoDB Atlas**

---

## Architecture Overview

```
[Browser / Mobile]
        │
        ▼
[AWS Amplify — Next.js Frontend]   ←── NEXT_PUBLIC_API_URL
        │
        ▼
[AWS EB / EC2 — Express Backend]   ←── CORS whitelisted to Amplify URL
        │
        ├── [MongoDB Atlas — Database]   ←── MONGODB_URI
        ├── [Cloudinary — Image CDN]     ←── CLOUDINARY_*
        └── [Razorpay — Payments]        ←── RAZORPAY_*
```

---

## Step 1: MongoDB Atlas

1. Create cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a DB user with `readWrite` permissions
3. Under **Network Access** → Whitelist `0.0.0.0/0` (or specific backend IPs for higher security )
4. Get the connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
5. Set as `MONGODB_URI` in backend environment variables

---

## Step 2: Cloudinary (Image Uploads)

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Copy **Cloud Name**, **API Key**, **API Secret** from dashboard
3. Set in backend environment:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

---

## Step 3: Razorpay Payments

1. Login at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Settings → API Keys** → Generate **Live** keys

| Variable | Where |
|----------|-------|
| `RAZORPAY_KEY_ID` | Backend env only |
| `RAZORPAY_KEY_SECRET` | Backend env only — **never expose** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Frontend env only |

---

## Step 4: Deploy Backend on AWS

### Option A — AWS Elastic Beanstalk (Recommended, Managed)

1. Install AWS CLI and EB CLI:
   ```bash
   pip install awsebcli --upgrade
   ```
2. From the `server/` directory:
   ```bash
   eb init        # choose region, Node.js platform
   eb create amrutha-backend-prod
   ```
3. Set environment variables via AWS Console:
   - Go to **Elastic Beanstalk → Your Environment → Configuration → Software**
   - Add all variables from the table below
4. Deploy updates:
   ```bash
   eb deploy
   ```
5. Note the generated URL: `http://your-env.elasticbeanstalk.com`

### Option B — AWS EC2 (Manual, Full Control)

1. Launch an **EC2 t3.small+** instance (Ubuntu 22.04)
2. SSH in and install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Clone and set up the server:
   ```bash
   git clone https://github.com/premg514/DigitalArcTechnologies-Ecommerce.git
   cd DigitalArcTechnologies-Ecommerce/server
   npm install
   cp .env.example .env   # fill in all values
   ```
4. Use **PM2** to keep it running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name amrutha-backend
   pm2 save && pm2 startup
   ```
5. Use **Nginx** as a reverse proxy on port 80 → 5000
6. Attach an **Elastic IP** for a stable public IP address
7. Open **Security Group port 80/443** to the internet

---

## Backend Environment Variables (Complete)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string, min 32 chars — generate via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRE` | `1d` |
| `RAZORPAY_KEY_ID` | Live key |
| `RAZORPAY_KEY_SECRET` | Live secret |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary |
| `CLOUDINARY_API_KEY` | From Cloudinary |
| `CLOUDINARY_API_SECRET` | From Cloudinary |
| `CLIENT_URL` | Frontend URL (e.g. `https://main.d1234.amplifyapp.com`) |
| `SERVER_URL` | This backend's URL |
| `CORS_ALLOWED_ORIGINS` | All allowed frontend domains, comma-separated |
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `SMTP_HOST` | `smtp.gmail.com` (optional) |
| `SMTP_PORT` | `587` (optional) |
| `SMTP_SECURE` | `false` (optional) |
| `SMTP_USER` | Sender email (optional) |
| `SMTP_PASS` | App-specific password (optional) |
| `EMAIL_FROM` | `"Amrutha" <noreply@yourdomain.com>` (optional) |

---

## Step 5: Deploy Frontend on AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. **New App → Host Web App → GitHub**
3. Select the repo, set **root directory** to `client`
4. Amplify auto-detects Next.js — confirm build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
5. Add **Environment Variables** in Amplify Console:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url/api` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Live Razorpay Key ID |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | WhatsApp contact number |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Support email |

6. Deploy — Amplify assigns a URL like `https://main.d1234.amplifyapp.com`
7. *(Optional)* Add a custom domain under **Domain Management**

---

## Step 6: Post-Deployment Wiring

After both services are live:

1. **Backend** → Update `CLIENT_URL` and `CORS_ALLOWED_ORIGINS` to the Amplify frontend URL
2. **Frontend** → Confirm `NEXT_PUBLIC_API_URL` points to the backend URL + `/api`
3. **Redeploy both** after updating env vars
4. **Google OAuth** (if enabled) → Add both URLs to Authorized Origins and Redirect URIs in [Google Cloud Console](https://console.cloud.google.com)

---

## Step 7: Health Checks

After deployment, verify these endpoints:

| Check | URL | Expected |
|-------|-----|----------|
| Backend alive | `GET /health` | `{ "success": true }` |
| DB connected | `GET /api/db-status` | `{ "readyState": 1 }` |
| Products listing | `GET /api/products` | `{ "success": true, "data": [...] }` |
| Categories | `GET /api/products/categories` | `{ "success": true, "data": [...] }` |

---

## Security Checklist (Go-Live)

- [ ] `NODE_ENV=production` set on backend
- [ ] `JWT_SECRET` is unique, random, minimum 32 characters
- [ ] Razorpay **LIVE** keys used (not test)
- [ ] `RAZORPAY_KEY_SECRET` only in backend — never frontend
- [ ] `CLIENT_URL` / `CORS_ALLOWED_ORIGINS` match actual Amplify domain
- [ ] MongoDB Atlas IPs restricted (or `0.0.0.0/0` for managed platforms)
- [ ] EC2 Security Group allows only ports 80, 443, 22 (SSH from your IP only)
- [ ] All `.env` files committed to `.gitignore`
- [ ] HTTPS enabled on all URLs (Amplify handles this automatically)
- [ ] MongoDB Atlas automated backups enabled

---

## Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `500: Cannot set property query` | `mongoSanitize` conflicts with serverless req.query getter | Already fixed — uses `.sanitize()` on body/params only |
| `CORS error` | Frontend domain not in `CORS_ALLOWED_ORIGINS` | Add Amplify URL to `CORS_ALLOWED_ORIGINS` env var |
| `Route not found` | Wrong `NEXT_PUBLIC_API_URL` | Ensure it ends with `/api`, no trailing slash |
| `401 Unauthorized` | Wrong or expired `JWT_SECRET` | Regenerate secret and redeploy both services |
| `Payment failed` | Test Razorpay keys used in production | Switch to Live keys from Razorpay dashboard |
| `Image upload failed` | Missing Cloudinary credentials | Verify all 3 Cloudinary env vars are set |

---

*Last Updated: 2026-03-05 | Stack: Next.js + Express + MongoDB Atlas on AWS*
