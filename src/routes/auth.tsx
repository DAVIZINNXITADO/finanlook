import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  UserPlus,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


/* =========================================================
   ROTAS
   ========================================================= */

const searchSchema = z.object({
  modo: z
    .enum([
      "entrar",
      "cadastro",
    ])
    .optional()
    .catch("entrar"),
});


export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,

  head: () => ({
    meta: [
      {
        title: "Entrar no FinanLook",
      },

      {
        name: "description",
        content:
          "Entre ou crie sua conta no FinanLook para organizar entradas, gastos, metas e sua vida financeira de forma simples.",
      },

      {
        property: "og:title",
        content:
          "FinanLook — organize sua vida financeira",
      },

      {
        property: "og:description",
        content:
          "Crie sua conta e acompanhe seu dinheiro de forma simples, clara e organizada.",
      },
    ],
  }),

  component: AuthPage,
});


/* =========================================================
   VALIDAÇÃO
   ========================================================= */

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Informe seu nome",
      )
      .max(
        24,
        "O nome pode ter no máximo 24 caracteres",
      ),

    username: z
      .string()
      .trim()
      .min(
        3,
        "O nome de usuário precisa ter pelo menos 3 caracteres",
      )
      .max(
        24,
        "O nome de usuário pode ter no máximo 24 caracteres",
      )
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Use apenas letras, números, ponto, hífen ou underline",
      ),

    email: z
      .string()
      .trim()
      .email(
        "E-mail inválido",
      )
      .max(
        160,
        "O e-mail pode ter no máximo 160 caracteres",
      ),

    password: z
      .string()
      .min(
        6,
        "A senha precisa ter pelo menos 6 caracteres",
      )
      .max(
        1000,
        "A senha pode ter no máximo 1.000 caracteres",
      ),

    confirm: z
      .string()
      .max(
        1000,
        "A confirmação pode ter no máximo 1.000 caracteres",
      ),
  })

  .refine(
    (value) =>
      value.password === value.confirm,
    {
      message:
        "As senhas não são iguais",
      path: [
        "confirm",
      ],
    },
  );


/* =========================================================
   PÁGINA
   ========================================================= */

