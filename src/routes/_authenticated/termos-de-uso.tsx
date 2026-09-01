import {
  createFileRoute,
} from "@tanstack/react-router";

export const Route =
  createFileRoute(
    "/_authenticated/termos-de-privacidade",
  )({
    component: TermosDeUso,
  });

function TermosDeUso() {
  const lastUpdated =
    "31 de agosto de 2026";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* CABEÇALHO */}

      <div>
        <p className="text-sm font-medium text-primary">
          DOCUMENTOS LEGAIS
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Termos de Uso
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: {lastUpdated}
        </p>
      </div>

      {/* INTRODUÇÃO */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          1. Aceitação dos Termos
        </h2>

        <p className="leading-7 text-muted-foreground">
          Ao acessar ou utilizar o FinanLook, você concorda
          com estes Termos de Uso. Caso não concorde com
          alguma parte destes termos, não utilize a
          plataforma.
        </p>
      </section>

      {/* SERVIÇO */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          2. Sobre o FinanLook
        </h2>

        <p className="leading-7 text-muted-foreground">
          O FinanLook é uma plataforma de organização
          financeira pessoal que permite registrar
          movimentações, acompanhar contas, organizar
          receitas e despesas, definir metas, acompanhar
          reservas e utilizar recursos de planejamento
          financeiro.
        </p>

        <p className="leading-7 text-muted-foreground">
          As informações apresentadas na plataforma têm
          finalidade informativa e de organização pessoal.
          O FinanLook não presta consultoria financeira,
          jurídica, contábil ou de investimentos.
        </p>
      </section>

      {/* CONTA */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          3. Conta do Usuário
        </h2>

        <p className="leading-7 text-muted-foreground">
          Algumas funcionalidades podem exigir a criação de
          uma conta. Você é responsável por fornecer
          informações corretas e por manter a segurança das
          credenciais utilizadas para acessar sua conta.
        </p>

        <p className="leading-7 text-muted-foreground">
          Você não deve compartilhar suas credenciais de
          acesso com terceiros nem utilizar a conta de outra
          pessoa sem autorização.
        </p>
      </section>

      {/* RESPONSABILIDADES */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          4. Responsabilidades do Usuário
        </h2>

        <p className="leading-7 text-muted-foreground">
          Ao utilizar o FinanLook, você concorda em utilizar
          a plataforma de forma legal e responsável.
        </p>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            Fornecer informações verdadeiras quando
            necessário.
          </li>

          <li>
            Não utilizar a plataforma para atividades
            ilegais ou fraudulentas.
          </li>

          <li>
            Não tentar acessar sistemas, dados ou contas sem
            autorização.
          </li>

          <li>
            Não interferir no funcionamento, segurança ou
            disponibilidade da plataforma.
          </li>
        </ul>
      </section>

      {/* DADOS FINANCEIROS */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          5. Informações Financeiras
        </h2>

        <p className="leading-7 text-muted-foreground">
          As informações financeiras registradas no
          FinanLook são fornecidas pelo próprio usuário.
          Portanto, o usuário é responsável pela exatidão e
          atualização das informações inseridas na
          plataforma.
        </p>

        <p className="leading-7 text-muted-foreground">
          O FinanLook não garante resultados financeiros,
          rentabilidade, ganhos ou qualquer resultado
          específico decorrente da utilização da plataforma
          ou de suas ferramentas de simulação.
        </p>
      </section>

      {/* INVESTIMENTOS */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          6. Simulações e Investimentos
        </h2>

        <p className="leading-7 text-muted-foreground">
          Recursos relacionados a investimentos, projeções,
          cálculos ou simulações possuem caráter
          exclusivamente informativo e educacional.
        </p>

        <p className="leading-7 text-muted-foreground">
          Os resultados apresentados podem variar conforme
          os dados utilizados, condições de mercado e outros
          fatores. Simulações não representam garantia de
          rentabilidade ou desempenho futuro.
        </p>

        <p className="leading-7 text-muted-foreground">
          Antes de tomar decisões financeiras ou de
          investimento, considere buscar informações
          atualizadas e, quando necessário, orientação de um
          profissional qualificado.
        </p>
      </section>

      {/* DISPONIBILIDADE */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          7. Disponibilidade da Plataforma
        </h2>

        <p className="leading-7 text-muted-foreground">
          Buscamos manter o FinanLook disponível e
          funcionando corretamente. Entretanto, a
          plataforma pode passar por manutenção,
          atualizações ou apresentar indisponibilidades
          temporárias.
        </p>

        <p className="leading-7 text-muted-foreground">
          Não garantimos que o serviço estará disponível de
          forma ininterrupta ou livre de erros em todos os
          momentos.
        </p>
      </section>

      {/* ALTERAÇÕES */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          8. Alterações na Plataforma
        </h2>

        <p className="leading-7 text-muted-foreground">
          O FinanLook poderá modificar, adicionar ou remover
          funcionalidades da plataforma para melhorias,
          manutenção, segurança ou evolução do serviço.
        </p>
      </section>

      {/* SUSPENSÃO */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          9. Suspensão ou Encerramento
        </h2>

        <p className="leading-7 text-muted-foreground">
          Poderemos restringir ou suspender o acesso à
          plataforma em casos de uso que violem estes Termos
          de Uso, comprometam a segurança do serviço ou
          infrinjam a legislação aplicável.
        </p>
      </section>

      {/* PRIVACIDADE */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          10. Privacidade
        </h2>

        <p className="leading-7 text-muted-foreground">
          O tratamento de dados pessoais e outras
          informações relacionadas ao uso da plataforma é
          descrito em nossa Política de Privacidade.
        </p>
      </section>

      {/* COOKIES */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          11. Cookies
        </h2>

        <p className="leading-7 text-muted-foreground">
          O FinanLook poderá utilizar cookies e tecnologias
          semelhantes para o funcionamento e aprimoramento
          da plataforma. Mais informações podem ser
          encontradas na Política de Cookies.
        </p>
      </section>

      {/* TERMOS */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          12. Alterações nestes Termos
        </h2>

        <p className="leading-7 text-muted-foreground">
          Estes Termos de Uso poderão ser atualizados
          periodicamente. Quando isso acontecer, a data da
          última atualização será modificada nesta página.
        </p>

        <p className="leading-7 text-muted-foreground">
          Recomendamos que você consulte esta página
          regularmente para acompanhar eventuais mudanças.
        </p>
      </section>

      {/* CONTATO */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">
          13. Contato
        </h2>

        <p className="mt-3 leading-7 text-muted-foreground">
          Caso tenha dúvidas sobre estes Termos de Uso,
          entre em contato pelos canais oficiais
          disponibilizados pelo FinanLook.
        </p>
      </section>
    </div>
  );
}