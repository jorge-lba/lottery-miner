# Worker

O Worker deve fazer as raspagem da página para extrair os dados de cadastro das lotéricas.

## Lista de Desenvolvimento

- [x] Pegar dados para execução e uma fila Redis
- [x] Acessar a página da Caixa Económica
    - [x] Selecionar tipo
    - [x] Selecionar estado
    - [x] Selecionar cidade
    - [x] Clicar em buscar
    - [x] Tirar um print da página inteira (teste)
- [x] Extrair dados de cada lotérica em um Array
- [x] Filtrar dados do array de lotéricas
    - [x] Nome
    - [x] Rua
    - [x] Bairro
    - [x] CEP
    - [x] Cidade
    - [x] UF
    - [x] Telefone
    - [x] Numero da Agência
- [ ] Cadastrar lotéricas individualmente no Banco de Dados ( MongoDB )
    - [ ] Criar um Schema
    - [ ] Conexão
    - [ ] Controller
        - [ ] Create
        - [ ] Update
        - [ ] Listar Todos
        - [ ] Listar por Estado, Cidade ou CEP
        - [ ] Delete All