import type { AppProps } from "next/app";

// App Router is used for the actual site. This file exists for build/runtime compatibility
// with certain platforms that still probe the Pages Router entrypoints.
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

