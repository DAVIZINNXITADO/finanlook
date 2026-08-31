import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import {
  useDeleteInvestment,
  useInvestments,
  useSaveInvestment,
} from "@/lib/data";
import {
  formatBRL,
  formatDateBR,
  parseAmount,
  todayISO,
  type Investment,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/investimentos")({
  head: () => ({
    meta: [
      { title: "Meus investimentos — FinanLook" },
      {
        name: "description",
        content:
          "Registre manualmente seus investimentos para planejamento e acompanhamento pessoal.",
      },
      {
        property: "og:title",
        content: "Meus investimentos — FinanLook",
      },
      {
        property: "og:description",
        content: "Planejamento e acompanhamento manual.",
      },
    ],
  }),
  component: InvestmentsPage,
});

type FormState = {
  name: string;
  amount: string;
  date: string;
  note: string;
};

const emptyForm = (): FormState => ({
  name: "",
  amount: "",
  date: todayISO(),
  note: "",
});

function InvestmentsPage() {
  const { data: investments = [], isLoading } = useInvestments();
  const save = useSaveInvestment();
  const remove = useDeleteInvestment();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<Investment | null>(null);

  const total = investments.reduce(
    (acc, i) => acc + Number(i.amount),
    0,
  );

  async function submit() {
    const amount = parseAmount(form.amount);

    if (!form.name.trim()) {
      toast.error("Informe o nome do investimento");
      return;
    }

    if (amount <= 0) {
      toast.error("Informe o valor aplicado");
      return;
    }

    try {
      await save.mutateAsync({
        values: {
          name: form.name.trim().slice(0, 80),
          amount,
          date: form.date,
          note: form.note.trim()
            ? form.note.trim().slice(0, 300)
            : null,
        },
      });

      toast.success("Investimento registrado");

      setForm(emptyForm());
      setOpen(false);
    } catch {
      toast.error("Não foi possível salvar.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus investimentos"
        subtitle="Registro manual, apenas para organização e acompanhamento."
        action={
          <Button
            className="h-11"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-4" />
            Novo registro
          </Button>
        }
      />

      <p className="rounded-2xl bg-accent/60 px-4 py-3 text-sm">
        📈 Este recurso serve apenas para você organizar e
        acompanhar o que planejou. O FinanLook não conecta bancos
        ou corretoras, não recomenda produtos e não promete
        rentabilidade.
      </p>

      <StatCard
        label="Total planejado/aplicado"
        value={formatBRL(total)}
        tone="info"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Carregando...
        </p>
      ) : investments.length === 0 ? (
        <EmptyState
          emoji="📈"
          title="Você ainda não registrou investimentos."
          description="Exemplos: CDB, Tesouro, Fundo ou Outro."
          action={
            <Button
              className="mt-2"
              onClick={() => setOpen(true)}
            >
              <Plus className="size-4" />
              Adicionar registro
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {investments.map((item) => (
            <li
              key={item.id}
              className="surface flex items-center gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {item.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatDateBR(item.date)}
                </p>

                {item.note ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.note}
                  </p>
                ) : null}
              </div>

              <span className="shrink-0 text-sm font-semibold">
                {formatBRL(item.amount)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir"
                onClick={() => setDeleting(item)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo registro</DialogTitle>

            <DialogDescription>
              Anote o que você aplicou ou planeja aplicar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-nome">
                Nome do investimento
              </Label>

              <Input
                id="inv-nome"
                className="h-11"
                placeholder="CDB, Tesouro, Fundo, Outro"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-valor">
                Valor aplicado
              </Label>

              <Input
                id="inv-valor"
                inputMode="decimal"
                className="h-11"
                placeholder="500,00"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    amount: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-data">
                Data
              </Label>

              <Input
                id="inv-data"
                type="date"
                className="h-11"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    date: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-obs">
                Observação
              </Label>

              <Textarea
                id="inv-obs"
                placeholder="Opcional"
                value={form.note}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    note: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={() => void submit()}
              disabled={save.isPending}
            >
              Salvar registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(o) =>
          !o && setDeleting(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir registro?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleting
                ? `“${deleting.name}” será removido da sua lista.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  void remove.mutateAsync(deleting.id);
                }

                setDeleting(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}