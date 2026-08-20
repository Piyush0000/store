"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  Phone,
  ShieldCheck,
  PhoneCall,
  Lock,
  ChevronDown,
  ChevronRight,
  Loader2,
  Banknote,
  CreditCard,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useAnalytics } from "@/components/AnalyticsProvider";
import { sendOtp, verifyOtp, createSession, validateSession } from "@/actions/otp-actions";
import { getUserByPhone, createOrUpdateUser } from "@/actions/user-actions";
import {
  createAddress,
  createOrder,
  createCodOrder,
} from "@/actions/order-actions";
import { initiatePayUPayment } from "@/actions/payment-actions";
import { validateCouponAction } from "@/actions/coupon-actions";
import { getInitialCheckoutState } from "@/actions/checkout-actions";
import OtpStep from "@/components/OtpStep";
import DetailsForm from "@/components/DetailsForm";
import AddressSection from "@/components/AddressSection";
import PaymentStep from "@/components/PaymentStep";
import OrderSummary from "@/components/OrderSummary";
import "./checkout.css";

const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const SuccessStep = dynamic(() => import("@/components/SuccessStep"), {
  ssr: false,
});

const IndiaFlag = () => (
  <svg width="20" height="14" viewBox="0 0 900 600" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="900" height="200" fill="#FF9933" />
    <rect y="200" width="900" height="200" fill="#FFFFFF" />
    <rect y="400" width="900" height="200" fill="#128807" />
    <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="10" />
  </svg>
);

type Step = "identify" | "verify" | "details" | "payment" | "success";

const isStepActive = (step: Step, s: Step) => {
  const order: Step[] = ["identify", "verify", "details", "payment", "success"];
  return order.indexOf(step) >= order.indexOf(s);
};

