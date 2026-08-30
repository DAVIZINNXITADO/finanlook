# Finan Look

Crie uma aplicação web completa chamada FinanFácil.



OBJETIVO



O FinanFácil é um aplicativo de organização financeira pessoal.



Ele deve ajudar cada usuário a:



- registrar entradas e gastos;

- acompanhar o saldo;

- organizar o salário;

- definir limites de gastos;

- criar uma reserva de emergência;

- criar metas financeiras;

- acompanhar investimentos apenas como planejamento;

- receber um relatório mensal;

- visualizar gráficos;

- receber insights simples sobre seus hábitos financeiros.



O aplicativo deve ser simples o suficiente para uma pessoa sem conhecimento financeiro conseguir usar.



---



1. AUTENTICAÇÃO E MULTIUSUÁRIO



O aplicativo deve possuir contas individuais.



Criar tela de cadastro com:



- Nome

- Nome de usuário

- Senha

- Confirmar senha



Botão:



Criar conta



Criar tela de login com:



- Nome de usuário

- Senha



Botão:



Entrar



Também mostrar:



Ainda não possui uma conta? Criar conta



IMPORTANTE:



Não armazenar senhas em localStorage.



Usar um sistema de autenticação seguro e apropriado para aplicações web.



Cada usuário deve possuir seus próprios dados financeiros.



Um usuário nunca pode visualizar, editar ou excluir os dados de outro usuário.



O sistema deve suportar vários usuários utilizando o aplicativo simultaneamente.



Exemplo:



Usuário João:



- seus gastos;

- seu salário;

- suas metas;

- sua reserva;

- seus relatórios.



Usuário Maria:



- seus próprios dados completamente separados.



Preparar a arquitetura para futuramente permitir uma conta compartilhada entre duas pessoas, mas NÃO implementar essa função agora.



---



2. BANCO DE DADOS



Usar banco de dados apropriado para armazenar os dados dos usuários.



Criar estruturas para:



Usuários



- id

- nome

- nome de usuário

- dados de perfil



Movimentações



- id

- user_id

- tipo

- descrição

- valor

- categoria

- data

- observação



Metas



- id

- user_id

- nome

- valor objetivo

- valor guardado

- prazo



Reserva



- id

- user_id

- objetivo

- valor atual



Planejamento mensal



- id

- user_id

- mês

- categoria

- limite



Configurações



- id

- user_id

- preferências



Garantir isolamento dos dados por usuário usando as regras de segurança disponíveis no banco.



---



3. DASHBOARD



Depois do login, mostrar:



Olá, [nome]! 👋



Subtítulo:



Veja como está sua vida financeira.



Criar quatro cartões:



Saldo atual



Entradas - saídas



Entradas



Total recebido no mês.



Gastos



Total gasto no mês.



Valor guardado



Total destinado para reserva, metas ou investimentos no mês.



Abaixo mostrar:



Onde seu dinheiro está indo?



Criar gráfico mostrando os gastos por categoria.



Categorias:



- Necessidades

- Alimentação

- Transporte

- Moradia

- Saúde

- Educação

- Contas

- Lazer

- Compras

- Assinaturas

- Outros



Abaixo do gráfico mostrar os maiores gastos.



Não inventar dados.



Se não houver dados suficientes, mostrar uma mensagem orientando o usuário a adicionar sua primeira movimentação.



---



4. MOVIMENTAÇÕES



Criar página:



Movimentações



Botão:



+ Nova movimentação



Ao clicar, abrir formulário.



Campos:



Tipo



- Entrada

- Saída



Descrição



Exemplo:

"Salário"



Valor



Exemplo:

"2500,00"



Categoria



Para entradas:



- Salário

- Trabalho

- Vendas

- Outros



Para saídas:



- Necessidades

- Alimentação

- Moradia

- Transporte

- Saúde

- Educação

- Contas

- Lazer

- Compras

- Assinaturas

- Reserva de emergência

- Investimentos

- Outros



Data



Observação



Botão:



Adicionar movimentação



Permitir:



- editar;

- excluir;

- filtrar;

- pesquisar.



Antes de excluir, pedir confirmação.



Mostrar as movimentações em ordem da mais recente para a mais antiga.



Formatar valores em:



R$ 1.250,00



Datas:



29/08/2026



