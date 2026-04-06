import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CHECKOUT_URL =
  "https://rnkkktytsxxtzaigafuc.supabase.co/functions/v1/create-checkout-session";

interface CheckoutOptions {
  priceId: string;
  email: string;
  accessToken?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToCheckout = async ({
    priceId,
    email,
    accessToken,
    successUrl = window.location.origin + "/dashboard",
    cancelUrl = window.location.origin + "/auth",
  }: CheckoutOptions) => {
    setLoading(true);
    setError(null);
    try {
      // Priorité : token passé depuis signUp (frais), sinon session courante
      let token = accessToken;
      if (!token) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
      }

      if (!token) {
        throw new Error("Session expirée. Veuillez vous connecter à nouveau.");
      }

      const res = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId, email }),
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
