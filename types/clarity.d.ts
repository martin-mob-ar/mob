interface Window {
  clarity?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
}
