import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
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
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { generateRecoveryLink } from "@/lib/password-recovery.functions";
import { useProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

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
          "Gerencie sua conta e suas preferências no FinanLook.",
      },
    ],
  }),

  component: SettingsPage,
});

type Theme = "light" | "dark" | "system";
type PasswordMethod = "senha" | "email";

// Credenciais do EmailJS (a Public Key é feita para ficar no client, não é segredo)
const EMAILJS_SERVICE_ID = "service_nx7898n";
const EMAILJS_TEMPLATE_ID = "template_cxhuybn";
const EMAILJS_PUBLIC_KEY = "2TVDc9D7QgTpm0QCs";

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useProfile();

  const [theme, setTheme] = useState<Theme>("system");

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");

  const [newEmail, setNewEmail] = useState("");

  const [passwordMethod, setPasswordMethod] =
    useState<PasswordMethod>("senha");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingRecoveryLink, setSendingRecoveryLink] = useState(false);

  /* =======================================================
     PERFIL
     ======================================================= */

  function openProfileDialog() {
    setProfileName(profile?.name ?? "");
    setProfileUsername(profile?.username ?? "");
    setEditProfileOpen(true);
  }

  async function saveProfile() {
    const name = profileName.trim();
    const username = profileUsername.trim().replace(/^@/, "");

    if (!name) {
      toast.error("Informe seu nome.");
      return;
    }

    if (!username) {
      toast.error("Informe seu username.");
      return;
    }

    setSavingProfile(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error();
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.slice(0, 80),
          username: username.slice(0, 40).toLowerCase(),
        })
        .eq("id", authData.user.id);

      if (error) {
        throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      toast.success("Perfil atualizado com sucesso.");
      setEditProfileOpen(false);
    } catch {
      toast.error("Não foi possível atualizar seu perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  /* =======================================================
     EMAIL
     ======================================================= */

  function openEmailDialog() {
    setNewEmail(profile?.email ?? "");
    setEditEmailOpen(true);
  }

  async function saveEmail() {
    const email = newEmail.trim().toLowerCase();

    if (!email) {
      toast.error("Informe um email.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Informe um email válido.");
      return;
    }

    setSavingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({ email });

      if (error) {
        throw error;
      }

      toast.success("Enviamos uma confirmação para o novo email.");
      setEditEmailOpen(false);
    } catch {
      toast.error("Não foi possível alterar seu email.");
    } finally {
      setSavingEmail(false);
    }
  }

  /* =======================================================
     SENHA
     ======================================================= */

  function openPasswordDialog() {
    setPasswordMethod("senha");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setEditPasswordOpen(true);
  }

  async function handleChangeWithCurrentPassword() {
    const accountEmail = profile?.email?.trim().toLowerCase() ?? "";

    if (!accountEmail) {
      toast.error("Não foi possível identificar o e-mail da sua conta.");
      return;
    }

    if (!currentPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }

    if (!newPassword) {
      toast.error("Informe uma nova senha.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("A nova senha precisa ser diferente da atual.");
      return;
    }

    setSavingPassword(true);

    try {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: accountEmail,
          password: currentPassword,
        });

      if (signInError) {
        throw new Error("Senha atual incorreta.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success("Senha alterada com sucesso.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEditPasswordOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar sua senha.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSendRecoveryLink() {
    const accountEmail = profile?.email?.trim().toLowerCase() ?? "";

    if (!accountEmail) {
      toast.error("Não foi possível identificar o e-mail da sua conta.");
      return;
    }

    setSendingRecoveryLink(true);

    try {
      const result = await generateRecoveryLink({
        data: {
          email: accountEmail,
          origin: window.location.origin,
        },
      });

      if (result.link) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: accountEmail,
            reset_link: result.link,
          },
          { publicKey: EMAILJS_PUBLIC_KEY },
        );
      }

      toast.success(
        "Enviamos um link para redefinir sua senha para o seu e-mail.",
      );

      setEditPasswordOpen(false);
    } catch {
      toast.error("Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setSendingRecoveryLink(false);
    }
  }

  /* =======================================================
     TEMA
     ======================================================= */

  function changeTheme(value: Theme) {
    setTheme(value);

    toast.success("Preferência de aparência atualizada.");
  }

  /* =======================================================
     SAIR
     ======================================================= */

  async function signOut() {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();

      navigate({
        to: "/auth",
        replace: true,
      });
    } catch {
      toast.error("Não foi possível sair da conta.");
    }
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta e personalize sua experiência no FinanLook."
      />

      {/* PERFIL */}
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
                Informações públicas da sua conta.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y">
          <SettingsRow
            icon={<User className="size-5" />}
            title="Nome e username"
            description={
              profile
                ? `${profile.name || "Você"} • @${
                    profile.username ?? ""
                  }`
                : "Configure seu nome e username"
            }
            action="Editar"
            onClick={openProfileDialog}
          />

          <SettingsRow
            icon={<Mail className="size-5" />}
            title="Email"
            description={
              profile?.email ?? "Configure seu email"
            }
            action="Alterar"
            onClick={openEmailDialog}
          />
        </div>
      </section>

      {/* SEGURANÇA */}
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
                Proteja sua conta e suas informações.
              </p>
            </div>
          </div>
        </div>

        <div>
          <SettingsRow
            icon={<LockKeyhole className="size-5" />}
            title="Senha"
            description="Altere sua senha de acesso."
            action="Alterar"
            onClick={openPasswordDialog}
          />
        </div>
      </section>

      {/* APARÊNCIA */}
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
            icon={<Sun className="size-5" />}
            title="Claro"
            active={theme === "light"}
            onClick={() => changeTheme("light")}
          />

          <ThemeOption
            icon={<Moon className="size-5" />}
            title="Escuro"
            active={theme === "dark"}
            onClick={() => changeTheme("dark")}
          />

          <ThemeOption
            icon={<Monitor className="size-5" />}
            title="Sistema"
            active={theme === "system"}
            onClick={() => changeTheme("system")}
          />
        </div>
      </section>

      {/* CONTA */}
      <section className="surface overflow-hidden">
        <div className="border-b p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <LogOut className="size-5 text-primary" />
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold">
                Conta
              </h2>

              <p className="text-sm text-muted-foreground">
                Gerencie sua sessão atual.
              </p>
            </div>
          </div>
        </div>

        <SettingsRow
          icon={<LogOut className="size-5" />}
          title="Sair da conta"
          description="Encerrar sua sessão neste dispositivo."
          action="Sair"
          destructive
          onClick={() => void signOut()}
        />
      </section>

      {/* DIALOG PERFIL */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Atualize seu nome e username.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>

              <Input
                id="name"
                className="h-11"
                value={profileName}
                onChange={(event) =>
                  setProfileName(event.target.value)
                }
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>

                <Input
                  id="username"
                  className="h-11 pl-7"
                  value={profileUsername}
                  onChange={(event) =>
                    setProfileUsername(event.target.value)
                  }
                  placeholder="seuusername"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              disabled={savingProfile}
              onClick={() => void saveProfile()}
            >
              <Save className="size-4" />

              {savingProfile ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG EMAIL */}
      <Dialog open={editEmailOpen} onOpenChange={setEditEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar email</DialogTitle>
            <DialogDescription>
              Você receberá uma confirmação no novo endereço de email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="email">Novo email</Label>

            <Input
              id="email"
              type="email"
              className="h-11"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="voce@email.com"
            />
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              disabled={savingEmail}
              onClick={() => void saveEmail()}
            >
              <Mail className="size-4" />

              {savingEmail ? "Alterando..." : "Alterar email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG SENHA — agora com 2 métodos */}
      <Dialog open={editPasswordOpen} onOpenChange={setEditPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Por segurança, confirme sua senha atual ou use um link
              enviado por e-mail.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setPasswordMethod("senha")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                passwordMethod === "senha"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <KeyRound className="size-4" />
              Senha atual
            </button>

            <button
              type="button"
              onClick={() => setPasswordMethod("email")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                passwordMethod === "email"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Mail className="size-4" />
              Link por e-mail
            </button>
          </div>

          {passwordMethod === "senha" ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Senha atual</Label>

                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  className="h-11"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-password">Nova senha</Label>

                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="h-11 pr-11"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label="Mostrar ou ocultar senha"
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
                  type={showPassword ? "text" : "password"}
                  className="h-11"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                />
              </div>

              <Button
                className="h-11 w-full"
                disabled={savingPassword}
                onClick={() => void handleChangeWithCurrentPassword()}
              >
                <LockKeyhole className="size-4" />

                {savingPassword ? "Alterando..." : "Alterar senha"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enviaremos um link de redefinição para{" "}
                {profile?.email ?? "o e-mail da sua conta"}. Clique no
                link para escolher uma nova senha.
              </p>

              <Button
                className="h-11 w-full"
                disabled={sendingRecoveryLink}
                onClick={() => void handleSendRecoveryLink()}
              >
                <Mail className="size-4" />

                {sendingRecoveryLink
                  ? "Enviando..."
                  : "Enviar link de redefinição"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
   COMPONENTE: LINHA DE CONFIGURAÇÃO
   ========================================================= */

function SettingsRow({
  icon,
  title,
  description,
  action,
  destructive = false,
  onClick,
}: {
  icon: React.ReactNode;
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
          destructive && "bg-destructive/10 text-destructive",
        )}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium",
            destructive && "text-destructive",
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
          destructive && "text-destructive",
        )}
      >
        <span className="hidden sm:inline">{action}</span>
        <ChevronRight className="size-4" />
      </div>
    </button>
  );
}

/* =========================================================
   COMPONENTE: TEMA
   ========================================================= */

function ThemeOption({
  icon,
  title,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "hover:bg-muted/50",
      )}
    >
      {active ? (
        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : null}

      {icon}
      <span>{title}</span>
    </button>
  );
}