---



5. ORGANIZADOR DE SALÁRIO



Criar uma página:



Organizar meu salário



Perguntar:



Quanto você recebe por mês?



Depois mostrar uma sugestão de organização.



Categorias:



🏠 Necessidades

🍎 Alimentação

🚗 Transporte

🎮 Lazer

🛟 Reserva de emergência

📈 Investimentos

🎯 Metas

💰 Dinheiro livre



A divisão deve ser apenas uma sugestão inicial.



NÃO impor porcentagens obrigatórias.



Permitir que o usuário altere os valores.



Mostrar:



Renda mensal



Menos:



Necessidades

Alimentação

Transporte

Lazer

Reserva

Investimentos

Metas



Mostrar:



Dinheiro restante



Se os valores ultrapassarem a renda:



"A distribuição ultrapassou sua renda mensal."



Se sobrar dinheiro:



"Você ainda tem R$ X para distribuir."



Criar gráfico visual mostrando como o salário foi distribuído.



---



6. RESERVA DE EMERGÊNCIA



Criar página:



Minha reserva



Permitir definir:



Objetivo da reserva: R$ X



Valor atual: R$ X



Mostrar:



R$ X de R$ X



Criar barra de progresso.



Mostrar:



Falta R$ X para atingir sua meta.



Permitir adicionar dinheiro à reserva através de movimentações.



Adicionar uma explicação simples:



"Uma reserva de emergência é um valor separado para ajudar a lidar com despesas inesperadas."



Não oferecer compra de investimentos reais.



Não prometer rentabilidade.



---



7. INVESTIMENTOS — APENAS PLANEJAMENTO



Criar uma seção:



Meus investimentos



Nesta primeira versão, NÃO conectar corretoras, bancos ou investimentos reais.



Permitir apenas registrar manualmente:



- nome do investimento;

- valor aplicado;

- data;

- observação.



Exemplos:



"CDB"

"Tesouro"

"Fundo"

"Outro"



Mostrar:



Total planejado/aplicado: R$ X



Deixar claro que o recurso é apenas para organização e acompanhamento.



Não recomendar produtos financeiros específicos.



---



8. METAS FINANCEIRAS



Criar página:



Minhas metas



Permitir criar:



- nome;

- valor objetivo;

- valor já guardado;

- prazo opcional.



Exemplos:



"Notebook"

"Viagem"

"Curso"

"Reserva"

"Outro"



Mostrar progresso.



Exemplo:



Comprar notebook



R$ 1.200 / R$ 3.000



40%



Falta R$ 1.800



Permitir adicionar valores, editar e excluir metas.



---



9. PLANEJAMENTO MENSAL



Criar página:



Planejamento do mês



Permitir definir um limite para cada categoria.



Exemplo:



Alimentação:

R$ 400



Lazer:

R$ 200



Compras:

R$ 150



Transporte:

R$ 250



Mostrar quanto já foi gasto e quanto resta.



Exemplo:



Lazer



Limite: R$ 200



Gasto: R$ 150



Restante: R$ 50



Quando chegar perto do limite:



"Você já utilizou grande parte do limite desta categoria."



Quando ultrapassar:



"Você ultrapassou o limite definido para esta categoria."



Não bloquear gastos.



---



10. RELATÓRIO MENSAL



Criar página:



Relatório mensal



Permitir selecionar o mês.



Mostrar:



Resumo



Entradas:

R$ X



Gastos:

R$ X



Valor guardado:

R$ X



Saldo:

R$ X



Taxa de economia:

X%



Comparação



Comparar com o mês anterior quando houver dados.



Exemplos:



"Você gastou R$ 80 menos que no mês passado."



"Você conseguiu guardar R$ 50 a mais que no mês passado."



"Sua maior categoria de gastos foi Alimentação."



IMPORTANTE



Só mostrar comparações quando existirem dados reais suficientes.



Nunca inventar números.



---



11. INSIGHTS



Criar seção:



Insights financeiros



O sistema deve analisar as movimentações registradas pelo usuário e gerar observações simples.



Exemplos:



"Seu maior grupo de gastos este mês foi Alimentação."



"Você gastou menos neste mês do que no mês passado."



"Você conseguiu guardar dinheiro em 3 meses seguidos."



"Seus gastos com lazer representam X% dos seus gastos."



