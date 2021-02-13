const express = require('express');
const router = express.Router();

const gameModel = require('../models/games');
const commentModel = require('../models/comments');


router.get("/games", async (req, res) => {
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
  router.get("/games/:id", async (req, res) => {
    if (!req.signedCookies.id) {
      res.status(401).send();
      return;
    }
    let game = await gameModel.findOne({
      _id: req.params.id
    });
    res.send(game);
  });
  
  router.get("/tle/:sid", (req, res) => {
    const sid = req.params.sid;
  });
  
  // Create new game
  router.post("/new", async (req, res) => {
    if (!req.signedCookies.id) {
      res.status(401).send();
      return;
    }
    let newGame = await new gameModel(req.body).save();
    console.log(req.body.name);
    res.cookie("name", req.body.name).send(newGame);
  });
  
  router.put("/update/:game/:team", async (req, res) => {
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
  
  router.delete("/:id", async (req, res) => {
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
  
  router.post("/comment", async (req, res) => {
    let { comment = "no comment attached", inPackage = "none" } = req.body;
    let outComment = await new commentModel({
      content: comment,
      package: inPackage
    }).save();
    res.send(comment);
  });
  
  router.put("/referee/:id", async (req, res) => {
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

  module.exports = router;