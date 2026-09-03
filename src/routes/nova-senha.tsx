import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/nova-senha")({
  head: () => ({
    meta: [
      { title: "Nova senha — FinanLook" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta.",
      },
    ],
  }),
  component: NovaSenhaPage,
});

function NovaSenhaPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!password) {
      toast.error("Informe uma nova senha.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);

    if (error) {
      toast.error(
        error.message.includes("session")
          ? "Este link expirou. Peça um novo link de recuperação."
          : "Não foi possível alterar sua senha.",
      );
      return;
    }

    toast.success("Senha alterada com sucesso!");

    navigate({ to: "/auth", search: { modo: "entrar" } });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="surface w-full max-w-sm p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <LockKeyhole className="size-5 text-primary" />
          </span>

          <div>
            <h1 className="font-display text-xl font-semibold">
              Definir nova senha
            </h1>

            <p className="text-sm text-muted-foreground">
              Escolha uma nova senha para sua conta.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova senha</Label>

            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                className="h-11 pr-11"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                maxLength={1000}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>

            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              className="h-11"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              maxLength={1000}
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={saving}>
            {saving ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
