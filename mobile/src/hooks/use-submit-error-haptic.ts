import { useEffect, useRef } from "react";

import { errorFeedback } from "@/lib/haptics";

export function useSubmitErrorHaptic(submitCount: number, errors: object) {
  const handled = useRef(0);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (submitCount === handled.current) return;
    handled.current = submitCount;
    if (hasErrors) errorFeedback();
  }, [submitCount, hasErrors]);
}
