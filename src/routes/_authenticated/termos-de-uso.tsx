import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  ArrowLeft,
  FileText,
} from "lucide-react";

export const Route =
  createFileRoute(
    "/termos-de-uso",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Termos de Uso — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Leia os Termos de Uso do FinanLook e entenda as regras para utilização da plataforma de organização financeira pessoal.",
        },
        {
          property:
            "og:title",
          content:
            "Termos de Uso — FinanLook",
        },
        {
          property:
            "og:description",
          content:
            "Conheça os Termos de Uso da plataforma FinanLook.",
        },
      ],
    }),

    component:
      TermsOfUsePage,
  });

function TermsOfUsePage() {
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
              <FileText className="size-6 text-primary" />
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                Termos de Uso
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Última atualização: 1 de setembro de 2026
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                1. Aceitação dos Termos
              </h2>

              <p className="mt-2">
                Ao acessar ou utilizar o FinanLook, você concorda
                com estes Termos de Uso. Caso não concorde com
                alguma parte destes termos, não utilize a
                plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                2. Sobre o FinanLook
              </h2>

              <p className="mt-2">
                O FinanLook é uma plataforma de organização
                financeira pessoal que permite registrar
                movimentações, acompanhar contas, organizar
                receitas e despesas, definir metas, acompanhar
                reservas e utilizar recursos de planejamento
                financeiro.
              </p>

              <p className="mt-2">
                As informações apresentadas na plataforma têm
                finalidade informativa e de organização pessoal.
                O FinanLook não presta consultoria financeira,
                jurídica, contábil ou de investimentos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                3. Conta do Usuário
              </h2>

              <p className="mt-2">
                Algumas funcionalidades podem exigir a criação
                de uma conta. Você é responsável por fornecer
                informações corretas e por manter a segurança
                das credenciais utilizadas para acessar sua
                conta.
              </p>

              <p className="mt-2">
                Você não deve compartilhar suas credenciais de
                acesso com terceiros nem utilizar a conta de
                outra pessoa sem autorização.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                4. Responsabilidades do Usuário
              </h2>

              <p className="mt-2">
                Ao utilizar o FinanLook, você concorda em utilizar
                a plataforma de forma legal e responsável.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>
                  Fornecer informações verdadeiras quando
                  necessário.
                </li>

                <li>
                  Não utilizar a plataforma para atividades
                  ilegais ou fraudulentas.
                </li>

                <li>
                  Não tentar acessar sistemas, dados ou contas
                  sem autorização.
                </li>

                <li>
                  Não interferir no funcionamento, segurança ou
                  disponibilidade da plataforma.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                5. Informações Financeiras
              </h2>

              <p className="mt-2">
                As informações financeiras registradas no
                FinanLook são fornecidas pelo próprio usuário.
                Portanto, o usuário é responsável pela exatidão
                e atualização das informações inseridas na
                plataforma.
              </p>

              <p className="mt-2">
                O FinanLook não garante resultados financeiros,
                rentabilidade, ganhos ou qualquer resultado
                específico decorrente da utilização da plataforma
                ou de suas ferramentas de simulação.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                6. Simulações e Investimentos
              </h2>

              <p className="mt-2">
                Recursos relacionados a investimentos, projeções,
                cálculos ou simulações possuem caráter
                exclusivamente informativo e educacional.
              </p>

              <p className="mt-2">
                Os resultados apresentados podem variar conforme
                os dados utilizados, condições de mercado e outros
                fatores. Simulações não representam garantia de
                rentabilidade ou desempenho futuro.
              </p>

              <p className="mt-2">
                Antes de tomar decisões financeiras ou de
                investimento, considere buscar informações
                atualizadas e, quando necessário, orientação de
                um profissional qualificado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                7. Disponibilidade da Plataforma
              </h2>

              <p className="mt-2">
                Buscamos manter o FinanLook disponível e
                funcionando corretamente. Entretanto, a
                plataforma pode passar por manutenção,
                atualizações ou apresentar indisponibilidades
                temporárias.
              </p>

              <p className="mt-2">
                Não garantimos que o serviço estará disponível
                de forma ininterrupta ou livre de erros em todos
                os momentos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                8. Alterações na Plataforma
              </h2>

              <p className="mt-2">
                O FinanLook poderá modificar, adicionar ou remover
                funcionalidades da plataforma para melhorias,
                manutenção, segurança ou evolução do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                9. Suspensão ou Encerramento
              </h2>

              <p className="mt-2">
                Poderemos restringir ou suspender o acesso à
                plataforma em casos de uso que violem estes
                Termos de Uso, comprometam a segurança do serviço
                ou infrinjam a legislação aplicável.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                10. Privacidade
              </h2>

              <p className="mt-2">
                O tratamento de dados pessoais e outras
                informações relacionadas ao uso da plataforma é
                descrito em nossa Política de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                11. Cookies
              </h2>

              <p className="mt-2">
                O FinanLook poderá utilizar cookies e tecnologias
                semelhantes para o funcionamento e aprimoramento
                da plataforma. Mais informações podem ser
                encontradas na Política de Cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                12. Alterações nestes Termos
              </h2>

              <p className="mt-2">
                Estes Termos de Uso poderão ser atualizados
                periodicamente. Quando isso acontecer, a data da
                última atualização será modificada nesta página.
              </p>

              <p className="mt-2">
                Recomendamos que você consulte esta página
                regularmente para acompanhar eventuais mudanças.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                13. Contato
              </h2>

              <p className="mt-2">
                Caso tenha dúvidas sobre estes Termos de Uso,
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