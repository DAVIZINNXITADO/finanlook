import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { useDeleteGoal, useGoals, useSaveGoal } from "@/lib/data";
import {
  formatBRL,
  formatDateBR,
  parseAmount,
  type Goal,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Minhas metas — FinanLook" },
      {
        name: "description",
        content:
          "Crie metas financeiras como notebook, viagem ou curso e acompanhe o progresso.",
      },
      {
        property: "og:title",
        content: "Minhas metas — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Acompanhe o progresso das suas metas financeiras.",
      },
    ],
  }),
  component: GoalsPage,
});

type FormState = {
  name: string;
  target: string;
  saved: string;
  deadline: string;
};

const emptyForm = (): FormState => ({
  name: "",
  target: "",
  saved: "",
  deadline: "",
});

function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const save = useSaveGoal();
  const remove = useDeleteGoal();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [addValue, setAddValue] = useState<Record<string, string>>({});

  function openNew() {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditing(goal);

    setForm({
      name: goal.name,
      target: String(Number(goal.target_amount)).replace(
        ".",
        ",",
      ),
      saved: String(Number(goal.saved_amount)).replace(
        ".",
        ",",
      ),
      deadline: goal.deadline ?? "",
    });

    setOpen(true);
  }

  async function submit() {
    const target = parseAmount(form.target);

    if (!form.name.trim()) {
      toast.error("Informe o nome da meta");
      return;
    }

    if (target <= 0) {
      toast.error("Informe o valor objetivo");
      return;
    }

    try {
      await save.mutateAsync({
        ...(editing ? { id: editing.id } : {}),
        values: {
          name: form.name.trim().slice(0, 80),
          target_amount: target,
          saved_amount: parseAmount(form.saved),
          deadline: form.deadline || null,
        },
      });

      toast.success(
        editing ? "Meta atualizada" : "Meta criada",
      );

      setOpen(false);
    } catch {
      toast.error("Não foi possível salvar a meta.");
    }
  }

  async function addToGoal(goal: Goal) {
    const value = parseAmount(
      addValue[goal.id] ?? "",
    );

    if (value <= 0) {
      toast.error("Informe um valor maior que zero");
      return;
    }

    await save.mutateAsync({
      id: goal.id,
      values: {
        name: goal.name,
        target_amount: Number(goal.target_amount),
        saved_amount:
          Number(goal.saved_amount) + value,
        deadline: goal.deadline,
      },
    });

    setAddValue((prev) => ({
      ...prev,
      [goal.id]: "",
    }));

    toast.success(
      `${formatBRL(value)} adicionado à meta`,
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas metas"
        subtitle="Um objetivo por vez, no seu ritmo."
        action={
          <Button
            className="h-11"
            onClick={openNew}
          >
            <Plus className="size-4" />
            Nova meta
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Carregando...
        </p>
      ) : goals.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title="Você ainda não possui metas."
          description="Crie sua primeira meta, como um notebook, uma viagem ou um curso."
          action={
            <Button
              className="mt-2"
              onClick={openNew}
            >
              <Plus className="size-4" />
              Criar meta
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const target = Number(
              goal.target_amount,
            );

            const saved = Number(
              goal.saved_amount,
            );

            const pct =
              target > 0
                ? Math.min(
                    (saved / target) * 100,
                    100,
                  )
                : 0;

            const missing = Math.max(
              target - saved,
              0,
            );

            return (
              <li
                key={goal.id}
                className="surface p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-semibold">
                      {goal.name}
                    </h2>

                    {goal.deadline ? (
                      <p className="text-xs text-muted-foreground">
                        Prazo:{" "}
                        {formatDateBR(
                          goal.deadline,
                        )}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() =>
                        openEdit(goal)
                      }
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir"
                      onClick={() =>
                        setDeleting(goal)
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <p className="mt-3 text-sm">
                  <strong>
                    {formatBRL(saved)}
                  </strong>{" "}
                  / {formatBRL(target)}
                </p>

                <Progress
                  value={pct}
                  className="mt-2 h-3"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  {pct.toFixed(0)}% ·{" "}
                  {missing > 0
                    ? `Falta ${formatBRL(missing)}`
                    : "Meta conquistada! 🎉"}
                </p>

                <div className="mt-4 flex gap-2">
                  <Input
                    inputMode="decimal"
                    className="h-11"
                    placeholder="Adicionar valor"
                    value={
                      addValue[goal.id] ?? ""
                    }
                    onChange={(e) =>
                      setAddValue((prev) => ({
                        ...prev,
                        [goal.id]:
                          e.target.value,
                      }))
                    }
                  />

                  <Button
                    variant="secondary"
                    className="h-11"
                    onClick={() =>
                      void addToGoal(goal)
                    }
                  >
                    Adicionar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Editar meta"
                : "Nova meta"}
            </DialogTitle>

            <DialogDescription>
              Defina o objetivo e acompanhe o
              progresso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="meta-nome">
                Nome
              </Label>

              <Input
                id="meta-nome"
                className="h-11"
                placeholder="Comprar notebook"
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
              <Label htmlFor="meta-valor">
                Valor objetivo
              </Label>

              <Input
                id="meta-valor"
                inputMode="decimal"
                className="h-11"
                placeholder="3000,00"
                value={form.target}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    target: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meta-guardado">
                Valor já guardado
              </Label>

              <Input
                id="meta-guardado"
                inputMode="decimal"
                className="h-11"
                placeholder="0,00"
                value={form.saved}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    saved: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meta-prazo">
                Prazo (opcional)
              </Label>

              <Input
                id="meta-prazo"
                type="date"
                className="h-11"
                value={form.deadline}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    deadline: e.target.value,
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
              {editing
                ? "Salvar alterações"
                : "Criar meta"}
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
              Excluir meta?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleting
                ? `A meta “${deleting.name}” será removida permanentemente.`
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
                  void remove.mutateAsync(
                    deleting.id,
                  );
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