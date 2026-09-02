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
  Crown,
  Eye,
  EyeOff,
  Lock,
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
  type ThemeStyle,
} from "@/components/theme-provider";

import {
  THEME_COLORS,
  themeColorSwatch,
  type ThemeColorKey,
} from "@/lib/theme-colors";

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
            "Gerencie sua conta e personalize sua experiência no FinanLook.",
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

  if (
    username.length <= 2
  ) {
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

    themeStyle,
    setThemeStyle,

    themeColor,
    setThemeColor,

    customColor,
    setCustomColor,
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
    appearanceOpen,
    setAppearanceOpen,
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


    if (
      username.length < 3
    ) {
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


  function changeThemeStyle(
    value: ThemeStyle,
  ) {
    setThemeStyle(
      value,
    );


    toast.success(
      value === "real"
        ? "Estilo Real ativado."
        : "Estilo Verdant ativado.",
    );
  }


  function changeThemeColor(
    color: ThemeColorKey,
  ) {
    const selected =
      THEME_COLORS.find(
        (
          item,
        ) =>
          item.key ===
          color,
      );


    if (
      selected?.premium
    ) {
      toast.info(
        "Esta cor está disponível no FinanLook Premium.",
      );

      return;
    }


    setThemeColor(
      color,
    );


    toast.success(
      `Cor ${selected?.label ?? ""} ativada.`,
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
      !accountUsername
    ) {
      toast.error(
        "Não foi possível identificar seu nome de usuário.",
      );

      return;
    }


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
      !accountUsername
    ) {
      toast.error(
        "Não foi possível identificar seu nome de usuário.",
      );

      return;
    }


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


      <section className="grid gap-4 lg:grid-cols-3">

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
          description="Gerencie seu e-mail e senha."
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
          description="Personalize o modo, estilo e cores do FinanLook."
          buttonText="Personalizar"
          onClick={() =>
            setAppearanceOpen(
              true,
            )
          }
        />

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


      {/* PERFIL */}

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

              <Input
                id="profile-username"
                className="h-11"
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


      {/* APARÊNCIA */}

      <Dialog
        open={
          appearanceOpen
        }
        onOpenChange={
          setAppearanceOpen
        }
      >

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">

          <DialogHeader>

            <DialogTitle>
              Aparência
            </DialogTitle>

            <DialogDescription>
              Personalize como o FinanLook aparece para você.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-8 py-2">

            <div>

              <h3 className="font-semibold">
                Modo
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Escolha a aparência clara, escura ou siga o sistema.
              </p>


              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <ThemeOption
                  icon={
                    <Sun className="size-5" />
                  }
                  title="Claro"
                  description="Sempre usar claro"
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
                  description="Sempre usar escuro"
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
                  description="Seguir dispositivo"
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

            </div>


            <div className="border-t pt-6">

              <h3 className="font-semibold">
                Estilo da interface
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Escolha o estilo visual geral.
              </p>


              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <ThemeOption
                  title="Real"
                  description="Visual padrão e equilibrado"
                  active={
                    themeStyle ===
                    "real"
                  }
                  onClick={() =>
                    changeThemeStyle(
                      "real",
                    )
                  }
                />


                <ThemeOption
                  title="Verdant"
                  description="Visual com identidade mais natural"
                  active={
                    themeStyle ===
                    "verdant"
                  }
                  onClick={() =>
                    changeThemeStyle(
                      "verdant",
                    )
                  }
                />

              </div>

            </div>


            <div className="border-t pt-6">

              <h3 className="font-semibold">
                Cor de destaque
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Altera botões, destaques e elementos principais.
              </p>


              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                {THEME_COLORS.map(
                  (
                    color,
                  ) => {

                    const active =
                      themeColor ===
                      color.key;

                    const swatch =
                      themeColorSwatch(
                        color.key,
                        customColor,
                      );


                    return (
                      <button
                        key={
                          color.key
                        }
                        type="button"
                        onClick={() =>
                          changeThemeColor(
                            color.key,
                          )
                        }
                        className={cn(
                          "relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all",

                          active
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "hover:border-primary/30 hover:bg-muted/50",
                        )}
                      >

                        <div
                          className="size-11 shrink-0 rounded-xl border shadow-sm"
                          style={{
                            backgroundColor:
                              swatch,
                          }}
                        />


                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            <p className="font-medium">
                              {
                                color.label
                              }
                            </p>


                            {color.premium ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">

                                <Crown className="size-3" />

                                Premium

                              </span>
                            ) : null}

                          </div>


                          <p className="mt-1 text-sm text-muted-foreground">
                            {
                              color.description
                            }
                          </p>

                        </div>


                        {active ? (
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">

                            <Check className="size-3.5" />

                          </span>
                        ) : color.premium ? (

                          <Lock className="size-4 shrink-0 text-muted-foreground" />

                        ) : null}

                      </button>
                    );
                  },
                )}

              </div>


              {themeColor ===
              "custom" ? (

                <div className="mt-5 rounded-xl border bg-muted/30 p-4">

                  <Label htmlFor="custom-color">
                    Cor personalizada
                  </Label>


                  <div className="mt-3 flex gap-3">

                    <input
                      id="custom-color"
                      type="color"
                      value={
                        customColor
                      }
                      onChange={(
                        event,
                      ) =>
                        setCustomColor(
                          event.target.value,
                        )
                      }
                      className="h-11 w-14 cursor-pointer rounded-lg border bg-transparent p-1"
                    />


                    <Input
                      value={
                        customColor
                      }
                      onChange={(
                        event,
                      ) =>
                        setCustomColor(
                          event.target.value,
                        )
                      }
                      placeholder="#2f6df6"
                      className="h-11 flex-1 uppercase"
                    />

                  </div>

                </div>

              ) : null}

            </div>

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              onClick={() =>
                setAppearanceOpen(
                  false,
                )
              }
            >

              <Check className="size-4" />

              Concluir

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* SEGURANÇA */}

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


      {/* E-MAIL */}

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
              Confirme o e-mail atual e informe o novo endereço.
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
              />

            </div>

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


      {/* SENHA */}

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
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
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
                 