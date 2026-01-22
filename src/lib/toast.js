import { toast } from "react-toastify";

export const showConnectivityWarning = (showToast = true) => showToast && toast.warning("Please check your internet connectivity");
