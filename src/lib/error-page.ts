/**
 * Renderiza página de erro como HTML puro
 * Usado quando há falha no carregamento do SSR
 */
export function renderErrorPage(): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro - FinanLook</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .error-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 500px;
            text-align: center;
          }
          
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          
          h1 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 12px;
            font-weight: 600;
          }
          
          p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          
          .button-group {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          button, a {
            padding: 10px 20px;
            border-radius: 6px;
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            display: inline-block;
          }
          
          .btn-primary {
            background: #667eea;
            color: white;
          }
          
          .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-1px);
          }
          
          .btn-secondary {
            background: #f3f4f6;
            color: #1f2937;
            border: 1px solid #e5e7eb;
          }
          
          .btn-secondary:hover {
            background: #e5e7eb;
            transform: translateY(-1px);
          }
          
          .help-text {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h1>Oops! Algo deu errado</h1>
          <p>Houve um erro ao carregar a página. Não se preocupe, você pode tentar novamente ou voltar para o início.</p>
          
          <div class="button-group">
            <button class="btn-primary" onclick="location.reload()">
              Tentar novamente
            </button>
            <a href="/" class="btn-secondary">
              Voltar ao início
            </a>
          </div>
          
          <div class="help-text">
            <p>Se o problema persistir, verifique sua conexão com a internet ou entre em contato com o suporte.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