export default function CheckoutPage() {
  const { track } = useAnalytics();
  const { cartItems: contextCartItems, clearCart: contextClearCart, cartTotal: contextCartTotal, isHydrated } = useCart();
  const [buyNowItems, setBuyNowItems] = useState<any[] | null>(null);
  const [buyNowChecked, setBuyNowChecked] = useState(false);

  const cartItems = buyNowItems || contextCartItems;
  const cartTotal = buyNowItems ? buyNowItems.reduce((acc, item) => acc + item.price * item.quantity, 0) : contextCartTotal;
  
  const clearCart = useCallback(() => {
    if (buyNowItems) {
      sessionStorage.removeItem("buyNowItem");
      setBuyNowItems(null);
    } else {
      contextClearCart();
    }
  }, [buyNowItems, contextClearCart]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("buyNow") === "true") {
      const item = sessionStorage.getItem("buyNowItem");
      if (item) {
        try {
          setBuyNowItems([JSON.parse(item)]);
        } catch (e) {
          console.error("Failed to parse buyNowItem", e);
        }
      }
    }
    setBuyNowChecked(true);
  }, []);
  const [codFee, setCodFee] = useState(0);
  const [onlineDiscountPercent, setOnlineDiscountPercent] = useState(0);
  const [shippingConfig, setShippingConfig] = useState({
    shippingFee: 0,
    freeShippingThreshold: 0,
    shippingLabel: "Shipment Fee",
    enabled: true,
  });
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [step, setStep] = useState<Step>("identify");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deviceId, setDeviceId] = useState<string>("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<'COD' | 'PAYU' | null>(null);

  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: "HOME",
    flatHouse: "",
    areaStreet: "",
    city: "",
    state: "",
    pincode: "",
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
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  );

  const bundleDiscountTotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) =>
          acc +
          (item.type === "BUNDLE" ? item.discountAmount || 0 : 0) *
          item.quantity,
        0,
      ),
    [cartItems],
  );

  const displaySubtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) =>
          acc +
          (item.type === "BUNDLE"
            ? item.regularTotal || item.price
            : item.price) *
          item.quantity,
        0,
      ),
    [cartItems],
  );
  const onlineDiscountAmount = paymentMethod === 'PAYU' ? Math.round(displaySubtotal * (onlineDiscountPercent / 100)) : 0;
  
  const displayDiscountTotal = discountAmount + bundleDiscountTotal + onlineDiscountAmount;
  

  const effectiveShippingFee = useMemo(() => {
    if (!shippingConfig.enabled) return 0;
    if (
      shippingConfig.freeShippingThreshold > 0 &&
      subtotal >= shippingConfig.freeShippingThreshold
    )
      return 0;
    return shippingConfig.shippingFee;
  }, [shippingConfig, subtotal]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const result = await validateCouponAction(couponInput, subtotal);
      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discount || 0);
      } else {
        setCouponError(result.message || "Invalid coupon code");
      }
    } catch (err: any) {
      setCouponError("Failed to validate coupon code. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponInput, subtotal]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput("");
    setCouponError(null);
  }, []);

  // Redirect to PayU Hosted Checkout (to avoid domain whitelisting issues)
  useEffect(() => {
    if (!payUData || !pendingOrderId) return;
    if (launchAttemptedRef.current) return;
    launchAttemptedRef.current = true;

    console.log("Redirecting to PayU Hosted Checkout...", payUData);

    const form = document.createElement("form");
    form.method = "POST";

    // Use isSandbox flag from backend (based on PayU key) — reliable for all environments
    const isSandbox = payUData.isSandbox === true;
    form.action = isSandbox
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment";

    // Remove isSandbox from the fields we POST to PayU (PayU doesn't accept it)
    const { isSandbox: _ignored, ...payUFields } = payUData;

    // Append fields (excluding isSandbox which is internal-only)
    Object.entries(payUFields).forEach(([key, val]) => {
      const input = document.createElement("input");
      input.type = "hidden";
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

  // Initialize device ID, fetch initial checkout data, and set step in single pass
  const sessionChecked = useRef(false);

  useEffect(() => {
    if (sessionChecked.current) return;
    sessionChecked.current = true;

    // Get or create device ID
    let storedDeviceId = localStorage.getItem("checkout_device_id");
    if (!storedDeviceId) {
      storedDeviceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("checkout_device_id", storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // Validate existing session and fetch storefront settings
    const checkSession = async () => {
      try {
        const initialState = await getInitialCheckoutState();
        
        if (initialState.shippingConfig) {
          setShippingConfig(initialState.shippingConfig);
        }
        if (initialState.codFee !== undefined) {
          setCodFee(initialState.codFee);
        }
        if ((initialState as any).onlineDiscountPercent !== undefined) {
          setOnlineDiscountPercent((initialState as any).onlineDiscountPercent);
        }
        if (initialState.sessionValid && initialState.phone) {
          setPhone(initialState.phone);
          if (initialState.user) {
            setUser(initialState.user);
            setUserId(initialState.user.id);
            setSavedAddresses(initialState.savedAddresses || []);
            if (initialState.customerFirstName) setCustomerFirstName(initialState.customerFirstName);
            if (initialState.customerLastName) setCustomerLastName(initialState.customerLastName);
            if (initialState.customerEmail) setCustomerEmail(initialState.customerEmail);
            
            if (initialState.savedAddresses && initialState.savedAddresses.length > 0) {
              const defaultAddr = initialState.savedAddresses.find((a: any) => a.isDefault) || initialState.savedAddresses[0];
              setSelectedAddress(defaultAddr);
            }
          }
          setStep(initialState.initialStep);
        } else {
          setStep("identify");
        }
      } catch (err) {
        console.error("Failed to load checkout state:", err);
        setStep("identify");
      }
    };
    checkSession();

    // Track InitiateCheckout event
    try {
      track("InitiateCheckout", {
        content_ids: cartItems.map((item) => item.id),
        num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        value: cartTotal,
        currency: "INR",
      });
    } catch (e) {
      console.warn("[Analytics] Failed to track InitiateCheckout:", e);
    }
  }, []);

  // Auto-apply coupon from URL query param — fires once on mount only
  const autoAppliedRef = useRef(false);
  const subtotalRef = useRef(subtotal);
  subtotalRef.current = subtotal;
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoAppliedRef.current || subtotalRef.current === 0) return;
    const params = new URLSearchParams(window.location.search);
    const urlCoupon = params.get("coupon");
    if (urlCoupon) {
      autoAppliedRef.current = true;
      setCouponInput(urlCoupon);
      setIsApplyingCoupon(true);
      setCouponError(null);
      validateCouponAction(urlCoupon, subtotalRef.current)
        .then((result) => {
          if (result.success && result.coupon) {
            setAppliedCoupon(result.coupon);
            setDiscountAmount(result.discount || 0);
          } else {
            setCouponError(result.message || "Invalid coupon code");
          }
        })
        .catch(() => {
          setCouponError("Failed to validate coupon code. Please try again.");
        })
        .finally(() => {
          setIsApplyingCoupon(false);
        });
    }
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resendTimer > 0]);

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, "").slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      // Auto-focus next input
      if (digit && index < 3) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
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

  const handleIdentifySubmit = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userResult = await getUserByPhone(phone);
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
        }
      }
      setStep('details');
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
        } else {
          const newUserResult = await createOrUpdateUser({ phone });
          if (newUserResult.success && newUserResult.data) {
            setUser(newUserResult.data);
            setUserId(newUserResult.data.id);
          }
        }
        if (isRecurring) {
          setStep('payment');
        } else {
          setStep('details');
        }
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

  const handleContinueToPayment = useCallback(async () => {
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
  }, [
    customerFirstName,
    addressForm,
    savedAddresses,
    userId,
    phone,
    customerEmail,
  ]);

  // Shared helper: maps cartItems → order items array + totals
  const buildOrderItems = useCallback(() => {
    const orderItems: any[] = [];
    let totalBundleDiscount = 0;
    let totalRegularSubtotal = 0;

    cartItems.forEach((item) => {
      if (item.type === "BUNDLE" && item.items) {
        const regularTotal =
          item.regularTotal || item.items.reduce((sum: number, i: any) => sum + (i.price || 0), 0);
        const discountAmt = item.discountAmount || 0;
        totalBundleDiscount += discountAmt * item.quantity;
        totalRegularSubtotal += regularTotal * item.quantity;

        item.items.forEach((p: any) => {
          orderItems.push({
            productId: p.id,
            name: p.name,
            price: Number(p.price),
            quantity: item.quantity,
            image: p.image || "",
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
          image: item.images?.[0] || "",
          variantId: item.variantId,
          variant: item.variants
            ? Object.entries(item.variants)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
            : undefined,
        });
      }
    });

    return { orderItems, totalBundleDiscount, totalRegularSubtotal };
  }, [cartItems]);

  const handleCreateCodOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Validate cart has items
    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty. Please add items before checkout.");
      setIsLoading(false);
      return;
    }

    // Validate prices
    if (subtotal <= 0) {
      setError("Invalid cart total. Please refresh the page and try again.");
      setIsLoading(false);
      return;
    }

    // Log price issues for debugging
    if (process.env.NODE_ENV === "development") {
      const zeroPriceItems = cartItems.filter((item) => item.price <= 0);
      if (zeroPriceItems.length > 0) {
        console.warn(
          "[Checkout] Items with 0 or negative price:",
          zeroPriceItems.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
          })),
        );
      }
    }

    try {
      const { orderItems, totalBundleDiscount, totalRegularSubtotal } =
        buildOrderItems();

      const overallDiscount = discountAmount + totalBundleDiscount;

      if (process.env.NODE_ENV === "development") {
        console.log("[Checkout] Creating COD order:", {
          itemCount: orderItems.length,
          calculatedSubtotal: totalRegularSubtotal,
          prices: orderItems.map((i) => ({
            name: i.name,
            price: i.price,
            qty: i.quantity,
          })),
        });
      }

      const result = await createCodOrder({
        userId: userId || `temp_${phone}`,
        items: orderItems,
        totalAmount:
          totalRegularSubtotal +
          codFee +
          effectiveShippingFee -
          overallDiscount,
        firstName: customerFirstName,
        lastName: customerLastName,
        email: customerEmail,
        phone,
        shippingAddress: {
          flatHouse: selectedAddress?.flatHouse || "",
          areaStreet: selectedAddress?.areaStreet || "",
          city: selectedAddress?.city || "",
          state: selectedAddress?.state || "",
          pincode: selectedAddress?.pincode || "",
        },
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: overallDiscount || undefined,
      } as any);

      if (process.env.NODE_ENV === "development") {
        console.log("[Checkout] COD order result:", result);
      }

      if (result.success && result.orderId) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[Checkout] Order success, setting orderSummary with subtotal:",
            totalRegularSubtotal,
          );
        }
        // Store order summary in a ref to preserve data even after state clears
        const capturedItems = [...cartItems];
        const capturedSubtotal = totalRegularSubtotal;
        const capturedDiscount = overallDiscount;
        const capturedCouponCode = appliedCoupon?.code || null;

        setOrderId(result.orderId);
        setOrderSummary({
          items: capturedItems,
          subtotal: capturedSubtotal,
          paymentMethod: "COD",
          discountAmount: capturedDiscount,
          couponCode: capturedCouponCode,
        });

        if (process.env.NODE_ENV === "development") {
          console.log("[Checkout] After setOrderSummary, orderSummary:", {
            items: capturedItems.length,
            subtotal: capturedSubtotal,
          });
        }

        // Clear cart AFTER setting orderSummary
        clearCart();

        // Track Purchase event for Meta Pixel
        try {
          track("Purchase", {
            content_ids: capturedItems.map((item) => item.id),
            value: capturedSubtotal,
            currency: "INR",
            transaction_id: result.orderId,
            payment_method: "COD",
          });
        } catch (e) {
          console.warn("[Analytics] Failed to track Purchase:", e);
        }

        // Change step last
        setStep("success");

        if (process.env.NODE_ENV === "development") {
          console.log("[Checkout] Step changed to success");
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    cartItems,
    subtotal,
    buildOrderItems,
    discountAmount,
    phone,
    codFee,
    effectiveShippingFee,
    customerFirstName,
    customerLastName,
    customerEmail,
    selectedAddress,
    appliedCoupon,
    userId,
    clearCart,
    track,
  ]);

  const handleInitiatePayU = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Validate cart has items and valid prices
    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty. Please add items before checkout.");
      setIsLoading(false);
      return;
    }

    if (subtotal <= 0) {
      setError("Invalid cart total. Please refresh the page and try again.");
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
        throw new Error("Failed to create user");
      }

      const { orderItems, totalBundleDiscount, totalRegularSubtotal } =
        buildOrderItems();

      const overallDiscount = discountAmount + totalBundleDiscount;

      const result = await createOrder({
        userId: uid,
        items: orderItems,
        totalAmount:
          totalRegularSubtotal + effectiveShippingFee - overallDiscount,
        subtotal: totalRegularSubtotal,
        tax: 0,
        shipping: effectiveShippingFee,
        paymentMethod: "PAYU",
        firstName: customerFirstName,
        lastName: customerLastName,
        email: customerEmail,
        phone,
        shippingAddress: {
          flatHouse: selectedAddress?.flatHouse || "",
          areaStreet: selectedAddress?.areaStreet || "",
          city: selectedAddress?.city || "",
          state: selectedAddress?.state || "",
          pincode: selectedAddress?.pincode || "",
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
        productinfo:
          cartItems.length > 1
            ? `${cartItems.length} items`
            : cartItems[0]?.name || "Jewellery",
      });

      if (payUResult.success && payUResult.data) {
        // Store the data for the SDK to use
        setPayUData(payUResult.data);
      } else {
        throw new Error(payUResult.message || "Failed to initiate payment");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    cartItems,
    subtotal,
    discountAmount,
    effectiveShippingFee,
    customerFirstName,
    customerLastName,
    customerEmail,
    selectedAddress,
    appliedCoupon,
  ]);

  const handleFinalOrderClick = async (action: 'COD' | 'PAYU') => {
    setPendingAction(action);
    if (isSessionVerified) {
      if (action === 'COD') {
        handleCreateCodOrder();
      } else {
        handleInitiatePayU();
      }
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await sendOtp({ phone });
      if (res.success) {
        if (res.sessionId) setSessionId(res.sessionId);
        setIsOtpModalOpen(true);
        setResendTimer(30);
      } else {
        setError(res.message || 'Failed to send verification code');
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
      setError('Please enter the 4-digit verification code');
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
        setError(result.message || 'Invalid OTP code');
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

  if (!buyNowChecked || !isHydrated) {
    return (
      <div className="checkout">
        <h1 className="checkout__title">Checkout</h1>
      </div>
    );
  }

  if (cartItems.length === 0 && step !== "success") {
    return (
      <div className="checkout">
        <h1 className="checkout__title">Checkout</h1>
        <div className="checkout__empty">
          <ShoppingBag size={64} className="checkout__empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Add some beautiful pieces to get started</p>
          <Link href="/catalogue" className="checkout__empty-btn">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <link
        rel="preload"
        href="/otp-illustration.webp"
        as="image"
        type="image/webp"
        fetchPriority="high"
      />
      <h1 className="checkout__title">Checkout</h1>

      <div className="checkout__steps">
        <div className={`checkout__step ${isStepActive(step, 'identify') ? 'active' : ''}`}>
          <span className="checkout__step-content">
            <span className="checkout__step-num">1.</span>
            <span className="checkout__step-label">Login &amp; Verification</span>
          </span>
        </div>
        <div className={`checkout__step ${isStepActive(step, 'details') ? 'active' : ''}`}>
          <span className="checkout__step-content">
            <span className="checkout__step-num">2.</span>
            <span className="checkout__step-label">Shipping</span>
          </span>
        </div>
        <div className={`checkout__step ${isStepActive(step, 'payment') ? 'active' : ''}`}>
          <span className="checkout__step-content">
            <span className="checkout__step-num">3.</span>
            <span className="checkout__step-label">Payment</span>
          </span>
        </div>
      </div>

      <div className="checkout__layout">
        <div className="checkout__form">
          {step === "success" && orderSummary && (
            <SuccessStep
              orderId={orderId}
              paymentMethod={orderSummary.paymentMethod}
            />
          )}

          {step === 'identify' && (
            <section className="checkout__section checkout__section--sticky">
              <div className="checkout__illustration-container">
                <img src="/otp-illustration.webp" alt="Verify Phone" className="checkout__illustration" />
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
                    <span>Secure</span>
                    <span>Verification</span>
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
                    <span>OTP Required for</span>
                    <span>Delivery Updates</span>
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
                <img src="/otp-illustration.webp" alt="Verify Phone" className="checkout__illustration" />
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
                <button className="checkout__resend" onClick={handleSendOtp} disabled={resendTimer > 0 || isLoading}>
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button className="checkout__send-otp-btn" onClick={handleVerifyOtp} disabled={isLoading || otp.join('').length !== 4}>
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

          {step === "payment" && (
            <>
              {isEditingDetails ? renderDetailsForm() : renderDeliveryCapsule()}

              <section className="checkout__section" style={{ marginTop: isEditingDetails ? '24px' : '0' }}>
                <div className="checkout__step-header">
                  <h2>PAYMENT METHOD</h2>
                </div>
                <p className="checkout__step-desc">Select your preferred way to pay</p>

                {paymentMethod === null && (
                  <div className="checkout__payment-options">
                    <div className="checkout__payment-card" onClick={() => handleFinalOrderClick('COD')}>
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
                            <img src="/upi-icons.png" alt="Cards, UPI, Net Banking" style={{ height: '80px', width: 'auto', marginTop: '6px' }} />
                            {onlineDiscountPercent > 0 && (
                              <p className="checkout__payment-note" style={{ color: '#16a34a', fontWeight: 600 }}>
                                🎉 {onlineDiscountPercent}% off
                              </p>
                            )}
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
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : `CONFIRM ORDER - ₹${(displaySubtotal + codFee - displayDiscountTotal).toLocaleString()}`}
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
                        {onlineDiscountPercent > 0 && (
                          <p className="checkout__coupon-success">
                            🎉 {onlineDiscountPercent}% off applied for online payment!
                          </p>
                        )}
                      </div>
                      {error && <span className="checkout__error">{error}</span>}
                      <div className="checkout__payment-actions">
                        <button className="checkout__btn-secondary" onClick={() => setPaymentMethod(null)}>Choose Different Payment</button>
                        <button className="checkout__place-order-btn checkout__place-order-btn--online" onClick={() => handleFinalOrderClick('PAYU')} disabled={isLoading}>
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : `PAY NOW - ₹${(displaySubtotal - displayDiscountTotal).toLocaleString()}`}
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
                  ×
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
              <span className="checkout__summary-toggle-price">₹{((orderSummary?.subtotal ?? subtotal) + ((orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') ? codFee : 0) + effectiveShippingFee - (orderSummary?.discountAmount ?? displayDiscountTotal)).toLocaleString('en-IN')}</span>
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
                      {item.variants && Object.keys(item.variants).length > 0 && (
                        <span className="checkout__summary-item-variant">
                          {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </span>
                      )}
                      {item.type === 'BUNDLE' && item.items && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: '1.3' }}>
                          {item.items.map((i: any) => (
                            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#94a3b8' }}>•</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                {i.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <span className="checkout__summary-item-pricing">
                        {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
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
                      🎉 Code <strong>{appliedCoupon.code}</strong> applied! You saved ₹{discountAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              <div className="checkout__summary-rows">
                <div className="checkout__summary-row"><span>Subtotal</span><span>₹{(orderSummary?.subtotal ?? displaySubtotal).toLocaleString('en-IN')}</span></div>
                {(orderSummary?.discountAmount ?? displayDiscountTotal) > 0 && (
                  <div className="checkout__summary-row checkout__summary-row--green">
                    <span>Discount {(orderSummary?.couponCode ?? appliedCoupon?.code) && `(${(orderSummary?.couponCode ?? appliedCoupon?.code)})`}</span>
                    <span>-₹{(orderSummary?.discountAmount ?? displayDiscountTotal).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {(orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') && <div className="checkout__summary-row"><span>COD Fee</span><span>₹{codFee}</span></div>}
                {effectiveShippingFee > 0 ? (
                  <div className="checkout__summary-row">
                    <span>{shippingConfig.shippingLabel || 'Shipment Fee'}</span>
                    <span>₹{effectiveShippingFee}</span>
                  </div>
                ) : (
                  <div className="checkout__summary-row checkout__summary-row--green"><span>Shipping</span><span>FREE</span></div>
                )}
              </div>

              {/* Free Shipping Banner */}
              {effectiveShippingFee === 0 && (
                <div className="checkout__free-shipping-banner">
                  <Truck size={16} className="checkout__free-shipping-icon" />
                  <span>Yay! You get FREE shipping 🥳</span>
                </div>
              )}

              <div className="checkout__summary-divider" />
              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Total</span>
                <span className="checkout__summary-total-price">₹{Math.max(0, (orderSummary?.subtotal ?? displaySubtotal) + ((orderSummary?.paymentMethod === 'COD' || paymentMethod === 'COD') ? codFee : 0) + effectiveShippingFee - (orderSummary?.discountAmount ?? displayDiscountTotal)).toLocaleString('en-IN')}</span>
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