Usar linguagem amigável.



Nunca julgar o usuário.



Não usar termos como:



"gasto bosta"

"dinheiro jogado fora"

"você gastou errado"



Preferir:



"Gasto opcional"

"Lazer"

"Compras"

"Outros"



---



12. GRÁFICOS



Criar gráficos modernos e fáceis de entender.



Adicionar:



Gastos por categoria



Entradas x gastos



Evolução do saldo



Valor guardado por mês



Os gráficos devem utilizar os dados reais do usuário.



---



13. NAVEGAÇÃO



Criar menu com:



🏠 Visão geral



💳 Movimentações



💰 Organizar salário



🛟 Reserva



🎯 Metas



📈 Investimentos



📊 Relatórios



⚙️ Configurações



No celular, criar navegação responsiva e fácil de tocar.



---



14. CONFIGURAÇÕES



Criar página:



Configurações



Mostrar:



Nome

Nome de usuário



Opções:



Alterar perfil



Alterar senha



Sair da conta



Apagar minha conta



Ao apagar a conta, exigir confirmação.



Ao apagar a conta, excluir os dados pertencentes àquele usuário de acordo com as regras do banco.



---



15. PRIMEIRO ACESSO



Depois de criar uma conta, mostrar:



Bem-vindo ao FinanFácil! 👋



"Vamos organizar seu dinheiro de forma simples."



Perguntar opcionalmente:



Qual é sua renda mensal?



Botões:



Começar



Pular por enquanto



Se informar a renda, utilizar esse valor no Organizador de Salário.



---



16. DADOS DE DEMONSTRAÇÃO



Criar opção para utilizar dados fictícios de demonstração.



Exemplo:



Entrada:

Salário — R$ 2.500



Saída:

Alimentação — R$ 350



Saída:

Transporte — R$ 200



Saída:

Lazer — R$ 150



Saída:

Contas — R$ 400



Reserva:

R$ 300



Deixar claro:



"Estes são dados de demonstração."



Permitir apagar os dados de demonstração.



---



17. DESIGN



O aplicativo deve parecer um produto real.



Visual:



- moderno;

- minimalista;

- profissional;

- amigável;

- fácil de entender.



Usar cards arredondados, boa tipografia, ícones e espaçamento adequado.



Dar prioridade à experiência em celular.



Criar estados vazios bonitos.



Exemplo:



"Você ainda não possui movimentações."



"Adicione sua primeira entrada ou saída para começar."



---



18. RESPONSIVIDADE



Testar:



- celular;

- tablet;

- notebook;

- desktop.



No celular:



- menu adaptado;

- cartões empilhados;

- botões grandes o suficiente para tocar;

- tabelas transformadas em cards quando necessário.



---



19. TECNOLOGIA



Utilizar:



React

TypeScript

Tailwind CSS



Utilizar componentes reutilizáveis.



Utilizar uma solução segura de autenticação e banco de dados adequada para a plataforma.



Não utilizar localStorage para senhas ou como substituto do banco de dados.



---



20. PREPARAR PARA O FUTURO



Estruturar o projeto para que futuramente seja possível adicionar:



- conta compartilhada entre duas pessoas;

- convite para outro usuário;

- permissões;

- notificações;

- integração bancária;

- importação de extratos;

- versão mobile;

- planos pagos.



NÃO implementar essas funções agora.



---



21. TESTES



Antes de finalizar, teste:



1. Criar conta.

2. Fazer login.

3. Sair.

4. Fazer login novamente.

5. Criar dois usuários diferentes.

6. Confirmar que cada usuário vê apenas seus próprios dados.

7. Adicionar entrada.

8. Adicionar saída.

9. Editar movimentação.

10. Excluir movimentação.

11. Confirmar cálculo do saldo.

12. Criar meta.

13. Criar reserva.

14. Organizar salário.

15. Definir limite mensal.

16. Gerar relatório.

17. Comparar meses.

18. Verificar gráficos.

19. Alterar perfil.

20. Testar no celular.



Se encontrar erros, corrija-os antes de finalizar.



O resultado final deve ser um aplicativo financeiro funcional, bonito, responsivo e preparado para receber vários usuários simultaneamente.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://finanlook.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/834cc179-d974-47e2-972c-869ea5722f26).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
