## Para executar o projeto
Suba o dump do banco de dados
Atualize o DATABASE_URL do .env com a configuração atual
Execute:
    npm install
    prisma generate client
    npm run dev
Caso ocorra problemas com a biblioteca de datas, instale-a manualmente:
    npm install date-fns --save

## Usuário já cadastrado no banco
e-mail: joao@mail.com
senha: 123