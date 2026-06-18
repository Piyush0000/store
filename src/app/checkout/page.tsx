'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Phone, CheckCircle2, Truck, ChevronRight, Banknote, CreditCard, ShoppingBag, Lock, RefreshCw } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import {
  sendOtp,
  verifyOtp,
  createSession,
  validateSession,
} from '@/actions/otp-actions';
import { getUserByPhone, createOrUpdateUser } from '@/actions/user-actions';
import { createAddress, createOrder, createCodOrder } from '@/actions/order-actions';
import { initiatePayUPayment } from '@/actions/payment-actions';
import './checkout.css';

const COD_FEE = 40;

type Step = 'identify' | 'verify' | 'details' | 'payment' | 'success';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
  'Andaman & Nicobar Islands', 'Puducherry'
];

export default function CheckoutPage() {
  const { cartItems, clearCart, cartTotal } = useCart();
  const [step, setStep] = useState<Step>('identify');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deviceId, setDeviceId] = useState<string>('');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'HOME',
    flatHouse: '',
    areaStreet: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [payUData, setPayUData] = useState<any>(null);
  const launchAttemptedRef = useRef(false);
  const [orderSummary, setOrderSummary] = useState<{ items: typeof cartItems; subtotal: number; paymentMethod: string | null } | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Redirect to PayU Hosted Checkout (to avoid domain whitelisting issues)
  useEffect(() => {
    if (!payUData || !pendingOrderId) return;
    if (launchAttemptedRef.current) return;
    launchAttemptedRef.current = true;

    console.log('Redirecting to PayU Hosted Checkout...', payUData);

    const form = document.createElement('form');
    form.method = 'POST';

    // Set destination URL: PayU sandbox or production
    const isTestKey = payUData.key === 'IWqFlM' || process.env.NEXT_PUBLIC_PAYU_SANDBOX === 'true';
    form.action = isTestKey 
      ? 'https://test.payu.in/_payment' 
      : 'https://secure.payu.in/_payment';

    // Append fields
    Object.entries(payUData).forEach(([key, val]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(val);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    // Clean up state
    setPayUData(null);
    launchAttemptedRef.current = false;
  }, [payUData, pendingOrderId]);

  // Initialize device ID and validate session on mount
  const sessionChecked = useRef(false);

  useEffect(() => {
    if (sessionChecked.current) return;
    sessionChecked.current = true;

    // Get or create device ID
    let storedDeviceId = localStorage.getItem('checkout_device_id');
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem('checkout_device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // Validate existing session
    const checkSession = async () => {
      const sessionResult = await validateSession();
      if (sessionResult.valid && sessionResult.phone) {
        setPhone(sessionResult.phone);
        const userResult = await getUserByPhone(sessionResult.phone);
        if (userResult.success && userResult.data) {
          setUser(userResult.data);
          setUserId(userResult.data.id);
          setSavedAddresses(userResult.data.addresses || []);
          if (userResult.data.firstName) setCustomerFirstName(userResult.data.firstName);
          if (userResult.data.lastName) setCustomerLastName(userResult.data.lastName);
          if (userResult.data.email) setCustomerEmail(userResult.data.email);
          if (userResult.data.addresses?.length > 0) {
            const defaultAddr = userResult.data.addresses.find((a: any) => a.isDefault) || userResult.data.addresses[0];
            setSelectedAddress(defaultAddr);
          }
        }
        setStep('details');
      } else {
        setStep('identify');
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOtp(['', '', '', '']); // Reset OTP inputs
    try {
      const result = await sendOtp({ phone });
      if (result.success) {
        setSessionId((result as any).sessionId || null);
        setResendTimer(120);
        setStep('verify');
        // Focus first OTP input after step change
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (!otpCode || otpCode.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp({ phone, code: otpCode, sessionId: sessionId || undefined });
      if (result.success) {
        await createSession(phone, deviceId);

        // Get or create user
        const userResult = await getUserByPhone(phone);
        if (userResult.success && userResult.data) {
          setUser(userResult.data);
          setUserId(userResult.data.id);
          setSavedAddresses(userResult.data.addresses || []);
          if (userResult.data.firstName) setCustomerFirstName(userResult.data.firstName);
          if (userResult.data.lastName) setCustomerLastName(userResult.data.lastName);
          if (userResult.data.email) setCustomerEmail(userResult.data.email);
          if (userResult.data.addresses?.length > 0) {
            const defaultAddr = userResult.data.addresses.find((a: any) => a.isDefault) || userResult.data.addresses[0];
            setSelectedAddress(defaultAddr);
          }
        } else {
          const newUserResult = await createOrUpdateUser({ phone });
          if (newUserResult.success && newUserResult.data) {
            setUser(newUserResult.data);
            setUserId(newUserResult.data.id);
          }
        }
        setStep('details');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.flatHouse || !addressForm.areaStreet || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      setError('Please fill all address fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // De-duplicate: check if similar address already exists
      const isDuplicate = savedAddresses.some(addr =>
        addr.flatHouse?.toLowerCase().trim() === addressForm.flatHouse.toLowerCase().trim() &&
        addr.areaStreet?.toLowerCase().trim() === addressForm.areaStreet.toLowerCase().trim() &&
        addr.city?.toLowerCase().trim() === addressForm.city.toLowerCase().trim() &&
        addr.state?.toLowerCase().trim() === addressForm.state.toLowerCase().trim() &&
        addr.pincode?.trim() === addressForm.pincode.trim()
      );

      if (isDuplicate) {
        const existingAddr = savedAddresses.find(addr =>
          addr.flatHouse?.toLowerCase().trim() === addressForm.flatHouse.toLowerCase().trim() &&
          addr.areaStreet?.toLowerCase().trim() === addressForm.areaStreet.toLowerCase().trim() &&
          addr.city?.toLowerCase().trim() === addressForm.city.toLowerCase().trim() &&
          addr.state?.toLowerCase().trim() === addressForm.state.toLowerCase().trim() &&
          addr.pincode?.trim() === addressForm.pincode.trim()
        );
        setSelectedAddress(existingAddr);
        setShowAddressForm(false);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Ensure user exists first
      let uid = userId;
      if (!uid) {
        const userResult = await createOrUpdateUser({ phone });
        if (userResult.success && userResult.data) {
          uid = userResult.data.id;
          setUserId(uid);
          setUser(userResult.data);
        }
      }

      if (!uid) {
        throw new Error('Failed to create user');
      }

      const result = await createAddress(uid, addressForm);
      if (result.success && result.data) {
        setSelectedAddress(result.data);
        setSavedAddresses(prev => [result.data, ...prev]);
        setShowAddressForm(false);
        setAddressForm({ type: 'HOME', flatHouse: '', areaStreet: '', city: '', state: '', pincode: '', isDefault: true });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToPayment = async () => {
    setError(null);
    setFieldErrors({});

    if (!customerFirstName.trim()) {
      setFieldErrors((prev) => ({ ...prev, firstName: 'First name is required' }));
      return;
    }
    if (!customerLastName.trim()) {
      setFieldErrors((prev) => ({ ...prev, lastName: 'Last name is required' }));
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFieldErrors((prev) => ({ ...prev, email: 'Valid email is required' }));
      return;
    }
    if (!selectedAddress) {
      setError('Please select or add a delivery address');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure user exists with details
      let uid = userId;
      if (!uid) {
        const userResult = await createOrUpdateUser({
          phone,
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
        });
        if (userResult.success && userResult.data) {
          uid = userResult.data.id;
          setUserId(uid);
          setUser(userResult.data);
        }
      } else {
        // Update existing user
        const result = await createOrUpdateUser({
          phone,
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
        });
        if (result.success && result.data) {
          setUser(result.data);
        }
      }

      if (!uid) {
        throw new Error('Failed to create user');
      }

      setPaymentMethod(null); // Reset payment method when entering payment step
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCodOrder = async () => {
    setIsLoading(true);
    setError(null);

    // Validate cart has items
    if (!cartItems || cartItems.length === 0) {
      setError('Your cart is empty. Please add items before checkout.');
      setIsLoading(false);
      return;
    }

    // Validate prices
    const calculatedSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (calculatedSubtotal <= 0) {
      setError('Invalid cart total. Please refresh the page and try again.');
      setIsLoading(false);
      return;
    }

    // Log price issues for debugging
    const zeroPriceItems = cartItems.filter(item => item.price <= 0);
    if (zeroPriceItems.length > 0) {
      console.warn('[Checkout] Items with 0 or negative price:', zeroPriceItems.map(i => ({ id: i.id, name: i.name, price: i.price })));
    }

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.images?.[0] || '',
        variantId: item.variantId,
        variant: item.variants ? Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ') : undefined,
      }));

      console.log('[Checkout] Creating COD order:', {
        itemCount: orderItems.length,
        calculatedSubtotal,
        prices: orderItems.map(i => ({ name: i.name, price: i.price, qty: i.quantity }))
      });

      const result = await createCodOrder({
        userId: userId || `temp_${phone}`,
        items: orderItems,
        totalAmount: calculatedSubtotal + COD_FEE,
        firstName: customerFirstName,
        lastName: customerLastName,
        email: customerEmail,
        phone,
        shippingAddress: {
          flatHouse: selectedAddress?.flatHouse || '',
          areaStreet: selectedAddress?.areaStreet || '',
          city: selectedAddress?.city || '',
          state: selectedAddress?.state || '',
          pincode: selectedAddress?.pincode || '',
        },
      });

      console.log('[Checkout] COD order result:', result);

      if (result.success && result.orderId) {
        console.log('[Checkout] Order success, setting orderSummary with subtotal:', calculatedSubtotal);
        // Store order summary in a ref to preserve data even after state clears
        const capturedItems = [...cartItems];
        const capturedSubtotal = calculatedSubtotal;

        setOrderId(result.orderId);
        setOrderSummary({ items: capturedItems, subtotal: capturedSubtotal, paymentMethod: 'COD' });

        // Log state after setOrderSummary
        console.log('[Checkout] After setOrderSummary, orderSummary:', { items: capturedItems.length, subtotal: capturedSubtotal });

        // Clear cart AFTER setting orderSummary
        clearCart();

        // Change step last
        setStep('success');

        console.log('[Checkout] Step changed to success');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiatePayU = async () => {
    setIsLoading(true);
    setError(null);

    // Validate cart has items and valid prices
    if (!cartItems || cartItems.length === 0) {
      setError('Your cart is empty. Please add items before checkout.');
      setIsLoading(false);
      return;
    }

    const calculatedSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (calculatedSubtotal <= 0) {
      setError('Invalid cart total. Please refresh the page and try again.');
      setIsLoading(false);
      return;
    }

    try {
      const ordId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const txnId = ordId.slice(-12).toUpperCase();
      setPendingOrderId(ordId);

      let uid = userId;
      if (!uid) {
        const userResult = await createOrUpdateUser({
          phone,
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
        });
        if (userResult.success && userResult.data) {
          uid = userResult.data.id;
          setUserId(uid);
          setUser(userResult.data);
        }
      }

      if (!uid) {
        throw new Error('Failed to create user');
      }

      const result = await createOrder({
        userId: uid,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || '',
          variantId: item.variantId,
          variant: item.variants ? Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ') : undefined,
        })),
        totalAmount: calculatedSubtotal,
        subtotal: calculatedSubtotal,
        tax: 0,
        shipping: 0,
        paymentMethod: 'PAYU',
        firstName: customerFirstName,
        lastName: customerLastName,
        email: customerEmail,
        phone,
        shippingAddress: {
          flatHouse: selectedAddress?.flatHouse || '',
          areaStreet: selectedAddress?.areaStreet || '',
          city: selectedAddress?.city || '',
          state: selectedAddress?.state || '',
          pincode: selectedAddress?.pincode || '',
        },
        payuTxnId: txnId,
      });

      if (result.success && result.data) {
        setPendingOrderId(result.data.id);
      }

      const payUResult = await initiatePayUPayment({
        orderId: ordId,
        amount: subtotal,
        firstName: customerFirstName,
        email: customerEmail,
        phone: `+91${phone}`,
        productinfo: cartItems.length > 1 ? `${cartItems.length} items` : cartItems[0]?.name || 'Jewellery',
      });

      if (payUResult.success && payUResult.data) {
        // Store the data for the SDK to use
        setPayUData(payUResult.data);
      } else {
        throw new Error(payUResult.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 'success') {
    return (
      <div className="checkout">
        <h1 className="checkout__title">Checkout</h1>
        <div className="checkout__empty">
          <ShoppingBag size={64} className="checkout__empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Add some beautiful pieces to get started</p>
          <Link href="/catalogue" className="checkout__empty-btn">Browse Collection</Link>
        </div>
      </div>
    );
  }

  const isStepActive = (s: Step) => {
    const order: Step[] = ['identify', 'verify', 'details', 'payment', 'success'];
    return order.indexOf(step) >= order.indexOf(s);
  };

  return (
    <div className="checkout">
      <h1 className="checkout__title">CHECKOUT</h1>

      <div className="checkout__steps">
        <div className={`checkout__step ${isStepActive('identify') ? 'active' : ''}`}>
          <span className="checkout__step-num">1</span>
          <span>Login</span>
        </div>
        <div className="checkout__step-line" />
        <div className={`checkout__step ${isStepActive('details') ? 'active' : ''}`}>
          <span className="checkout__step-num">2</span>
          <span>Details</span>
        </div>
        <div className="checkout__step-line" />
        <div className={`checkout__step ${isStepActive('payment') ? 'active' : ''}`}>
          <span className="checkout__step-num">3</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="checkout__layout">
        <div className="checkout__form">
          {step === 'success' && orderSummary && (
            <section className="checkout__section">
              <CheckCircle2 size={64} className="checkout__success-icon" />
              <h2 className="checkout__success-heading">Order Confirmed!</h2>
              <p className="checkout__success-order">Order #{orderId?.split('-')[0]}</p>
              <p className="checkout__success-message">Your shipment is being packed and will ship to you soon.</p>
              <div className="checkout__success-delivery">
                <Truck size={18} />
                <span>{orderSummary.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
              </div>
              <Link href="/catalogue" className="checkout__continue-btn checkout__continue-btn--success">
                CONTINUE SHOPPING
              </Link>
            </section>
          )}

          {step === 'identify' && (
            <section className="checkout__section checkout__section--sticky">
              <div className="checkout__step-header">
                <Phone size={24} />
                <h2>VERIFY PHONE NUMBER</h2>
              </div>

              <div className="checkout__field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  className={error ? 'error' : ''}
                />
                {error && <span className="checkout__error">{error}</span>}
              </div>

              <button className="checkout__continue-btn" onClick={handleSendOtp} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'SEND OTP'} <ChevronRight size={18} />
              </button>
              <div className="checkout__powered-by-wrapper">
                <div className="checkout__powered-by">
                  <span className="checkout__powered-by-text">Powered by</span>
                  <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                </div>
              </div>
            </section>
          )}

          {step === 'verify' && (
            <section className="checkout__section checkout__section--sticky">
              <div className="checkout__step-header">
                <Phone size={24} />
                <h2>ENTER OTP</h2>
              </div>
              <p className="checkout__step-desc">We&apos;ve sent a code to +91 {phone}</p>

              <div className="checkout__otp-inputs">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    className={`checkout__otp-digit ${error ? 'error' : ''}`}
                  />
                ))}
              </div>
              {error && <span className="checkout__error">{error}</span>}

              <button className="checkout__resend" onClick={handleSendOtp} disabled={resendTimer > 0 || isLoading}>
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>

              <button className="checkout__continue-btn" onClick={handleVerifyOtp} disabled={isLoading || otp.join('').length !== 4}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'VERIFY & CONTINUE'} <ChevronRight size={18} />
              </button>
              <div className="checkout__powered-by-wrapper">
                <div className="checkout__powered-by">
                  <span className="checkout__powered-by-text">Powered by</span>
                  <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                </div>
              </div>
            </section>
          )}

          {step === 'details' && (
            <section className="checkout__section">
              <div className="checkout__step-header">
                <CheckCircle2 size={24} />
                <h2>YOUR DETAILS</h2>
                <span className="checkout__verified-badge">✓ Verified</span>
              </div>
              <p className="checkout__step-desc">We&apos;ll use this to contact you about your order</p>

              <div className="checkout__row">
                <div className="checkout__field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={customerFirstName}
                    onChange={(e) => {
                      setCustomerFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ''));
                      setFieldErrors((prev) => ({ ...prev, firstName: '' }));
                    }}
                    className={fieldErrors.firstName ? 'error' : ''}
                  />
                  {fieldErrors.firstName && <span className="checkout__error">{fieldErrors.firstName}</span>}
                </div>
                <div className="checkout__field">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={customerLastName}
                    onChange={(e) => {
                      setCustomerLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ''));
                      setFieldErrors((prev) => ({ ...prev, lastName: '' }));
                    }}
                    className={fieldErrors.lastName ? 'error' : ''}
                  />
                  {fieldErrors.lastName && <span className="checkout__error">{fieldErrors.lastName}</span>}
                </div>
              </div>

              <div className="checkout__field">
                <label>Email *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={fieldErrors.email ? 'error' : ''}
                />
                {fieldErrors.email && <span className="checkout__error">{fieldErrors.email}</span>}
              </div>

              <div className="checkout__address-section">
                <h3 className="checkout__address-title">DELIVERY ADDRESS</h3>

                {!showAddressForm && (
                  <button className="checkout__add-address-btn" onClick={() => setShowAddressForm(true)}>
                    + Add New Address
                  </button>
                )}

                {showAddressForm && (
                  <div className="checkout__address-form">
                    <div className="checkout__address-type-btns">
                      {['HOME', 'WORK', 'OTHER'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setAddressForm({ ...addressForm, type })}
                          className={`checkout__address-type-btn ${addressForm.type === type ? 'active' : ''}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="checkout__field">
                      <label>House/Flat/Building *</label>
                      <input type="text" value={addressForm.flatHouse} onChange={(e) => setAddressForm({ ...addressForm, flatHouse: e.target.value })} />
                    </div>

                    <div className="checkout__field">
                      <label>Street/Area/Landmark *</label>
                      <input type="text" value={addressForm.areaStreet} onChange={(e) => setAddressForm({ ...addressForm, areaStreet: e.target.value })} />
                    </div>

                    <div className="checkout__row checkout__row--3">
                      <div className="checkout__field">
                        <label>City *</label>
                        <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} />
                      </div>
                      <div className="checkout__field">
                        <label>State *</label>
                        <select value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}>
                          <option value="">Select</option>
                          {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="checkout__field">
                        <label>PIN Code *</label>
                        <input type="text" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} maxLength={6} />
                      </div>
                    </div>

                    <div className="checkout__address-form-actions">
                      <button className="checkout__btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>
                      <button className="checkout__btn-primary" onClick={handleSaveAddress} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Save Address'}
                      </button>
                    </div>
                  </div>
                )}

                {savedAddresses.length > 0 && (
                  <div className="checkout__saved-addresses">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`checkout__address-card ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedAddress(addr); setShowAddressForm(false); }}
                      >
                        <div className="checkout__address-card-header">
                          <span className="checkout__address-type">{addr.type}</span>
                          {addr.isDefault && <span className="checkout__address-default">Default</span>}
                          {selectedAddress?.id === addr.id && <CheckCircle2 size={14} className="checkout__address-check" />}
                        </div>
                        <p className="checkout__address-detail">{addr.flatHouse}</p>
                        <p className="checkout__address-detail">{addr.areaStreet}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <span className="checkout__error">{error}</span>}

              <div className="checkout__mobile-sticky-bottom">
                <button className="checkout__continue-btn" onClick={handleContinueToPayment} disabled={isLoading || !selectedAddress}>
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'CONTINUE TO PAYMENT'} <ChevronRight size={18} />
                </button>

                <div className="checkout__powered-by-wrapper">
                  <div className="checkout__powered-by">
                    <span>Powered by</span>
                    <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 'payment' && (
            <section className="checkout__section">
              <div className="checkout__step-header">
                <h2>PAYMENT METHOD</h2>
              </div>
              <p className="checkout__step-desc">Select your preferred way to pay</p>

              {paymentMethod === null && (
                <div className="checkout__payment-options">
                  <div className="checkout__payment-card" onClick={() => setPaymentMethod('COD')}>
                    <div className="checkout__payment-header">
                      <div className="checkout__payment-icon">
                        <Banknote size={24} />
                      </div>
                      <div>
                        <p className="checkout__payment-title">Cash on Delivery</p>
                        <p className="checkout__payment-note">+ Rs. {COD_FEE} fee</p>
                      </div>
                    </div>
                  </div>

                  <div className="checkout__payment-card" onClick={() => setPaymentMethod('PAYU')}>
                    <div className="checkout__payment-header">
                      <div className="checkout__payment-icon">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <p className="checkout__payment-title">Online Payment</p>
                        <p className="checkout__payment-note">Cards, UPI, Net Banking</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="checkout__payment-inline-wrapper">
                  <div className="checkout__payment-confirm">
                    <div className="checkout__cod-info">
                      <p>Pay with cash when your order arrives.</p>
                      <p className="checkout__cod-fee">A fee of Rs. {COD_FEE} applies.</p>
                    </div>
                    {error && <span className="checkout__error">{error}</span>}
                    {error && (error.includes('Unable to verify') || error.includes('stock')) ? (
                      <div className="checkout__payment-actions">
                        <Link href="/catalogue" className="checkout__btn-secondary">
                          Go Back to Shop
                        </Link>
                        <button className="checkout__btn-secondary" onClick={() => { setPaymentMethod(null); setError(null); }}>
                          Choose Different Payment
                        </button>
                      </div>
                    ) : (
                      <div className="checkout__payment-actions">
                        <button className="checkout__btn-secondary" onClick={() => setPaymentMethod(null)}>Choose Different Payment</button>
                        <button className="checkout__place-order-btn" onClick={handleCreateCodOrder} disabled={isLoading}>
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : `CONFIRM ORDER - ₹${(subtotal + COD_FEE).toLocaleString()}`}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="checkout__powered-by-wrapper" style={{ marginTop: '24px' }}>
                    <div className="checkout__powered-by">
                      <span>Powered by</span>
                      <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'PAYU' && !payUData && (
                <div className="checkout__payment-inline-wrapper">
                  <div className="checkout__payment-confirm">
                    <div className="checkout__online-info">
                      <p>Pay securely via PayU.</p>
                      <p className="checkout__secure-badge">🔒 256-bit SSL Encrypted</p>
                    </div>
                    {error && <span className="checkout__error">{error}</span>}
                    <div className="checkout__payment-actions">
                      <button className="checkout__btn-secondary" onClick={() => setPaymentMethod(null)}>Choose Different Payment</button>
                      <button className="checkout__place-order-btn checkout__place-order-btn--online" onClick={handleInitiatePayU} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : `PAY NOW - ₹${subtotal.toLocaleString()}`}
                      </button>
                    </div>
                  </div>
                  <div className="checkout__powered-by-wrapper" style={{ marginTop: '24px' }}>
                    <div className="checkout__powered-by">
                      <span>Powered by</span>
                      <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="checkout__summary">
          <h2 className="checkout__summary-title">ORDER SUMMARY</h2>

          <div className="checkout__summary-items">
            {(orderSummary?.items || cartItems).map((item) => (
              <div key={`${item.id}-${JSON.stringify(item.variants || {})}`} className="checkout__summary-item">
                <img src={item.images?.[0] || 'https://via.placeholder.com/60'} alt={item.name} />
                <div className="checkout__summary-item-info">
                  <span className="checkout__summary-item-name">{item.name}</span>
                  <span className="checkout__summary-item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="checkout__summary-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="checkout__summary-rows">
            <div className="checkout__summary-row"><span>Subtotal</span><span>₹{(orderSummary?.subtotal ?? subtotal).toLocaleString('en-IN')}</span></div>
            {(orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') && <div className="checkout__summary-row"><span>COD Fee</span><span>₹{COD_FEE}</span></div>}
            <div className="checkout__summary-row checkout__summary-row--green"><span>Shipping</span><span>FREE</span></div>
          </div>

          <div className="checkout__summary-divider" />
          <div className="checkout__summary-row checkout__summary-row--total">
            <span>Total</span>
            <span className="checkout__summary-total-price">₹{((orderSummary?.subtotal ?? subtotal) + ((orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') ? COD_FEE : 0)).toLocaleString('en-IN')}</span>
          </div>

          <div className="checkout__summary-badges">
            <span><Lock size={14} /> Secure Payment</span>
            <span><CheckCircle2 size={14} /> 100% Authentic</span>
            <span><RefreshCw size={14} /> Easy Returns</span>
          </div>

          <div className="checkout__powered-by-wrapper">
            <div className="checkout__powered-by">
              <span>Powered by</span>
              <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}