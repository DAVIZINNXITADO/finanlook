import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
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
      { title: "Entrar no FinanLook" },
      {
        name: "description",
        content:
          "Acesse sua conta do FinanLook ou crie uma nova para começar a organizar seu dinheiro.",
      },
      {
        property: "og:title",
        content: "Entrar no FinanLook",
      },
      {
        property: "og:description",
        content: "Acesse ou crie sua conta do FinanLook.",
      },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome")
      .max(24, "O nome pode ter no máximo 24 caracteres"),

    username: z
      .string()
      .trim()
      .min(3, "O nome de usuário precisa ter pelo menos 3 caracteres")
      .max(24, "O nome de usuário pode ter no máximo 24 caracteres")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Use apenas letras, números, ponto, hífen ou underline",
      ),

    email: z
      .string()
      .trim()
      .email("E-mail inválido")
      .max(160, "O e-mail pode ter no máximo 160 caracteres"),

    password: z
      .string()
      .min(6, "A senha precisa ter pelo menos 6 caracteres")
      .max(1000, "A senha pode ter no máximo 1.000 caracteres"),

    confirm: z
      .string()
      .max(1000, "A confirmação pode ter no máximo 1.000 caracteres"),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSignUp() {
    const parsed = signUpSchema.safeParse(form);

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Verifique os dados informados",
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: parsed.data.name,
          username: parsed.data.username.toLowerCase(),
        },
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

      navigate({
        to: "/auth",
        search: {
          modo: "entrar",
        },
      });

      return;
    }

    toast.success("Conta criada com sucesso!");

    navigate({
      to: "/bem-vindo",
    });
  }

  async function handleSignIn() {
    if (!form.email.trim()) {
      toast.error("Informe seu e-mail");
      return;
    }

    if (!form.password) {
      toast.error("Informe sua senha");
      return;
    }

    if (form.password.length > 1000) {
      toast.error("A senha pode ter no máximo 1.000 caracteres");
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

    navigate({
      to: "/visao-geral",
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <Link
        to="/"
        className="mb-6 flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <span className="hero-gradient flex size-10 items-center justify-center rounded-xl text-lg">
          💸
        </span>

        <span className="font-display text-xl font-semibold">
          FinanLook
        </span>
      </Link>

      <div className="surface w-full max-w-sm p-6">
        <h1 className="font-display text-xl font-semibold">
          {isSignUp ? "Criar conta" : "Entrar"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp
            ? "Crie sua conta e comece a organizar sua vida financeira."
            : "Bem-vindo de volta! Acesse sua conta para continuar."}
        </p>

        <form
          className="mt-6 space-y-4"
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
                placeholder="Seu primeiro nome"
                helperText="Como você gostaria de ser chamado?"
                autoComplete="given-name"
                maxLength={24}
              />

              <Field
                id="username"
                label="Nome de usuário"
                value={form.username}
                onChange={(v) => update("username", v)}
                placeholder="Escolha seu nome de usuário"
                helperText="Use letras, números, ponto, hífen ou underline."
                autoComplete="username"
                maxLength={24}
              />
            </>
          ) : null}

          <Field
            id="email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="seuemail@exemplo.com"
            helperText="Use um e-mail que você tenha acesso."
            autoComplete="email"
            maxLength={160}
          />

          <PasswordField
            id="password"
            label="Senha"
            value={form.password}
            onChange={(v) => update("password", v)}
            placeholder="Digite sua senha"
            helperText={
              isSignUp
                ? "Sua senha deve ter pelo menos 6 caracteres."
                : "Digite a senha usada na sua conta."
            }
            autoComplete={isSignUp ? "new-password" : "current-password"}
            showPassword={showPassword}
            onToggleVisibility={() =>
              setShowPassword((prev) => !prev)
            }
          />

          {isSignUp ? (
            <PasswordField
              id="confirm"
              label="Confirmar senha"
              value={form.confirm}
              onChange={(v) => update("confirm", v)}
              placeholder="Repita sua senha"
              helperText="Digite novamente a mesma senha."
              autoComplete="new-password"
              showPassword={showConfirmPassword}
              onToggleVisibility={() =>
                setShowConfirmPassword((prev) => !prev)
              }
            />
          ) : null}

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={loading}
          >
            {loading
              ? "Aguarde..."
              : isSignUp
                ? "Criar minha conta"
                : "Entrar na minha conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp
            ? "Já possui uma conta? "
            : "Ainda não possui uma conta? "}

          <Link
            to="/auth"
            search={{
              modo: isSignUp ? "entrar" : "cadastro",
            }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  helperText,
  autoComplete,
  showPassword,
  onToggleVisibility,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}) {
  const maxLength = 1000;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>

        {value.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>

      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pr-11"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={
            showPassword
              ? "Ocultar senha"
              : "Mostrar senha"
          }
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>

      {helperText ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {helperText}
        </p>
      ) : null}
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
  helperText,
  autoComplete,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>

        {value.length > 0 && maxLength ? (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>

      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="h-11"
      />

      {helperText ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}