import lottie from "lottie-web";

export interface LottieConfig {
  container: HTMLElement;
  path: string;
  renderer?: "svg" | "canvas" | "html";
  loop?: boolean;
  autoplay?: boolean;
  rendererSettings?: {
    preserveAspectRatio?: string;
  };
}

export function loadLottieAnimation(config: LottieConfig) {
  return lottie.loadAnimation({
    renderer: "svg",
    loop: false,
    autoplay: false,
    ...config,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      ...config.rendererSettings,
    },
  });
}
