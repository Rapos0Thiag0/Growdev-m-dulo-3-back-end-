import express, { Request, Response, NextFunction, application } from "express";
import "dotenv/config";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();

app.use(cors());

app.use(express.json());
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Servidor inicializado e rodando na PORT: ${port}`);
});

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

// classe construtora das mensagens
class Mensagens {
  public id: string;
  public desc: string;
  public det: string;

  constructor(id: string, desc: string, det: string) {
    this.id = id;
    this.desc = desc;
    this.det = det;
  }
}

//user teste
const users: Array<User> = [
  {
    id: 0,
    nome: "Marcelo",
    senha: "321321321",
    mensagens: [
      {
        id: randomUUID(),
        desc: "primeira mensagem",
        det: "primeira mensagem",
      },
    ],
  },
];

// rota chamada ao criar novo usuário
app.post("/api", (req: Request, res: Response) => {
  const nome = String(req.body.nome);
  const senha = String(req.body.senha);

  if (!!!nome || nome == "" || !!!senha || senha == "") {
    res
      .status(400)
      .json({ message: "Preencha todos os campos!", error: "empty_fields" });
  } else {
    const validaNome = users.findIndex((user) => user.nome == nome);

    if (validaNome == -1) {
      let novasMensagens: Array<Mensagens> = [];
      let userID = users.length++;
      const novoUsuario: User = new User(userID, nome, senha, novasMensagens);
      users.push(novoUsuario);
      // userID++;
      res.status(201).json(novoUsuario);
    } else {
      res
        .status(400)
        .json({ message: "Usuário já existe", error: "user_exist" });
    }
  }
});
app.post("/login", (req: Request, res: Response) => {
  const nome = String(req.body.nome);
  const senha = String(req.body.senha);

  if (!!!nome || nome == "" || !!!senha || senha == "") {
    res
      .status(400)
      .json({ message: "Preencha todos os campos!", error: "empty_fields" });
  } else {
    const validaNome = users.findIndex((user) => user.nome == nome);
    const validaSenha = users.findIndex((user) => user.senha == senha);

    if (validaNome !== -1 && validaSenha !== -1) {
      const usuario = users[validaNome];
      res.status(201).json(usuario.id);
    } else {
      res
        .status(400)
        .json({ message: "Usuário não existe", error: "user_not_exist" });
    }
  }
});

//rota para exibir um usuário pelo seu id
app.get("/api/:id", (req: Request, res: Response) => {
  const idProcurado: number = Number(req.params.id);

  let idEncontrado: User | undefined = users.find(
    (usuario) => usuario.id === idProcurado
  );

  if (idEncontrado !== undefined) {
    res.status(200).send({ message: "Usuário encontrado", data: idEncontrado });
  } else {
    res.status(400).send({
      message: "Não foi possível localizar o usuário com id: " + idProcurado,
      error: "user_not_found",
    });
  }
});

//rota para exibir todos os usuários criados
app.get("/api", (req: Request, res: Response) => {
  let usuarios = users.map((user) => user);
  res.json({ message: "Lista de usuários", data: usuarios });
});

// rota para criar nova mensagem
app.post("/api/:userId", (req: Request, res: Response) => {
  const idUser = Number(req.params.userId);
  const desc = String(req.body.desc);
  const det = String(req.body.det);

  let idEncontrado: User | undefined = users.find((user) => user.id === idUser);

  if (idEncontrado !== undefined || NaN) {
    if (!!!desc || "" || !!!det || "") {
      res
        .status(400)
        .json({ message: "Preencha todos os campos!", error: "empty_fields" });
    } else {
      const novaMensagem: Mensagens = new Mensagens(randomUUID(), desc, det);
      users[idUser].mensagens.push(novaMensagem);

      let userData = users[idUser].mensagens;
      res.status(201).json(userData);
    }
    res.status(200).json({
      message: "Sucesso ao criar nova mensagem",
      user: users[idUser].nome,
    });
  } else {
    res.status(400).json({
      message: `Não foi possível localizar o usuário com id = ${idUser}`,
      error: "user_not_found",
    });
  }
});

//rota para ver as mensagens do usuário
app.get("/api/:userId", (req: Request, res: Response) => {
  const idUser: number = Number(req.params.userId);

  const userMsg: Array<Mensagens> = [...users[idUser].mensagens];

  if (userMsg.length > 0) {
    res.status(200).json({
      message: "Lista de mensagens do usuário: " + users[idUser].nome,
      data: userMsg,
    });
  } else {
    res.status(404).json({
      message: "Não existem mensagens para o usuário: " + users[idUser].nome,
      error: "message_not_found",
    });
  }
});

//rota para ver uma mensagem do usuário
app.get("/api/:userId/mensagem/:mensagemId", (req: Request, res: Response) => {
  const idUser: number = Number(req.params.userId);
  const idMsg: string = String(req.params.mensagemId);

  const userMsg: Mensagens | undefined = users[idUser].mensagens.find(
    (user) => user.id == idMsg
  );

  if (userMsg !== undefined) {
    res.status(200).json({
      message: userMsg,
      data: "Mensagem do usuário: " + users[idUser].nome,
    });
  } else {
    res.status(404).json({
      message: "Não existe mensagem para o usuário: " + users[idUser].nome,
      error: "message_not_found",
    });
  }
});

//rota para editar mensagem do usuário
app.put("/api/:userId/mensagem/:mensagemId", (req: Request, res: Response) => {
  const idUser: number = Number(req.params.userId);
  const idMsg: string = String(req.params.mensagemId);
  const descricao = String(req.body.desc);
  const detalhamento = String(req.body.det);

  const msgIndex = users[idUser].mensagens.findIndex(
    (user) => user.id == idMsg
  );

  users[idUser].mensagens[msgIndex].desc = descricao;
  users[idUser].mensagens[msgIndex].det = detalhamento;

  const userMsg: Mensagens = users[idUser].mensagens[msgIndex];

  res.status(200).json({
    message:
      "Mensagem do usuário: " + users[idUser].nome + " foi editada com sucesso",
    data: userMsg,
  });
});

//rota para deletar mensagem do usuário
app.delete(
  "/api/:userId/mensagem/:mensagemId",
  (req: Request, res: Response) => {
    const idUser: number = Number(req.params.userId);
    const idMsg: string = String(req.params.mensagemId);

    const msgIndex = users[idUser].mensagens.findIndex(
      (user) => user.id == idMsg
    );

    const userMsg: Mensagens = users[idUser].mensagens[msgIndex];
    users[idUser].mensagens.splice(msgIndex, 1);
    res.status(200).json({
      message:
        "Mensagem do usuário: " +
        users[idUser].nome +
        " foi deletada com sucesso",
      data: userMsg,
    });
  }
);
