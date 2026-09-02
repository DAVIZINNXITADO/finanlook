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
      ],
    }),
    component:
      SettingsPage,
  });


function maskEmail(
  email: string,
) {
  const [
    name = "",
    domain = "",
  ] =
    email.split("@");

  if (
    !name ||
    !domain
  ) {
    return email;
  }

  if (
    name.length <=
    2
  ) {
    return `${name[0] ?? ""}***@${domain}`;
  }

  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}


function normalizeUsername(
  value: string,
) {
  return value
    .trim()
    .replace(
      /^@/,
      "",
    )
    .toLowerCase();
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
    deleteUsername,
    setDeleteUsername,
  ] =
    useState("");


  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    deleting,
    setDeleting,
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
      normalizeUsername(
        profileUsername,
      );

    if (
      !name
    ) {
      toast.error(
        "Informe seu nome.",
      );
      return;
    }

    if (
      username.length <
      3
    ) {
      toast.error(
        "O nome de usuário precisa ter pelo menos 3 caracteres.",
      );
      return;
    }

    if (
      !/^[a-z0-9._-]+$/i.test(
        username,
      )
    ) {
      toast.error(
        "Use apenas letras, números, ponto, hífen ou underline.",
      );
      return;
    }

    setSaving(
      true,
    );

    try {
      const {
        data,
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
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

      if (
        error
      ) {
        throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: [
          "profile",
        ],
      });

      toast.success(
        "Perfil atualizado.",
      );

      setProfileOpen(
        false,
      );
    } catch {
      toast.error(
        "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSaving(
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

    if (
      current !==
      accountEmail.toLowerCase()
    ) {
      toast.error(
        "Informe corretamente o e-mail atual.",
      );
      return;
    }

    if (
      !next ||
      !next.includes(
        "@",
      )
    ) {
      toast.error(
        "Informe um novo e-mail válido.",
      );
      return;
    }

    if (
      next ===
      accountEmail.toLowerCase()
    ) {
      toast.error(
        "O novo e-mail deve ser diferente do atual.",
      );
      return;
    }

    setSaving(
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

      if (
        error
      ) {
        throw error;
      }

      toast.success(
        "Enviamos uma confirmação para o novo e-mail.",
      );

      setEmailOpen(
        false,
      );
    } catch {
      toast.error(
        "Não foi possível alterar o e-mail.",
      );
    } finally {
      setSaving(
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

    setSaving(
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

      if (
        error
      ) {
        throw error;
      }

      toast.success(
        "Senha alterada.",
      );

      setPasswordOpen(
        false,
      );
    } catch {
      toast.error(
        "Não foi possível alterar a senha.",
      );
    } finally {
      setSaving(
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
  }


  function changeThemeStyle(
    value: ThemeStyle,
  ) {
    setThemeStyle(
      value,
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
  }


  async function signOut() {
    try {
      queryClient.clear();

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (
        error
      ) {
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
    setDeleteUsername(
      "",
    );
    setDeleteOpen(
      true,
    );
  }


  async function deleteAccount() {
    const typed =
      normalizeUsername(
        deleteUsername,
      );

    if (
      !accountUsername ||
      typed !==
      accountUsername.toLowerCase()
    ) {
      toast.error(
        "O nome de usuário não corresponde à sua conta.",
      );
      return;
    }

    setDeleting(
      true,
    );

    try {
      const {
        error,
      } =
        await supabase.functions.invoke(
          "delete-account",
        );

      if (
        error
      ) {
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
        "Não foi possível excluir a conta.",
      );
    } finally {
      setDeleting(
        false,
      );
    }
  }


  return (
    <div className="space-y-6">

      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta e personalize sua experiência."
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
          description="Gerencie e-mail e senha."
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
          description="Escolha modo, estilo e cor."
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

          <SettingsCard
            icon={
              <LogOut className="size-6" />
            }
            title="Sair da conta"
            description="Encerrar sua sessão neste dispositivo."
            buttonText="Sair da conta"
            onClick={() =>
              void signOut()
            }
            danger
          />

          <SettingsCard
            icon={
              <Trash2 className="size-6" />
            }
            title="Excluir conta"
            description="Remover permanentemente sua conta e seus dados."
            buttonText="Excluir conta"
            onClick={
              openDeleteAccount
            }
            danger
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

            <Field
              id="profile-name"
              label="Nome"
              value={
                profileName
              }
              onChange={
                setProfileName
              }
              placeholder="Seu nome"
            />

            <Field
              id="profile-username"
              label="Nome de usuário"
              value={
                profileUsername
              }
              onChange={
                setProfileUsername
              }
              placeholder="seuusername"
            />

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              disabled={
                saving
              }
              onClick={() =>
                void saveProfile()
              }
            >

              <Save className="size-4" />

              {saving
                ? "Salvando..."
                : "Salvar"}

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
              Gerencie suas credenciais de acesso.
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
              description="Alterar senha de acesso."
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
              Confirme o endereço atual e informe o novo.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-4">

            <Field
              id="current-email"
              label="E-mail atual"
              type="email"
              value={
                currentEmail
              }
              onChange={
                setCurrentEmail
              }
              placeholder="Digite seu e-mail atual"
            />

            <Field
              id="new-email"
              label="Novo e-mail"
              type="email"
              value={
                newEmail
              }
              onChange={
                setNewEmail
              }
              placeholder="Digite seu novo e-mail"
            />

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              disabled={
                saving
              }
              onClick={() =>
                void saveEmail()
              }
            >

              <Mail className="size-4" />

              {saving
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
                />

                <button
                  type="button"
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center"
                  onClick={() =>
                    setShowPassword(
                      (
                        value,
                      ) =>
                        !value,
                    )
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


            <Field
              id="confirm-password"
              label="Confirmar nova senha"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
              placeholder="Repita a nova senha"
            />

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              disabled={
                saving
              }
              onClick={() =>
                void savePassword()
              }
            >

              <LockKeyhole className="size-4" />

              {saving
                ? "Alterando..."
                : "Alterar senha"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


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


          <div className="space-y-7">

            <AppearanceSection
              title="Modo"
              description="Escolha claro, escuro ou sistema."
            >

              <div className="grid gap-3 sm:grid-cols-3">

                <ThemeButton
                  icon={
                    <Sun className="size-5" />
                  }
                  title="Claro"
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

                <ThemeButton
                  icon={
                    <Moon className="size-5" />
                  }
                  title="Escuro"
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

                <ThemeButton
                  icon={
                    <Monitor className="size-5" />
                  }
                  title="Sistema"
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

            </AppearanceSection>


            <AppearanceSection
              title="Estilo"
              description="Escolha o estilo visual da interface."
            >

              <div className="grid gap-3 sm:grid-cols-2">

                <ThemeButton
                  title="Real"
                  description="Visual neutro e equilibrado."
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

                <ThemeButton
                  title="Verdant"
                  description="Visual com personalidade esverdeada."
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

            </AppearanceSection>


            <AppearanceSection
              title="Cor de destaque"
              description="Altera botões, destaques e elementos principais."
            >

              <div className="grid gap-3 sm:grid-cols-2">

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
                          "relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                          active
                            ? "border-primary bg-primary/10"
                            : "hover:border-primary/40",
                        )}
                      >

                        <span
                          className="size-10 shrink-0 rounded-lg border"
                          style={{
                            backgroundColor:
                              swatch,
                          }}
                        />

                        <span className="min-w-0 flex-1">

                          <span className="block font-medium">
                            {
                              color.label
                            }
                          </span>

                          <span className="mt-1 block text-sm text-muted-foreground">
                            {
                              color.description
                            }
                          </span>

                        </span>


                        {active ? (
                          <Check className="size-5 text-primary" />
                        ) : null}

                      </button>
                    );
                  },
                )}

              </div>


              {themeColor ===
              "custom" ? (

                <div className="mt-4 flex gap-3 rounded-xl border p-4">

                  <input
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
                    className="h-11 w-14"
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
                    className="h-11 flex-1"
                  />

                </div>

              ) : null}

            </AppearanceSection>

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
              Concluir
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

          <DialogHeader>

            <DialogTitle>
              Excluir conta
            </DialogTitle>

            <DialogDescription>
              Esta ação é permanente e não poderá ser desfeita.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-4">

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">

              <p className="font-medium text-destructive">
                Atenção
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Para confirmar, digite seu nome de usuário.
              </p>

            </div>


            <Field
              id="delete-username"
              label="Nome de usuário"
              value={
                deleteUsername
              }
              onChange={
                setDeleteUsername
              }
              placeholder={
                accountUsername
                  ? `@${accountUsername}`
                  : "Seu nome de usuário"
              }
              disabled={
                deleting
              }
            />

          </div>


          <DialogFooter className="gap-2">

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              disabled={
                deleting
              }
              onClick={() =>
                setDeleteOpen(
                  false,
                )
              }
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full"
              disabled={
                deleting
              }
              onClick={() =>
                void deleteAccount()
              }
            >

              <Trash2 className="size-4" />

              {deleting
                ? "Excluindo..."
                : "Excluir conta"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}


type SettingsCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  danger?: boolean;
};


function SettingsCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  danger = false,
}: SettingsCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">

      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          danger
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary",
        )}
      >
        {icon}
      </div>


      <h2 className="mt-4 font-display text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>


      <Button
        type="button"
        variant={
          danger
            ? "destructive"
            : "outline"
        }
        className="mt-5 w-full"
        onClick={onClick}
      >
        {buttonText}
        {!danger ? (
          <ChevronRight className="size-4" />
        ) : null}
      </Button>

    </div>
  );
}


type SettingsRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};


function SettingsRow({
  icon,
  title,
  description,
  onClick,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50"
    >

      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>

      <span className="min-w-0 flex-1">

        <span className="block font-medium">
          {title}
        </span>

        <span className="block truncate text-sm text-muted-foreground">
          {description}
        </span>

      </span>

      <ChevronRight className="size-4 text-muted-foreground" />

    </button>
  );
}


type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
};


function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: FieldProps) {
  return (
    <div className="space-y-1.5">

      <Label htmlFor={id}>
        {label}
      </Label>

      <Input
        id={id}
        type={type}
        className="h-11"
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        disabled={disabled}
      />

    </div>
  );
}


type ThemeButtonProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  active: boolean;
  onClick: () => void;
};


function ThemeButton({
  icon,
  title,
  description,
  active,
  onClick,
}: ThemeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-xl border p-4 text-left transition-all",
        active
          ? "border-primary bg-primary/10"
          : "hover:border-primary/40 hover:bg-muted/50",
      )}
    >

      {active ? (
        <Check className="absolute right-3 top-3 size-4 text-primary" />
      ) : null}


      {icon ? (
        <div className="mb-3 text-muted-foreground">
          {icon}
        </div>
      ) : null}


      <p className="font-medium">
        {title}
      </p>


      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}

    </button>
  );
}


type AppearanceSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};


function AppearanceSection({
  title,
  description,
  children,
}: AppearanceSectionProps) {
  return (
    <section className="border-t pt-6">

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>

      <div className="mt-4">
        {children}
      </div>

    </section>
  );
}
