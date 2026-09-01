import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
  type ReactNode,
} from "react";

import {
  toast,
} from "sonner";

import {
  Check,
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
  UserRound,
} from "lucide-react";

import {
  useQueryClient,
} from "@tanstack/react-query";

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


export const Route = createFileRoute(
  "/_authenticated/configuracoes",
)({
  head: () => ({
    meta: [
      {
        title: "Configurações — FinanLook",
      },
      {
        name: "description",
        content:
          "Gerencie sua conta, segurança e preferências no FinanLook.",
      },
    ],
  }),

  component: SettingsPage,
});


type SettingsSection =
  | "perfil"
  | "seguranca"
  | "aparencia"
  | "conta";


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


  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SettingsSection>(
      "perfil",
    );


  const accountEmail =
    authUser?.email ??
    "";


  const currentUsername =
    profile?.username ??
    "";


  /* =====================================================
     DIALOGS
     ===================================================== */

  const [
    editProfileOpen,
    setEditProfileOpen,
  ] =
    useState(false);


  const [
    editEmailOpen,
    setEditEmailOpen,
  ] =
    useState(false);


  const [
    editPasswordOpen,
    setEditPasswordOpen,
  ] =
    useState(false);


  const [
    logoutOpen,
    setLogoutOpen,
  ] =
    useState(false);


  const [
    deleteAccountOpen,
    setDeleteAccountOpen,
  ] =
    useState(false);


  /* =====================================================
     PERFIL
     ===================================================== */

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


  /* =====================================================
     EMAIL
     ===================================================== */

  const [
    newEmail,
    setNewEmail,
  ] =
    useState("");


  /* =====================================================
     SENHA
     ===================================================== */

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


  /* =====================================================
     CONFIRMAÇÕES
     ===================================================== */

  const [
    logoutUsername,
    setLogoutUsername,
  ] =
    useState("");


  const [
    deleteUsername,
    setDeleteUsername,
  ] =
    useState("");


  /* =====================================================
     LOADING
     ===================================================== */

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


  /* =====================================================
     EMAIL MASCARADO
     ===================================================== */

  function maskEmail(
    email: string,
  ) {
    if (!email) {
      return "Não informado";
    }


    const [
      local,
      domain,
    ] =
      email.split("@");


    if (
      !local ||
      !domain
    ) {
      return email;
    }


    if (
      local.length === 1
    ) {
      return `${local}****@${domain}`;
    }


    const first =
      local.charAt(0);


    const last =
      local.charAt(
        local.length - 1,
      );


    return `${first}****${last}@${domain}`;
  }


  /* =====================================================
     PERFIL
     ===================================================== */

  function openProfileDialog() {
    setProfileName(
      profile?.name ??
        "",
    );

    setProfileUsername(
      profile?.username ??
        "",
    );

    setEditProfileOpen(
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


    if (
      name.length < 2
    ) {
      toast.error(
        "Informe um nome com pelo menos 2 caracteres.",
      );

      return;
    }


    if (
      name.length > 80
    ) {
      toast.error(
        "O nome pode ter no máximo 80 caracteres.",
      );

      return;
    }


    if (
      username.length < 3
    ) {
      toast.error(
        "O username precisa ter pelo menos 3 caracteres.",
      );

      return;
    }


    if (
      username.length > 40
    ) {
      toast.error(
        "O username pode ter no máximo 40 caracteres.",
      );

      return;
    }


    if (
      !/^[a-zA-Z0-9._-]+$/.test(
        username,
      )
    ) {
      toast.error(
        "Use apenas letras, números, ponto, hífen ou underline no username.",
      );

      return;
    }


    setSavingProfile(
      true,
    );


    try {
      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.getUser();


      if (
        authError ||
        !authData.user
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
            name,
            username,
          })
          .eq(
            "id",
            authData.user.id,
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


      setEditProfileOpen(
        false,
      );
    } catch (
      error,
    ) {
      const message =
        error instanceof Error
          ? error.message
          : "";


      if (
        message.toLowerCase().includes(
          "duplicate",
        )
      ) {
        toast.error(
          "Este username já está sendo utilizado.",
        );
      } else {
        toast.error(
          "Não foi possível atualizar seu perfil.",
        );
      }
    } finally {
      setSavingProfile(
        false,
      );
    }
  }


  /* =====================================================
     EMAIL
     ===================================================== */

  function openEmailDialog() {
    setNewEmail(
      accountEmail,
    );

    setEditEmailOpen(
      true,
    );
  }


  async function saveEmail() {
    const email =
      newEmail
        .trim()
        .toLowerCase();


    if (!email) {
      toast.error(
        "Informe um e-mail.",
      );

      return;
    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      toast.error(
        "Informe um e-mail válido.",
      );

      return;
    }


    if (
      email ===
      accountEmail.toLowerCase()
    ) {
      toast.error(
        "Informe um e-mail diferente do atual.",
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
          email,
        });


      if (error) {
        throw error;
      }


      toast.success(
        "Enviamos uma confirmação para o novo e-mail.",
      );


      setEditEmailOpen(
        false,
      );
    } catch {
      toast.error(
        "Não foi possível alterar seu e-mail.",
      );
    } finally {
      setSavingEmail(
        false,
      );
    }
  }


  /* =====================================================
     SENHA
     ===================================================== */

  async function savePassword() {
    if (
      !newPassword
    ) {
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
      newPassword.length >
      1000
    ) {
      toast.error(
        "A senha pode ter no máximo 1.000 caracteres.",
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


      setNewPassword(
        "",
      );


      setConfirmPassword(
        "",
      );


      setShowPassword(
        false,
      );


      setEditPasswordOpen(
        false,
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


  /* =====================================================
     TEMA
     ===================================================== */

  function changeTheme(
    value: Theme,
  ) {
    if (
      value ===
      theme
    ) {
      return;
    }


    setTheme(
      value,
    );


    const themeName =
      value === "light"
        ? "tema claro"
        : value === "dark"
          ? "tema escuro"
          : "tema do sistema";


    toast.success(
      `Aparência alterada para ${themeName}.`,
    );
  }


  /* =====================================================
     LOGOUT
     ===================================================== */

  function openLogoutDialog() {
    setLogoutUsername(
      "",
    );

    setLogoutOpen(
      true,
    );
  }


  async function signOut() {
    const confirmation =
      logoutUsername
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase();


    if (
      confirmation !==
      currentUsername.toLowerCase()
    ) {
      toast.error(
        "O username informado não confere.",
      );

      return;
    }


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


      toast.success(
        "Você saiu da sua conta.",
      );


      navigate({
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


  /* =====================================================
     EXCLUIR CONTA
     ===================================================== */

  function openDeleteDialog() {
    setDeleteUsername(
      "",
    );

    setDeleteAccountOpen(
      true,
    );
  }


  async function deleteAccount() {
    const confirmation =
      deleteUsername
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase();


    if (
      confirmation !==
      currentUsername.toLowerCase()
    ) {
      toast.error(
        "O username informado não confere.",
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
        "Sua conta foi excluída com sucesso.",
      );


      navigate({
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


      {/* =================================================
          NAVEGAÇÃO DAS CONFIGURAÇÕES
         ================================================= */}

      <section className="surface p-2">

        <div className="grid gap-2 sm:grid-cols-4">

          <SettingsTab
            icon={
              <UserRound className="size-4" />
            }
            title="Perfil"
            active={
              activeSection ===
              "perfil"
            }
            onClick={() =>
              setActiveSection(
                "perfil",
              )
            }
          />


          <SettingsTab
            icon={
              <ShieldCheck className="size-4" />
            }
            title="Segurança"
            active={
              activeSection ===
              "seguranca"
            }
            onClick={() =>
              setActiveSection(
                "seguranca",
              )
            }
          />


          <SettingsTab
            icon={
              <Palette className="size-4" />
            }
            title="Aparência"
            active={
              activeSection ===
              "aparencia"
            }
            onClick={() =>
              setActiveSection(
                "aparencia",
              )
            }
          />


          <SettingsTab
            icon={
              <User className="size-4" />
            }
            title="Conta"
            active={
              activeSection ===
              "conta"
            }
            onClick={() =>
              setActiveSection(
                "conta",
              )
            }
          />

        </div>

      </section>


      {/* =================================================
          PERFIL
         ================================================= */}

      {activeSection ===
      "perfil" ? (

        <section className="surface overflow-hidden">

          <div className="border-b p-5">

            <div className="flex items-center gap-3">

              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">

                <User className="size-5 text-primary" />

              </div>


              <div>

                <h2 className="font-display text-lg font-semibold">
                  Perfil
                </h2>

                <p className="text-sm text-muted-foreground">
                  Gerencie suas informações pessoais.
                </p>

              </div>

            </div>

          </div>


          <div className="divide-y">

            <SettingsAction
              icon={
                <User className="size-5" />
              }
              title="Nome e username"
              description={
                profile
                  ? `${profile.name || "Você"} • @${
                      profile.username ||
                      "username"
                    }`
                  : "Configure seu nome e username"
              }
              action="Editar"
              onClick={
                openProfileDialog
              }
            />


            <SettingsAction
              icon={
                <Mail className="size-5" />
              }
              title="E-mail"
              description={
                maskEmail(
                  accountEmail,
                )
              }
              action="Alterar"
              onClick={
                openEmailDialog
              }
            />

          </div>

        </section>

      ) : null}


      {/* =================================================
          SEGURANÇA
         ================================================= */}

      {activeSection ===
      "seguranca" ? (

        <section className="surface overflow-hidden">

          <div className="border-b p-5">

            <div className="flex items-center gap-3">

              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">

                <ShieldCheck className="size-5 text-primary" />

              </div>


              <div>

                <h2 className="font-display text-lg font-semibold">
                  Segurança
                </h2>

                <p className="text-sm text-muted-foreground">
                  Proteja o acesso à sua conta.
                </p>

              </div>

            </div>

          </div>


          <SettingsAction
            icon={
              <LockKeyhole className="size-5" />
            }
            title="Senha"
            description="Altere sua senha de acesso."
            action="Alterar"
            onClick={() => {
              setNewPassword(
                "",
              );

              setConfirmPassword(
                "",
              );

              setShowPassword(
                false,
              );

              setEditPasswordOpen(
                true,
              );
            }}
          />

        </section>

      ) : null}


      {/* =================================================
          APARÊNCIA
         ================================================= */}

      {activeSection ===
      "aparencia" ? (

        <section className="surface p-5">

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


          <div className="mt-6 grid gap-3 sm:grid-cols-3">

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
              description="Seguir o tema do dispositivo"
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

      ) : null}


      {/* =================================================
          CONTA
         ================================================= */}

      {activeSection ===
      "conta" ? (

        <div className="space-y-6">

          <section className="surface overflow-hidden">

            <div className="border-b p-5">

              <div className="flex items-center gap-3">

                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">

                  <User className="size-5 text-primary" />

                </div>


                <div>

                  <h2 className="font-display text-lg font-semibold">
                    Sessão
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Gerencie sua sessão atual.
                  </p>

                </div>

              </div>

            </div>


            <SettingsAction
              icon={
                <LogOut className="size-5" />
              }
              title="Sair da conta"
              description="Encerre sua sessão neste dispositivo."
              action="Sair"
              onClick={
                openLogoutDialog
              }
            />

          </section>


          <section className="overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/[0.03]">

            <div className="p-5">

              <div className="flex items-start gap-3">

                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">

                  <Trash2 className="size-5" />

                </div>


                <div>

                  <h2 className="font-display text-lg font-semibold text-destructive">
                    Zona de perigo
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    A exclusão da conta remove permanentemente seus dados.
                  </p>

                </div>

              </div>


              <Button
                type="button"
                variant="destructive"
                className="mt-5"
                onClick={
                  openDeleteDialog
                }
              >
                <Trash2 className="size-4" />

                Excluir minha conta
              </Button>

            </div>

          </section>

        </div>

      ) : null}


      {/* =================================================
          DIALOG PERFIL
         ================================================= */}

      <Dialog
        open={
          editProfileOpen
        }
        onOpenChange={
          setEditProfileOpen
        }
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Editar perfil
            </DialogTitle>

            <DialogDescription>
              Atualize seu nome e username.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-4">

            <div className="space-y-1.5">

              <Label htmlFor="name">
                Nome
              </Label>

              <Input
                id="name"
                className="h-11"
                value={
                  profileName
                }
                onChange={(event) =>
                  setProfileName(
                    event.target.value,
                  )
                }
                maxLength={80}
                placeholder="Seu nome"
              />

            </div>


            <div className="space-y-1.5">

              <Label htmlFor="username">
                Username
              </Label>


              <div className="relative">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>


                <Input
                  id="username"
                  className="h-11 pl-7"
                  value={
                    profileUsername
                  }
                  onChange={(event) =>
                    setProfileUsername(
                      event.target.value,
                    )
                  }
                  maxLength={40}
                  placeholder="seuusername"
                />

              </div>


              <p className="text-xs text-muted-foreground">
                Use letras, números, ponto, hífen ou underline.
              </p>

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


      {/* =================================================
          DIALOG EMAIL
         ================================================= */}

      <Dialog
        open={
          editEmailOpen
        }
        onOpenChange={
          setEditEmailOpen
        }
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Alterar e-mail
            </DialogTitle>

            <DialogDescription>
              Você receberá uma confirmação no novo endereço.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-1.5">

            <Label htmlFor="email">
              Novo e-mail
            </Label>

            <Input
              id="email"
              type="email"
              className="h-11"
              value={
                newEmail
              }
              onChange={(event) =>
                setNewEmail(
                  event.target.value,
                )
              }
              placeholder="voce@email.com"
            />

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
                ? "Alterando..."
                : "Alterar e-mail"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* =================================================
          DIALOG SENHA
         ================================================= */}

      <Dialog
        open={
          editPasswordOpen
        }
        onOpenChange={
          setEditPasswordOpen
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
                  autoComplete="new-password"
                  className="h-11 pr-11"
                  value={
                    newPassword
                  }
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
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
                autoComplete="new-password"
                className="h-11"
                value={
                  confirmPassword
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
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


      {/* =================================================
          DIALOG SAIR
         ================================================= */}

      <Dialog
        open={
          logoutOpen
        }
        onOpenChange={
          setLogoutOpen
        }
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Confirmar saída
            </DialogTitle>

            <DialogDescription>
              Para confirmar que esta ação está sendo realizada por você, digite seu username abaixo.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-3">

            <p className="rounded-xl bg-muted p-3 text-sm">

              Confirme digitando:

              {" "}

              <strong>
                {currentUsername}
              </strong>

            </p>


            <div className="space-y-1.5">

              <Label htmlFor="logout-username">
                Seu username
              </Label>

              <Input
                id="logout-username"
                className="h-11"
                value={
                  logoutUsername
                }
                onChange={(event) =>
                  setLogoutUsername(
                    event.target.value,
                  )
                }
                placeholder={currentUsername}
              />

            </div>

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              variant="destructive"
              onClick={() =>
                void signOut()
              }
            >

              <LogOut className="size-4" />

              Sair da conta

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* =================================================
          DIALOG EXCLUIR CONTA
         ================================================= */}

      <Dialog
        open={
          deleteAccountOpen
        }
        onOpenChange={
          setDeleteAccountOpen
        }
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle className="text-destructive">
              Excluir conta
            </DialogTitle>

            <DialogDescription>
              Esta ação é permanente. Após excluir sua conta, seus dados não poderão ser recuperados.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-3">

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">

              <p className="font-medium text-destructive">
                Confirmação necessária
              </p>

              <p className="mt-1 text-muted-foreground">
                Para excluir sua conta, digite exatamente seu username:
              </p>

              <p className="mt-2 font-semibold">
                {currentUsername}
              </p>

            </div>


            <div className="space-y-1.5">

              <Label htmlFor="delete-username">
                Confirmar username
              </Label>

              <Input
                id="delete-username"
                className="h-11"
                value={
                  deleteUsername
                }
                onChange={(event) =>
                  setDeleteUsername(
                    event.target.value,
                  )
                }
                placeholder={currentUsername}
              />

            </div>

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              variant="destructive"
              disabled={
                deletingAccount
              }
              onClick={() =>
                void deleteAccount()
              }
            >

              <Trash2 className="size-4" />

              {deletingAccount
                ? "Excluindo conta..."
                : "Excluir permanentemente"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}


/* =========================================================
   ABA DE CONFIGURAÇÕES
   ========================================================= */

function SettingsTab({
  icon,
  title,
  active,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all",

        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}

      {title}
    </button>
  );
}


/* =========================================================
   AÇÃO DE CONFIGURAÇÃO
   ========================================================= */

function SettingsAction({
  icon,
  title,
  description,
  action,
  destructive = false,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/40"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary",

          destructive &&
            "bg-destructive/10 text-destructive",
        )}
      >
        {icon}
      </div>


      <div className="min-w-0 flex-1">

        <p
          className={cn(
            "font-medium",

            destructive &&
              "text-destructive",
          )}
        >
          {title}
        </p>


        <p className="mt-1 truncate text-sm text-muted-foreground">
          {description}
        </p>

      </div>


      <span
        className={cn(
          "shrink-0 text-sm font-medium text-primary",

          destructive &&
            "text-destructive",
        )}
      >
        {action}
      </span>

    </button>
  );
}


/* =========================================================
   OPÇÃO DE TEMA
   ========================================================= */

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
        "relative flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border p-5 text-center transition-all",

        active
          ? "border