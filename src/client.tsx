// src/client.tsx
// Entry point required by public/index.html
// Tries to initialize the TanStack Start client entry in several common shapes
// and shows a visible error in the #app element if initialization fails.

async function boot() {
  try {
    // TanStack Start standard client entry
    const mod = await import("@tanstack/react-start/client-entry");
    const entry = (mod as any).default ?? mod;

    if (typeof entry === "function") {
      await entry();
      return;
    }

    if (entry && typeof entry.start === "function") {
      await entry.start();
      return;
    }

    if (entry && typeof entry.hydrate === "function") {
      await entry.hydrate();
      return;
    }

    console.error("Não foi possível encontrar uma função de inicialização no entry do client:", entry);
    throw new Error("Client entry não encontrado em @tanstack/react-start/client-entry");
  } catch (err) {
    // Log full error to console and render a user-visible message so the page
    // doesn't stay in the generic "This page didn't load" state.
    // This helps debugging in production where console output may be available.
    // We intentionally avoid exposing secrets.
    // eslint-disable-next-line no-console
    console.error("Falha ao iniciar o client:", err);

    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div style="padding:24px; font-family: system-ui, sans-serif; max-width:720px; margin:48px auto;">
          <h1 style="font-size:1.25rem; margin-bottom:0.5rem;">Erro ao inicializar a aplicação</h1>
          <p style="color:#333; margin-bottom:1rem;">Houve uma falha ao carregar o cliente da aplicação. Verifique o console do navegador para mais detalhes.</p>
          <pre style="background:#f6f8fa; padding:12px; border-radius:6px; overflow:auto; color:#b91c1c;">${String(err)}</pre>
          <p style="margin-top:12px; color:#666;">Se estiver em desenvolvimento, rode <code>npm run dev</code> e verifique se existem erros no terminal. Confirme também que as variáveis de ambiente do Supabase estão configuradas (veja <code>.env.example</code>).</p>
        </div>
      `;
    }
  }
}

void boot();
