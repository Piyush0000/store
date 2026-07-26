"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useAnalytics } from "@/components/AnalyticsProvider";
import {
  sendOtp,
  verifyOtp,
  createSession,
  validateSession,
} from "@/actions/otp-actions";
import { getUserByPhone, createOrUpdateUser } from "@/actions/user-actions";
import {
  createAddress,
  createOrder,
  createCodOrder,
  getStorefrontCodFee,
  getStorefrontShippingFee,
} from "@/actions/order-actions";
import { initiatePayUPayment } from "@/actions/payment-actions";
import { validateCouponAction } from "@/actions/coupon-actions";
import OtpStep from "@/components/OtpStep";
import DetailsForm from "@/components/DetailsForm";
import AddressSection from "@/components/AddressSection";
import PaymentStep from "@/components/PaymentStep";
import OrderSummary from "@/components/OrderSummary";
import SuccessStep from "@/components/SuccessStep";
import "./checkout.css";

type Step = "identify" | "verify" | "details" | "payment" | "success";

const isStepActive = (step: Step, s: Step) => {
  const order: Step[] = ["identify", "verify", "details", "payment", "success"];
  return order.indexOf(step) >= order.indexOf(s);
};

export default function CheckoutPage() {
  const { track } = useAnalytics();
  const { cartItems, clearCart, cartTotal } = useCart();
  const [codFee, setCodFee] = useState(0);
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
  const displayDiscountTotal = discountAmount + bundleDiscountTotal;

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

  useEffect(() => {
    Promise.all([getStorefrontCodFee(), getStorefrontShippingFee()]).then(
      ([fee, cfg]) => {
        setCodFee(fee);
        setShippingConfig(cfg);
      },
    );
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

  // Initialize device ID and validate session on mount
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

    // Validate existing session
    const checkSession = async () => {
      const sessionResult = await validateSession();
      if (sessionResult.valid && sessionResult.phone) {
        setPhone(sessionResult.phone);
        const userResult = await getUserByPhone(sessionResult.phone);
        let isRecurring = false;
        if (userResult.success && userResult.data) {
          setUser(userResult.data);
          setUserId(userResult.data.id);
          const addresses = userResult.data.addresses || [];
          setSavedAddresses(addresses);
          if (userResult.data.firstName)
            setCustomerFirstName(userResult.data.firstName);
          if (userResult.data.lastName)
            setCustomerLastName(userResult.data.lastName);
          if (userResult.data.email) setCustomerEmail(userResult.data.email);
          if (addresses.length > 0) {
            const defaultAddr =
              addresses.find((a: any) => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
            if (
              userResult.data.firstName &&
              userResult.data.lastName &&
              userResult.data.email
            ) {
              isRecurring = true;
            }
          }
        }
        if (isRecurring) {
          setStep("payment");
        } else {
          setStep("details");
        }
      } else {
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

  const handleSendOtp = useCallback(async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOtp(["", "", "", ""]); // Reset OTP inputs
    try {
      const result = await sendOtp({ phone });
      if (result.success) {
        setSessionId((result as any).sessionId || null);
        setResendTimer(120);
        setStep("verify");
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
  }, [phone]);

  const handleVerifyOtp = useCallback(async () => {
    const otpCode = otp.join("");
    if (!otpCode || otpCode.length !== 4) {
      setError("Please enter the 4-digit code");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp({
        phone,
        code: otpCode,
        sessionId: sessionId || undefined,
      });
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
          if (userResult.data.firstName)
            setCustomerFirstName(userResult.data.firstName);
          if (userResult.data.lastName)
            setCustomerLastName(userResult.data.lastName);
          if (userResult.data.email) setCustomerEmail(userResult.data.email);
          if (addresses.length > 0) {
            const defaultAddr =
              addresses.find((a: any) => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
            if (
              userResult.data.firstName &&
              userResult.data.lastName &&
              userResult.data.email
            ) {
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
          setStep("payment");
        } else {
          setStep("details");
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [otp, phone, sessionId, deviceId]);

  const handleSaveAddress = useCallback(async () => {
    if (
      !addressForm.flatHouse ||
      !addressForm.areaStreet ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pincode
    ) {
      setError("Please fill all address fields");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // De-duplicate: find existing address in a single pass
      const existingAddr = savedAddresses.find(
        (addr) =>
          addr.flatHouse?.toLowerCase().trim() ===
            addressForm.flatHouse.toLowerCase().trim() &&
          addr.areaStreet?.toLowerCase().trim() ===
            addressForm.areaStreet.toLowerCase().trim() &&
          addr.city?.toLowerCase().trim() ===
            addressForm.city.toLowerCase().trim() &&
          addr.state?.toLowerCase().trim() ===
            addressForm.state.toLowerCase().trim() &&
          addr.pincode?.trim() === addressForm.pincode.trim(),
      );

      if (existingAddr) {
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
        throw new Error("Failed to create user");
      }

      const result = await createAddress(uid, addressForm);
      if (result.success && result.data) {
        setSelectedAddress(result.data);
        setSavedAddresses((prev) => [result.data, ...prev]);
        setShowAddressForm(false);
        setAddressForm({
          type: "HOME",
          flatHouse: "",
          areaStreet: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: true,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [addressForm, savedAddresses, phone, userId]);

  const handleContinueToPayment = useCallback(async () => {
    setError(null);
    setFieldErrors({});

    if (!customerFirstName.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        firstName: "First name is required",
      }));
      return;
    }
    if (!customerLastName.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        lastName: "Last name is required",
      }));
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setFieldErrors((prev) => ({ ...prev, email: "Valid email is required" }));
      return;
    }
    if (!selectedAddress) {
      setError("Please select or add a delivery address");
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
        throw new Error("Failed to create user");
      }

      if (step === "payment") {
        setIsEditingDetails(false);
      } else {
        setPaymentMethod(null); // Reset payment method when entering payment step
        setStep("payment");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    customerFirstName,
    customerLastName,
    customerEmail,
    selectedAddress,
    userId,
    phone,
    step,
  ]);

  // Shared helper: maps cartItems → order items array + totals
  const buildOrderItems = useCallback(() => {
    const orderItems: any[] = [];
    let totalBundleDiscount = 0;
    let totalRegularSubtotal = 0;

    cartItems.forEach((item) => {
      if (item.type === "BUNDLE" && item.items) {
        const regularTotal =
          item.regularTotal || item.items.reduce((sum, i) => sum + i.price, 0);
        const discountAmt = item.discountAmount || 0;
        totalBundleDiscount += discountAmt * item.quantity;
        totalRegularSubtotal += regularTotal * item.quantity;

        item.items.forEach((p) => {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    cartItems,
    subtotal,
    phone,
    customerEmail,
    customerFirstName,
    customerLastName,
    discountAmount,
    effectiveShippingFee,
    selectedAddress,
    appliedCoupon,
    buildOrderItems,
    userId,
  ]);

  const onFirstNameChange = useCallback((v: string) => {
    setCustomerFirstName(v);
    setFieldErrors((prev) => ({ ...prev, firstName: "" }));
  }, []);

  const onLastNameChange = useCallback((v: string) => {
    setCustomerLastName(v);
    setFieldErrors((prev) => ({ ...prev, lastName: "" }));
  }, []);

  const onEmailChange = useCallback((v: string) => {
    setCustomerEmail(v);
    setFieldErrors((prev) => ({ ...prev, email: "" }));
  }, []);

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
      <h1 className="checkout__title">CHECKOUT</h1>

      <div className="checkout__steps">
        <div
          className={`checkout__step ${isStepActive(step, "identify") ? "active" : ""}`}
        >
          <span className="checkout__step-num">1</span>
          <span className="checkout__step-label">Login</span>
        </div>
        <div
          className={`checkout__step-line ${isStepActive(step, "details") ? "active" : isStepActive(step, "identify") ? "half-active" : ""}`}
        />
        <div
          className={`checkout__step ${isStepActive(step, "details") ? "active" : ""}`}
        >
          <span className="checkout__step-num">2</span>
          <span className="checkout__step-label">Details</span>
        </div>
        <div
          className={`checkout__step-line ${isStepActive(step, "payment") ? "active" : isStepActive(step, "details") ? "half-active" : ""}`}
        />
        <div
          className={`checkout__step ${isStepActive(step, "payment") ? "active" : ""}`}
        >
          <span className="checkout__step-num">3</span>
          <span className="checkout__step-label">Payment</span>
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

          {(step === "identify" || step === "verify") && (
            <OtpStep
              step={step as "identify" | "verify"}
              phone={phone}
              otp={otp}
              otpRefs={otpRefs}
              resendTimer={resendTimer}
              isLoading={isLoading}
              error={error}
              onPhoneChange={setPhone}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
            />
          )}

          {step === "details" && (
            <DetailsForm
              isStepPayment={false}
              customerFirstName={customerFirstName}
              customerLastName={customerLastName}
              customerEmail={customerEmail}
              fieldErrors={fieldErrors}
              error={error}
              isLoading={isLoading}
              showAddressForm={showAddressForm}
              addressForm={addressForm}
              savedAddresses={savedAddresses}
              selectedAddress={selectedAddress}
              onFirstNameChange={onFirstNameChange}
              onLastNameChange={onLastNameChange}
              onEmailChange={onEmailChange}
              onShowAddressForm={setShowAddressForm}
              onAddressFormChange={setAddressForm}
              onSaveAddress={handleSaveAddress}
              onSelectAddress={setSelectedAddress}
              onContinue={handleContinueToPayment}
            />
          )}

          {step === "payment" && (
            <>
              {isEditingDetails ? (
                <DetailsForm
                  isStepPayment={true}
                  customerFirstName={customerFirstName}
                  customerLastName={customerLastName}
                  customerEmail={customerEmail}
                  fieldErrors={fieldErrors}
                  error={error}
                  isLoading={isLoading}
                  showAddressForm={showAddressForm}
                  addressForm={addressForm}
                  savedAddresses={savedAddresses}
                  selectedAddress={selectedAddress}
                  onFirstNameChange={onFirstNameChange}
                  onLastNameChange={onLastNameChange}
                  onEmailChange={onEmailChange}
                  onShowAddressForm={setShowAddressForm}
                  onAddressFormChange={setAddressForm}
                  onSaveAddress={handleSaveAddress}
                  onSelectAddress={setSelectedAddress}
                  onContinue={handleContinueToPayment}
                />
              ) : (
                <AddressSection
                  selectedAddress={selectedAddress}
                  customerFirstName={customerFirstName}
                  customerLastName={customerLastName}
                  phone={phone}
                  onChangeClick={() => setIsEditingDetails(true)}
                />
              )}

              <PaymentStep
                paymentMethod={paymentMethod}
                payUData={payUData}
                codFee={codFee}
                displaySubtotal={displaySubtotal}
                displayDiscountTotal={displayDiscountTotal}
                isLoading={isLoading}
                error={error}
                onSelectPayment={setPaymentMethod}
                onCreateCodOrder={handleCreateCodOrder}
                onInitiatePayU={handleInitiatePayU}
                onClearPaymentMethod={() => setPaymentMethod(null)}
                onClearError={() => setError(null)}
              />
            </>
          )}
        </div>

        <OrderSummary
          step={step}
          isSummaryOpen={isSummaryOpen}
          onToggleSummary={() => setIsSummaryOpen(!isSummaryOpen)}
          items={orderSummary?.items || cartItems}
          orderSummarySubtotal={orderSummary?.subtotal ?? null}
          orderSummaryDiscount={orderSummary?.discountAmount ?? null}
          orderSummaryCouponCode={orderSummary?.couponCode}
          orderSummaryPaymentMethod={orderSummary?.paymentMethod}
          displaySubtotal={displaySubtotal}
          displayDiscountTotal={displayDiscountTotal}
          codFee={codFee}
          paymentMethod={paymentMethod}
          effectiveShippingFee={effectiveShippingFee}
          shippingLabel={shippingConfig.shippingLabel}
          appliedCoupon={appliedCoupon}
          discountAmount={discountAmount}
          couponInput={couponInput}
          couponError={couponError}
          isApplyingCoupon={isApplyingCoupon}
          onCouponInputChange={(v) => {
            setCouponInput(v);
            setCouponError(null);
          }}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </div>
    </div>
  );
}
