import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute(
  "/politica-de-privacidade",
)({
  head: () => ({
    meta: [
      {
        title:
          "Política de Privacidade — FinanLook",
      },
      {
        name:
          "description",
        content:
          "Conheça como o FinanLook coleta, utiliza, armazena e protege informações dos usuários.",
      },
      {
        property:
          "og:title",
        content:
          "Política de Privacidade — FinanLook",
      },
      {
        property:
          "og:description",
        content:
          "Saiba como o FinanLook trata e protege as informações dos usuários.",
      },
      {
        property:
          "og:type",
        content:
          "website",
      },
    ],
  }),

  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
              <ShieldCheck className="size-6 text-primary" />
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                Política de Privacidade
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Última atualização: 31 de agosto de 2026
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                1. Introdução
              </h2>

              <p className="mt-2">
                Esta Política de Privacidade explica como o
                FinanLook coleta, utiliza, armazena e protege
                determinadas informações dos usuários durante
                a utilização da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                2. Informações que podemos coletar
              </h2>

              <p className="mt-2">
                Dependendo das funcionalidades utilizadas,
                podemos coletar informações fornecidas pelo
                próprio usuário, como nome, endereço de email,
                username e informações relacionadas à
                organização financeira inseridas na plataforma.
              </p>

              <p className="mt-2">
                Também podemos coletar informações técnicas
                necessárias para o funcionamento e segurança
                do serviço, como dados do navegador e
                informações relacionadas à sessão.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                3. Como utilizamos as informações
              </h2>

              <p className="mt-2">
                As informações podem ser utilizadas para:
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>fornecer e manter as funcionalidades do FinanLook;</li>
                <li>identificar e autenticar usuários;</li>
                <li>permitir o armazenamento das informações cadastradas pelo usuário;</li>
                <li>melhorar a experiência e o funcionamento da plataforma;</li>
                <li>prevenir fraudes, abusos e problemas de segurança;</li>
                <li>cumprir obrigações legais quando aplicável.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                4. Dados financeiros
              </h2>

              <p className="mt-2">
                O FinanLook permite que o usuário registre e
                organize informações financeiras pessoais.
                Esses dados são utilizados exclusivamente para
                disponibilizar as funcionalidades da plataforma.
              </p>

              <p className="mt-2">
                O usuário é responsável pelas informações que
                cadastra e deve evitar inserir dados
                desnecessariamente sensíveis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                5. Cookies e tecnologias semelhantes
              </h2>

              <p className="mt-2">
                O FinanLook pode utilizar cookies e tecnologias
                semelhantes para manter sessões, lembrar
                preferências e melhorar o funcionamento da plataforma.
              </p>

              <p className="mt-2">
                Caso sejam utilizados serviços de publicidade
                ou análise, cookies adicionais poderão ser
                utilizados conforme as políticas desses serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                6. Publicidade
              </h2>

              <p className="mt-2">
                O FinanLook poderá exibir anúncios para ajudar
                a financiar e manter o funcionamento da plataforma.
              </p>

              <p className="mt-2">
                Serviços de publicidade de terceiros podem
                utilizar tecnologias próprias para medir o
                desempenho dos anúncios e apresentar conteúdo publicitário.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                7. Compartilhamento de informações
              </h2>

              <p className="mt-2">
                Não vendemos informações pessoais dos usuários.
                Informações poderão ser compartilhadas apenas
                quando necessário para o funcionamento da plataforma,
                prestação de serviços por fornecedores confiáveis ou
                cumprimento de obrigações legais.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                8. Segurança
              </h2>

              <p className="mt-2">
                Adotamos medidas razoáveis para proteger as
                informações armazenadas na plataforma.
                Entretanto, nenhum sistema digital pode
                garantir segurança absoluta.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                9. Seus direitos
              </h2>

              <p className="mt-2">
                Dependendo da legislação aplicável, você pode
                possuir direitos relacionados aos seus dados pessoais,
                incluindo acesso, correção, atualização ou exclusão
                de determinadas informações.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                10. Alterações nesta política
              </h2>

              <p className="mt-2">
                Esta Política de Privacidade poderá ser atualizada
                periodicamente. Recomendamos que os usuários consultem
                esta página regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                11. Contato
              </h2>

              <p className="mt-2">
                Caso tenha dúvidas sobre esta Política de Privacidade,
                entre em contato pelos canais disponibilizados pelo
                FinanLook.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}