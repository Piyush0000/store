'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getServerSubdomain } from '@/lib/server-utils';
import { fetchStorefront } from '@/lib/api';

const SESSION_COOKIE_NAME = "checkout_session_id";

export type EnabledPaymentMethods = {
  cod: boolean;
  payu: boolean;
  cashfree: boolean;
  razorpay: boolean;
};

const NO_PAYMENT_METHODS: EnabledPaymentMethods = {
  cod: false,
  payu: false,
  cashfree: false,
  razorpay: false,
};

function parseEnabledPaymentMethods(gateways: any): EnabledPaymentMethods {
  const isOn = (key: string) => Boolean(gateways?.[key]?.enabled ?? gateways?.[key]);
  return {
    cod: isOn("cod"),
    payu: isOn("payu"),
    cashfree: isOn("cashfree"),
    razorpay: isOn("razorpay"),
  };
}

function onlineDiscountFromGateways(gateways: any): number {
  return (
    gateways?.payu?.discountPercent ??
    gateways?.cashfree?.discountPercent ??
    gateways?.razorpay?.discountPercent ??
    0
  );
}

export interface InitialCheckoutState {
  sessionValid: boolean;
  phone: string;
  user: any | null;
  savedAddresses: any[];
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  codFee: number;
  onlineDiscountPercent: number;
  enabledPaymentMethods: EnabledPaymentMethods;
  shippingConfig: {
    shippingFee: number;
    freeShippingThreshold: number;
    shippingLabel: string;
    enabled: boolean;
  };
  initialStep: "identify" | "details" | "payment";
}

export async function getInitialCheckoutState(): Promise<InitialCheckoutState> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Run session check and storefront settings fetch concurrently in parallel
    const sessionPromise = (async () => {
      if (!sessionId) return null;
      const session = await prisma.checkoutSession.findUnique({
        where: { id: sessionId },
      });
      if (!session || session.expiresAt < new Date()) {
        return null;
      }
      return session;
    })();

    const storefrontPromise = (async () => {
      try {
        const subdomain = await getServerSubdomain();
        const storefront = await fetchStorefront(subdomain);
        const settings = storefront.settings || {};
        const customization = storefront.customization || {};
        const shippingSettings = (customization as any).shippingSettings || {};
        const gateways = settings.enabledGateways || (storefront as any).store?.enabledGateways || {};

        const codFee = settings.codFee ?? 0;
        const onlineDiscountPercent = onlineDiscountFromGateways(gateways);
        const shippingFee = Number(shippingSettings.shippingFee ?? (settings as any).shippingFee ?? 0);
        const freeShippingThreshold = Number(shippingSettings.freeShippingThreshold ?? (settings as any).freeShippingThreshold ?? 0);
        const shippingLabel = shippingSettings.shippingLabel || 'Shipment Fee';
        const enabled = shippingSettings.enabled !== false;

        return {
          codFee,
          onlineDiscountPercent,
          enabledPaymentMethods: parseEnabledPaymentMethods(gateways),
          shippingConfig: {
            shippingFee,
            freeShippingThreshold,
            shippingLabel,
            enabled,
          },
        };
      } catch (err) {
        return {
          codFee: 0,
          onlineDiscountPercent: 0,
          enabledPaymentMethods: NO_PAYMENT_METHODS,
          shippingConfig: {
            shippingFee: 0,
            freeShippingThreshold: 0,
            shippingLabel: 'Shipment Fee',
            enabled: false,
          },
        };
      }
    })();

    const [session, storefrontData] = await Promise.all([sessionPromise, storefrontPromise]);

    let user: any = null;
    let savedAddresses: any[] = [];
    let phone = "";
    let customerFirstName = "";
    let customerLastName = "";
    let customerEmail = "";
    let initialStep: "identify" | "details" | "payment" = "identify";

    if (session && session.phone) {
      phone = session.phone;
      const dbUser = await prisma.user.findUnique({
        where: { phone },
        include: { addresses: true },
      });

      if (dbUser) {
        user = dbUser;
        savedAddresses = dbUser.addresses || [];
        customerFirstName = dbUser.firstName || "";
        customerLastName = dbUser.lastName || "";
        customerEmail = dbUser.email || "";

        const hasDetails = Boolean(
          dbUser.firstName && dbUser.lastName && dbUser.email && savedAddresses.length > 0
        );
        initialStep = hasDetails ? "payment" : "details";
      } else {
        initialStep = "details";
      }
    }

    return {
      sessionValid: Boolean(session),
      phone,
      user,
      savedAddresses,
      customerFirstName,
      customerLastName,
      customerEmail,
      codFee: storefrontData.codFee,
      onlineDiscountPercent: storefrontData.onlineDiscountPercent,
      enabledPaymentMethods: storefrontData.enabledPaymentMethods,
      shippingConfig: storefrontData.shippingConfig,
      initialStep,
    };
  } catch (error) {
    console.error("Error in getInitialCheckoutState:", error);
    return {
      sessionValid: false,
      phone: "",
      user: null,
      savedAddresses: [],
      customerFirstName: "",
      customerLastName: "",
      customerEmail: "",
      codFee: 0,
      onlineDiscountPercent: 0,
      enabledPaymentMethods: NO_PAYMENT_METHODS,
      shippingConfig: {
        shippingFee: 0,
        freeShippingThreshold: 0,
        shippingLabel: 'Shipment Fee',
        enabled: false,
      },
      initialStep: "identify",
    };
  }
}
