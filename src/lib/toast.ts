import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },

  error: (message: string) => {
    toast.error(message);
  },

  info: (message: string) => {
    toast.info(message);
  },

  fromThunk: (
    result: { meta: { requestStatus: string }; payload?: unknown; error?: { message?: string } },
    successMessage: string,
  ) => {
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(successMessage);
    } else {
      const msg =
        (result as { payload?: string }).payload ??
        (result as { error?: { message?: string } }).error?.message ??
        'Ocurrió un error';
      toast.error(msg);
    }
  },
};