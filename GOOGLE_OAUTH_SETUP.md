# Google OAuth Integration Guide

## Overview

The application now supports Google OAuth 2.0 authentication, allowing users to sign in with their Google accounts. This provides a seamless and secure authentication experience.

## Features

- ✅ Sign in with Google
- ✅ Sign up with Google
- ✅ Automatic account creation for new Google users
- ✅ Account linking for existing users
- ✅ Secure JWT token generation
- ✅ No password required for Google users

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:5000/api/auth/google/callback`
     - Production: `https://yourdomain.com/api/auth/google/callback`
   - Click "Create"
   - Copy the Client ID and Client Secret

### 2. Configure Environment Variables

**Server (.env)**:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### 3. Install Dependencies

The following packages are already installed:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth 2.0 strategy

## How It Works

### Authentication Flow

```
1. User clicks "Continue with Google"
   ↓
2. Redirected to Google login page
   ↓
3. User authenticates with Google
   ↓
4. Google redirects to callback URL
   ↓
5. Server verifies Google response
   ↓
6. Server creates/updates user account
   ↓
7. Server generates JWT token
   ↓
8. User redirected to frontend with token
   ↓
9. Frontend stores token and logs in user
```

### Technical Implementation

#### Backend

**1. Passport Configuration** (`server/config/passport.js`)
- Configures Google OAuth strategy
- Handles user creation/update
- Links Google accounts to existing users

**2. Auth Routes** (`server/routes/authRoutes.js`)
- `GET /api/auth/google` - Initiates Google OAuth flow
- `GET /api/auth/google/callback` - Handles Google callback

**3. User Model** (`server/models/User.js`)
- Added `googleId` field for Google account linking
- Supports both email/password and Google authentication

#### Frontend

**1. Login Page** (`client/app/(auth)/login/page.tsx`)
- "Continue with Google" button
- Redirects to Google OAuth endpoint

**2. Register Page** (`client/app/(auth)/register/page.tsx`)
- "Continue with Google" button for signup
- Same OAuth flow as login

**3. Callback Page** (`client/app/(auth)/callback/page.tsx`)
- Receives JWT token from backend
- Stores token in localStorage
- Redirects to home page

## User Experience

### New Users (Google Sign-up)
1. Click "Continue with Google"
2. Select Google account
3. Grant permissions
4. Automatically redirected to home page
5. Account created with Google profile information

### Existing Users (Google Sign-in)
1. Click "Continue with Google"
2. Select Google account
3. Automatically redirected to home page
4. Google ID linked to existing account (if email matches)

### Account Linking
- If a user signs up with email/password and later uses Google OAuth with the same email, the accounts are automatically linked
- Users can then sign in using either method

## Security Features

### 1. OAuth 2.0 Protocol
- Industry-standard authentication protocol
- No password storage required
- Secure token exchange

### 2. JWT Tokens
- Secure token generation
- Token-based authentication
- Stateless authentication

### 3. Email Verification
- Google users are pre-verified
- No email verification required

### 4. Account Protection
- Google accounts cannot be accessed with password
- Existing accounts are safely linked

## API Endpoints

### Initiate Google OAuth
```
GET /api/auth/google
```
Redirects user to Google login page.

### Google OAuth Callback
```
GET /api/auth/google/callback
```
Handles Google's response and creates/authenticates user.

**Success Response:**
- Redirects to: `http://localhost:3000/auth/callback?token=<jwt_token>`

**Error Response:**
- Redirects to: `http://localhost:3000/login?error=google_auth_failed`

## Frontend Integration

### Login Button
```tsx
const handleGoogleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
};

<Button onClick={handleGoogleLogin}>
  <Chrome className="mr-2 h-4 w-4" />
  Continue with Google
</Button>
```

### Callback Handler
```tsx
useEffect(() => {
  const token = searchParams.get('token');
  if (token) {
    localStorage.setItem('token', token);
    router.push('/');
  }
}, [searchParams, router]);
```

## Testing

### Development Testing
1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. Verify redirect to home page
6. Check that user is authenticated

### Test Scenarios
- ✅ New user sign-up with Google
- ✅ Existing user sign-in with Google
- ✅ Account linking (email/password user using Google)
- ✅ Error handling (cancelled authentication)
- ✅ Token storage and persistence

## Troubleshooting

### "Redirect URI mismatch" Error
**Problem**: Google OAuth callback URL doesn't match configured URI.

**Solution**:
1. Check Google Cloud Console > Credentials
2. Ensure redirect URI matches exactly: `http://localhost:5000/api/auth/google/callback`
3. For production, add your production URL

### "Access blocked" Error
**Problem**: App not verified by Google.

**Solution**:
1. Add test users in Google Cloud Console
2. Or complete Google's verification process for production

### Token Not Received
**Problem**: Callback page doesn't receive token.

**Solution**:
1. Check server logs for errors
2. Verify `CLIENT_URL` in `.env` is correct
3. Check browser console for errors

### User Not Created
**Problem**: Google authentication succeeds but user not created.

**Solution**:
1. Check MongoDB connection
2. Verify User model has `googleId` field
3. Check server logs for database errors

## Production Deployment

### 1. Update Google OAuth Credentials
- Add production redirect URI in Google Cloud Console
- Update authorized JavaScript origins

### 2. Update Environment Variables
```env
SERVER_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com
```

### 3. Enable HTTPS
- Google OAuth requires HTTPS in production
- Use SSL/TLS certificates

### 4. Verify App (Optional)
- Complete Google's app verification process
- Required for apps with many users

## Benefits of Google OAuth

### For Users
- ✅ Faster sign-up process
- ✅ No password to remember
- ✅ Trusted authentication provider
- ✅ Automatic profile information

### For Developers
- ✅ Reduced password management
- ✅ Lower security risks
- ✅ Better user experience
- ✅ Trusted authentication flow

## Additional OAuth Providers

The same pattern can be used to add other OAuth providers:
- Facebook OAuth
- GitHub OAuth
- Twitter OAuth
- LinkedIn OAuth

Just install the respective Passport strategy and configure similarly.

## Support

For Google OAuth specific issues:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Note**: Always keep your Google Client Secret secure and never commit it to version control.
