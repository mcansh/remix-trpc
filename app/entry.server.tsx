import { PassThrough } from "stream";
import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          const body = new PassThrough();

          preloadRouteAssets(remixContext, responseHeaders);
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function preloadRouteAssets(context: EntryContext, headers: Headers) {
  let modules = Object.entries(context.manifest.routes);

  let links = context.staticHandlerContext.matches
    .flatMap((match) => {
      let routeMatch = modules.find((m) => m[0] === match.route.id);
      let routeImports = routeMatch?.[1].imports ?? [];
      let routeModule = routeMatch?.[1].module;

      let route = context.routeModules[match.route.id];
      let links = typeof route.links === "function" ? route.links() : [];
      let imports = [
        routeModule,
        ...routeImports,
        context.manifest.url,
        context.manifest.entry.module,
        ...context.manifest.entry.imports,
      ]
        .filter((i: any): i is string => i !== undefined)
        .map((i) => {
          return { href: i, as: "script" } as const;
        });
      return [...links, ...imports];
    })
    .map((link) => {
      if ("as" in link && "href" in link) {
        return { href: link.href, as: link.as } as const;
      }
      if ("rel" in link && "href" in link) {
        if (link.rel === "stylesheet") {
          return { href: link.href, as: "style" } as const;
        }
      }
      return null;
    })
    .filter((link: any): link is { href: string; as: string } => {
      return link && "href" in link;
    })
    .filter((item, index, list) => {
      return index === list.findIndex((link) => link.href === item.href);
    });

  for (let link of links) {
    headers.append(
      "Link",
      `<${link.href}>; rel=preload; as=${link.as}; crossorigin=anonymous`
    );
  }
}
