import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  usePlan,
} from "@/lib/premium";

/**
 * Acesso Premium na interface.
 *
 * A fonte de verdade é sempre o banco (`usePlan`).
 * Enquanto não existe pagamento integrado, um modo de
 * pré-visualização local permite testar as telas Premium —
 * ele NÃO libera nada no backend e não é segurança real.
 */

const PREVIEW_KEY =
  "finanlook-premium-preview";

const PREVIEW_EVENT =
  "finanlook:premium-preview";

function readPreview() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(PREVIEW_KEY) ===
    "true"
  );
}

export function usePremiumAccess() {
  const {
    data: plan,
    isLoading,
  } = usePlan();

  const [
    preview,
    setPreview,
  ] = useState(false);

  useEffect(() => {
    setPreview(readPreview());

    function sync() {
      setPreview(readPreview());
    }

    window.addEventListener(
      PREVIEW_EVENT,
      sync,
    );

    return () => {
      window.removeEventListener(
        PREVIEW_EVENT,
        sync,
      );
    };
  }, []);

  const setPreviewPremium = useCallback(
    (value: boolean) => {
      window.localStorage.setItem(
        PREVIEW_KEY,
        value ? "true" : "false",
      );

      window.dispatchEvent(
        new Event(PREVIEW_EVENT),
      );
    },
    [],
  );

  const isPremium =
    plan?.isPremium === true;

  return {
    isLoading,
    /** assinatura confirmada no backend */
    isPremium,
    /** pré-visualização local (apenas interface) */
    isPreview: preview && !isPremium,
    /** libera as telas Premium na interface */
    hasPremiumUi: isPremium || preview,
    setPreviewPremium,
  };
}
