import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";

const app = express();

app.use(express.json());
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Servidor inicializado e rodando na PORT: ${port}`);
});

// contador que vai incrementar gerando os id unicos dos usuários
// contagem em 1 pois exite um usuario padrão de teste
let userID: number = 1;

//classe criadora de usuários
class User {
  public id: number;
  public nome: string;
  public senha: string;
  public mensagens: Array<Mensagens>;

  constructor(
    id: number,
    nome: string,
    senha: string,
    mensagens: Array<Mensagens>
  ) {
    this.id = id;
    this.nome = nome;
    this.senha = senha;
    this.mensagens = mensagens;
  }
}

//user teste
const users: Array<User> = [new User(0, "Paulo", "000000000-01", [])];

// contador que vai incrementar gerando as id unicas das mensagens
let mensagensID: number = 0;

// classe construtora das mensagens
class Mensagens {
  public id: number;
  public desc: string;
  public det: string;

  constructor(id: number, desc: string, det: string) {
    this.id = id;
    this.desc = desc;
    this.det = det;
  }
}

// rota chamada ao criar novo usuário
app.post("/users", (req: Request, res: Response) => {
  const nome = String(req.body.nome);
  const senha = String(req.body.senha);

  if (nome === "undefined" || "" || senha === "undefined" || "") {
    res.status(400).send("Preencha todos os campos!");
  } else {
    const validaNome = users.findIndex((user) => user.nome === nome);
    const validaSenha = users.findIndex((user) => user.senha === senha);

    if (validaNome === -1 && validaSenha === -1) {
      const novoUsuario: User = new User(userID, nome, senha, []);
      users.push(novoUsuario);
      userID++;
      res.status(201).json(novoUsuario);
    } else {
      res.status(400).send("Erro nas informações do usuário.");
    }
  }
});

//rota para exibir todos os usuários criados
app.get("/users", (req: Request, res: Response) => {
  res.json(users);
});

//rota para exibir um usuário pelo seu id
app.get("/users/:id", (req: Request, res: Response) => {
  const idProcurado: number = Number(req.params.id);
  let idEncontrado: User | undefined = users.find(
    (usuario) => usuario.id === idProcurado
  );

  if (idEncontrado !== undefined) {
    res.status(200).send(idEncontrado);
  } else {
    res
      .status(400)
      .send(`Não foi possível localizar o usuário com id = ${idProcurado}`);
  }
});

// rota chamada ao criar nova mensagem
app.post("/users/:idUser/mensagens", (req: Request, res: Response) => {
  const idUser = Number(req.params.idUser);
  const desc = String(req.body.desc);
  const det = String(req.body.det);

  let idEncontrado: User | undefined = users.find(
    (usuario) => usuario.id === idUser
  );

  if (idEncontrado !== undefined || "NaN") {
    if (desc === "undefined" || "" || det === "undefined" || "") {
      res.status(400).send("Preencha todos os campos!");
    } else {
      const novaMensagem: Mensagens = new Mensagens(mensagensID, desc, det);
      users[idUser].mensagens.push(novaMensagem);
      mensagensID++;
      res.status(201).send("Nova mensagem adicionada com sucesso.");
    }
    res.status(200).send(idEncontrado);
  } else {
    res
      .status(400)
      .send(`Não foi possível localizar o usuário com id = ${idUser}`);
  }
});
