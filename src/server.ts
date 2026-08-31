import "./lib/error-capture";

import {
  consumeLastCapturedError,
} from "./lib/error-capture";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

let serverEntryPromise:
  | Promise<ServerEntry>
  | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise =
      import(
        "@tanstack/react-start/server-entry"
      ).then(
        (module) =>
          (module.default ??
            module) as ServerEntry,
      );
  }

  return serverEntryPromise;
}

function isH3ErrorResponse(
  body: string,
) {
  try {
    const parsed =
      JSON.parse(body);

    return (
      parsed?.unhandled === true &&
      parsed?.message ===
        "HTTPError"
    );
  } catch {
    return false;
  }
}

export default {
  async fetch(
    request: Request,
    env: unknown,
    ctx: unknown,
  ) {
    try {
      const handler =
        await getServerEntry();

      const response =
        await handler.fetch(
          request,
          env,
          ctx,
        );

      /*
       * O H3 pode transformar um erro interno
       * em:
       *
       * {
       *   status: 500,
       *   unhandled: true,
       *   message: "HTTPError"
       * }
       *
       * Vamos verificar isso e imprimir o erro
       * original capturado.
       */
      if (
        response.status >=
        500
      ) {
        const contentType =
          response.headers.get(
            "content-type",
          ) ?? "";

        if (
          contentType.includes(
            "application/json",
          )
        ) {
          const body =
            await response
              .clone()
              .text();

          if (
            isH3ErrorResponse(
              body,
            )
          ) {
            const originalError =
              consumeLastCapturedError();

            console.error(
              "====================================",
            );

            console.error(
              "ERRO SSR ORIGINAL:",
            );

            console.error(
              originalError ??
                new Error(
                  `H3 retornou HTTPError: ${body}`,
                ),
            );

            console.error(
              "URL:",
              request.url,
            );

            console.error(
              "====================================",
            );
          }
        }
      }

      return response;
    } catch (error) {
      console.error(
        "====================================",
      );

      console.error(
        "ERRO CAPTURADO NO SERVER:",
      );

      console.error(
        error,
      );

      console.error(
        "URL:",
        request.url,
      );

      console.error(
        "====================================",
      );

      throw error;
    }
  },
};