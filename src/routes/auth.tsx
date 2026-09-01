import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  z,
} from "zod";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";


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
          "Entre ou crie sua conta no FinanLook para organizar sua vida financeira de forma simples.",
      },
      {
        property: "og:title",
        content: "Entrar no FinanLook",
      },
      {
        property: "og:description",
        content:
          "Acesse sua conta ou crie uma nova conta no FinanLook.",
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


function AuthPage() {
  const {
    modo,
  } = Route.useSearch();

  const navigate = useNavigate();

  const isSignUp =
    modo === "cadastro";


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const [
    showRecovery,
    setShowRecovery,
  ] = useState(false);


  const [
    recoveryLoading,
    setRecoveryLoading,
  ] = useState(false);


  const [
    recoveryEmail,
    setRecoveryEmail,
  ] = useState("");


  const [
    form,
    setForm,
  ] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });


  function update(
    key: keyof typeof form,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }


  async function handleSignUp() {
    const parsed =
      signUpSchema.safeParse(form);


    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ??
          "Verifique os dados informados.",
      );

      return;
    }


    setLoading(true);


    try {
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,

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


      if (error) {
        throw error;
      }


      if (!data.session) {
        toast.success(
          "Conta criada! Confirme seu e-mail para entrar.",
        );


        await navigate({
          to: "/auth",

          search: {
            modo: "entrar",
          },

          replace: true,
        });

        return;
      }


      toast.success(
        "Conta criada com sucesso!",
      );


      await navigate({
        to: "/bem-vindo",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "";


      toast.error(
        message.includes(
          "already registered",
        )
          ? "Este e-mail já possui uma conta. Tente entrar."
          : message ||
            "Não foi possível criar sua conta.",
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleSignIn() {
    const email =
      form.email
        .trim()
        .toLowerCase();


    if (!email) {
      toast.error(
        "Informe seu e-mail.",
      );

      return;
    }


    if (!form.password) {
      toast.error(
        "Informe sua senha.",
      );

      return;
    }


    if (
      form.password.length >
      1000
    ) {
      toast.error(
        "A senha pode ter no máximo 1.000 caracteres.",
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


      if (error) {
        throw error;
      }


      toast.success(
        "Login realizado com sucesso!",
      );


      await navigate({
        to: "/visao-geral",
      });
    } catch {
      toast.error(
        "E-mail ou senha incorretos.",
      );
    } finally {
      setLoading(false);
    }
  }


  async function handlePasswordRecovery() {
    const email =
      recoveryEmail
        .trim()
        .toLowerCase();


    if (!email) {
      toast.error(
        "Informe seu e-mail.",
      );

      return;
    }


    if (!email.includes("@")) {
      toast.error(
        "Informe um e-mail válido.",
      );

      return;
    }


    setRecoveryLoading(true);


    try {
      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${window.location.origin}/nova-senha`,
          },
        );


      if (error) {
        throw error;
      }


      toast.success(
        "Se existir uma conta com este e-mail, enviaremos um link para redefinir sua senha.",
      );


      setRecoveryEmail("");

      setShowRecovery(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o e-mail de recuperação.",
      );
    } finally {
      setRecoveryLoading(false);
    }
  }


  if (showRecovery) {
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


        <div className="surface w-full max-w-sm overflow-hidden">

          <div className="border-b bg-primary/[0.03] px-6 py-7 text-center">

            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">

              <KeyRound className="size-6 text-primary" />

            </div>


            <h1 className="mt-4 font-display text-2xl font-semibold">
              Recuperar senha
            </h1>


            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Digite seu e-mail e enviaremos um link para você criar uma nova senha.
            </p>

          </div>


          <form
            className="space-y-5 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void handlePasswordRecovery();
            }}
          >

            <div className="space-y-1.5">

              <Label htmlFor="recovery-email">
                E-mail da conta
              </Label>


              <div className="relative">

                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />


                <Input
                  id="recovery-email"
                  type="email"
                  value={recoveryEmail}
                  onChange={(event) =>
                    setRecoveryEmail(
                      event.target.value,
                    )
                  }
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  maxLength={160}
                  className="h-11 pl-10"
                />

              </div>


              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Enviaremos um link de recuperação para este endereço.
              </p>

            </div>


            <Button
              type="submit"
              className="h-11 w-full"
              disabled={recoveryLoading}
            >
              <Mail className="size-4" />

              {recoveryLoading
                ? "Enviando..."
                : "Enviar link de recuperação"}

            </Button>

          </form>

        </div>


        <button
          type="button"
          onClick={() =>
            setShowRecovery(false)
          }
          className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Voltar para entrar
        </button>

      </div>
    );
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


      <div className="surface w-full max-w-sm overflow-hidden">

        <div className="border-b bg-primary/[0.03] px-6 py-6">

          <h1 className="font-display text-2xl font-semibold">

            {isSignUp
              ? "Criar sua conta"
              : "Bem-vindo de volta"}

          </h1>


          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">

            {isSignUp
              ? "Comece a organizar sua vida financeira de um jeito simples."
              : "Entre na sua conta para continuar organizando seu dinheiro."}

          </p>

        </div>


        <form
          className="space-y-4 p-6"
          onSubmit={(event) => {
            event.preventDefault();

            if (isSignUp) {
              void handleSignUp();
            } else {
              void handleSignIn();
            }
          }}
        >

          {isSignUp ? (
            <>

              <Field
                id="name"
                label="Nome"
                value={form.name}
                onChange={(value) =>
                  update(
                    "name",
                    value,
                  )
                }
                placeholder="Seu primeiro nome"
                helperText="Como você gostaria de ser chamado?"
                autoComplete="given-name"
                maxLength={24}
              />


              <Field
                id="username"
                label="Nome de usuário"
                value={form.username}
                onChange={(value) =>
                  update(
                    "username",
                    value,
                  )
                }
                placeholder="seuusername"
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
            onChange={(value) =>
              update(
                "email",
                value,
              )
            }
            placeholder="seuemail@exemplo.com"
            helperText="Use um e-mail que você tenha acesso."
            autoComplete="email"
            maxLength={160}
          />


          <PasswordField
            id="password"
            label="Senha"
            value={form.password}
            onChange={(value) =>
              update(
                "password",
                value,
              )
            }
            placeholder="Digite sua senha"
            helperText={
              isSignUp
                ? "Sua senha deve ter pelo menos 6 caracteres."
                : "Digite a senha usada na sua conta."
            }
            autoComplete={
              isSignUp
                ? "new-password"
                : "current-password"
            }
            showPassword={showPassword}
            onToggleVisibility={() =>
              setShowPassword(
                (previous) => !previous,
              )
            }
          />


          {!isSignUp ? (
            <div className="flex justify-end">

              <button
                type="button"
                onClick={() => {
                  setRecoveryEmail(
                    form.email,
                  );

                  setShowRecovery(true);
                }}
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </button>

            </div>
          ) : null}


          {isSignUp ? (
            <PasswordField
              id="confirm"
              label="Confirmar senha"
              value={form.confirm}
              onChange={(value) =>
                update(
                  "confirm",
                  value,
                )
              }
              placeholder="Repita sua senha"
              helperText="Digite novamente a mesma senha."
              autoComplete="new-password"
              showPassword={showConfirmPassword}
              onToggleVisibility={() =>
                setShowConfirmPassword(
                  (previous) => !previous,
                )
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

      </div>


      <p className="mt-6 text-center text-sm text-muted-foreground">

        {isSignUp
          ? "Já possui uma conta? "
          : "Ainda não possui uma conta? "}


        <Link
          to="/auth"
          search={{
            modo:
              isSignUp
                ? "entrar"
                : "cadastro",
          }}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >

          {isSignUp
            ? "Entrar"
            : "Criar conta"}

        </Link>

      </p>

    </div>
  );
}


/* =========================================================
   COMPONENTE: CAMPO DE SENHA
   ========================================================= */

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
  onChange: (
    value: string,
  ) => void;
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

        <Label htmlFor={id}>
          {label}
        </Label>


        {value.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        ) : null}

      </div>


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
          maxLength={maxLength}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
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


/* =========================================================
   COMPONENTE: CAMPO NORMAL
   ========================================================= */

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
  onChange: (
    value: string,
  ) => void;
  type?: string;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">

      <div className="flex items-center justify-between gap-2">

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