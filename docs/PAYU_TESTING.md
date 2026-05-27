# Testing PayU Payments on Localhost

Since PayU needs to POST the payment result to a publicly accessible URL, you need a tunnel to test end-to-end on localhost.

## Prerequisites

1. PayU Merchant Account (test credentials from [PayU Test Portal](https://test.payu.in))
2. ngrok or cloudflared installed

## Setup Steps

### 1. Install ngrok

```bash
# Using npm
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### 2. Start Your Local Server

```bash
pnpm dev
# Server running at http://localhost:3000
```

### 3. Start ngrok Tunnel

```bash
ngrok http 3000
```

You'll see output like:

```
Session Status                online
Account                      your@email.com
Forwarding                   https://abc123-def456.ngrok.io -> http://localhost:3000
```

Copy the `https://abc123-def456.ngrok.io` URL.

### 4. Configure Environment Variables

Create or update `.env.local`:

```bash
# PayU Credentials (get from PayU Test Portal)
PAYU_KEY=your_test_merchant_key
PAYU_SALT=your_test_salt
PAYU_CALLBACK_URL=https://abc123-def456.ngrok.io/api/payu/callback

# Keep existing variables
NEXT_PUBLIC_API_URL=https://api.evoclabs.com
DATABASE_URL=your_database_url
TWO_FACTOR_API_KEY=your_2fa_key
```

**Important**: Update `PAYU_CALLBACK_URL` each time you restart ngrok (the URL changes).

### 5. Verify Callback URL is Reachable

Test that ngrok is forwarding correctly:

```bash
curl https://abc123-def456.ngrok.io/api/payu/callback
# Should return some response (even a redirect is fine)
```

## Testing the Payment Flow

### Option A: Full E2E Test

1. Start ngrok: `ngrok http 3000`
2. Update `PAYU_CALLBACK_URL` in `.env.local`
3. Update `NEXT_PUBLIC_VERCEL_URL` or ensure the app uses the callback URL correctly
4. Add a product to cart
5. Go through checkout → Select PayU payment
6. Complete payment on PayU test gateway
7. Check success/failure page
8. Verify order in database

### Option B: Direct Callback Testing with curl

Test the callback handler directly without the full payment flow:

```bash
# Calculate the hash (requires PayU_SALT)
# Hash format: SALT|status|udf10|...|udf1|email|firstname|productinfo|amount|txnid|key

# Example (replace with your actual values):
curl -X POST http://localhost:3000/api/payu/callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=your_merchant_key" \
  -d "txnid=ORD-XXXXXXXX" \
  -d "amount=999.00" \
  -d "productinfo=Jewellery" \
  -d "firstname=Test" \
  -d "email=test@example.com" \
  -d "status=success" \
  -d "mihpayid=test_txn_123" \
  -d "hash=your_calculated_hash"
```

### Option C: Use PayU Test Gateway

PayU provides test cards and netbanking:

```
Test Card: 4012012012012012
Expiry: Any future date
CVV: Any 3 digits

Test Netbanking: Select any bank, use test credentials
```

## Troubleshooting

### ngrok shows "Account does not have a paid plan"

Free tier has limitations. Use cloudflared as alternative:

```bash
npx cloudflared tunnel --url http://localhost:3000
```

### Callback returns 502

Your server isn't running or ngrok tunnel is down. Restart ngrok and ensure `pnpm dev` is running.

### Hash mismatch error

The hash calculation in your curl command doesn't match PayU's format. For testing, you can temporarily add debug logging in `src/app/api/payu/callback/route.ts`:

```typescript
// Add before hash verification
console.log('Received hash:', hash);
console.log('Calculated hash:', calculatedHash);
```

### Order not found error

The `txnid` in the callback doesn't match any order. Ensure:
1. Order was created before initiating PayU
2. The `txnid` format matches: `orderId.slice(-12).toUpperCase()`

## Production Deployment

When deploying to Vercel:

1. Set `PAYU_CALLBACK_URL` in Vercel dashboard:
   ```
   PAYU_CALLBACK_URL=https://yourdomain.com/api/payu/callback
   ```

2. Update DNS/domains in Vercel if needed

3. Set production PayU credentials (not test keys)

4. Update PayU merchant dashboard with production callback URL

## Security Notes

- Never commit `.env.local` with real credentials
- Test credentials (`.in` domain) ≠ Production credentials (`.in` domain in production mode)
- Always verify hash before processing payment callback
- Log all callback attempts for audit trail
