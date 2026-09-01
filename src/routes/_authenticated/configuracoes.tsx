import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
  type ReactNode,
} from "react";

import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

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


function maskEmail(
  email: string,
) {
  const parts =
    email.split("@");

  if (
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1]
  ) {
    return email;
  }

  const name =
    parts[0];

  const domain =
    parts[1];

  if (
    name.length <= 2
  ) {
    return `${name[0] ?? ""}****@${domain}`;
  }

  return `${name[0]}****${name.at(-1)}@${domain}`;
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


  const username =
    profile?.username ??
    "";

  const accountEmail =
    authUser?.email ??
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
    sessionsOpen,
    setSessionsOpen,
  ] =
    useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
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
    sessionUsername,
    setSessionUsername,
  ] =
    useState("");

  const [
    deleteUsername,
    setDeleteUsername,
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
    signingOut,
    setSigningOut,
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

    setProfileOpen(true);
  }


  function openSecurity() {
    setSecurityOpen(true);
  }


  function openEmail() {
    setNewEmail(
      accountEmail,
    );

    setEmailOpen(true);
  }


  function openPassword() {
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);

    setPasswordOpen(true);
  }


  function openSessions() {
    setSessionUsername("");
    setSessionsOpen(true);
  }


  function openDelete() {
    setDeleteUsername("");
    setDeleteOpen(true);
  }


  async function saveProfile() {
    const name =
      profileName.trim();

    const newUsername =
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
      newUsername.length < 3
    ) {
      toast.error(
        "O nome de usuário precisa ter pelo menos 3 caracteres.",
      );

      return;
    }


    if (
      !/^[a-zA-Z0-9._-]+$/.test(
        newUsername,
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
          .from("profiles")
          .update({
            name:
              name.slice(
                0,
                80,
              ),

            username:
              newUsername.slice(
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

      setProfileOpen(false);
    } catch {
      toast.error(
        "Não foi possível atualizar seu perfil.",
      );
    } finally {
      setSavingProfile(false);
    }
  }


  async function saveEmail() {
    const email =
      newEmail
        .trim()
        .toLowerCase();


    if (
      !email ||
      !email.includes("@")
    ) {
      toast.error(
        "Informe um e-mail válido.",
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
        "Enviamos uma confirmação para o novo e-mail.",
      );

      setEmailOpen(false);
    } catch {
      toast.error(
        "Não foi possível alterar seu e-mail.",
      );
    } finally {
      setSavingEmail(false);
    }
  }


  async function savePassword() {
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

      setPasswordOpen(false);
    } catch {
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
    setTheme(value);

    const label =
      value === "light"
        ? "claro"
        : value === "dark"
          ? "escuro"
          : "do sistema";

    toast.success(
      `Aparência alterada para tema ${label}.`,
    );
  }


  async function confirmSignOut() {
    if (
      !username
    ) {
      toast.error(
        "Não foi possível confirmar seu nome de usuário.",
      );

      return;
    }


    if (
      sessionUsername
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase() !==
      username.toLowerCase()
    ) {
      toast.error(
        "Digite exatamente o seu nome de usuário para confirmar.",
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
        replace: true,
      });
    } catch {
      toast.error(
        "Não foi possível sair da conta.",
      );
    } finally {
      setSigningOut(false);
    }
  }


  async function confirmDelete() {
    if (
      !username
    ) {
      toast.error(
        "Não foi possível confirmar seu nome de usuário.",
      );

      return;
    }


    if (
      deleteUsername
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase() !==
      username.toLowerCase()
    ) {
      toast.error(
        "Digite exatamente o seu nome de usuário para confirmar.",
      );

      return;
    }


    setDeleting(true);


    try {
      /*
       * A exclusão definitiva da conta deve ser feita
       * por uma função segura no backend.
       *
       * Aqui deixamos a confirmação pronta para conectar
       * quando você criar a função no Supabase.
       */

      toast.error(
        "A exclusão da conta ainda precisa ser conectada ao backend.",
      );
    } finally {
      setDeleting(false);
    }
  }


  return (
    <div className="space-y-6">

      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta e personalize sua experiência no FinanLook."
      />


      <section className="grid gap-4 md:grid-cols-2">


        <SettingsCard
          icon={
            <User className="size-6" />
          }
          title="Perfil"
          description="Altere seu nome e nome de usuário."
          action="Configurar"
          onClick={openProfile}
        />


        <SettingsCard
          icon={
            <ShieldCheck className="size-6" />
          }
          title="Conta e segurança"
          description="Gerencie seu e-mail, senha e informações de acesso."
          action="Configurar"
          onClick={openSecurity}
        />


        <SettingsCard
          icon={
            <Palette className="size-6" />
          }
          title="Aparência"
          description="Personalize como o FinanLook aparece para você."
          action="Configurar"
          onClick={() =>
            setAppearanceOpen(true)
          }
        />


        <SettingsCard
          icon={
            <Laptop className="size-6" />
          }
          title="Gerenciar sessões"
          description="Controle a sessão atual e saia da sua conta."
          action="Abrir"
          variant="success"
          onClick={openSessions}
        />


      </section>


      <section className="surface overflow-hidden">

        <div className="border-b p-5">

          <div className="flex items-center gap-3">

            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">

              <Trash2 className="size-5" />

            </div>


            <div>

              <h2 className="font-display text-lg font-semibold">
                Zona de perigo
              </h2>

              <p className="text-sm text-muted-foreground">
                Ações importantes relacionadas à sua conta.
              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={openDelete}
          className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-destructive/5"
        >

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">

              <Trash2 className="size-5" />

            </div>


            <div className="min-w-0">

              <p className="font-medium text-destructive">
                Excluir minha conta
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Remover permanentemente sua conta e seus dados.
              </p>

            </div>

          </div>


          <ChevronRight className="size-5 shrink-0 text-destructive" />

        </button>

      </section>


      {/* PERFIL */}

      <Dialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Perfil
            </DialogTitle>

            <DialogDescription>
              Atualize as informações que aparecem na sua conta.
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
                value={profileName}
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
                  value={profileUsername}
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
              disabled={savingProfile}
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


      {/* CONTA E SEGURANÇA */}

      <Dialog
        open={securityOpen}
        onOpenChange={setSecurityOpen}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Conta e segurança
            </DialogTitle>

            <DialogDescription>
              Gerencie as informações usadas para acessar sua conta.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-3">

            <button
              type="button"
              onClick={() => {
                setSecurityOpen(false);
                openEmail();
              }}
              className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
            >

              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="size-5" />
              </div>


              <div className="min-w-0 flex-1">

                <p className="font-medium">
                  E-mail
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {maskEmail(accountEmail)}
                </p>

              </div>


              <ChevronRight className="size-5 text-muted-foreground" />

            </button>


            <button
              type="button"
              onClick={() => {
                setSecurityOpen(false);
                openPassword();
              }}
              className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
            >

              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="size-5" />
              </div>


              <div className="flex-1">

                <p className="font-medium">
                  Senha
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Altere sua senha de acesso.
                </p>

              </div>


              <ChevronRight className="size-5 text-muted-foreground" />

            </button>

          </div>

        </DialogContent>

      </Dialog>


      {/* EMAIL */}

      <Dialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Alterar e-mail
            </DialogTitle>

            <DialogDescription>
              Você receberá uma confirmação no novo endereço de e-mail.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-1.5">

            <Label htmlFor="new-email">
              Novo e-mail
            </Label>

            <Input
              id="new-email"
              type="email"
              className="h-11"
              value={newEmail}
              onChange={(event) =>
                setNewEmail(
                  event.target.value,
                )
              }
              placeholder="voce@email.com"
              maxLength={160}
            />

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              disabled={savingEmail}
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


      {/* SENHA */}

      <Dialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
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
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                  className="h-11 pr-11"
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
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground"
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
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                className="h-11"
                autoComplete="new-password"
                maxLength={1000}
              />

            </div>

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              disabled={savingPassword}
              onClick={() =>
                void savePassword()
              }
            >

              <KeyRound className="size-4" />

              {savingPassword
                ? "Alterando..."
                : "Alterar senha"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* APARÊNCIA */}

      <Dialog
        open={appearanceOpen}
        onOpenChange={setAppearanceOpen}
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

        </DialogContent>

      </Dialog>


      {/* GERENCIAR SESSÕES */}

      <Dialog
        open={sessionsOpen}
        onOpenChange={setSessionsOpen}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Gerenciar sessões
            </DialogTitle>

            <DialogDescription>
              Você está gerenciando a sessão atual da sua conta.
            </DialogDescription>

          </DialogHeader>


          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">

            <div className="flex items-start gap-3">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">

                <Smartphone className="size-5" />

              </div>


              <div>

                <p className="font-medium">
                  Sessão atual
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Esta é a sessão que está sendo usada agora.
                </p>

              </div>

            </div>

          </div>


          <div className="space-y-2">

            <Label htmlFor="session-username">
              Confirme seu nome de usuário
            </Label>


            <p className="text-sm text-muted-foreground">
              Para sair da sua conta, digite exatamente:
              {" "}
              <strong>
                {username
                  ? `@${username}`
                  : "seu nome de usuário"}
              </strong>
            </p>


            <Input
              id="session-username"
              value={sessionUsername}
              onChange={(event) =>
                setSessionUsername(
                  event.target.value,
                )
              }
              className="h-11"
              placeholder={
                username
                  ? username
                  : "Seu nome de usuário"
              }
            />

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={() =>
                setSessionsOpen(false)
              }
              disabled={signingOut}
            >
              Cancelar
            </Button>


            <Button
              className="h-11 w-full bg-green-600 hover:bg-green-700"
              disabled={signingOut}
              onClick={() =>
                void confirmSignOut()
              }
            >

              <LogOut className="size-4" />

              {signingOut
                ? "Saindo..."
                : "Sair da conta"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* EXCLUIR CONTA */}

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle className="text-destructive">
              Excluir minha conta
            </DialogTitle>

            <DialogDescription>
              Esta é uma ação permanente. Confira cuidadosamente antes de continuar.
            </DialogDescription>

          </DialogHeader>


          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">

            <p className="text-sm leading-relaxed">
              Para confirmar esta ação, digite exatamente o seu nome de usuário.
            </p>

          </div>


          <div className="space-y-2">

            <Label htmlFor="delete-username">
              Confirme seu nome de usuário
            </Label>


            <p className="text-sm text-muted-foreground">
              Digite:
              {" "}
              <strong>
                {username
                  ? `@${username}`
                  : "seu nome de usuário"}
              </strong>
            </p>


            <Input
              id="delete-username"
              value={deleteUsername}
              onChange={(event) =>
                setDeleteUsername(
                  event.target.value,
                )
              }
              className="h-11"
              placeholder={
                username
                  ? username
                  : "Seu nome de usuário"
              }
            />

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={() =>
                setDeleteOpen(false)
              }
              disabled={deleting}
            >
              Cancelar
            </Button>


            <Button
              variant="destructive"
              className="h-11 w-full"
              disabled={deleting}
              onClick={() =>
                void confirmDelete()
              }
            >

              <Trash2 className="size-4" />

              {deleting
                ? "Excluindo..."
                : "Excluir minha conta"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}


function SettingsCard({
  icon,
  title,
  description,
  action,
  onClick,
  variant = "default",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  variant?: "default" | "success";
}) {
  const isSuccess =
    variant ===
    "success";


  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "surface group flex min-h-48 flex-col items-start p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        isSuccess &&
          "border-green-500/20 hover:border-green-500/40",
      )}
    >

      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary",
          isSuccess &&
            "bg-green-500/10 text-green-600 dark:text-green-400",
        )}
      >
        {icon}
      </div>


      <div className="mt-5">

        <h2 className="font-display text-lg font-semibold">
          {title}
        </h2>

        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

      </div>


      <div
        className={cn(
          "mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-primary",
          isSuccess &&
            "text-green-600 dark:text-green-400",
        )}
      >

        <span>
          {action}
        </span>

        <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />

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

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>

      </div>

    </button>
  );
}