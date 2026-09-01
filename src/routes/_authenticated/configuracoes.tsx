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
  ChevronRight,
  Crown,
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
  Sparkles,
  Sun,
  User,
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

/* =========================================================
   ROTA
   ========================================================= */

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
            "Gerencie sua conta, segurança, aparência e preferências no FinanLook.",
        },
      ],
    }),

    component:
      SettingsPage,
  });

/* =========================================================
   PÁGINA
   ========================================================= */

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

  /* =======================================================
     CONTROLE DAS MINI TELAS
     ======================================================= */

  const [
    profileOpen,
    setProfileOpen,
  ] =
    useState(false);

  const [
    accountOpen,
    setAccountOpen,
  ] =
    useState(false);

  const [
    securityOpen,
    setSecurityOpen,
  ] =
    useState(false);

  const [
    appearanceOpen,
    setAppearanceOpen,
  ] =
    useState(false);

  const [
    subscriptionOpen,
    setSubscriptionOpen,
  ] =
    useState(false);

  const [
    editEmailOpen,
    setEditEmailOpen,
  ] =
    useState(false);

  /* =======================================================
     PERFIL
     ======================================================= */

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

  /* =======================================================
     EMAIL
     ======================================================= */

  const [
    newEmail,
    setNewEmail,
  ] =
    useState("");

  /* =======================================================
     SENHA
     ======================================================= */

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

  /* =======================================================
     LOADING
     ======================================================= */

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

  /* =======================================================
     ABRIR PERFIL
     ======================================================= */

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

  /* =======================================================
     SALVAR PERFIL
     ======================================================= */

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

    if (
      name.length < 2
    ) {
      toast.error(
        "Seu nome precisa ter pelo menos 2 caracteres.",
      );

      return;
    }

    if (!username) {
      toast.error(
        "Informe seu username.",
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

      setProfileOpen(
        false,
      );
    } catch (
      error,
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível atualizar seu perfil.",
      );
    } finally {
      setSavingProfile(
        false,
      );
    }
  }

  /* =======================================================
     ABRIR EMAIL
     ======================================================= */

  function openEmail() {
    setNewEmail(
      accountEmail,
    );

    setEditEmailOpen(
      true,
    );
  }

  /* =======================================================
     SALVAR EMAIL
     ======================================================= */

  async function saveEmail() {
    const email =
      newEmail
        .trim()
        .toLowerCase();

    if (!email) {
      toast.error(
        "Informe um email.",
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      toast.error(
        "Informe um email válido.",
      );

      return;
    }

    if (
      email ===
      accountEmail.toLowerCase()
    ) {
      toast.error(
        "Informe um email diferente do atual.",
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
        "Enviamos uma confirmação para o novo email.",
      );

      setEditEmailOpen(
        false,
      );
    } catch (
      error,
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível alterar seu email.",
      );
    } finally {
      setSavingEmail(
        false,
      );
    }
  }

  /* =======================================================
     SALVAR SENHA
     ======================================================= */

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

      setNewPassword(
        "",
      );

      setConfirmPassword(
        "",
      );

      setShowPassword(
        false,
      );

      setSecurityOpen(
        false,
      );
    } catch (
      error,
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível alterar sua senha.",
      );
    } finally {
      setSavingPassword(
        false,
      );
    }
  }

  /* =======================================================
     TEMA
     ======================================================= */

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
      value ===
      "light"
        ? "tema claro"
        : value ===
            "dark"
          ? "tema escuro"
          : "tema do sistema";

    toast.success(
      `Aparência alterada para ${themeName}.`,
    );
  }

  /* =======================================================
     LOGOUT
     ======================================================= */

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

      navigate({
        to:
          "/auth",

        replace:
          true,
      });
    } catch (
      error,
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível sair da conta.",
      );
    }
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-8">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta e personalize sua experiência no FinanLook."
      />

      {/* =================================================
          RESUMO DA CONTA
         ================================================= */}

      <section className="surface overflow-hidden">
        <div className="flex items-center gap-4 p-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <User className="size-7 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-semibold">
              {profile?.name ||
                "Sua conta"}
            </h2>

            <p className="truncate text-sm text-muted-foreground">
              {accountEmail ||
                "Nenhum email encontrado"}
            </p>

            {profile?.username ? (
              <p className="mt-1 text-xs text-primary">
                @
                {
                  profile.username
                }
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* =================================================
          PREFERÊNCIAS
         ================================================= */}

      <section className="surface overflow-hidden">
        <SettingsSectionHeader
          icon={
            <User className="size-5 text-primary" />
          }
          title="Conta e preferências"
          description="Gerencie suas informações e preferências."
        />

        <div className="divide-y">
          <SettingsRow
            icon={
              <User className="size-5" />
            }
            title="Perfil"
            description="Nome e username"
            onClick={
              openProfile
            }
          />

          <SettingsRow
            icon={
              <Mail className="size-5" />
            }
            title="Conta"
            description={
              accountEmail ||
              "Gerencie seu email"
            }
            onClick={() =>
              setAccountOpen(
                true,
              )
            }
          />

          <SettingsRow
            icon={
              <Palette className="size-5" />
            }
            title="Aparência"
            description={
              theme ===
              "light"
                ? "Tema claro"
                : theme ===
                    "dark"
                  ? "Tema escuro"
                  : "Seguir o sistema"
            }
            onClick={() =>
              setAppearanceOpen(
                true,
              )
            }
          />
        </div>
      </section>

      {/* =================================================
          SEGURANÇA
         ================================================= */}

      <section className="surface overflow-hidden">
        <SettingsSectionHeader
          icon={
            <ShieldCheck className="size-5 text-primary" />
          }
          title="Segurança"
          description="Proteja sua conta e seus dados."
        />

        <SettingsRow
          icon={
            <LockKeyhole className="size-5" />
          }
          title="Senha"
          description="Altere sua senha de acesso"
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

            setSecurityOpen(
              true,
            );
          }}
        />
      </section>

      {/* =================================================
          ASSINATURA
         ================================================= */}

      <section className="surface overflow-hidden">
        <SettingsSectionHeader
          icon={
            <Crown className="size-5 text-primary" />
          }
          title="Assinatura"
          description="Veja seu plano e futuras opções do FinanLook."
        />

        <SettingsRow
          icon={
            <Sparkles className="size-5" />
          }
          title="Seu plano"
          description="Gratuito"
          badge="Grátis"
          onClick={() =>
            setSubscriptionOpen(
              true,
            )
          }
        />
      </section>

      {/* =================================================
          SESSÃO
         ================================================= */}

      <section className="surface overflow-hidden">
        <SettingsSectionHeader
          icon={
            <LogOut className="size-5 text-primary" />
          }
          title="Sessão"
          description="Gerencie sua sessão neste dispositivo."
        />

        <SettingsRow
          icon={
            <LogOut className="size-5" />
          }
          title="Sair da conta"
          description="Encerrar sua sessão neste dispositivo"
          destructive
          onClick={() =>
            void signOut()
          }
        />
      </section>

      {/* =================================================
          MODAL PERFIL
         ================================================= */}

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
              Escolha como seu nome será exibido no FinanLook.
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
                maxLength={
                  80
                }
                onChange={(
                  event,
                ) =>
                  setProfileName(
                    event.target.value,
                  )
                }
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
                  maxLength={
                    40
                  }
                  onChange={(
                    event,
                  ) =>
                    setProfileUsername(
                      event.target.value,
                    )
                  }
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
          MODAL CONTA
         ================================================= */}

      <Dialog
        open={
          accountOpen
        }
        onOpenChange={
          setAccountOpen
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Conta
            </DialogTitle>

            <DialogDescription>
              Gerencie as informações principais da sua conta.
            </DialogDescription>
          </DialogHeader>

          <div className="divide-y rounded-xl border">
            <MiniSettingRow
              icon={
                <Mail className="size-5" />
              }
              title="Email"
              description={
                accountEmail ||
                "Nenhum email"
              }
              onClick={
                openEmail
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* =================================================
          MODAL EMAIL
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
              Alterar email
            </DialogTitle>

            <DialogDescription>
              Uma confirmação será enviada para concluir a alteração.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="email">
              Novo email
            </Label>

            <Input
              id="email"
              type="email"
              className="h-11"
              value={
                newEmail
              }
              maxLength={
                160
              }
              onChange={(
                event,
              ) =>
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
                : "Alterar email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================================================
          MODAL SEGURANÇA
         ================================================= */}

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
              Segurança
            </DialogTitle>

            <DialogDescription>
              Escolha uma nova senha para sua conta.
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
                  maxLength={
                    1000
                  }
                  autoComplete="new-password"
                  onChange={(
                    event,
                  ) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (
                        current,
                      ) =>
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
                className="h-11"
                value={
                  confirmPassword
                }
                maxLength={
                  1000
                }
                autoComplete="new-password"
                onChange={(
                  event,
                ) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Use pelo menos 6 caracteres.
            </p>
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
          MODAL APARÊNCIA
         ================================================= */}

      <Dialog
        open={
          appearanceOpen
        }
        onOpenChange={
          setAppearanceOpen
        }
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Aparência
            </DialogTitle>

            <DialogDescription>
              Escolha como deseja visualizar o FinanLook.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-3">
            <ThemeOption
              icon={
                <Sun className="size-5" />
              }
              title="Claro"
              description="Sempre claro"
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
              description="Sempre escuro"
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
              description="Do dispositivo"
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
        </DialogContent>
      </Dialog>

      {/* =================================================
          MODAL ASSINATURA
         ================================================= */}

      <Dialog
        open={
          subscriptionOpen
        }
        onOpenChange={
          setSubscriptionOpen
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assinatura
            </DialogTitle>

            <DialogDescription>
              Gerencie seu plano no FinanLook.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="size-5 text-primary" />
              </div>

              <div>
                <p className="font-semibold">
                  Plano gratuito
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Você está utilizando a versão gratuita do FinanLook.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed p-4 text-center">
            <Crown className="mx-auto size-5 text-primary" />

            <p className="mt-2 text-sm font-medium">
              Novos planos em breve
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Quando você adicionar assinaturas ao FinanLook, elas aparecerão aqui.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
   CABEÇALHO DE SEÇÃO
   ========================================================= */

function SettingsSectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">
            {title}
          </h2>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LINHA PRINCIPAL
   ========================================================= */

function SettingsRow({
  icon,
  title,
  description,
  destructive = false,
  badge,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  destructive?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-muted/40"
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
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "font-medium",

              destructive &&
                "text-destructive",
            )}
          >
            {title}
          </p>

          {badge ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {badge}
            </span>
          ) : null}
        </div>

        <p className="mt-1 truncate text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <ChevronRight
        className={cn(
          "size-4 shrink-0 text-muted-foreground",

          destructive &&
            "text-destructive",
        )}
      />
    </button>
  );
}

/* =========================================================
   LINHA DENTRO DE MINI TELA
   ========================================================= */

function MiniSettingRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {title}
        </p>

        <p className="truncate text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <ChevronRight className="size-4 text-muted-foreground" />
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
      onClick={
        onClick
      }
      className={cn(
        "relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all",

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

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  );
}