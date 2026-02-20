# statsfestas

A seguir está um PRD (Product Requirements Document) para um site focado somente na “Calculadora de Orçamento da Festa”, implementado em Angular.

Visão e metas
Produto: Orçamento da Festa (web)
Proposta de valor: o usuário informa tipo de festa, nº de convidados e região (RJ) e recebe uma estimativa de gasto por categoria (buffet, decoração, bolo, lembrancinhas, DJ/animação, salão etc.), com faixas Econômico/Médio/Premium.

Objetivos (MVP):

Entregar um orçamento útil em menos de 30 segundos, sem exigir cadastro.

Capturar leads (salvar orçamento em PDF/WhatsApp mediante e-mail/WhatsApp).

Construir base inicial de preços do RJ a partir de fontes públicas e evoluir para dados enviados por fornecedores.

KPIs:

Conversão visitante → cálculo concluído.

Conversão cálculo → “salvar/compartilhar”.

Retenção (usuários retornando em 30 dias).

Volume de dados por região/categoria (amostras válidas).

Escopo do MVP
Inclui:

Home com a calculadora embutida (single page) + seção “como calculamos” + FAQ + contato.

Formulário: tipo de festa, convidados, cidade/bairro (começa RJ por cidade; bairro opcional), padrão (econômico/médio/premium opcional).

Resultado: total estimado + quebra por categoria + faixa (mín–máx) + observação de amostra (“baseado em X referências”).

Compartilhar: link público do orçamento + botão WhatsApp + exportação PDF simples.

Admin (restrito): painel para inserir/editar faixas de preço por categoria/região/evento e importar CSV.

Não inclui (por agora):

Marketplace/geração de leads para fornecedores (apenas “lista de fornecedores” depois).

Pagamento/assinatura.

Login completo (apenas captura de contato para “salvar orçamento”, se você quiser).

Requisitos e UX
User stories principais:

Como pai/mãe, quero inserir convidados e tipo de festa para ter um orçamento por categoria e saber o total aproximado.

Como usuário, quero ajustar padrão (econômico/médio/premium) para caber no meu bolso.

Como usuário, quero salvar e compartilhar o orçamento no WhatsApp para decidir com a família.

Como admin, quero atualizar faixas de preço por região sem depender de deploy.

Campos e regras de cálculo (MVP):

Entradas: tipo_evento, convidados, cidade, padrão (opcional).

Saídas: categorias com (faixa_min, faixa_mediana, faixa_max) e total (soma).

Categorias sugeridas: salão, buffet, decoração, bolo, lembrancinhas, DJ/animação, foto/vídeo (opcional), extras (opcional).

Regras: buffet e lembrancinhas tendem a ser “por pessoa”; salão e DJ tendem a ser “fixos”; decoração pode ser “fixo por faixa de convidados”.

Critérios de aceitação (exemplos):

Dado “Festa infantil, 80 convidados, Niterói”, quando clicar em “Calcular”, então vejo o total e a quebra por categoria na mesma página.

O orçamento deve indicar claramente a região e a data/hora do cálculo (para o usuário entender contexto).

Em mobile, a experiência deve funcionar sem rolagem excessiva (resultado em cards colapsáveis).

Dados e confiabilidade
Fontes iniciais (internet):

Coleta manual/curadoria de preços públicos (sites, posts, páginas de casas de festa/buffets, artigos e tabelas publicadas).

Estruturação em “faixas” por região + tipo de evento + faixa de convidados.

Modelagem de dados (MVP):

Tabela price_reference: região, tipo_evento, categoria, convidados_min/max, valor_min/med/max, fonte_url, data_coleta, confiabilidade (baixa/média/alta).

O cálculo usa agregação por região/tipo/categoria e escolhe a faixa compatível com nº de convidados.

Regras de qualidade:

Sempre mostrar “amostra mínima”: se não tiver referências suficientes, exibir aviso e usar fallback “RJ geral”.

Controle de outliers: referências muito fora da curva devem ser marcadas e não entram automaticamente no cálculo.

Transparência: link “Como calculamos” explicando que são estimativas e variam por data, bairro e pacote.

Arquitetura e entrega (Angular)
Frontend (Angular):

SPA com rotas: / (home/calculadora), /orcamento/:id (resultado compartilhável), /admin (restrito).

Componentes: CalculatorForm, BudgetResult, CategoryBreakdown, HowItWorks, Faq, LeadCaptureModal.

Estado: serviço BudgetService + cache local (LocalStorage) para último orçamento.

Backend (simples e barato para MVP):

API (Node/Nest ou Firebase/Supabase) para ler faixas e salvar orçamentos compartilháveis.

Admin com autenticação básica e RBAC (somente você/operador).

Build e deploy (referência Angular):

O app pode ser criado com ng new (com prompts como suporte a routing) e compilado com ng build.

Para deploy manual, gere o build de produção e publique o diretório de saída (por padrão em dist/), servindo-o em um servidor/CDN conforme a documentação de deployment do Angular.
​

Se você me disser: (1) quais cidades do RJ você quer no MVP (ex.: São Gonçalo, Niterói, Rio, Maricá, Itaboraí), (2) quais tipos de festa (infantil e 15 anos primeiro?), eu ajusto este PRD para um MVP de 2 semanas com backlog priorizado (épicos + histórias + estimativa).