function AuthPage() {
  const { modo } =
    Route.useSearch();

  const navigate =
    useNavigate();

  const isSignUp =
    modo === "cadastro";


  /* =====================================================
     STATES
     ===================================================== */

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);


  const [
    form,
    setForm,
  ] =
    useState({
      name: "",
      username: "",
      email: "",
      password: "",
      confirm: "",
    });


  /* =====================================================
     ATUALIZAR FORM
     ===================================================== */

  function update(
    key:
      | "name"
      | "username"
      | "email"
      | "password"
      | "confirm",

    value: string,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      }),
    );
  }


  /* =====================================================
     CADASTRO
     ===================================================== */

  async function handleSignUp() {
    const parsed =
      signUpSchema.safeParse(
        form,
      );

    if (
      !parsed.success
    ) {
      toast.error(
        parsed.error.issues[0]
          ?.message ??
          "Verifique os dados informados",
      );

      return;
    }


    setLoading(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email:
            parsed.data.email,

          password:
            parsed.data.password,

          options: {
            emailRedirectTo:
              window.location.origin,

            data: {
              name:
                parsed.data.name,

              username:
                parsed.data.username.toLowerCase(),
            },
          },
        });


      if (
        error
      ) {
        throw error;
      }


      if (
        !data.session
      ) {
        toast.success(
          "Conta criada! Verifique seu e-mail para confirmar sua conta.",
        );

        navigate({
          to: "/auth",

          search: {
            modo:
              "entrar",
          },
        });

        return;
      }


      toast.success(
        "Conta criada com sucesso! 🎉",
      );


      navigate({
        to:
          "/bem-vindo",
      });
    } catch (
      error,
    ) {
      const message =
        error instanceof Error
          ? error.message
          : "";


      toast.error(
        message.includes(
          "already registered",
        )
          ? "Este e-mail já possui uma conta."
          : message ||
              "Não foi possível criar sua conta.",
      );
    } finally {
      setLoading(false);
    }
  }


  /* =====================================================
     LOGIN
     ===================================================== */

  async function handleSignIn() {
    const email =
      form.email
        .trim()
        .toLowerCase();


    if (
      !email
    ) {
      toast.error(
        "Informe seu e-mail",
      );

      return;
    }


    if (
      !form.password
    ) {
      toast.error(
        "Informe sua senha",
      );

      return;
    }


    setLoading(true);

    try {
      const {
        error,
      } =
        await supabase.auth.signInWithPassword({
          email,

          password:
            form.password,
        });


      if (
        error
      ) {
        throw error;
      }


      toast.success(
        "Bem-vindo de volta! 👋",
      );


      navigate({
        to:
          "/visao-geral",
      });
    } catch {
      toast.error(
        "E-mail ou senha incorretos.",
      );
    } finally {
      setLoading(false);
    }
  }


  /* =====================================================
     RECUPERAR SENHA
     ===================================================== */

  async function handleForgotPassword() {
    const email =
      form.email
        .trim()
        .toLowerCase();


    if (
      !email
    ) {
      toast.error(
        "Digite seu e-mail primeiro para recuperar sua senha.",
      );

      return;
    }


    setLoading(true);

    try {
      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${window.location.origin}/redefinir-senha`,
          },
        );


      if (
        error
      ) {
        throw error;
      }


      toast.success(
        "Se existir uma conta com esse e-mail, enviaremos as instruções para recuperar sua senha.",
      );
    } catch {
      toast.error(
        "Não foi possível solicitar a recuperação da senha.",
      );
    } finally {
      setLoading(false);
    }
  }


  /* =====================================================
     SUBMIT
     ===================================================== */

  function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    void (
      isSignUp
        ? handleSignUp()
        : handleSignIn()
    );
  }


  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">


      {/* FUNDO DECORATIVO */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl" />

      </div>


      <div className="relative w-full max-w-md">


        {/* VOLTAR */}

        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />

          Voltar ao início
        </Link>


        {/* LOGO */}

        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-primary shadow-lg shadow-primary/20">

            <img
              src="/favicon.png"
              alt="FinanLook"
              className="size-full object-cover"
            />

          </div>


          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">
              FinanLook
            </p>

            <p className="text-xs text-muted-foreground">
              Organização financeira simples
            </p>
          </div>
        </Link>


        {/* CARD */}

        <div className="surface overflow-hidden">


          {/* TOPO */}

          <div className="border-b bg-muted/30 px-6 py-6">

            <div className="flex items-start gap-4">

              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">

                {isSignUp ? (
                  <UserPlus className="size-5" />
                ) : (
                  <KeyRound className="size-5" />
                )}

              </div>


              <div>

                <h1 className="font-display text-xl font-semibold">

                  {isSignUp
                    ? "Criar sua conta"
                    : "Bem-vindo de volta"}

                </h1>


                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">

                  {isSignUp
                    ? "Comece a organizar sua vida financeira de um jeito simples."
                    : "Entre para continuar acompanhando sua vida financeira."}

                </p>

              </div>

            </div>

          </div>


          {/* FORM */}

          <form
            className="space-y-5 p-6"
            onSubmit={
              handleSubmit
            }
          >


            {/* CADASTRO */}

            {isSignUp ? (
              <>
                <Field
                  id="name"
                  label="Nome"
                  value={
                    form.name
                  }
                  onChange={
                    (value) =>
                      update(
                        "name",
                        value,
                      )
                  }
                  placeholder="Como podemos chamar você?"
                  autoComplete="given-name"
                  maxLength={24}
                />


                <Field
                  id="username"
                  label="Nome de usuário"
                  value={
                    form.username
                  }
                  onChange={
                    (value) =>
                      update(
                        "username",
                        value,
                      )
                  }
                  placeholder="seuusuario"
                  autoComplete="username"
                  maxLength={24}
                  prefix="@"
                />
              </>
            ) : null}


            {/* EMAIL */}

            <Field
              id="email"
              label="E-mail"
              type="email"
              value={
                form.email
              }
              onChange={
                (value) =>
                  update(
                    "email",
                    value,
                  )
              }
              placeholder="voce@email.com"
              autoComplete="email"
              maxLength={160}
              icon={
                <Mail className="size-4" />
              }
            />


            {/* SENHA */}

            <div>

              <div className="mb-1.5 flex items-center justify-between">

                <Label htmlFor="password">
                  Senha
                </Label>


                {!isSignUp ? (
                  <button
                    type="button"
                    onClick={() =>
                      void handleForgotPassword()
                    }
                    disabled={
                      loading
                    }
                    className="text-xs font-medium text-primary transition-opacity hover:opacity-75 disabled:opacity-50"
                  >
                    Esqueci minha senha
                  </button>
                ) : null}

              </div>


              <PasswordField
                id="password"
                value={
                  form.password
                }
                onChange={
                  (value) =>
                    update(
                      "password",
                      value,
                    )
                }
                placeholder="Digite sua senha"
                autoComplete={
                  isSignUp
                    ? "new-password"
                    : "current-password"
                }
                showPassword={
                  showPassword
                }
                onToggleVisibility={() =>
                  setShowPassword(
                    (previous) =>
                      !previous,
                  )
                }
              />

            </div>


            {/* CONFIRMAR */}

            {isSignUp ? (
              <div>

                <Label
                  htmlFor="confirm"
                  className="mb-1.5 block"
                >
                  Confirmar senha
                </Label>


                <PasswordField
                  id="confirm"
                  value={
                    form.confirm
                  }
                  onChange={
                    (value) =>
                      update(
                        "confirm",
                        value,
                      )
                  }
                  placeholder="Digite novamente sua senha"
                  autoComplete="new-password"
                  showPassword={
                    showConfirmPassword
                  }
                  onToggleVisibility={() =>
                    setShowConfirmPassword(
                      (
                        previous,
                      ) =>
                        !previous,
                    )
                  }
                />

              </div>
            ) : null}


            {/* BOTÃO */}

            <Button
              type="submit"
              className="h-12 w-full gap-2 text-sm"
              disabled={
                loading
              }
            >

              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />

                  Aguarde...
                </>
              ) : (
                <>
                  {isSignUp
                    ? "Criar minha conta"
                    : "Entrar na minha conta"}

                  <ArrowRight className="size-4" />
                </>
              )}

            </Button>


            {/* TROCAR MODO */}

            <div className="pt-1 text-center text-sm text-muted-foreground">

              {isSignUp
                ? "Já possui uma conta?"
                : "Ainda não possui uma conta?"}


              <Link
                to="/auth"
                search={{
                  modo:
                    isSignUp
                      ? "entrar"
                      : "cadastro",
                }}
                className="ml-1 font-medium text-primary transition-opacity hover:opacity-75"
              >

                {isSignUp
                  ? "Entrar"
                  : "Criar conta"}

              </Link>

            </div>

          </form>

        </div>


        {/* RODAPÉ */}

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">

          Ao continuar, você concorda com os
          {" "}

          <Link
            to="/termos-de-uso"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Termos de Uso
          </Link>

          {" "}e a{" "}

          <Link
            to="/politica-de-privacidade"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Política de Privacidade
          </Link>.

        </p>

      </div>

    </div>
  );
}


/* =========================================================
   CAMPO NORMAL
   ========================================================= */

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
  prefix,
  icon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  prefix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">

      <div className="flex items-center justify-between gap-3">

        <Label htmlFor={id}>
          {label}
        </Label>


        {value.length > 0 &&
        maxLength ? (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        ) : null}

      </div>


      <div className="relative">

        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        ) : null}


        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}


        <Input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className={[
            "h-11 transition-all",

            prefix || icon
              ? "pl-10"
              : "",
          ].join(" ")}
        />

      </div>

    </div>
  );
}


/* =========================================================
   CAMPO SENHA
   ========================================================= */

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  showPassword,
  onToggleVisibility,
}: {
  id: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  autoComplete?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}) {
  return (
    <div className="relative">

      <Input
        id={id}
        type={
          showPassword
            ? "text"
            : "password"
        }
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={1000}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 pr-11"
      />


      <button
        type="button"
        onClick={
          onToggleVisibility
        }
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
  );
}