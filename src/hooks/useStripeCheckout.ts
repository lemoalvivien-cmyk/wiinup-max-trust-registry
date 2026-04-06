import { useState } from "react";

const CHECKOUT_URL =
  "https://rnkkktytsxxtzaigafuc.supabase.co/functions/v1/create-checkout-session";

interface CheckoutOptions {
  priceId: string;
  email: string;
  successUrl?: string;
  cancelUrl?: string;
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToCheckout = async ({
    priceId,
    email,
    successUrl = window.location.origin + "/dashboard",
    cancelUrl = window.location.origin + "/auth",
  }: CheckoutOptions) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, email, successUrl, cancelUrl }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || "Impossible de créer la session de paiement");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return { redirectToCheckout, loading, error };
}
