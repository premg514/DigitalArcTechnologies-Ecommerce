# 🚀 Quick Start Checklist

## ✅ What You Need Right Now

### 1. Software Installed
- [ ] Node.js v18+ (`node --version`)
- [ ] MongoDB running OR MongoDB Atlas account
- [ ] npm (`npm --version`)

### 2. Accounts Created
- [ ] Razorpay account (https://razorpay.com/)
  - [ ] Got Test API Key ID
  - [ ] Got Test API Secret
- [ ] Google Cloud account (OPTIONAL for OAuth)
  - [ ] Created OAuth 2.0 Client
  - [ ] Got Client ID
  - [ ] Got Client Secret

### 3. Dependencies Installed
```bash
# Backend
cd server
npm install  # Should install ~159 packages

# Frontend  
cd client
npm install  # Should install all Next.js dependencies
```

### 4. Environment Files Created

**server/.env** (REQUIRED):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
CLIENT_URL=http://localhost:3000
```

**client/.env.local** (REQUIRED):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

### 5. Services Running
- [ ] MongoDB running (local) OR Atlas connected
- [ ] Backend server: `cd server && npm run dev`
- [ ] Frontend server: `cd client && npm run dev`

### 6. Test Access
- [ ] Frontend: http://localhost:3000 (loads)
- [ ] Backend: http://localhost:5000/api (responds)

---

## 🎯 Minimum Configuration to Start

**You MUST have**:
1. MongoDB connection (local or Atlas)
2. Razorpay Test API keys
3. Both .env files created

**Optional** (can skip initially):
- Google OAuth credentials
- Cloudinary account
- Email SMTP settings

---

## 🔥 Quick Commands

### Start Everything
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Check if Running
```bash
# Check Node
node --version

# Check MongoDB (local)
mongod --version

# Check if ports are free
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### Reset if Issues
```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## ⚠️ Common First-Time Issues

### "Cannot connect to MongoDB"
→ Start MongoDB: `mongod`  
→ Or use Atlas connection string

### "Port already in use"
→ Kill process or change PORT in .env

### "Module not found"
→ Run `npm install` in both server/ and client/

### "Razorpay not working"
→ Check keys match in both .env files  
→ Use TEST mode keys (rzp_test_...)

### "CORS error"
→ Check CLIENT_URL in server/.env  
→ Check NEXT_PUBLIC_API_URL in client/.env.local

---

## 📝 First Test Steps

1. **Register a user**:
   - Go to http://localhost:3000/register
   - Create account
   - Should redirect to homepage

2. **Check if logged in**:
   - User icon in header
   - Can access cart

3. **Add test product** (MongoDB):
   ```javascript
   db.products.insertOne({
     name: "Test Product",
     description: "Test",
     price: 999,
     category: "Electronics",
     stock: 10,
     images: [{url: "https://via.placeholder.com/400", public_id: "test"}],
     rating: 4.5,
     numReviews: 10
   })
   ```

4. **Browse products**:
   - Should see test product on homepage

5. **Test cart**:
   - Add product to cart
   - Go to cart page
   - Proceed to checkout

6. **Test payment** (Razorpay test):
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: Any future date

---

## 🎉 Success Indicators

✅ No errors in terminal  
✅ Homepage loads at localhost:3000  
✅ Can register/login  
✅ Products display (after adding)  
✅ Cart works  
✅ Payment modal opens  

---

## 📞 Need Help?

Check these in order:
1. Terminal logs (server and client)
2. Browser console (F12)
3. PROJECT_SETUP.md (detailed guide)
4. TROUBLESHOOTING section in setup guide

---

**Ready to start?** Follow the checklist above! ✨
