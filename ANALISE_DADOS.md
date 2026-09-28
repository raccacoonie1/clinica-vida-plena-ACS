# Análise exploratória dos dados

A análise abaixo usa os registros históricos após normalização dos sinônimos de status e resolução de IDs duplicados pela regra definida no desafio: maior completude; em empate, registro com `data_agendamento` mais recente.

## Achados principais

- CSV bruto: **7.359 linhas**.
- IDs duplicados adicionais: **65**; após deduplicação ficam **7.294 agendamentos**.
- Para a taxa de falta, entram apenas `realizada` e `falta`: **6.378 consultas válidas**, sendo **2.003 faltas**, taxa histórica de **31,4%** na base tratada.
- O tipo de atendimento quase não separa o risco: convênio ~31,8% e particular ~30,7% na leitura bruta normalizada. Portanto, não usei “convênio” como fator forte do score.
- O médico `MED01` aparece com taxa perto de **40,5%**, acima dos demais médicos.
- **Segundas-feiras** têm taxa perto de **39,7%**.
- **Primeira consulta na clínica** apresenta taxa aproximada de **37,0%**, contra ~29,9% nas demais.
- A variável mais forte e acionável é a **antecedência do agendamento**: consultas marcadas com 29–42 dias chegam a ~45,2% de faltas; 43+ dias, ~46,2%; consultas marcadas com até 7 dias ficam em ~18,7%.

## Hipótese de produto

Em vez de implementar overbooking automático — que pode criar espera e conflito caso os dois pacientes compareçam — a Parte 2 prioriza uma **fila de confirmação por risco**, com lembrete simulado. A recepção vê primeiro quem tem maior risco e pode disparar uma confirmação contendo data/hora, opção de cancelar e aviso sobre a regra de multa.

O score é propositalmente simples e explicável, sem “IA preditiva” opaca:

- +3: antecedência >= 29 dias;
- +2: antecedência entre 15 e 28 dias;
- +2: primeira consulta na clínica;
- +2: segunda-feira;
- +2: `MED01` (faixa histórica de maior falta);
- +1: três ou mais faltas anteriores.

Score >= 5 = alto risco; 3–4 = médio; 0–2 = baixo.

Na base deduplicada, o grupo de alto risco tem aproximadamente **812 consultas**, **434 faltas** e taxa de **53,4%**. Isso torna a priorização bem mais eficiente do que tratar toda a agenda da mesma forma.

## Estimativa de impacto

Há cerca de **434 faltas de alto risco em 12 meses**, ou **36,2/mês**. Como hipótese inicial de produto, assumo que confirmação direcionada + possibilidade explícita de cancelar consiga evitar ou liberar antecipadamente **20%** dessas faltas:

`434 / 12 × 20% = 7,23`

Meta inicial: **~7 faltas evitadas por mês**. Isso é uma hipótese, não uma promessa. Em produção, o efeito deve ser medido por coorte/experimento.

## Como validar em 3 meses

Comparar pacientes elegíveis para alto risco que receberam o fluxo de confirmação com um grupo de controle equivalente. Métricas: taxa de falta, cancelamento antecipado, ocupação reaproveitada e taxa de confirmação. A proposta é considerada útil se reduzir a taxa de falta do grupo de alto risco sem aumentar de forma relevante cancelamentos tardios, reclamações ou ociosidade.
