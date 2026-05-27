# PayU Production Setup

This guide covers everything needed to run PayU payments in production.

## Prerequisites

1. PayU Production Merchant Account
2. Domain with SSL (HTTPS required)
3. Vercel account (or your hosting provider)

---

## 1. PayU Merchant Portal Setup

### 1.1 Get Production Credentials

1. Log into [PayU Merchant Dashboard](https://onboarding.payu.in)
2. Go to **Settings → API Credentials** or **My Account → Developer Settings**
3. Copy your production credentials:
   - **Merchant Key** (similar to `gtKFFx`)
   - **Merchant Salt** (similar to `eCwWEL5`)

**Warning**: Production salt gives access to real money. Keep it secure and never commit to git.

### 1.2 Configure Callback URL

1. In PayU Merchant Dashboard, find **Callback URL** or **Postback URL** settings
2. Set it to your production callback:
   ```
   https://yourdomain.com/api/payu/callback
   ```
3. Save settings

This tells PayU where to POST payment results after each transaction.

---

## 2. Environment Variables

### 2.1 Required Variables

Set these in your hosting provider (Vercel Dashboard → Settings → Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYU_KEY` | PayU merchant key | `gtKFFx` |
| `PAYU_SALT` | PayU merchant salt (secret) | `eCwWEL5` |
| `PAYU_CALLBACK_URL` | Full callback URL (must be HTTPS) | `https://yourdomain.com/api/payu/callback` |

### 2.2 Vercel Setup

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Navigate to **Environment Variables**
3. Add each variable:

```
PAYU_KEY = gtKFFx
PAYU_SALT = eCwWEL5
PAYU_CALLBACK_URL = https://yourdomain.com/api/payu/callback
```

4. Select environment: **Production**, **Preview**, **Development** (or all)
5. Click **Save**

### 2.3 Redeploy

After adding environment variables, redeploy to apply:

```bash
vercel --prod
```

Or trigger via Vercel Dashboard → **Deployments** → **Create New Deployment**

---

## 3. Domain Configuration

### 3.1 Requirements

- Domain must have valid SSL certificate
- HTTPS is mandatory for PayU (they reject HTTP callbacks)
- Domain should resolve correctly via DNS

### 3.2 Vercel Custom Domain

1. Go to **Vercel Dashboard** → Project → **Settings** → **Domains**
2. Add your domain (e.g., `yourstore.com`)
3. Configure DNS as instructed by Vercel
4. Wait for SSL certificate provisioning

### 3.3 Verify Callback URL

Test that your callback is accessible:

```bash
curl -I https://yourdomain.com/api/payu/callback
```

Expected response: HTTP 405 (Method Not Allowed for GET, since it's POST only)

---

## 4. Code Configuration

### 4.1 No Code Changes Needed

The current implementation already handles production correctly:

```typescript
// src/actions/payment-actions.ts
const callbackUrl = PAYU_CALLBACK_URL;
if (!callbackUrl) {
  return { success: false, message: 'PAYU_CALLBACK_URL environment variable is required' };
}
```

### 4.2 Security Features

The callback handler includes:

- **Hash Verification**: Validates PayU's signature using SALT
- **Status Validation**: Ensures only valid status values are processed
- **Order Lookup**: Finds order by txnid or order ID

---

## 5. Production Checklist

### Before Going Live

- [ ] PayU production credentials obtained
- [ ] `PAYU_KEY` set in environment variables
- [ ] `PAYU_SALT` set in environment variables (secret)
- [ ] `PAYU_CALLBACK_URL` set (HTTPS, your domain)
- [ ] Callback URL configured in PayU merchant portal
- [ ] Custom domain configured and SSL active
- [ ] Redeployed application
- [ ] Test transaction with small amount

### Test Transaction

Before accepting real payments, test with a small transaction:

1. Use production PayU credentials
2. Make a test purchase (₹1-10)
3. Verify:
   - [ ] Order created in database
   - [ ] Payment status updated correctly
   - [ ] Success/failure page shown
   - [ ] Email confirmation sent (if configured)

---

## 6. Common Issues

### Issue: "Invalid Merchant Key"

**Cause**: Using test credentials in production or vice versa.

**Fix**: Ensure you're using production credentials from PayU dashboard, not test portal (`test.payu.in`).

### Issue: "Checksum Mismatch"

**Cause**: Hash calculation mismatch.

**Fix**: Verify `PAYU_SALT` matches exactly what's in PayU dashboard. No extra spaces or characters.

### Issue: "Callback URL Not Accessible"

**Cause**: Domain not configured or SSL not working.

**Fix**:
```bash
curl https://yourdomain.com/api/payu/callback
```
Should return a response (even 405 is fine).

### Issue: "Order Not Found"

**Cause**: `txnid` from PayU doesn't match any order.

**Fix**: Check that order was created before PayU payment. The `txnid` is derived from order ID's last 12 characters.

---

## 7. Monitoring & Logs

### Vercel Logs

```bash
vercel logs your-project --prod
```

### Key Log Messages to Watch

```
PayU callback: Hash mismatch!        # Possible attack attempt
PayU callback: Order XXX not found  # Configuration issue
PayU callback: Order updated to success  # Successful payment
```

### Database Verification

Check order status in database:

```sql
SELECT id, orderNumber, paymentStatus, status, payuTxnId, createdAt
FROM "Order"
WHERE "orderNumber" LIKE '%ORD%'
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 8. Production vs Test Differences

| Aspect | Test | Production |
|--------|------|------------|
| PayU Portal | test.payu.in | onboarding.payu.in |
| Credentials | Test merchant key/salt | Live merchant key/salt |
| Real Money | No | Yes |
| Callback URL | Can use ngrok | Must be real domain |
| Test Cards | 4012012012012012 | Same or real cards |

---

## 9. Going Live Checklist

- [ ] All environment variables configured
- [ ] Callback URL matches in code AND PayU portal
- [ ] Custom domain with SSL working
- [ ] Test transaction completed successfully
- [ ] Error handling verified (try a declined card)
- [ ] Payment confirmation email configured
- [ ] Refund process understood (in PayU portal)
- [ ] Support contact configured in PayU portal

---

## 10. Security Reminders

1. **Never commit `PAYU_SALT`** to git or any version control
2. **Use Vercel secrets** for all payment credentials
3. **Monitor logs** for hash mismatch errors (potential attacks)
4. **Implement webhooks** for payment status updates
5. **Set up alerts** for failed transactions

---

## Related Docs

- [Testing PayU on Localhost](./PAYU_TESTING.md) - How to test with ngrok
- [Checkout Flow](../checkout/page.tsx) - Payment implementation