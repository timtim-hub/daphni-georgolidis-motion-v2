import { Head, Html, Main, NextScript } from "next/document";

// Netlify's Next.js runtime expects a pages-based `_document` module during the build
// even when using the App Router. This keeps the build compatible without affecting routes.
export default function Document() {
  return (
    <Html lang="de">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

