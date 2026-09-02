import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
  type ReactNode,
} from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from "lucide-react";

import {
  PageHeader,
} from "@/components/PageHeader";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  useProfile,
  useUser,
} from "@/lib/data";

import {
  useTheme,
  type Theme,
} from "@/components/theme-provider";

import {
  cn,
} from "@/lib/utils";


export const Route =
  createFileRoute(
    "/_authenticated/configuracoes",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Configurações — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Gerencie sua conta e preferências no FinanLook.",
        },
      ],
    }),

    component:
      SettingsPage,
  });


function maskEmail(
  email: string,
) {
  if (!email) {
    return "";
  }

  const parts =
    email.split("@");

  const username =
    parts[0] ?? "";

  const domain =
    parts[1] ?? "";

  if (!domain) {
    return email;
  }

  if (username.length <= 2) {
    return `${username[0] ?? ""}****@${domain}`;
  }

  const first =
    username[0];

  const last =
    username[
      username.length - 1
    ];

  return `${first}****${last}@${domain}`;
}


function SettingsPage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    data: profile,
  } =
    useProfile();

  const {
    data: authUser,
  } =
    useUser();

  const {
    theme,
    setTheme,
  } =
    useTheme();


  const accountEmail =
    authUser?.email ??
    "";

  const accountUsername =
    profile?.username ??
    "";


  const [
    profileOpen,
    setProfileOpen,
  ] =
    useState(false);

  const [
    securityOpen,
    setSecurityOpen,
  ] =
    useState(false);

  const [
    emailOpen,
    setEmailOpen,
  ] =
    useState(false);

  const [
    passwordOpen,
    setPasswordOpen,
  ] =
    useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] =
    useState(false);

  const [
    deleteStep,
    setDeleteStep,
  ] =
    useState(1);

  const [
    profileName,
    setProfileName,
  ] =
    useState("");

  const [
    profileUsername,
    setProfileUsername,
  ] =
    useState("");

  const [
    currentEmail,
    setCurrentEmail,
  ] =
    useState("");

  const [
    newEmail,
    setNewEmail,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    deleteUsernameFirst,
    setDeleteUsernameFirst,
  ] =
    useState("");

  const [
    deleteUsernameFinal,
    setDeleteUsernameFinal,
  ] =
    useState("");

  const [
    savingProfile,
    setSavingProfile,
  ] =
    useState(false);

  const [
    savingEmail,
    setSavingEmail,
  ] =
    useState(false);

  const [
    savingPassword,
    setSavingPassword,
  ] =
    useState(false);

  const [
    deletingAccount,
    setDeletingAccount,
  ] =
    useState(false);


  function openProfile() {
    setProfileName(
      profile?.name ??
        "",
    );

    setProfileUsername(
      profile?.username ??
        "",
    );

    setProfileOpen(
      true,
    );
  }


  async function saveProfile() {
    const name =
      profileName.trim();

    const username =
      profileUsername
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase();


    if (!name) {
      toast.error(
        "Informe seu nome.",
      );

      return;
    }


    if (!username) {
      toast.error(
        "Informe seu nome de usuário.",
      );

      return;
    }


    if (username.length < 3) {
      toast.error(
        "O nome de usuário precisa ter pelo menos 3 caracteres.",
      );

      return;
    }


    if (
      !/^[a-zA-Z0-9._-]+$/.test(
        username,
      )
    ) {
      toast.error(
        "Use apenas letras, números, ponto, hífen ou underline.",
      );

      return;
    }


    setSavingProfile(
      true,
    );


    try {
      const {
        data,
        error: authError,
      } =
        await supabase.auth.getUser();


      if (
        authError ||
        !data.user
      ) {
        throw new Error(
          "Usuário não autenticado.",
        );
      }


      const {
        error,
      } =
        await supabase
          .from(
            "profiles",
          )
          .update({
            name:
              name.slice(
                0,
                80,
              ),

            username:
              username.slice(
                0,
                40,
              ),
          })
          .eq(
            "id",
            data.user.id,
          );


      if (error) {
        throw error;
      }


      await queryClient.invalidateQueries({
        queryKey: [
          "profile",
        ],
      });


      toast.success(
        "Perfil atualizado com sucesso.",
      );


      setProfileOpen(
        false,
      );
    } catch {
      toast.error(
        "Não foi possível atualizar seu perfil.",
      );
    } finally {
      setSavingProfile(
        false,
      );
    }
  }


  function openEmail() {
    setCurrentEmail(
      "",
    );

    setNewEmail(
      "",
    );

    setEmailOpen(
      true,
    );
  }


  async function saveEmail() {
    const current =
      currentEmail
        .trim()
        .toLowerCase();

    const next =
      newEmail
        .trim()
        .toLowerCase();


    if (!current) {
      toast.error(
        "Informe o e-mail atual.",
      );

      return;
    }


    if (
      current !==
      accountEmail.toLowerCase()
    ) {
      toast.error(
        "O e-mail atual informado não corresponde à sua conta.",
      );

      return;
    }


    if (!next) {
      toast.error(
        "Informe o novo e-mail.",
      );

      return;
    }


    if (
      !next.includes(
        "@",
      )
    ) {
      toast.error(
        "Informe um e-mail válido.",
      );

      return;
    }


    if (
      next ===
      accountEmail.toLowerCase()
    ) {
      toast.error(
        "O novo e-mail precisa ser diferente do atual.",
      );

      return;
    }


    setSavingEmail(
      true,
    );


    try {
      const {
        error,
      } =
        await supabase.auth.updateUser({
          email:
            next,
        });


      if (error) {
        throw error;
      }


      toast.success(
        "Enviamos uma confirmação para concluir a alteração do seu e-mail.",
      );


      setEmailOpen(
        false,
      );

      setCurrentEmail(
        "",
      );

      setNewEmail(
        "",
      );
    } catch {
      toast.error(
        "Não foi possível solicitar a alteração do e-mail.",
      );
    } finally {
      setSavingEmail(
        false,
      );
    }
  }


  function openPassword() {
    setNewPassword(
      "",
    );

    setConfirmPassword(
      "",
    );

    setShowPassword(
      false,
    );

    setPasswordOpen(
      true,
    );
  }


  async function savePassword() {
    if (!newPassword) {
      toast.error(
        "Informe uma nova senha.",
      );

      return;
    }


    if (
      newPassword.length <
      6
    ) {
      toast.error(
        "A senha precisa ter pelo menos 6 caracteres.",
      );

      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "As senhas não coincidem.",
      );

      return;
    }


    setSavingPassword(
      true,
    );


    try {
      const {
        error,
      } =
        await supabase.auth.updateUser({
          password:
            newPassword,
        });


      if (error) {
        throw error;
      }


      toast.success(
        "Senha alterada com sucesso.",
      );


      setPasswordOpen(
        false,
      );

      setNewPassword(
        "",
      );

      setConfirmPassword(
        "",
      );
    } catch {
      toast.error(
        "Não foi possível alterar sua senha.",
      );
    } finally {
      setSavingPassword(
        false,
      );
    }
  }


  function changeTheme(
    value: Theme,
  ) {
    setTheme(
      value,
    );


    const name =
      value === "light"
        ? "tema claro"
        : value === "dark"
          ? "tema escuro"
          : "tema do sistema";


    toast.success(
      `Aparência alterada para ${name}.`,
    );
  }


  async function signOut() {
    try {
      await queryClient.cancelQueries();

      queryClient.clear();


      const {
        error,
      } =
        await supabase.auth.signOut();


      if (error) {
        throw error;
      }


      await navigate({
        to:
          "/auth",

        search: {
          modo:
            "entrar",
        },

        replace:
          true,
      });
    } catch {
      toast.error(
        "Não foi possível sair da conta.",
      );
    }
  }


  function openDeleteAccount() {
    setDeleteStep(
      1,
    );

    setDeleteUsernameFirst(
      "",
    );

    setDeleteUsernameFinal(
      "",
    );

    setDeleteOpen(
      true,
    );
  }


  function confirmDeleteStepOne() {
    const typed =
      deleteUsernameFirst
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase();


    if (
      typed !==
      accountUsername.toLowerCase()
    ) {
      toast.error(
        "O nome de usuário não corresponde à sua conta.",
      );

      return;
    }


    setDeleteStep(
      2,
    );

    setDeleteUsernameFinal(
      "",
    );
  }


  async function deleteAccount() {
    const typed =
      deleteUsernameFinal
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase();


    if (
      typed !==
      accountUsername.toLowerCase()
    ) {
      toast.error(
        "O nome de usuário não corresponde à sua conta.",
      );

      return;
    }


    setDeletingAccount(
      true,
    );


    try {
      const {
        error,
      } =
        await supabase.functions.invoke(
          "delete-account",
        );


      if (error) {
        throw error;
      }


      await supabase.auth.signOut();

      queryClient.clear();


      toast.success(
        "Sua conta foi excluída.",
      );


      await navigate({
        to:
          "/",

        replace:
          true,
      });
    } catch {
      toast.error(
        "Não foi possível excluir sua conta.",
      );
    } finally {
      setDeletingAccount(
        false,
      );
    }
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta e personalize sua experiência no FinanLook."
      />


      <section className="grid gap-4 lg:grid-cols-2">

        <SettingsCard
          icon={
            <User className="size-6" />
          }
          title="Perfil"
          description="Atualize seu nome e nome de usuário."
          buttonText="Configurar"
          onClick={
            openProfile
          }
        />


        <SettingsCard
          icon={
            <ShieldCheck className="size-6" />
          }
          title="Conta e segurança"
          description="Gerencie seu e-mail, senha e informações de acesso."
          buttonText="Configurar"
          onClick={() =>
            setSecurityOpen(
              true,
            )
          }
        />


        <SettingsCard
          icon={
            <Palette className="size-6" />
          }
          title="Aparência"
          description="Personalize como o FinanLook aparece para você."
          buttonText="Personalizar"
          onClick={() =>
            document
              .getElementById(
                "appearance",
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",
              })
          }
        />

      </section>


      <section
        id="appearance"
        className="surface p-5"
      >
        <div className="flex items-start gap-3">

          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Palette className="size-5 text-primary" />
          </div>


          <div>
            <h2 className="font-display text-lg font-semibold">
              Aparência
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Escolha como deseja visualizar o FinanLook.
            </p>
          </div>

        </div>


        <div className="mt-5 grid gap-3 sm:grid-cols-3">

          <ThemeOption
            icon={
              <Sun className="size-5" />
            }
            title="Claro"
            description="Sempre usar aparência clara"
            active={
              theme ===
              "light"
            }
            onClick={() =>
              changeTheme(
                "light",
              )
            }
          />


          <ThemeOption
            icon={
              <Moon className="size-5" />
            }
            title="Escuro"
            description="Sempre usar aparência escura"
            active={
              theme ===
              "dark"
            }
            onClick={() =>
              changeTheme(
                "dark",
              )
            }
          />


          <ThemeOption
            icon={
              <Monitor className="size-5" />
            }
            title="Sistema"
            description="Seguir o dispositivo"
            active={
              theme ===
              "system"
            }
            onClick={() =>
              changeTheme(
                "system",
              )
            }
          />

        </div>
      </section>


      <section>
        <div className="mb-3">
          <h2 className="font-display text-lg font-semibold">
            Conta
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Ações relacionadas à sua conta.
          </p>
        </div>


        <div className="grid gap-4 sm:grid-cols-2">

          <DangerCard
            icon={
              <LogOut className="size-6" />
            }
            title="Sair da conta"
            description="Encerrar sua sessão neste dispositivo."
            buttonText="Sair da conta"
            onClick={() =>
              void signOut()
            }
          />


          <DangerCard
            icon={
              <Trash2 className="size-6" />
            }
            title="Excluir conta"
            description="Remover permanentemente sua conta e seus dados."
            buttonText="Excluir conta"
            onClick={
              openDeleteAccount
            }
          />

        </div>
      </section>


      <Dialog
        open={
          profileOpen
        }
        onOpenChange={
          setProfileOpen
        }
      >
        <DialogContent className="sm:max-w-md">

          <DialogHeader>
            <DialogTitle>
              Editar perfil
            </DialogTitle>

            <DialogDescription>
              Atualize as informações exibidas na sua conta.
            </DialogDescription>
          </DialogHeader>


          <div className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="profile-name">
                Nome
              </Label>

              <Input
                id="profile-name"
                className="h-11"
                value={
                  profileName
                }
                onChange={(
                  event,
                ) =>
                  setProfileName(
                    event.target.value,
                  )
                }
                placeholder="Seu nome"
                maxLength={80}
              />
            </div>


            <div className="space-y-1.5">
              <Label htmlFor="profile-username">
                Nome de usuário
              </Label>

              <div className="relative">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>

                <Input
                  id="profile-username"
                  className="h-11 pl-7"
                  value={
                    profileUsername
                  }
                  onChange={(
                    event,
                  ) =>
                    setProfileUsername(
                      event.target.value,
                    )
                  }
                  placeholder="seuusername"
                  maxLength={40}
                />

              </div>
            </div>

          </div>


          <DialogFooter>
            <Button
              className="h-11 w-full"
              disabled={
                savingProfile
              }
              onClick={() =>
                void saveProfile()
              }
            >
              <Save className="size-4" />

              {savingProfile
                ? "Salvando..."
                : "Salvar alterações"}

            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>


      <Dialog
        open={
          securityOpen
        }
        onOpenChange={
          setSecurityOpen
        }
      >
        <DialogContent className="sm:max-w-md">

          <DialogHeader>
            <DialogTitle>
              Conta e segurança
            </DialogTitle>

            <DialogDescription>
              Gerencie suas informações e credenciais de acesso.
            </DialogDescription>
          </DialogHeader>


          <div className="divide-y rounded-xl border">

            <SettingsRow
              icon={
                <Mail className="size-5" />
              }
              title="E-mail"
              description={
                maskEmail(
                  accountEmail,
                ) ||
                "Nenhum e-mail disponível"
              }
              action="Alterar"
              onClick={() => {
                setSecurityOpen(
                  false,
                );

                openEmail();
              }}
            />


            <SettingsRow
              icon={
                <LockKeyhole className="size-5" />
              }
              title="Senha"
              description="Altere sua senha de acesso."
              action="Alterar"
              onClick={() => {
                setSecurityOpen(
                  false,
                );

                openPassword();
              }}
            />

          </div>

        </DialogContent>
      </Dialog>


      <Dialog
        open={
          emailOpen
        }
        onOpenChange={
          setEmailOpen
        }
      >
        <DialogContent className="sm:max-w-md">

          <DialogHeader>
            <DialogTitle>
              Alterar e-mail
            </DialogTitle>

            <DialogDescription>
              Confirme o e-mail atual e informe o novo endereço que deseja utilizar.
            </DialogDescription>
          </DialogHeader>


          <div className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="current-email">
                E-mail atual
              </Label>

              <Input
                id="current-email"
                type="email"
                className="h-11"
                value={
                  currentEmail
                }
                onChange={(
                  event,
                ) =>
                  setCurrentEmail(
                    event.target.value,
                  )
                }
                placeholder="Digite seu e-mail atual"
                autoComplete="email"
              />
            </div>


            <div className="space-y-1.5">
              <Label htmlFor="new-email">
                Novo e-mail
              </Label>

              <Input
                id="new-email"
                type="email"
                className="h-11"
                value={
                  newEmail
                }
                onChange={(
                  event,
                ) =>
                  setNewEmail(
                    event.target.value,
                  )
                }
                placeholder="Digite seu novo e-mail"
                autoComplete="email"
              />
            </div>


            <p className="text-xs leading-relaxed text-muted-foreground">
              Uma confirmação será enviada para concluir a alteração.
            </p>

          </div>


          <DialogFooter>
            <Button
              className="h-11 w-full"
              disabled={
                savingEmail
              }
              onClick={() =>
                void saveEmail()
              }
            >
              <Mail className="size-4" />

              {savingEmail
                ? "Enviando..."
                : "Continuar"}

            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>


      <Dialog
        open={
          passwordOpen
        }
        onOpenChange={
          setPasswordOpen
        }
      >
        <DialogContent className="sm:max-w-md">

          <DialogHeader>
            <DialogTitle>
              Alterar senha
            </DialogTitle>

            <DialogDescription>
              Escolha uma nova senha para acessar sua conta.
            </DialogDescription>
          </DialogHeader>


          <div className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="new-password">
                Nova senha
              </Label>

              <div className="relative">

                <Input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="h-11 pr-11"
                  value={
                    newPassword
                  }
                  onChange={(
                    event,
                  ) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                  autoComplete="new-password"
                  maxLength={1000}
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
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
              <Label htmlFor="confirm-password">
                Confirmar nova senha
              </Label>

              <Input
                id="confirm-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="h-11"
                value={
                  confirmPassword
                }
                onChange={(
                  event,
                ) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                maxLength={1000}
              />
            </div>

          </div>


          <DialogFooter>
            <Button
              className="h-11 w-full"
              disabled={
                savingPassword
              }
              onClick={() =>
                void savePassword()
              }
            >
              <LockKeyhole className="size-4" />

              {savingPassword
                ? "Alterando..."
                : "Alterar senha"}

            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>


      <Dialog
        open={
          deleteOpen
        }
        onOpenChange={
          setDeleteOpen
        }
      >
        <DialogContent className="sm:max-w-md">

          {deleteStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Excluir conta
                </DialogTitle>

                <DialogDescription>
                  Esta ação iniciará o processo de exclusão permanente da sua conta.
                </DialogDescription>
              </DialogHeader>


              <div className="space-y-4">

                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">

                  <p className="text-sm font-medium text-destructive">
                    Atenção
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Esta é uma ação sensível e será necessário confirmar sua identidade em duas etapas.
                  </p>

                </div>


                <div className="space-y-1.5">

                  <Label htmlFor="delete-username-first">
                    Confirme seu nome de usuário
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Digite exatamente:
                  </p>

                  <p className="font-semibold">
                    @{accountUsername}
                  </p>

                  <Input
                    id="delete-username-first"
                    className="h-11"
                    value={
                      deleteUsernameFirst
                    }
                    onChange={(
                      event,
                    ) =>
                      setDeleteUsernameFirst(
                        event.target.value,
                      )
                    }
                    placeholder="Digite seu username"
                    autoComplete="off"
                  />

                </div>

              </div>


              <DialogFooter>
                <Button
                  variant="destructive"
                  className="h-11 w-full"
                  onClick={
                    confirmDeleteStepOne
                  }
                >
                  Continuar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  Confirmação final
                </DialogTitle>

                <DialogDescription>
                  Para concluir, confirme novamente seu nome de usuário.
                </DialogDescription>
              </DialogHeader>


              <div className="space-y-4">

                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">

                  <p className="text-sm font-medium text-destructive">
                    Esta ação é permanente.
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Após confirmar, sua conta será enviada para exclusão.
                  </p>

                </div>


                <div className="space-y-1.5">

                  <Label htmlFor="delete-username-final">
                    Digite novamente
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Confirme:
                  </p>

                  <p className="font-semibold">
                    @{accountUsername}
                  </p>

                  <Input
                    id="delete-username-final"
                    className="h-11"
                    value={
                      deleteUsernameFinal
                    }
                    onChange={(
                      event,
                    ) =>
                      setDeleteUsernameFinal(
                        event.target.value,
                      )
                    }
                    placeholder="Digite seu username novamente"
                    autoComplete="off"
                  />

                </div>

              </div>


              <DialogFooter>
                <Button
                  variant="destructive"
                  className="h-11 w-full"
                  disabled={
                    deletingAccount
                  }
                  onClick={() =>
                    void deleteAccount()
                  }
                >
                  <Trash2 className="size-4" />

                  {deletingAccount
                    ? "Excluindo..."
                    : "Excluir minha conta"}

                </Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>

    </div>
  );
}


function SettingsCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <section className="surface p-5">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>


      <h2 className="mt-4 font-display text-lg font-semibold">
        {title}
      </h2>


      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>


      <Button
        variant="ghost"
        className="mt-4 px-0 text-primary hover:bg-transparent hover:text-primary"
        onClick={onClick}
      >
        {buttonText}

        <ChevronRight className="size-4" />
      </Button>
    </section>
  );
}


function DangerCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">

      <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        {icon}
      </div>


      <h2 className="mt-4 font-display text-lg font-semibold text-destructive">
        {title}
      </h2>


      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>


      <Button
        variant="outline"
        className="mt-4 w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={onClick}
      >
        {buttonText}
      </Button>

    </section>
  );
}


function SettingsRow({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40"
    >

      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
        {icon}
      </div>


      <div className="min-w-0 flex-1">

        <p className="font-medium">
          {title}
        </p>

        <p className="mt-1 truncate text-sm text-muted-foreground">
          {description}
        </p>

      </div>


      <div className="flex items-center gap-1 text-sm font-medium text-primary">

        <span>
          {action}
        </span>

        <ChevronRight className="size-4" />

      </div>

    </button>
  );
}


function ThemeOption({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all",

        active
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "hover:border-primary/30 hover:bg-muted/50",
      )}
    >

      {active ? (
        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : null}


      {icon}


      <div>

        <p className="font-medium">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>

      </div>

    </button>
  );
}