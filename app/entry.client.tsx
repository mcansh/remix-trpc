import * as React from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";

function hydrate() {
  React.startTransition(() => {
    hydrateRoot(
      document,
      <React.StrictMode>
        <RemixBrowser />
      </React.StrictMode>
    );
  });
}

// Safari doesn't support requestIdleCallback
// https://caniuse.com/requestidlecallback
if (typeof window.requestIdleCallback === "undefined") {
  window.setTimeout(hydrate, 1);
} else {
  window.requestIdleCallback(hydrate);
}
