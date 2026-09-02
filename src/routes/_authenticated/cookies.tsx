import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  ArrowLeft,
  Cookie,
} from "lucide-react";

export const Route =
  createFileRoute(
    "/_authenticated/cookies",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Política de Cookies — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Entenda como o FinanLook utiliza cookies, armazenamento local e tecnologias semelhantes.",
        },
        {
          property:
            "og:title",
          content:
            "Política de Cookies — FinanLook",
        },
        {
          property:
            "og:description",
          content:
            "Saiba como o FinanLook utiliza cookies e tecnologias semelhantes.",
        },
      ],
    }),

    component:
      CookiesPage,
  });

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />

          Voltar ao início
        </Link>

        <div className="surface p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
              <Cookie className="size-6 text-primary" />
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                Política de Cookies
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Última atualização: 1 de setembro de 2026
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                1. O que são cookies?
              </h2>

              <p className="mt-2">
                Cookies são pequenos arquivos ou tecnologias
                semelhantes utilizados para armazenar ou acessar
                determinadas informações no dispositivo do usuário.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                2. Como utilizamos cookies
              </h2>

              <p className="mt-2">
                O FinanLook pode utilizar cookies, armazenamento
                local e tecnologias semelhantes para manter
                preferências, funcionalidades, segurança e outras
                operações necessárias ao funcionamento da
                plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                3. Cookies necessários
              </h2>

              <p className="mt-2">
                Alguns cookies e tecnologias semelhantes podem ser
                necessários para o funcionamento adequado do
                FinanLook, incluindo recursos relacionados à
                autenticação, segurança, manutenção de sessão e
                preferências essenciais.
              </p>

              <p className="mt-2">
                Esses recursos podem ser utilizados para permitir
                que a plataforma funcione corretamente e para ajudar
                a proteger contas e informações dos usuários.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                4. Armazenamento de preferências
              </h2>

              <p className="mt-2">
                Podemos utilizar armazenamento local ou tecnologias
                semelhantes para lembrar determinadas preferências do
                usuário, como configurações de aparência e outras
                escolhas relacionadas à utilização da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                5. Cookies de publicidade
              </h2>

              <p className="mt-2">
                Caso anúncios sejam exibidos na plataforma, parceiros
                de publicidade poderão utilizar cookies e tecnologias
                semelhantes para disponibilizar anúncios, medir seu
                desempenho, prevenir fraudes e realizar outras
                operações relacionadas à publicidade.
              </p>

              <p className="mt-2">
                Dependendo da legislação aplicável e das escolhas do
                usuário, determinadas tecnologias poderão ser
                utilizadas para personalização de anúncios.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                6. Serviços de terceiros
              </h2>

              <p className="mt-2">
                Alguns serviços utilizados pelo FinanLook podem
                utilizar suas próprias tecnologias, cookies ou
                mecanismos semelhantes para fornecer funcionalidades,
                segurança, análise ou publicidade.
              </p>

              <p className="mt-2">
                O tratamento dessas informações também pode estar
                sujeito às políticas e configurações dos respectivos
                fornecedores.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                7. Gerenciamento de consentimento
              </h2>

              <p className="mt-2">
                Quando aplicável, o usuário poderá receber uma
                mensagem de consentimento para escolher suas
                preferências relacionadas ao uso de cookies,
                publicidade e tecnologias semelhantes.
              </p>

              <p className="mt-2">
                As opções disponíveis podem variar conforme a
                localização do usuário, a legislação aplicável e os
                serviços utilizados pela plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                8. Gerenciamento pelo navegador
              </h2>

              <p className="mt-2">
                O usuário também pode gerenciar determinados cookies
                por meio das configurações do navegador ou do
                dispositivo utilizado.
              </p>

              <p className="mt-2">
                A desativação de determinadas tecnologias pode afetar
                o funcionamento de algumas funcionalidades da
                plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                9. Alterações nesta política
              </h2>

              <p className="mt-2">
                Esta Política de Cookies poderá ser atualizada
                periodicamente para refletir alterações na plataforma,
                nos serviços utilizados ou na legislação aplicável.
              </p>

              <p className="mt-2">
                Quando esta política for atualizada, a data da última
                atualização poderá ser modificada nesta página.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                10. Contato
              </h2>

              <p className="mt-2">
                Caso tenha dúvidas sobre esta Política de Cookies,
                entre em contato pelos canais oficiais
                disponibilizados pelo FinanLook.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}