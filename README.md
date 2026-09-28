# Clínica Vida Plena — Desafio Técnico ACS

Descrição: Sistema de agendamento, indicadores e prevenção de faltas. Backend em Node.js + TypeScript + Express + MongoDB/Mongoose; frontend em React + TypeScript + Vite + Recharts. Prioridade para **fila de confirmação priorizada por risco**, escolhida a partir dos dados históricos.

## Como rodar

Requisito: Docker + Docker Compose.

```bash
docker compose up --build
```

A primeira subida detecta a base vazia e importa automaticamente `data/agendamentos.csv` e `data/medicos.json`. Frontend: `http://localhost:5173`. API: `http://localhost:3000/api`. MongoDB: `localhost:27017`.

Para refazer manualmente a importação (com Node instalado):

```bash
cd backend
npm install
MONGO_URI=mongodb://localhost:27017/clinica_vida_plena DATA_DIR=../data npm run import
```

Testes:

```bash
cd backend && npm test
cd ../frontend && npm test
```

## O que foi construído

- Importador de CSV/JSON com normalização, deduplicação e relatório de descartes/correções.
- Persistência de médicos, pacientes, consultas e logs de mensagens.
- Criação de consulta validando slot de 30 minutos, grade do médico e conflito de médico/paciente.
- Máquina de estados com rejeição de transições inválidas e regras temporais.
- Cancelamento tardio (< 1h) com `penalty=true`, sem adulterar o status para `falta`.
- Indicadores filtráveis por período: geral, médico, tipo e dia da semana.
- Dashboard React responsivo.
- Fila de confirmação priorizada por risco com motivos explicáveis.
- Disparo **simulado** de WhatsApp, conforme permitido pelo desafio.
- Docker Compose para subir aplicação e banco em um comando.

## Bibliotecas escolhidas e por quê

**Backend:** `express` para HTTP, `mongoose` para modelagem/índices MongoDB, `zod` para validar payloads, `csv-parse` para o legado CSV, `date-fns` + `date-fns-tz` para datas e `America/Sao_Paulo`, `vitest` para testes e `tsx` para executar TypeScript sem etapa manual no desenvolvimento.

**Frontend:** React + Vite + TypeScript, `recharts` para gráficos e `vitest` para testes. Evitei Redux/TanStack Query porque o escopo atual não exige estado global complexo; `fetch` + estado local deixam o projeto mais fácil de avaliar.

## Decisões dos 5 pontos

1. Cancelamento com menos de 1 hora gera penalidade por multa, mas permanece `cancelada_paciente`.
2. Cancelamentos não entram na taxa: `falta / (falta + realizada)`.
3. Primeira consulta = primeira vez do paciente na clínica.
4. Duplicado: maior completude; empate: `data_agendamento` mais recente. Descartes têm motivo.
5. Paciente com 3+ faltas anteriores ganha risco adicional e confirmação reforçada.

A justificativa completa está em [`DECISOES_DE_NEGOCIO.md`](./DECISOES_DE_NEGOCIO.md).

## O que os dados mostraram

Após deduplicação por ID, a base fica com **7.294 registros**. Entre desfechos `realizada` e `falta`, são **6.378 consultas**, **2.003 faltas** e taxa histórica de aproximadamente **31%**. A maior diferença observada está na antecedência: até 7 dias ~18%; 29–42 dias ~45%; 43+ dias ~46%. Primeira consulta (~37%), segunda-feira (~39%) e `MED01` (~40%) também aparecem como sinais úteis. Convênio e particular ficam próximos e, por isso, o tipo de atendimento não recebe peso forte.

Veja [`ANALISE_DADOS.md`](./ANALISE_DADOS.md) para a análise e a conta de impacto.

## Parte 2 — por que fila de confirmação, e não overbooking?

O problema central é falta, mas overbooking adiciona um novo risco: dois pacientes podem comparecer e a clínica não ter capacidade para ambos. Os dados permitem uma intervenção mais controlável: priorizar confirmações onde a falta é historicamente mais provável. A tela mostra risco e motivos; a recepção pode simular uma mensagem de confirmação com aviso de multa e opção de cancelar.

### Resultado esperado

O grupo classificado como alto risco contém aproximadamente **434 faltas históricas/ano**, ou **36,2/mês**. Adotando como hipótese inicial uma redução de **20%** nesse grupo, a proposta evitaria/liberaria antecipadamente cerca de **7,2 faltas por mês** (`434 / 12 × 0,20`). Esse número é uma hipótese para teste, não uma previsão garantida.

### Como saber em 3 meses se funcionou

Criaria um teste controlado com pacientes de risco semelhante. Compararia grupo com confirmação priorizada vs. fluxo padrão. Métricas: taxa de falta (principal), cancelamentos antecipados, slots reaproveitados, taxa de confirmação e reclamações. Também acompanharia os resultados por médico e antecedência para detectar mudança de perfil.

## API principal

- `GET /api/health`
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/status`
- `GET /api/indicators?from=...&to=...`
- `GET /api/risk-queue`
- `POST /api/appointments/:id/reminder`

## O que ficou de fora / riscos

- Cobrança financeira real da multa: faltam valor, política de isenção, regras de convênio e integração de pagamento.
- Overbooking automático: precisa de limite de capacidade e teste operacional antes de ir a produção.
- Integração real com WhatsApp/SMS/e-mail: o desafio pede simulação.
- Autenticação e cadastro: explicitamente dispensados pelo enunciado.
- O score é heurístico, baseado nesta amostra. Pode sofrer drift e não deve ser tratado como verdade permanente.
- A regra de multa precisa de validação jurídica/comercial antes de uso real; aqui ela é apenas regra funcional do desafio.
- O importador descarta conflitos irrecuperáveis e reporta o motivo; em produção, eu adicionaria revisão manual.

## Estrutura

```text
backend/   API, regras de negócio, importação e testes
frontend/  dashboard e fila de confirmação
data/      arquivos fornecidos no desafio
ANALISE_DADOS.md
DECISOES_DE_NEGOCIO.md
```

## Uso de IA

Usei IA como apoio para acelerar boilerplate, organização do projeto, revisão de regras e geração inicial de testes/documentação. Corrigi decisões que poderiam distorcer o domínio — principalmente **não converter cancelamento tardio em falta**, não assumir que convênio explica o problema só porque foi mencionado pela recepção, e não implementar overbooking sem capacidade operacional. Os números do README foram recalculados diretamente sobre o CSV fornecido após normalização/deduplicação.

## Próximos passos

Investir em testes de integração com MongoDB efêmero, endpoint de resposta `CONFIRMO/CANCELAR`, job agendado para lembretes 48h/24h, tela de agenda para recepção, auditoria de mudanças, observabilidade e experimento A/B do fluxo de confirmação.
