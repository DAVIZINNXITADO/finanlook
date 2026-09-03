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
  generateRecoveryLink,
} from "@/lib/password.recovery.functions";

import {
  sendPasswordRecoveryEmail,
} from "@/lib/emailHolder";

import {
  SiteIcon,
} from "@/components/SiteIcon";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";


const searchSchema =
  z.object({
    modo:
      z.enum([
        "entrar",
        "cadastro",
      ])
        .optional()
        .catch(
          "entrar",
        ),
  });


export const Route =
  createFileRoute(
    "/auth",
  )({
    validateSearch:
      searchSchema,

    head: () => ({
      meta: [
        {
          title:
            "Entrar no FinanLook",
        },
        {
          name:
            "description",

          content:
            "Acesse sua conta do FinanLook ou crie uma nova para começar a organizar seu dinheiro.",
        },
        {
          property:
            "og:title",

          content:
            "Entrar no FinanLook",
        },
        {
          property:
            "og:description",

          content:
            "Acesse ou crie sua conta do FinanLook.",
        },
      ],
    }),

    component:
      AuthPage,
  });


const signUpSchema =
  z
    .object({
      name:
        z
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

      username:
        z
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

      email:
        z
          .string()
          .trim()
          .email(
            "E-mail inválido",
          )
          .max(
            160,
            "O e-mail pode ter no máximo 160 caracteres",
          ),

      password:
        z
          .string()
          .min(
            6,
            "A senha precisa ter pelo menos 6 caracteres",
          )
          .max(
            1000,
            "A senha pode ter no máximo 1.000 caracteres",
          ),

      confirm:
        z
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

        path:
          [
            "confirm",
          ],
      },
    );


