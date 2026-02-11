# Razorpay Payment Integration - API-Based Verification

## Overview

The payment system now uses **Razorpay API-based verification** instead of webhooks. This approach provides better control and immediate verification of payment status.

## How It Works

### 1. Payment Flow

```
User → Checkout Page → Razorpay Payment Gateway → Payment Verification → Order Confirmation
```

### 2. Step-by-Step Process

#### Step 1: Create Razorpay Order
- **Endpoint**: `POST /api/payment/create-order`
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "amount": 1000,
    "orderId": "order_123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "order_razorpay_id",
      "currency": "INR",
      "amount": 100000
    }
  }
  ```

#### Step 2: User Completes Payment
- Razorpay payment modal opens
- User enters payment details
- Payment is processed by Razorpay
- Razorpay returns payment details to frontend

#### Step 3: Verify Payment with API
- **Endpoint**: `POST /api/payment/verify`
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "razorpayOrderId": "order_razorpay_id",
    "razorpayPaymentId": "pay_razorpay_id",
    "razorpaySignature": "signature_hash",
    "orderId": "mongodb_order_id"
  }
  ```

### 3. Verification Process

The backend performs **multiple verification steps**:

1. **Signature Verification**
   - Verifies the signature using HMAC SHA256
   - Ensures the response is from Razorpay

2. **API-Based Payment Verification**
   - Fetches payment details from Razorpay API using `razorpay.payments.fetch()`
   - Verifies payment status (must be 'captured' or 'authorized')
   - Verifies order ID matches
   - Verifies payment amount matches order total

3. **Order Update**
   - Updates order status to 'processing'
   - Marks order as paid
   - Stores payment details

## Advantages Over Webhooks

### ✅ Immediate Verification
- No waiting for webhook delivery
- Instant payment confirmation

### ✅ Better Control
- Direct API calls provide more control
- Can retry verification if needed

### ✅ Simpler Setup
- No need to configure webhook URLs
- No webhook secret management
- No need for public endpoint

### ✅ Enhanced Security
- Multiple verification layers:
  1. Signature verification
  2. Payment status check via API
  3. Order ID verification
  4. Amount verification

### ✅ Better Error Handling
- Immediate error feedback
- Can handle edge cases better

## Configuration

### Environment Variables Required

**Server (.env)**:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

**Client (.env.local)**:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### No Longer Required
- ❌ `RAZORPAY_WEBHOOK_SECRET` - Not needed anymore
- ❌ Webhook endpoint configuration in Razorpay dashboard

## Code Changes Made

### 1. Payment Controller
- **File**: `server/controllers/paymentController.js`
- **Changes**:
  - Enhanced `verifyPayment()` function
  - Added Razorpay API payment fetch
  - Added multiple verification checks
  - Removed `handleWebhook()` function

### 2. Payment Routes
- **File**: `server/routes/paymentRoutes.js`
- **Changes**:
  - Removed webhook route
  - Removed webhook handler import

### 3. Environment Configuration
- **File**: `server/.env`
- **Changes**:
  - Removed `RAZORPAY_WEBHOOK_SECRET`

## Testing

### Test Mode
Use Razorpay test credentials for testing:
- Test Key ID: `rzp_test_xxxxxxxxxxxxxxxx`
- Test cards: [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

### Test Payment Flow
1. Add products to cart
2. Proceed to checkout
3. Fill shipping address
4. Click "Pay Now"
5. Use test card details:
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
6. Complete payment
7. Verify order is created and marked as paid

## Error Handling

The system handles various error scenarios:

### Invalid Signature
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

### Payment Not Successful
```json
{
  "success": false,
  "message": "Payment not successful. Status: failed"
}
```

### Order ID Mismatch
```json
{
  "success": false,
  "message": "Payment order ID mismatch"
}
```

### Amount Mismatch
```json
{
  "success": false,
  "message": "Payment amount mismatch"
}
```

### API Error
```json
{
  "success": false,
  "message": "Failed to verify payment with Razorpay API",
  "error": "API error details"
}
```

## Security Considerations

### 1. Signature Verification
- Always verify Razorpay signature first
- Prevents tampering with payment data

### 2. API Verification
- Double-check payment status via API
- Ensures payment was actually captured

### 3. Amount Verification
- Verify payment amount matches order total
- Prevents partial payment fraud

### 4. Order ID Verification
- Ensures payment is for the correct order
- Prevents payment ID reuse

## Production Deployment

### 1. Update Razorpay Credentials
Replace test credentials with live credentials:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
```

### 2. Enable Live Mode
Update both server and client environment files with live credentials.

### 3. Test Thoroughly
- Test with small amounts first
- Verify all payment scenarios
- Check order creation and status updates

## Troubleshooting

### Payment Verification Fails
1. Check Razorpay API credentials
2. Verify signature calculation
3. Check network connectivity to Razorpay API
4. Review server logs for API errors

### Order Not Created
1. Verify payment was successful in Razorpay dashboard
2. Check order creation logic
3. Review database connection

### Amount Mismatch Error
1. Verify tax and shipping calculations
2. Check currency conversion (amount in paise)
3. Review order total calculation

## Support

For Razorpay-specific issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

---

**Note**: This implementation provides a more secure and reliable payment verification system compared to webhooks, with immediate feedback and better error handling.
