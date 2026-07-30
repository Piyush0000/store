'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Phone, CheckCircle2, Truck, ChevronRight, Banknote, CreditCard, ShoppingBag, Lock, RefreshCw, ShieldCheck, PhoneCall, ArrowRight, ChevronDown } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useAnalytics } from '@/components/AnalyticsProvider';
import {
  sendOtp,
  verifyOtp,
  createSession,
  validateSession,
} from '@/actions/otp-actions';
import { getUserByPhone, createOrUpdateUser } from '@/actions/user-actions';
import { createAddress, createOrder, createCodOrder, getStorefrontCodFee, getStorefrontShippingFee } from '@/actions/order-actions';
import { initiatePayUPayment } from '@/actions/payment-actions';
import { validateCouponAction } from '@/actions/coupon-actions';
import './checkout.css';

const IndiaFlag = () => (
  <svg width="20" height="14" viewBox="0 0 30 20" className="checkout__flag">
    <rect width="30" height="20" fill="#FFF" />
    <rect width="30" height="6.67" fill="#FF9933" />
    <rect y="13.33" width="30" height="6.67" fill="#138808" />
    <circle cx="15" cy="10" r="2" fill="#000080" />
    <circle cx="15" cy="10" r="2" fill="none" stroke="#000080" strokeWidth="0.5" />
    <circle cx="15" cy="10" r="0.4" fill="#000080" />
  </svg>
);

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
  const { track } = useAnalytics();
  const { cartItems, clearCart, cartTotal } = useCart();
  const [codFee, setCodFee] = useState(0);
  const [shippingConfig, setShippingConfig] = useState({
    shippingFee: 0,
    freeShippingThreshold: 0,
    shippingLabel: 'Shipment Fee',
    enabled: true,
  });
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [step, setStep] = useState<Step>('identify');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
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
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<'COD' | 'PAYU' | null>(null);

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
  const [orderSummary, setOrderSummary] = useState<{
    items: typeof cartItems;
    subtotal: number;
    paymentMethod: string | null;
    discountAmount?: number;
    couponCode?: string | null;
  } | null>(null);

  // Coupon state variables
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const result = await validateCouponAction(couponInput, subtotal);
      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discount || 0);
      } else {
        setCouponError(result.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCouponError('Failed to validate coupon code. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
    setCouponError(null);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const bundleDiscountTotal = cartItems.reduce((acc, item) => acc + (item.type === 'BUNDLE' ? (item.discountAmount || 0) : 0) * item.quantity, 0);
  const displaySubtotal = cartItems.reduce((acc, item) => acc + (item.type === 'BUNDLE' ? (item.regularTotal || item.price) : item.price) * item.quantity, 0);
  const displayDiscountTotal = discountAmount + bundleDiscountTotal;

  useEffect(() => {
    getStorefrontCodFee().then(fee => setCodFee(fee));
    getStorefrontShippingFee().then(cfg => setShippingConfig(cfg));
  }, []);

  const effectiveShippingFee = (function() {
    if (!shippingConfig.enabled) return 0;
    const currentSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    if (shippingConfig.freeShippingThreshold > 0 && currentSubtotal >= shippingConfig.freeShippingThreshold) {
      return 0;
    }
    return shippingConfig.shippingFee;
  })();



  // Redirect to PayU Hosted Checkout (to avoid domain whitelisting issues)
  useEffect(() => {
    if (!payUData || !pendingOrderId) return;
    if (launchAttemptedRef.current) return;
    launchAttemptedRef.current = true;

    console.log('Redirecting to PayU Hosted Checkout...', payUData);

    const form = document.createElement('form');
    form.method = 'POST';

    // Use isSandbox flag from backend (based on PayU key) ÔÇö reliable for all environments
    const isSandbox = payUData.isSandbox === true;
    form.action = isSandbox
      ? 'https://test.payu.in/_payment' 
      : 'https://secure.payu.in/_payment';

    // Remove isSandbox from the fields we POST to PayU (PayU doesn't accept it)
    const { isSandbox: _ignored, ...payUFields } = payUData;

    // Append fields (excluding isSandbox which is internal-only)
    Object.entries(payUFields).forEach(([key, val]) => {
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
      storedDeviceId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('checkout_device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // Validate existing session
    const checkSession = async () => {
      const sessionResult = await validateSession();
      if (sessionResult.valid && sessionResult.phone) {
        setPhone(sessionResult.phone);
        setIsSessionVerified(true);
        const userResult = await getUserByPhone(sessionResult.phone);
        let isRecurring = false;
        if (userResult.success && userResult.data) {
          setUser(userResult.data);
          setUserId(userResult.data.id);
          const addresses = userResult.data.addresses || [];
          setSavedAddresses(addresses);
          if (userResult.data.firstName) setCustomerFirstName(userResult.data.firstName);
          if (userResult.data.lastName) setCustomerLastName(userResult.data.lastName);
          if (userResult.data.email) setCustomerEmail(userResult.data.email);
          if (addresses.length > 0) {
            const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
            if (userResult.data.firstName && userResult.data.lastName && userResult.data.email) {
              isRecurring = true;
            }
          }
        }
        if (isRecurring) {
          setStep('payment');
        } else {
          setStep('details');
        }
      } else {
        setStep('identify');
      }
    };
    checkSession();

    // Track InitiateCheckout event
    try {
      track('InitiateCheckout', {
        content_ids: cartItems.map(item => item.id),
        num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        value: cartTotal,
        currency: 'INR'
      });
    } catch (e) {
      console.warn('[Analytics] Failed to track InitiateCheckout:', e);
    }
  }, []);

  // Auto-apply coupon from URL query param
  const autoAppliedRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || autoAppliedRef.current || subtotal === 0) return;
    const params = new URLSearchParams(window.location.search);
    const urlCoupon = params.get('coupon');
    if (urlCoupon) {
      autoAppliedRef.current = true;
      setCouponInput(urlCoupon);
      setIsApplyingCoupon(true);
      setCouponError(null);
      validateCouponAction(urlCoupon, subtotal)
        .then((result) => {
          if (result.success && result.coupon) {
            setAppliedCoupon(result.coupon);
            setDiscountAmount(result.discount || 0);
          } else {
            setCouponError(result.message || 'Invalid coupon code');
          }
        })
        .catch(() => {
          setCouponError('Failed to validate coupon code. Please try again.');
        })
        .finally(() => {
          setIsApplyingCoupon(false);
        });
    }
  }, [subtotal]);

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

  const handleIdentifySubmit = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userResult = await getUserByPhone(phone);
      let hasAddress = false;
      if (userResult.success && userResult.data) {
        setUser(userResult.data);
        setUserId(userResult.data.id);
        const addresses = userResult.data.addresses || [];
        setSavedAddresses(addresses);
        if (userResult.data.firstName) setCustomerFirstName(userResult.data.firstName);
        if (userResult.data.lastName) setCustomerLastName(userResult.data.lastName);
        if (userResult.data.email) setCustomerEmail(userResult.data.email);
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
          setSelectedAddress(defaultAddr);
          hasAddress = true;
        }
      }
      if (hasAddress && customerFirstName && customerLastName && customerEmail) {
        setStep('payment');
      } else {
        setStep('details');
      }
    } catch (err: any) {
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalOrderClick = async (actionType: 'COD' | 'PAYU') => {
    if (isSessionVerified) {
      if (actionType === 'COD') {
        await handleCreateCodOrder();
      } else {
        await handleInitiatePayU();
      }
      return;
    }

    setPendingAction(actionType);
    setIsLoading(true);
    setError(null);
    setOtp(['', '', '', '']);
    try {
      const result = await sendOtp({ phone });
      if (result.success) {
        setSessionId((result as any).sessionId || null);
        setResendTimer(120);
        setIsOtpModalOpen(true);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalOtpVerify = async () => {
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
        setIsSessionVerified(true);
        setIsOtpModalOpen(false);

        if (pendingAction === 'COD') {
          await handleCreateCodOrder();
        } else if (pendingAction === 'PAYU') {
          await handleInitiatePayU();
        }
      } else {
        throw new Error(result.message || 'Invalid OTP code');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAddressForm(prev => ({ ...prev, pincode: pin }));

    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setAddressForm(prev => ({
            ...prev,
            city: postOffice.District || postOffice.Region || '',
            state: postOffice.State || ''
          }));
        }
      } catch (err) {
        console.error('Failed to fetch pincode details', err);
      }
    }
  };

  const handleContinueToPayment = async () => {
    setError(null);
    setFieldErrors({});

    if (!customerFirstName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!addressForm.flatHouse || !addressForm.areaStreet || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      setError('Please fill all delivery address fields');
      return;
    }

    setIsLoading(true);
    try {
      const parts = customerFirstName.trim().split(' ');
      const fName = parts[0];
      const lName = parts.slice(1).join(' ') || '';

      // De-duplicate: check if similar address already exists
      let existingAddr = savedAddresses.find(addr =>
        addr.flatHouse?.toLowerCase().trim() === addressForm.flatHouse.toLowerCase().trim() &&
        addr.areaStreet?.toLowerCase().trim() === addressForm.areaStreet.toLowerCase().trim() &&
        addr.city?.toLowerCase().trim() === addressForm.city.toLowerCase().trim() &&
        addr.state?.toLowerCase().trim() === addressForm.state.toLowerCase().trim() &&
        addr.pincode?.trim() === addressForm.pincode.trim()
      );

      // Ensure user exists with details
      let uid = userId;
      if (!uid) {
        const userResult = await createOrUpdateUser({
          phone,
          email: customerEmail || `${phone}@evoc.local`,
          firstName: fName,
          lastName: lName,
        });
        if (userResult.success && userResult.data) {
          uid = userResult.data.id;
          setUserId(uid);
          setUser(userResult.data);
        }
      } else {
        const result = await createOrUpdateUser({
          phone,
          email: customerEmail || `${phone}@evoc.local`,
          firstName: fName,
          lastName: lName,
        });
        if (result.success && result.data) {
          setUser(result.data);
        }
      }

      if (!uid) {
        throw new Error('Failed to create user');
      }

      if (existingAddr) {
        setSelectedAddress(existingAddr);
      } else {
        const result = await createAddress(uid, addressForm);
        if (result.success && result.data) {
          setSelectedAddress(result.data);
          setSavedAddresses(prev => [result.data, ...prev]);
        } else {
          throw new Error(result.message);
        }
      }
      
      setStep('payment');
      setIsEditingDetails(false);
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
      const orderItems: any[] = [];
      let totalBundleDiscount = 0;
      let totalRegularSubtotal = 0;

      cartItems.forEach((item) => {
        if (item.type === 'BUNDLE' && item.items) {
          const regularTotal = item.regularTotal || (item.items.reduce((sum, i) => sum + i.price, 0));
          const discountAmt = item.discountAmount || 0;
          totalBundleDiscount += discountAmt * item.quantity;
          totalRegularSubtotal += regularTotal * item.quantity;

          item.items.forEach((p) => {
            orderItems.push({
              productId: p.id,
              name: p.name,
              price: Number(p.price),
              quantity: item.quantity,
              image: p.image || '',
              variantId: undefined,
              variant: `Bundle: ${item.name}`,
            });
          });
        } else {
          totalRegularSubtotal += item.price * item.quantity;
          orderItems.push({
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: item.images?.[0] || '',
            variantId: item.variantId,
            variant: item.variants ? Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ') : undefined,
          });
        }
      });

      const overallDiscount = discountAmount + totalBundleDiscount;

      console.log('[Checkout] Creating COD order:', {
        itemCount: orderItems.length,
        calculatedSubtotal: totalRegularSubtotal,
        prices: orderItems.map(i => ({ name: i.name, price: i.price, qty: i.quantity }))
      });

      const result = await createCodOrder({
        userId: userId || `temp_${phone}`,
        items: orderItems,
        totalAmount: totalRegularSubtotal + codFee + effectiveShippingFee - overallDiscount,
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
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: overallDiscount || undefined,
      } as any);

      console.log('[Checkout] COD order result:', result);

      if (result.success && result.orderId) {
        console.log('[Checkout] Order success, setting orderSummary with subtotal:', totalRegularSubtotal);
        // Store order summary in a ref to preserve data even after state clears
        const capturedItems = [...cartItems];
        const capturedSubtotal = totalRegularSubtotal;
        const capturedDiscount = overallDiscount;
        const capturedCouponCode = appliedCoupon?.code || null;

        setOrderId(result.orderId);
        setOrderSummary({
          items: capturedItems,
          subtotal: capturedSubtotal,
          paymentMethod: 'COD',
          discountAmount: capturedDiscount,
          couponCode: capturedCouponCode,
        });

        // Log state after setOrderSummary
        console.log('[Checkout] After setOrderSummary, orderSummary:', { items: capturedItems.length, subtotal: capturedSubtotal });

        // Clear cart AFTER setting orderSummary
        clearCart();

        // Track Purchase event for Meta Pixel
        try {
          track('Purchase', {
            content_ids: capturedItems.map(item => item.id),
            value: capturedSubtotal,
            currency: 'INR',
            transaction_id: result.orderId,
            payment_method: 'COD'
          });
        } catch (e) {
          console.warn('[Analytics] Failed to track Purchase:', e);
        }

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

      const orderItems: any[] = [];
      let totalBundleDiscount = 0;
      let totalRegularSubtotal = 0;

      cartItems.forEach((item) => {
        if (item.type === 'BUNDLE' && item.items) {
          const regularTotal = item.regularTotal || (item.items.reduce((sum, i) => sum + i.price, 0));
          const discountAmt = item.discountAmount || 0;
          totalBundleDiscount += discountAmt * item.quantity;
          totalRegularSubtotal += regularTotal * item.quantity;

          item.items.forEach((p) => {
            orderItems.push({
              productId: p.id,
              name: p.name,
              price: Number(p.price),
              quantity: item.quantity,
              image: p.image || '',
              variantId: undefined,
              variant: `Bundle: ${item.name}`,
            });
          });
        } else {
          totalRegularSubtotal += item.price * item.quantity;
          orderItems.push({
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: item.images?.[0] || '',
            variantId: item.variantId,
            variant: item.variants ? Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ') : undefined,
          });
        }
      });

      const overallDiscount = discountAmount + totalBundleDiscount;

      const result = await createOrder({
        userId: uid,
        items: orderItems,
        totalAmount: totalRegularSubtotal + effectiveShippingFee - overallDiscount,
        subtotal: totalRegularSubtotal,
        tax: 0,
        shipping: effectiveShippingFee,
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
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: overallDiscount || undefined,
      });

      if (result.success && result.data) {
        setPendingOrderId(result.data.id);
      }

      const payUResult = await initiatePayUPayment({
        orderId: ordId,
        amount: totalRegularSubtotal - overallDiscount,
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

  const renderDetailsForm = () => {
    const isStepPayment = step === 'payment';
    return (
      <section className="checkout__section checkout__section--new-address">
        <div className="checkout__new-address-form">
          <div className="checkout__new-field">
            <input
              type="text"
              className="checkout__new-input"
              value={customerFirstName}
              onChange={(e) => setCustomerFirstName(e.target.value)}
              placeholder=" "
            />
            <label className="checkout__new-label">Full Name*</label>
          </div>

          <div className="checkout__new-field">
            <input
              type="text"
              className="checkout__new-input"
              value={addressForm.flatHouse}
              onChange={(e) => setAddressForm({ ...addressForm, flatHouse: e.target.value })}
              placeholder=" "
            />
            <label className="checkout__new-label">House No./ Building Name*</label>
          </div>

          <div className="checkout__new-field">
            <input
              type="text"
              className="checkout__new-input"
              value={addressForm.areaStreet}
              onChange={(e) => setAddressForm({ ...addressForm, areaStreet: e.target.value })}
              placeholder=" "
            />
            <label className="checkout__new-label">Road Name / Area / Colony*</label>
          </div>

          <div className="checkout__new-field">
            <input
              type="text"
              className="checkout__new-input"
              value={addressForm.pincode}
              onChange={handlePincodeChange}
              maxLength={6}
              placeholder=" "
            />
            <label className="checkout__new-label">Pincode*</label>
            {addressForm.pincode.length === 6 && addressForm.city && (
              <CheckCircle2 size={18} className="checkout__new-check" color="#10b981" fill="#d1fae5" />
            )}
          </div>

          <div className="checkout__new-row">
            <div className="checkout__new-field">
              <input
                type="text"
                className={`checkout__new-input ${addressForm.city ? 'checkout__new-input--readonly' : ''}`}
                value={addressForm.city}
                readOnly
                placeholder=" "
              />
              <label className="checkout__new-label">City*</label>
              {addressForm.city && (
                <CheckCircle2 size={18} className="checkout__new-check" color="#10b981" fill="#d1fae5" />
              )}
            </div>
            <div className="checkout__new-field">
              <input
                type="text"
                className={`checkout__new-input ${addressForm.state ? 'checkout__new-input--readonly' : ''}`}
                value={addressForm.state}
                readOnly
                placeholder=" "
              />
              <label className="checkout__new-label">State*</label>
              {addressForm.state && (
                <CheckCircle2 size={18} className="checkout__new-check" color="#10b981" fill="#d1fae5" />
              )}
            </div>
          </div>
        </div>

        {error && <span className="checkout__error" style={{ marginTop: '16px' }}>{error}</span>}

        <div className="checkout__mobile-sticky-bottom">
          <button className="checkout__continue-btn" onClick={handleContinueToPayment} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : isStepPayment ? 'CONFIRM DETAILS' : 'CONTINUE TO PAYMENT'} <ChevronRight size={18} />
          </button>

          <div className="checkout__powered-by-wrapper">
            <div className="checkout__powered-by">
              <span>Powered by</span>
              <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderDeliveryCapsule = () => {
    if (!selectedAddress) return null;
    const tagLabel = selectedAddress.type || 'HOME';

    return (
      <div className="checkout__delivery-capsule">
        <div className="checkout__delivery-capsule-header">
          <span className="checkout__delivery-capsule-title">Delivery details</span>
          <button
            type="button"
            className="checkout__delivery-capsule-change"
            onClick={() => setIsEditingDetails(true)}
          >
            Change
          </button>
        </div>
        <div className="checkout__delivery-capsule-content">
          <div className="checkout__delivery-capsule-name-row">
            <span className="checkout__delivery-capsule-name">
              {customerFirstName} {customerLastName}
            </span>
            <span className="checkout__delivery-capsule-tag">
              {tagLabel.charAt(0).toUpperCase() + tagLabel.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="checkout__delivery-capsule-address">
            {selectedAddress.flatHouse}, {selectedAddress.areaStreet}, {selectedAddress.city}, {selectedAddress.state}
          </p>
          <p className="checkout__delivery-capsule-pincode">
            {selectedAddress.pincode}
          </p>
          <div className="checkout__delivery-capsule-phone">
            <Phone size={14} className="checkout__delivery-capsule-phone-icon" />
            <span>{phone}</span>
          </div>
        </div>
      </div>
    );
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
          <span className="checkout__step-content">
            <span className="checkout__step-num">1.</span>
            <span className="checkout__step-label">Login &amp; Verification</span>
          </span>
        </div>
        <div className={`checkout__step ${isStepActive('details') ? 'active' : ''}`}>
          <span className="checkout__step-content">
            <span className="checkout__step-num">2.</span>
            <span className="checkout__step-label">Shipping</span>
          </span>
        </div>
        <div className={`checkout__step ${isStepActive('payment') ? 'active' : ''}`}>
          <span className="checkout__step-content">
            <span className="checkout__step-num">3.</span>
            <span className="checkout__step-label">Payment</span>
          </span>
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
              <div className="checkout__illustration-container">
                <img src="/otp-illustration.png" alt="Verify Phone" className="checkout__illustration" />
              </div>
              <h3 className="checkout__verification-title">Enter Your Mobile Number</h3>
              <p className="checkout__verification-desc">
                Provide your mobile number to begin checkout.<br />
                You&apos;ll verify via OTP at order confirmation.
              </p>

              <div className="checkout__verification-badges">
                <div className="checkout__badge-item">
                  <div className="checkout__badge-icon-wrapper">
                    <ShieldCheck size={16} className="checkout__badge-icon" />
                  </div>
                  <div className="checkout__badge-text">
                    <span>Seamless</span>
                    <span>Checkout</span>
                  </div>
                </div>
                <div className="checkout__badge-divider" />
                <div className="checkout__badge-item">
                  <div className="checkout__badge-icon-wrapper">
                    <PhoneCall size={16} className="checkout__badge-icon" />
                  </div>
                  <div className="checkout__badge-text">
                    <span>No Spam</span>
                    <span>Calls</span>
                  </div>
                </div>
                <div className="checkout__badge-divider" />
                <div className="checkout__badge-item">
                  <div className="checkout__badge-icon-wrapper">
                    <Lock size={16} className="checkout__badge-icon" />
                  </div>
                  <div className="checkout__badge-text">
                    <span>Verified</span>
                    <span>Delivery</span>
                  </div>
                </div>
              </div>

              <div className="checkout__phone-input-container">
                <div className="checkout__country-selector">
                  <IndiaFlag />
                  <span className="checkout__country-code">+91</span>
                  <ChevronDown size={14} className="checkout__caret" />
                </div>
                <div className="checkout__phone-divider" />
                <input
                  type="tel"
                  value={phone.length > 5 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  maxLength={11}
                  className="checkout__phone-field"
                />
              </div>
              {error && <span className="checkout__error" style={{ marginTop: '-16px', marginBottom: '16px' }}>{error}</span>}

              <button className="checkout__send-otp-btn" onClick={handleIdentifySubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'CONTINUE TO SHIPPING'} <ArrowRight size={18} />
              </button>
              <div className="checkout__powered-by-wrapper" style={{ marginTop: '20px' }}>
                <div className="checkout__powered-by">
                  <span className="checkout__powered-by-text">Powered by</span>
                  <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                </div>
              </div>
            </section>
          )}

          {step === 'verify' && (
            <section className="checkout__section checkout__section--sticky">
              <div className="checkout__illustration-container">
                <img src="/otp-illustration.png" alt="Verify Phone" className="checkout__illustration" />
              </div>
              <h3 className="checkout__verification-title">Verify Your Phone Number</h3>
              <p className="checkout__verification-desc">
                We&apos;ve sent a 4-digit code to +91 {phone.slice(0, 5)} {phone.slice(5)}
              </p>

              <div className="checkout__otp-inputs" style={{ margin: '24px 0 12px' }}>
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
              {error && <span className="checkout__error" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>{error}</span>}

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <button className="checkout__resend" onClick={handleIdentifySubmit} disabled={resendTimer > 0 || isLoading}>
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button className="checkout__send-otp-btn" onClick={handleFinalOtpVerify} disabled={isLoading || otp.join('').length !== 4}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'VERIFY & CONTINUE'} <ArrowRight size={18} />
              </button>
              <div className="checkout__powered-by-wrapper" style={{ marginTop: '20px' }}>
                <div className="checkout__powered-by">
                  <span className="checkout__powered-by-text">Powered by</span>
                  <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                </div>
              </div>
            </section>
          )}

          {step === 'details' && renderDetailsForm()}

          {step === 'payment' && (
            <>
              {isEditingDetails ? renderDetailsForm() : renderDeliveryCapsule()}

              <section className="checkout__section" style={{ marginTop: isEditingDetails ? '24px' : '0' }}>
                <div className="checkout__step-header">
                  <h2>PAYMENT METHOD</h2>
                </div>
                <p className="checkout__step-desc">Select your preferred way to pay</p>

              {paymentMethod === null && (
                <div className="checkout__payment-options">
                  <div className="checkout__payment-card" onClick={() => setPaymentMethod('COD')}>
                    <div className="checkout__payment-header">
                      <div className="checkout__payment-info-left">
                        <div className="checkout__payment-icon">
                          <Banknote size={24} />
                        </div>
                        <div>
                          <p className="checkout__payment-title">Cash on Delivery</p>
                          <p className="checkout__payment-note">+ Rs. {codFee} fee</p>
                        </div>
                      </div>
                      <button className="checkout__payment-select-btn" type="button">
                        Select <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="checkout__payment-card" onClick={() => setPaymentMethod('PAYU')}>
                    <div className="checkout__payment-header">
                      <div className="checkout__payment-info-left">
                        <div className="checkout__payment-icon">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <p className="checkout__payment-title">Online Payment</p>
                          <p className="checkout__payment-note">Cards, UPI, Net Banking</p>
                        </div>
                      </div>
                      <button className="checkout__payment-select-btn" type="button">
                        Select <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="checkout__payment-inline-wrapper">
                  <div className="checkout__payment-confirm">
                    <div className="checkout__cod-info">
                      <p>Pay with cash when your order arrives.</p>
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
                        <button className="checkout__place-order-btn" onClick={() => handleFinalOrderClick('COD')} disabled={isLoading}>
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : `CONFIRM ORDER - Ôé╣${(displaySubtotal + codFee - displayDiscountTotal).toLocaleString()}`}
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
                      <p className="checkout__secure-badge">­ƒöÆ 256-bit SSL Encrypted</p>
                    </div>
                    {error && <span className="checkout__error">{error}</span>}
                    <div className="checkout__payment-actions">
                      <button className="checkout__btn-secondary" onClick={() => setPaymentMethod(null)}>Choose Different Payment</button>
                      <button className="checkout__place-order-btn checkout__place-order-btn--online" onClick={() => handleFinalOrderClick('PAYU')} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : `PAY NOW - Ôé╣${(displaySubtotal - displayDiscountTotal).toLocaleString()}`}
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
            </>
          )}

          {isOtpModalOpen && (
            <div className="checkout__otp-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsOtpModalOpen(false); }}>
              <div className="checkout__otp-modal">
                <button className="checkout__otp-modal-close" onClick={() => setIsOtpModalOpen(false)} type="button">
                  ├ù
                </button>

                <div className="checkout__otp-modal-badge">
                  <ShieldCheck size={14} /> Security Verification
                </div>

                <h3 className="checkout__otp-modal-title">Authorize Your Order</h3>
                <p className="checkout__otp-modal-desc">
                  We&apos;ve sent a 4-digit security code to{' '}
                  <span className="checkout__otp-modal-phone">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                  <button
                    type="button"
                    className="checkout__otp-modal-change-phone"
                    onClick={() => { setIsOtpModalOpen(false); setStep('identify'); }}
                  >
                    Edit Number
                  </button>
                </p>

                <div className="checkout__otp-inputs" style={{ margin: '16px 0 16px' }}>
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

                {error && <span className="checkout__error" style={{ marginBottom: '12px', display: 'block', textAlign: 'center' }}>{error}</span>}

                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <button
                    className="checkout__resend"
                    onClick={() => handleFinalOrderClick(pendingAction || 'COD')}
                    disabled={resendTimer > 0 || isLoading}
                    type="button"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  className="checkout__send-otp-btn"
                  onClick={handleFinalOtpVerify}
                  disabled={isLoading || otp.join('').length !== 4}
                  type="button"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (pendingAction === 'PAYU' ? 'VERIFY & PAY NOW' : 'VERIFY & PLACE ORDER')}
                </button>

                <div className="checkout__powered-by-wrapper" style={{ marginTop: '16px' }}>
                  <div className="checkout__powered-by">
                    <span className="checkout__powered-by-text">Powered by</span>
                    <img src="/evoc-logo.png" alt="EvocLabs" className="checkout__evoc-logo" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`checkout__summary ${isSummaryOpen ? 'open' : ''}`}>
          <div className="checkout__summary-header" onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
            <h2 className="checkout__summary-title">ORDER SUMMARY</h2>
            <div className="checkout__summary-toggle">
              <span className="checkout__summary-toggle-price">Ôé╣{((orderSummary?.subtotal ?? subtotal) + ((orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') ? codFee : 0) + effectiveShippingFee - (orderSummary?.discountAmount ?? displayDiscountTotal)).toLocaleString('en-IN')}</span>
              <ChevronDown size={20} className="checkout__summary-toggle-icon" />
            </div>
          </div>

          <div className="checkout__summary-content-wrapper">
            <div className="checkout__summary-content">
              <div className="checkout__summary-items">
                {(orderSummary?.items || cartItems).map((item) => (
                  <div key={`${item.id}-${JSON.stringify(item.variants || {})}`} className="checkout__summary-item">
                    <div className="checkout__summary-item-image-wrapper">
                      <img src={item.images?.[0] || 'https://via.placeholder.com/60'} alt={item.name} />
                    </div>
                    <div className="checkout__summary-item-info">
                      <span className="checkout__summary-item-name">{item.name}</span>
                      {item.type === 'BUNDLE' && item.items && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: '1.3' }}>
                          {item.items.map((i: any) => (
                            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#94a3b8' }}>ÔÇó</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                {i.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.variants && Object.keys(item.variants).length > 0 ? (
                        <span className="checkout__summary-item-variant">
                          {Object.entries(item.variants)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </span>
                      ) : (item as any).selectedSize || (item as any).size ? (
                        <span className="checkout__summary-item-variant">
                          Size: {(item as any).selectedSize || (item as any).size}
                        </span>
                      ) : null}
                      <span className="checkout__summary-item-pricing">
                        {item.quantity} x Ôé╣{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon / Discount Input */}
              {step !== 'success' && (
                <div className="checkout__coupon-section">
                  <div className="checkout__coupon-input-wrapper">
                    <input
                      type="text"
                      placeholder="Discount Code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      disabled={isApplyingCoupon || appliedCoupon !== null}
                      className={`checkout__coupon-input ${couponError ? 'error' : ''}`}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="checkout__coupon-btn checkout__coupon-btn--remove"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="checkout__coupon-btn"
                      >
                        {isApplyingCoupon ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="checkout__coupon-error">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="checkout__coupon-success">
                      ­ƒÄë Code <strong>{appliedCoupon.code}</strong> applied! You saved Ôé╣{discountAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}
 
              <div className="checkout__summary-rows">
                <div className="checkout__summary-row"><span>Subtotal</span><span>Ôé╣{(orderSummary?.subtotal ?? displaySubtotal).toLocaleString('en-IN')}</span></div>
                {(orderSummary?.discountAmount ?? displayDiscountTotal) > 0 && (
                  <div className="checkout__summary-row checkout__summary-row--green">
                    <span>Discount {(orderSummary?.couponCode ?? appliedCoupon?.code) && `(${(orderSummary?.couponCode ?? appliedCoupon?.code)})`}</span>
                    <span>-Ôé╣{(orderSummary?.discountAmount ?? displayDiscountTotal).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {(orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') && <div className="checkout__summary-row"><span>COD Fee</span><span>Ôé╣{codFee}</span></div>}
                {effectiveShippingFee > 0 ? (
                  <div className="checkout__summary-row">
                    <span>{shippingConfig.shippingLabel || 'Shipment Fee'}</span>
                    <span>Ôé╣{effectiveShippingFee}</span>
                  </div>
                ) : (
                  <div className="checkout__summary-row checkout__summary-row--green"><span>Shipping</span><span>FREE</span></div>
                )}
              </div>
 
              {/* Free Shipping Banner */}
              {effectiveShippingFee === 0 && (
                <div className="checkout__free-shipping-banner">
                  <Truck size={16} className="checkout__free-shipping-icon" />
                  <span>Yay! You get FREE shipping ­ƒÑ│</span>
                </div>
              )}
 
              <div className="checkout__summary-divider" />
              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Total</span>
                <span className="checkout__summary-total-price">Ôé╣{Math.max(0, (orderSummary?.subtotal ?? displaySubtotal) + ((orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') ? codFee : 0) + effectiveShippingFee - (orderSummary?.discountAmount ?? displayDiscountTotal)).toLocaleString('en-IN')}</span>
              </div>

              <div className="checkout__summary-badges">
                <div className="checkout__summary-badge">
                  <Lock size={14} />
                  <span>Secure Payment</span>
                </div>
                <div className="checkout__summary-badge-divider" />
                <div className="checkout__summary-badge">
                  <ShieldCheck size={14} />
                  <span>100% Authentic</span>
                </div>
                <div className="checkout__summary-badge-divider" />
                <div className="checkout__summary-badge">
                  <RefreshCw size={14} />
                  <span>Easy Returns</span>
                </div>
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
      </div>
    </div>
  );
}
