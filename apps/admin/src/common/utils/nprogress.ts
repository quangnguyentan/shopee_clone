import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120,
  minimum: 0.2,
});

export default NProgress;
