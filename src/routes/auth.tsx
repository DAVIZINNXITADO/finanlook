import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  modo: z.enum(["entrar", "cadastro"]).optional().catch("entrar"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar no FinanFácil" },
      {
        name: "description",
        content: "Acesse sua conta do FinanFácil ou crie uma nova para começar a organizar seu dinheiro.",
      },
      { property: "og:title", content: "Entrar no FinanFácil" },
      { property: "og:description", content: "Acesse ou crie sua conta do FinanFácil." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome").max(80),
    username: z
      .string()
      .trim()
      .min(3, "O nome de usuário precisa ter pelo menos 3 caracteres")
      .max(24)
      .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou underline"),
    email: z.string().trim().email("E-mail inválido").max(160),
    password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "As senhas não são iguais",
    path: ["confirm"],
  });

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const isSignUp = modo === "cadastro";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSignUp() {
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: parsed.data.name, username: parsed.data.username.toLowerCase() },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Este e-mail já possui uma conta. Tente entrar."
          : error.message,
      );
      return;
    }
    if (!data.session) {
      toast.success("Conta criada! Confirme seu e-mail para entrar.");
      navigate({ to: "/auth", search: { modo: "entrar" } });
      return;
    }
    toast.success("Conta criada com sucesso!");
    navigate({ to: "/bem-vindo" });
  }

  async function handleSignIn() {
    if (!form.email.trim() || !form.password) {
      toast.error("Informe e-mail e senha");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha incorretos");
      return;
    }
    navigate({ to: "/visao-geral" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <span className="hero-gradient flex size-10 items-center justify-center rounded-xl text-lg">
          💚
        </span>
        <span className="font-display text-xl font-semibold">FinanFácil</span>
      </Link>

      <div className="surface w-full max-w-sm p-6">
        <h1 className="font-display text-xl font-semibold">
          {isSignUp ? "Criar conta" : "Entrar"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp
            ? "Leva menos de um minuto para começar."
            : "Bem-vindo de volta! Acesse sua conta."}
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void (isSignUp ? handleSignUp() : handleSignIn());
          }}
        >
          {isSignUp ? (
            <>
              <Field
                id="name"
                label="Nome"
                value={form.name}
                onChange={(v) => update("name", v)}
                placeholder="Seu nome"
                autoComplete="name"
              />
              <Field
                id="username"
                label="Nome de usuário"
                value={form.username}
                onChange={(v) => update("username", v)}
                placeholder="joao"
                autoComplete="username"
              />
            </>
          ) : null}

          <Field
            id="email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
          <Field
            id="password"
            label="Senha"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            placeholder="••••••••"
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          {isSignUp ? (
            <Field
              id="confirm"
              label="Confirmar senha"
              type="password"
              value={form.confirm}
              onChange={(v) => update("confirm", v)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          ) : null}

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Aguarde..." : isSignUp ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignUp ? "Já possui uma conta? " : "Ainda não possui uma conta? "}
          <Link
            to="/auth"
            search={{ modo: isSignUp ? "entrar" : "cadastro" }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-11"
      />
    </div>
  );
}
