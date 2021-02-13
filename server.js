const express = require('express');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const commentModel = require('./public/models/comments');
const gameModel = require('./public/models/games');
const userModel = require('./public/models/users');

const app = express();

async function passwordMaker(pass) {
  pass = await bcrypt.hash(pass,12);
  console.log(pass)
  await new userModel({
    username: 'admin',
    password: pass
  }).save();
}

// passwordMaker('')
app.use(cookieParser('Secret Phrase'))
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true
}));
app.use(morgan("combined"));
app.use(express.json());

app.get('/', (req,res) => {
  if (req.signedCookies.id === 'admin') {
    res.sendFile(__dirname + '/public/rpoSim.html');
  }
  else {
    res.sendFile(__dirname + '/public/login.html');
  }
});

app.post('/', async (req, res) => {
  let user = await userModel.findOne({
    username: 'admin' 
  });
  let good = await bcrypt.compare(req.body.password, user.password);
  if (good) {
    res.cookie('id','admin', {signed: true, maxAge: 21600000}).sendFile(__dirname + '/public/rpoSim.html');
  }
  else {
    res.sendFile(__dirname + '/public/login.html'); 
  }
})
mongoose.connect(
  process.env.DATA,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => console.log('Database connected @ ' + new Date())).catch(err => console.log('Error Connecting Database ' + err));


// Get list of all games
app.get("/games", async (req, res) => {
  if (!req.signedCookies.id) {
    res.status(401).send();
    return;
  }
  let games = await gameModel.find();
  res.send(
    games.map(game => {
      return {
        name: game.name,
        _id: game._id,
        players: game.players.map(player => {
          return player.name;
        })
      };
    })
  );
});

// Get specific game info
app.get("/games/:id", async (req, res) => {
  if (!req.signedCookies.id) {
    res.status(401).send();
    return;
  }
  let game = await gameModel.findOne({
    _id: req.params.id
  });
  res.send(game);
});

app.get("/tle/:sid", (req, res) => {
  const sid = req.params.sid;
});

// Create new game
app.post("/new", async (req, res) => {
  if (!req.signedCookies.id) {
    res.status(401).send();
    return;
  }
  let newGame = await new gameModel(req.body).save();
  console.log(req.body.name);
  res.cookie("name", req.body.name).send(newGame);
});

app.put("/update/:game/:team", async (req, res) => {
  if (!req.signedCookies.id) {
    res.status(401).send();
    return;
  }
  let game = await gameModel.findOne({
    _id: req.params.game
  });
  let playerBurnFailure = game.players.find(
    player => player.name === req.params.team
  ).burnFailure;
  if (playerBurnFailure / 100 > Math.random()) {
    await gameModel.updateOne(
      {
        _id: req.params.game,
        "players.name": req.params.team
      },
      {
        $set: {
          "players.$.turn": req.body.turn
        }
      }
    );
    res.send({ resp: false });
  } else {
    await gameModel.updateOne(
      {
        _id: req.params.game,
        "players.name": req.params.team
      },
      {
        $set: {
          "players.$.burns": req.body.burns,
          "players.$.turn": req.body.turn
        }
      }
    );
    res.send({ resp: true });
  }
});

app.delete("/:id", async (req, res) => {
  if (!req.signedCookies.id === 'admin') {
    res.status(401).send();
    return;
  }
  let game = await gameModel.deleteOne({
    _id: req.params.id
  });
  console.log(game);
  res.send("deleted");
});

app.post("/comment", async (req, res) => {
  let { comment = "no comment attached", inPackage = "none" } = req.body;
  let outComment = await new commentModel({
    content: comment,
    package: inPackage
  }).save();
  res.send(comment);
});

app.put("/referee/:id", async (req, res) => {
  if (!req.signedCookies.id) {
    res.status(401).send();
    return;
  }
  let resp = await gameModel.updateOne(
    {
      _id: req.params.id,
      "players.name": req.body.player
    },
    {
      $set: {
        "players.$.burnFailure": req.body.failRate
      }
    }
  );
  res.send({ resp: resp });
});


app.listen(process.env.PORT || 4000, () => {
  console.log('Server started @ ' + new Date());
});