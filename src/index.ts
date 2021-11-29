import express, { Request, Response, NextFunction, application } from "express";
import "dotenv/config";
import cors from "cors";
import { userInfo } from "os";

const app = express();

app.use(cors());

app.use(express.json());
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Servidor inicializado e rodando na PORT: ${port}`);
});

// contador que vai incrementar gerando os id unicos dos usuários
// contagem em 1 pois exite um usuario padrão de teste
// let userID: number = 2;

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

// contador que vai incrementar gerando as id unicas das mensagens
// let mensagensID: number = 2;

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

//user teste
const users: Array<User> = [
  {
    id: 0,
    nome: "Marcelo",
    senha: "321321321",
    mensagens: [
      {
        id: 0,
        desc: "primeira mensagem",
        det: "primeira mensagem",
      },
    ],
  },
];

// rota chamada ao criar novo usuário
app.post("/user", (req: Request, res: Response) => {
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
      let userID = users.length;
      const novoUsuario: User = new User(userID, nome, senha, novasMensagens);
      users.push(novoUsuario);
      userID++;
      res.status(201).json(novoUsuario);
    } else {
      res
        .status(400)
        .json({ message: "Usuário já existe", error: "user_exist" });
    }
  }
});

//rota para exibir todos os usuários criados
app.get("/users", (req: Request, res: Response) => {
  let usuarios = users.map((user) => user);
  res.json({ message: "Lista de usuários", data: usuarios });
});

// rota para criar nova mensagem
app.post("/user/:userId", (req: Request, res: Response) => {
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
      let mensagensID = users[idUser].mensagens.length;
      const novaMensagem: Mensagens = new Mensagens(mensagensID, desc, det);
      users[idUser].mensagens.push(novaMensagem);
      mensagensID++;
      res.status(201).json({
        message: "Nova mensagem criada com sucesso",
        data: novaMensagem,
      });
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
app.get("/user/:userId", (req: Request, res: Response) => {
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
app.get(
  "/user/:userId/mensagens/:mensagemId",
  (req: Request, res: Response) => {
    const idUser: number = Number(req.params.userId);
    const idMsg: number = Number(req.params.mensagemId);

    const userMsg: Mensagens = users[idUser].mensagens[idMsg];
    console.log(userMsg);

    if (userMsg !== undefined) {
      res.status(200).json({
        message: "Mensagem: " + idMsg + ". Do usuário: " + idUser,
        data: userMsg,
      });
    } else {
      res.status(404).json({
        message:
          "Não existe mensagem para o id: " +
          idMsg +
          " para o usuário: " +
          users[idUser].nome,
        error: "message_not_found",
      });
    }
  }
);

//rota para editar mensagem do usuário
app.put(
  "/user/:userId/mensagens/:mensagemId",
  (req: Request, res: Response) => {
    const idUser: number = Number(req.params.userId);
    const idMsg: number = Number(req.params.mensagemId);
    const descricao = String(req.body.desc);
    const detalhamento = String(req.body.det);

    users[idUser].mensagens[idMsg].desc = descricao;
    users[idUser].mensagens[idMsg].det = detalhamento;

    const userMsg: Mensagens = users[idUser].mensagens[idMsg];
    console.log(userMsg);

    res.status(200).json({
      message:
        "Mensagem: " +
        idMsg +
        ". Do usuário: " +
        idUser +
        " foi editada com sucesso",
      data: userMsg,
    });
  }
);

//rota para deletar mensagem do usuário
app.delete(
  "/user/:userId/mensagem/:mensagemId",
  (req: Request, res: Response) => {
    const idUser: number = Number(req.params.userId);
    const idMsg: number = Number(req.params.mensagemId);

    const userMsg: Mensagens = users[idUser].mensagens[idMsg];
    users[idUser].mensagens.splice(idMsg, 1);
    res.status(200).json({
      message:
        "Mensagem: " +
        idMsg +
        ". Do usuário: " +
        idUser +
        " foi deletada com sucesso",
      data: userMsg,
    });
  }
);
