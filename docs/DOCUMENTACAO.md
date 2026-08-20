# STAYO — Documentação

Interface no app: `/docs`. O conteúdo da tela vive em `src/docs/content.ts`. Este arquivo é o espelho em markdown.

Documentação de **funcionalidades do produto** — o que cada tela faz, fluxos de uso e limitações da demo.

Última atualização: 19 ago 2026

---

## Produto

STAYO é a camada de autoatendimento hoteleiro. Totens para o hóspede, console para a equipe.

O hóspede faz check-in no totem de recepção, pede serviços nos totens de quarto e área, e paga no checkout da recepção. A equipe acompanha tudo pelo console — filas, reservas, totens e cardápio — sem substituir o PMS do hotel.

**Não é PMS.** STAYO não gerencia ocupação, governança, manutenção, receita nem cadastro interno.

| Quem | Usa |
|---|---|
| Hóspede | Totens de recepção, quarto e área |
| Recepção / equipe | Console — filas, reservas, totens, cardápio |
| Administrador | Console — troca de hotel e gestão operacional |

---

## Funcionalidades

### Hub (`/`)

Ponto de entrada. Escolhe entre console ou totem.

- Lista as quatro superfícies do produto
- Link para esta documentação

### Console — Filas (`/filas`)

Painel operacional do dia. O que chegou pelos totens.

- Contadores: aguardando check-in, check-ins feitos, pedidos abertos
- Fila de check-in: reservas aguardando o totem e as já concluídas
- Fila de pedidos: abertos, em preparo, entregues ou cancelados
- Avançar status do pedido ou cancelar
- Clique em uma reserva leva para a lista completa

### Console — Reservas (`/reservas`)

Lista que o totem de recepção consulta no check-in.

- Busca por nome ou quarto
- Filtro por status (confirmada, hospedado, cancelada…)
- Filtro por período (chegada hoje, próximas, em casa)
- Ver detalhes: contato, datas, valor, pagamento, histórico
- Confirmar reserva pendente ou cancelar
- Criar nova reserva manualmente

**Ainda não:** edição de campos é simulada — alterações ficam só nesta sessão.

### Console — Totens (`/totens`)

Cadastro de tablets de quarto e de área.

- Listar totens por quarto ou área
- Criar e editar: nome, código de ativação, vínculo, status
- Copiar código para configurar o dispositivo

### Console — Cardápio (`/cardapio`)

O que os totens podem oferecer.

- Categorias e itens (room service, restaurante, spa…)
- Serviços extras no quarto (spa, transfer, late checkout…)
- Áreas comuns (restaurante, spa, lobby)

### Totem de recepção (`/totem/recepcao`)

Check-in de autoatendimento.

- Busca reserva por nome ou código
- Valida status: bloqueia canceladas, pendentes, já feitas ou fora da data
- Mostra dados da reserva e quarto atribuído
- Simula leitura de documento
- Apresenta termos do hotel e exige aceite
- Confirma check-in e orienta caminho até o quarto
- Modo operador para a recepção intervir
- Reinicia sozinho após inatividade

**Ainda não:** leitura de documento é simulada — sem hardware. Checkout e pagamento ainda não implementados.

### Totem de quarto (`/totem/quarto`)

Pedidos e solicitações no quarto. Tablet na parede ou mesa.

- Ativação única por código cadastrado no console
- Home com atalhos e destaques do cardápio (visual de catálogo)
- Ícones, badges (~25 min / Imediato), toast ao adicionar item
- Carrinho, observações e envio para a fila
- Confirmação com previsão; valor na conta do quarto
- Totem de área mantém layout kiosk

**Códigos demo (Aurora):** `Q203-AUR` (quarto 203), `Q308-AUR` (quarto 308)

### Totem de área (`/totem/area`)

Pedidos em restaurante, spa, lobby.

- Ativação única por código
- Cardápio filtrado pela área cadastrada
- Carrinho e envio para a fila
- Pagamento na recepção

**Códigos demo (Aurora):** `RST-AUR` (restaurante), `SPA-AUR` (spa)

### Multi-hotel

- Seletor de hotel no topbar do console
- Troca reservas, filas, pedidos, totens e cardápio do hotel selecionado
- Totens exibem cor, nome e termos do hotel vinculado ao cadastro

---

## Fluxos

### Check-in pelo hóspede (disponível)

1. Hóspede toca em "Fazer check-in" na tela inicial
2. Digita nome ou código da reserva
3. Sistema localiza e valida se pode fazer check-in
4. Confere dados pessoais e quarto atribuído
5. Passa pela leitura simulada do documento
6. Aceita os termos do hotel
7. Recebe confirmação com orientação até o quarto
8. Reserva muda para "Hospedado" e aparece na fila do console

### Equipe acompanha chegadas (disponível)

1. Abre Filas no console
2. Vê quantos aguardam check-in e quantos já concluíram
3. Lista mostra nome, quarto e status
4. Clica em uma linha para abrir detalhes em Reservas

### Equipe gerencia reservas (disponível)

1. Abre Reservas no console
2. Busca ou filtra a reserva
3. Abre painel lateral com contato, datas e histórico
4. Confirma, cancela ou cria nova reserva

### Configurar totem de quarto (disponível)

1. Console → Totens → cadastra tablet com quarto e código
2. No dispositivo, abre `/totem/quarto` e informa o código
3. Ativação fica salva no navegador — não repete
4. Cardápio vem de Console → Cardápio

### Pedido pelo quarto (disponível)

1. Hóspede abre o totem no quarto
2. Navega pelo catálogo e monta o pedido
3. Confirma — pedido entra na fila do console
4. Equipe avança status (preparo → entregue) ou cancela
5. Pagamento fica para o checkout na recepção

### Pedido na área comum (disponível)

1. Hóspede acessa totem da área (restaurante, spa…)
2. Consulta cardápio da área
3. Faz o pedido com observações
4. Pedido entra na fila do console
5. Pagamento na recepção

---

## Próximos passos

1. **Checkout na recepção** — fechar conta e pagamento no totem de recepção com itens dos pedidos
2. **Integração com PMS** — reservas vindas do sistema do hotel

---

## Limitações da demo

- Protótipo frontend — sem servidor. Dados resetam ao recarregar.
- Ativação do totem persiste no navegador; cadastros e pedidos resetam ao recarregar.
- Pagamento ainda não existe no totem de recepção.
- Leitura de documento no check-in é simulada.
- Edição de reserva no console é simulada.
- Não substitui PMS: sem governança, manutenção, relatórios nem gestão interna.

---

## Materiais extras

- **`docs/stayo-pitch-custos.html`** — apresentação de custos de hardware e hospedagem para investidor. Abrir no navegador; navegação por setas.
