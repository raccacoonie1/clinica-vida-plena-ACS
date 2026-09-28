# Decisões de negócio

## 1. Cancelamento em cima da hora

O paciente pode cancelar normalmente até **1 hora antes**. Com menos de 1 hora, o sistema ainda registra `cancelada_paciente`, mas marca `lateCancellation=true` e `penalty=true`.

**Polimento importante:** cancelamento tardio **não é transformado em `falta`**. Isso preserva a semântica dos dados: o paciente avisou, embora tarde. A clínica pode aplicar a mesma consequência financeira da falta sem contaminar o indicador de no-show.

## 2. Cancelamentos na taxa de falta

Cancelamentos são excluídos do denominador. A fórmula é:

`faltas / (faltas + realizadas)`

Assim, 10 agendamentos, 2 faltas e 2 cancelamentos resultam em **25%**: 2 faltas entre 8 consultas que chegaram a um desfecho de comparecimento/não comparecimento.

## 3. Primeira consulta

“Primeira consulta” significa a **primeira consulta do paciente na clínica**, independentemente do médico. É uma regra mais simples de comunicar e corresponde ao problema relatado de paciente novo.

## 4. Duplicados e conflitos

Para IDs duplicados: vence o registro com **mais campos preenchidos**. Em empate, vence o de `data_agendamento` mais recente. Toda decisão é contabilizada no relatório de importação. Registros sem status reconhecível, data válida, tipo válido ou médico existente são descartados com motivo.

Conflitos de slot não são “adivinhados”: se dois registros diferentes violarem uma restrição operacional ativa, o importador descarta o conflitante e registra o motivo. Em produção eu preferiria uma fila de revisão manual para esses casos.

## 5. Pacientes com faltas frequentes

A partir de **3 faltas anteriores**, o paciente recebe um fator extra de risco e aparece com prioridade maior na fila de confirmação. A mensagem pede confirmação explícita e informa a política de cancelamento/multa. Não bloqueio automaticamente o paciente: essa decisão teria impacto de acesso e cobrança que exige validação da clínica.

## Sobre multa e overbooking

A multa está modelada como **flag de penalidade**, não como cobrança financeira real, pois o desafio não fornece valor, meios de pagamento ou regras de convênio. Overbooking foi deliberadamente deixado fora do MVP: os dados sustentam primeiro uma intervenção menos arriscada — confirmação direcionada. Uma evolução seria testar overbooking apenas em slots com risco alto e capacidade operacional definida.
