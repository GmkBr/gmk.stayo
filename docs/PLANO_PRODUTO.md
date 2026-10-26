# Evolução do STAYO

Objetivo: conduzir a chegada e a saída do hóspede com autonomia verificável, mantendo a equipe capaz de resolver exceções. Este é um plano de desenvolvimento; os itens abaixo não representam funcionalidades já entregues.

## Ordem de entrega

### 1. Fundação e contratos

Iniciada nesta etapa: validação de build, separação dos modos, renovação de sessão, isolamento de cargas de hotel, testes de requisições e CI.

Próximos itens: acesso ao backend, contrato de autorização, erros previsíveis, idempotência e separação dos domínios do estado remoto. Critério de saída: o fluxo com API real passa pelos cenários de expiração, concorrência, troca de hotel e perda de conexão sem confirmar uma operação que não ocorreu.

### 2. Check-in e check-out reais

Conectar a identidade, disponibilidade do quarto, assinatura/aceite, pagamento e chave ao backend. Exibir uma ação clara para cada falha e manter o que já foi concluído.

Critério de saída: a conclusão mostra o resultado confirmado das integrações; uma falha após cobrança ou criação da estadia não gera duplicação na retomada. A equipe consegue localizar e concluir a mesma operação.

### 3. Experiência no dispositivo

Testar a jornada em português, inglês e espanhol, com texto completo em cada idioma, alvos de toque confortáveis, contraste, foco e uso sem gestos ocultos. Antes de encerrar por inatividade, avisar e permitir continuar; ao encerrar, limpar os dados do hóspede.

Critério de saída: hóspede conclui o fluxo no tablet real, consegue corrigir os dados e pedir ajuda sem reiniciar toda a jornada. O aviso de inatividade não interrompe leitura ou pagamento em andamento.

### 4. Operação e piloto

Criar painel de dispositivos e jornadas com última comunicação, versão, etapa atual sem dados pessoais, falhas e atendimentos pendentes. Validar atualização, rollback e recuperação depois de reiniciar o totem.

Critério de saída: piloto assistido em um hotel com acompanhamento de conclusão, tempo, abandono, solicitações de ajuda e falhas por etapa. Expandir a operação após corrigir as causas de falha observadas.

## Diferenciais a validar

### Pré-chegada e retomada por QR

O hóspede preenche dados e aceita informações antes de chegar. Um QR com validade curta retoma a jornada no totem, sem expor CPF ou código de reserva na imagem. Requer token validado pelo backend e proteção contra reutilização.

Valor a medir: menos digitação e menor tempo de chegada. Critério: QR expirado, usado ou inválido tem recuperação clara; o QR sozinho não libera a chave sem a verificação exigida pelo hotel.

### Ajuda com contexto

Um pedido de ajuda gera um atendimento para a equipe, com a etapa e o motivo da falha. O hóspede acompanha a confirmação de recebimento, e a equipe retoma a mesma operação.

Valor a medir: menos abandonos e menos repetição de dados. Critério: a interface só diz que a equipe foi avisada depois de receber confirmação do servidor; falha na notificação mostra alternativa presencial.

### Chegada antes do horário com disponibilidade real

Apresentar entrada antecipada, espera assistida ou upgrade apenas quando disponibilidade, quarto liberado e preço forem confirmados pelo PMS/backend.

Valor a medir: redução de atendimento manual e adesão às opções oferecidas. Critério: duas pessoas não compram o mesmo quarto; a oferta informa o preço e não é cobrada sem escolha explícita.

### Conta e serviços durante a estadia

Evoluir os totens de quarto já existentes para acompanhar pedidos, extrato e solicitações até a entrega, com atualização visível de status e tratamento de divergências.

Valor a medir: menos consultas à recepção e maior conclusão dos pedidos. Critério: cada consumo pertence à estadia correta, com preço validado no servidor e atualização após entrega ou cancelamento.

### Continuidade após falha

Se o terminal cair depois do pagamento ou do check-in, consultar o resultado da operação ao retomar e oferecer a próxima ação pendente, como entregar a chave. Não guardar documentos nem dados de cartão como fila local de operações.

Valor a medir: menos cobranças duplicadas e menos atendimento para recuperar jornadas interrompidas. Critério: pagamento pendente, confirmado, recusado e resultado desconhecido têm comportamentos distintos e verificáveis.

## Decisões ainda necessárias

- Localização e estado do backend; PMS usado pelo primeiro hotel.
- Modelo do totem, sistema operacional e integrações de câmera/leitor, pagamento e fechadura.
- Primeiro hotel piloto e quem assume os atendimentos de exceção.
- Critérios do hotel para identidade, aceite, entrada antecipada, cobrança e entrega da chave.

Referência de escopo consultada: [jornada pública do Mews Kiosk](https://help.mews.com/s/article/Mews-Guest-Journey?language=en_US), em 14/10/2026. Os diferenciais propostos acima são hipóteses do STAYO a validar no piloto.
