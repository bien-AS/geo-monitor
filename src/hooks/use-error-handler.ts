import { useCallback } from "react";
import { toast } from "sonner";
import { transformError } from "@/lib/error-transformer";
import { logger } from "@/lib/logger";

export function useErrorHandler() {
  const showToast = useCallback((error: unknown) => {
    const friendly = transformError(error);
    toast.error(friendly.message, {
      id: friendly.code,
    });
    logger.debug("Error toast shown", { code: friendly.code });
  }, []);

  return { showToast };
}
