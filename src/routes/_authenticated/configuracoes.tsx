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
          "Gerencie sua conta, segurança e preferências de aparência no FinanLook.",
      },
    ],
  }),

  component: SettingsPage,
});


function maskEmail(email: string) {
  if (!email) {
    return "";
  }

  const parts = email.split("@");

  if (parts.length !== 2) {
    return email;
  }

  const username = parts[0];
  const domain = parts[1];

  if (username.length <= 2) {
    return `${username.charAt(0)}****@${domain}`;
  }

  const first = username.charAt(0);
  const last = username.charAt(
    username.length - 1,
  );

  return `${first}****${last}@${domain}`;
}


function SettingsPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: profile,
  } = useProfile();

  const {
    data: authUser,
  } = useUser();

  const {
    theme,
    setTheme,
  } = useTheme();


  const accountEmail =
    authUser?.email ??
    "";

  const username =
    profile?.username ??
    "";


  const [
    editProfileOpen,
    setEditProfileOpen,
  ] = useState(false);

  const [
    editEmailOpen,
    setEditEmailOpen,
  ] = useState(false);

  const [
    editPasswordOpen,
    setEditPasswordOpen,
  ] = useState(false);

  const [
    logoutConfirmOpen,
    setLogoutConfirmOpen,
  ] = useState(false);


  const [
    profileName,
    setProfileName,
  ] = useState("");

  const [
    profileUsername,
    setProfileUsername,
  ] = useState("");

  const [
    newEmail,
    setNewEmail,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    confirmationUsername,
    setConfirmationUsername,
  ] = useState("");


  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    savingEmail,
    setSavingEmail,
  ] = useState(false);

  const [
    savingPassword,
    setSavingPassword,
  ] = useState(false);

  const [
    signingOut,
    setSigningOut,
  ] = useState(false);


  function openProfileDialog() {
    setProfileName(
      profile?.name ??
        "",
    );

    setProfileUsername(
      profile?.username ??
        "",
    );

    setEditProfileOpen(true);
  }


  async function saveProfile() {
    const name =
      profileName.trim();

    const username =
      profileUsername
        .trim()
        .replace(/^@/, "")
        .toLowerCase();


    if (!name) {
      toast.error(
        "Informe seu nome.",
      );

      return;
    }


    if (name.length < 2) {
      toast.error(
        "Seu nome precisa ter pelo menos 2 caracteres.",
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


    setSavingProfile(true);


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
          .from("profiles")
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


      setEditProfileOpen(false);
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível atualizar seu perfil.",
      );
    } finally {
      setSavingProfile(false);
    }
  }


  function openEmailDialog() {
    setNewEmail(accountEmail);

    setEditEmailOpen(true);
  }


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
      !email.includes("@")
    ) {
      toast.error(
        "Informe um email válido.",
      );

      return;
    }


    setSavingEmail(true);


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


      setEditEmailOpen(false);
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível alterar seu email.",
      );
    } finally {
      setSavingEmail(false);
    }
  }


  function openPasswordDialog() {
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);

    setEditPasswordOpen(true);
  }


  async function savePassword() {
    if (!newPassword) {
      toast.error(
        "Informe uma nova senha.",
      );

      return;
    }


    if (
      newPassword.length < 6
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


    setSavingPassword(true);


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


      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);

      setEditPasswordOpen(false);
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível alterar sua senha.",
      );
    } finally {
      setSavingPassword(false);
    }
  }


  function changeTheme(
    value: Theme,
  ) {
    if (
      value === theme
    ) {
      return;
    }


    setTheme(value);


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


  function openLogoutDialog() {
    setConfirmationUsername("");

    setLogoutConfirmOpen(true);
  }


  async function signOut() {
    const typedUsername =
      confirmationUsername
        .trim()
        .replace(/^@/, "")
        .toLowerCase();


    const correctUsername =
      username
        .trim()
        .replace(/^@/, "")
        .toLowerCase();


    if (!correctUsername) {
      toast.error(
        "Não foi possível confirmar seu username.",
      );

      return;
    }


    if (
      typedUsername !==
      correctUsername
    ) {
      toast.error(
        "O username informado não corresponde à sua conta.",
      );

      return;
    }


    setSigningOut(true);


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
        to: "/auth",

        search: {
          modo: "entrar",
        },

        replace: true,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível sair da conta.",
      );
    } finally {
      setSigningOut(false);
    }
  }


  return (
    <div className="space-y-6">

      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta, segurança e preferências do FinanLook."
      />


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

          <SettingsRow
            icon={
              <User className="size-5" />
            }
            title="Nome e nome de usuário"
            description={
              profile
                ? `${profile.name || "Você"} • @${
                    profile.username ??
                    ""
                  }`
                : "Configure seu nome e nome de usuário"
            }
            action="Editar"
            onClick={
              openProfileDialog
            }
          />


          <SettingsRow
            icon={
              <Mail className="size-5" />
            }
            title="Email"
            description={
              accountEmail
                ? maskEmail(
                    accountEmail,
                  )
                : "Configure seu email"
            }
            action="Alterar"
            onClick={
              openEmailDialog
            }
          />

        </div>

      </section>


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


        <SettingsRow
          icon={
            <LockKeyhole className="size-5" />
          }
          title="Senha"
          description="Altere sua senha de acesso."
          action="Alterar"
          onClick={
            openPasswordDialog
          }
        />

      </section>


      <section className="surface p-5">

        <div className="flex items-start gap-3">

          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">

            <Palette className="size-5 text-primary" />

          </div>


          <div className="min-w-0">

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
              theme === "light"
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
              theme === "dark"
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
            description="Seguir as configurações do dispositivo"
            active={
              theme === "system"
            }
            onClick={() =>
              changeTheme(
                "system",
              )
            }
          />

        </div>

      </section>


      <section className="surface overflow-hidden">

        <div className="border-b p-5">

          <div className="flex items-center gap-3">

            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10">

              <LogOut className="size-5 text-destructive" />

            </div>


            <div>

              <h2 className="font-display text-lg font-semibold">
                Sessão
              </h2>


              <p className="text-sm text-muted-foreground">
                Gerencie o acesso neste dispositivo.
              </p>

            </div>

          </div>

        </div>


        <SettingsRow
          icon={
            <LogOut className="size-5" />
          }
          title="Sair da conta"
          description="Encerre sua sessão neste dispositivo."
          action="Sair"
          destructive
          onClick={
            openLogoutDialog
          }
        />

      </section>


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
              Atualize as informações exibidas na sua conta.
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
                placeholder="Seu nome"
                maxLength={80}
              />

            </div>


            <div className="space-y-1.5">

              <Label htmlFor="username">
                Nome de usuário
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
                  placeholder="seuusername"
                  maxLength={40}
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
              Enviaremos uma confirmação para o novo endereço informado.
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
              onChange={(event) =>
                setNewEmail(
                  event.target.value,
                )
              }
              placeholder="voce@email.com"
              autoComplete="email"
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
              Escolha uma nova senha para proteger sua conta.
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
                  onChange={(event) =>
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
                      (current) =>
                        !current,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
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
          logoutConfirmOpen
        }
        onOpenChange={
          setLogoutConfirmOpen
        }
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Confirmar saída
            </DialogTitle>


            <DialogDescription>
              Para confirmar que deseja encerrar sua sessão, digite seu nome de usuário abaixo.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-3">

            <div className="rounded-xl border bg-muted/40 p-4">

              <p className="text-sm text-muted-foreground">
                Digite exatamente:
              </p>


              <p className="mt-1 font-semibold">
                @{username}
              </p>

            </div>


            <div className="space-y-1.5">

              <Label htmlFor="confirm-username">
                Confirmar nome de usuário
              </Label>


              <Input
                id="confirm-username"
                className="h-11"
                value={
                  confirmationUsername
                }
                onChange={(event) =>
                  setConfirmationUsername(
                    event.target.value,
                  )
                }
                placeholder={
                  username ||
                  "seuusername"
                }
                autoComplete="off"
              />

            </div>

          </div>


          <DialogFooter>

            <Button
              variant="destructive"
              className="h-11 w-full"
              disabled={
                signingOut
              }
              onClick={() =>
                void signOut()
              }
            >

              <LogOut className="size-4" />


              {signingOut
                ? "Saindo..."
                : "Confirmar saída"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}


function SettingsRow({
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


      <div
        className={cn(
          "flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground",

          destructive &&
            "text-destructive",
        )}
      >

        <span className="hidden sm:inline">
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