function AuthPage() {
  const {
    modo,
  } =
    Route.useSearch();


  const navigate =
    useNavigate();


  const isSignUp =
    modo === "cadastro";


  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
    );


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(
      false,
    );


  const [
    showRecovery,
    setShowRecovery,
  ] =
    useState(
      false,
    );


  const [
    recoveryEmail,
    setRecoveryEmail,
  ] =
    useState(
      "",
    );


  const [
    recoveryLoading,
    setRecoveryLoading,
  ] =
    useState(
      false,
    );


  const [
    form,
    setForm,
  ] =
    useState({
      name:
        "",

      username:
        "",

      email:
        "",

      password:
        "",

      confirm:
        "",
    });


  function update(
    key: keyof typeof form,
    value: string,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [key]:
          value,
      }),
    );
  }


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


    setLoading(
      true,
    );


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

          options:
            {
              emailRedirectTo:
                window.location.origin,

              data:
                {
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
        toast.error(
          error.message.includes(
            "already registered",
          )
            ? "Este e-mail já possui uma conta. Tente entrar."
            : error.message,
        );

        return;
      }


      if (
        !data.session
      ) {
        toast.success(
          "Conta criada! Confirme seu e-mail para entrar.",
        );


        navigate({
          to:
            "/auth",

          search:
            {
              modo:
                "entrar",
            },
        });

        return;
      }


      toast.success(
        "Conta criada com sucesso!",
      );


      navigate({
        to:
          "/bem-vindo",
      });

    } catch {
      toast.error(
        "Não foi possível criar sua conta.",
      );

    } finally {
      setLoading(
        false,
      );
    }
  }


  async function handleSignIn() {
    if (
      !form.email
        .trim()
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


    if (
      form.password.length >
      1000
    ) {
      toast.error(
        "A senha pode ter no máximo 1.000 caracteres",
      );

      return;
    }


    setLoading(
      true,
    );


    try {
      const {
        error,
      } =
        await supabase.auth.signInWithPassword({
          email:
            form.email
              .trim()
              .toLowerCase(),

          password:
            form.password,
        });


      if (
        error
      ) {
        toast.error(
          "E-mail ou senha incorretos",
        );

        return;
      }


      navigate({
        to:
          "/visao-geral",
      });

    } catch {
      toast.error(
        "Não foi possível entrar na sua conta.",
      );

    } finally {
      setLoading(
        false,
      );
    }
  }


  async function handlePasswordRecovery() {
    const email =
      recoveryEmail
        .trim()
        .toLowerCase();


    if (
      !email
    ) {
      toast.error(
        "Informe seu e-mail.",
      );

      return;
    }


    if (
      !email.includes(
        "@",
      )
    ) {
      toast.error(
        "Informe um e-mail válido.",
      );

      return;
    }


    setRecoveryLoading(
      true,
    );


    try {
      const result =
        await generateRecoveryLink({
          data:
            {
              email,
              origin:
                window.location.origin,
            },
        });


      if (
        result?.link
      ) {
        await sendPasswordRecoveryEmail({
          toEmail:
            email,

          toName:
            "Usuário",

          resetLink:
            result.link,
        });
      }


      toast.success(
        "Se existir uma conta com este e-mail, enviaremos um link para redefinir sua senha.",
      );


      setRecoveryEmail(
        "",
      );


      setShowRecovery(
        false,
      );

    } catch (error) {
      console.error(
        "Erro ao recuperar senha:",
        error,
      );


      toast.error(
        "Não foi possível enviar o e-mail de recuperação.",
      );

    } finally {
      setRecoveryLoading(
        false,
      );
    }
  }


  if (
    showRecovery
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">

        <Link
          to="/"
          className="mb-6 flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <SiteIcon className="size-10 rounded-xl object-contain" />

          <span className="font-display text-xl font-semibold">
            FinanLook
          </span>
        </Link>


        <div className="surface w-full max-w-sm p-6">

          <div className="flex items-center gap-3">

            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <KeyRound className="size-5 text-primary" />
            </span>


            <div>

              <h1 className="font-display text-xl font-semibold">
                Recuperar senha
              </h1>


              <p className="text-sm text-muted-foreground">
                Enviaremos um link para você criar uma nova senha.
              </p>

            </div>

          </div>


          <form
            className="mt-6 space-y-4"
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
                  value={
                    recoveryEmail
                  }
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

            </div>


            <Button
              type="submit"
              className="h-11 w-full"
              disabled={
                recoveryLoading
              }
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
            setShowRecovery(
              false,
            )
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
        <SiteIcon className="size-10 rounded-xl object-contain" />

        <span className="font-display text-xl font-semibold">
          FinanLook
        </span>
      </Link>


      <div className="surface w-full max-w-sm p-6">

        <h1 className="font-display text-xl font-semibold">
          {isSignUp
            ? "Criar conta"
            : "Entrar"}
        </h1>


        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp
            ? "Crie sua conta e comece a organizar sua vida financeira."
            : "Bem-vindo de volta! Acesse sua conta para continuar."}
        </p>


        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();

            void (
              isSignUp
                ? handleSignUp()
                : handleSignIn()
            );
          }}
        >

          {isSignUp ? (
            <>

              <Field
                id="name"
                label="Nome"
                value={
                  form.name
                }
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
                value={
                  form.username
                }
                onChange={(value) =>
                  update(
                    "username",
                    value,
                  )
                }
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
            value={
              form.email
            }
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
            value={
              form.password
            }
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


          {!isSignUp ? (
            <div className="flex justify-end">

              <button
                type="button"
                onClick={() => {
                  setRecoveryEmail(
                    form.email,
                  );

                  setShowRecovery(
                    true,
                  );
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
              value={
                form.confirm
              }
              onChange={(value) =>
                update(
                  "confirm",
                  value,
                )
              }
              placeholder="Repita sua senha"
              helperText="Digite novamente a mesma senha."
              autoComplete="new-password"
              showPassword={
                showConfirmPassword
              }
              onToggleVisibility={() =>
                setShowConfirmPassword(
                  (previous) =>
                    !previous,
                )
              }
            />
          ) : null}


          <Button
            type="submit"
            className="h-11 w-full"
            disabled={
              loading
            }
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
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}) {
  const maxLength =
    1000;


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
  type =
    "text",
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