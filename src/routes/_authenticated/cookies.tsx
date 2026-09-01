import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

export const Route =
  createFileRoute(
    "/cookies",
  )({
    component: CookiesPage,
  });

function CookiesPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <article className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="text-sm text-primary hover:underline"
        >
          ← Voltar
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Política de Cookies
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 1 de setembro de 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              O que são cookies?
            </h2>

            <p className="mt-2">
              Cookies são pequenos arquivos ou tecnologias semelhantes
              utilizados para armazenar ou acessar determinadas
              informações no dispositivo do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Como utilizamos cookies
            </h2>

            <p className="mt-2">
              O FinanLook pode utilizar cookies e armazenamento local
              para manter preferências, funcionalidades, segurança e
              outras operações necessárias ao funcionamento do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Cookies de publicidade
            </h2>

            <p className="mt-2">
              Caso anúncios sejam exibidos na plataforma, parceiros de
              publicidade poderão utilizar tecnologias relacionadas à
              medição, prevenção de fraude e, quando permitido,
              personalização de anúncios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Gerenciamento de consentimento
            </h2>

            <p className="mt-2">
              Quando aplicável, o usuário poderá receber uma mensagem
              de consentimento para escolher suas preferências
              relacionadas ao uso de cookies e dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Alterações nesta política
            </h2>

            <p className="mt-2">
              Esta política poderá ser atualizada periodicamente.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}