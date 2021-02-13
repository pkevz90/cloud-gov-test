const mongoose = require('mongoose');

const gameModel = mongoose.model(
    "Game",
    new mongoose.Schema({
      name: {
        type: String,
        default: "Game"
      },
      scenarioConditions: {
        initSun: {
          type: Number,
          default: 45
        },
        gameLength: {
          type: Number,
          default: 48
        },
        nBurns: {
          type: Number,
          default: 24
        },
        turnLength: {
          type: Number,
          default: 0
        }
      },
      players: [
        {
          name: {
            type: String,
            required: true
          },
          initState: [Number],
          fuel: Number,
          turn_fuel: Number,
          range: Number,
          cats: [Number],
          burns: [[Number]],
          turn: Number,
          burnFailure: {
            type: Number,
            default: 0
          }
        }
      ]
    })
  );
module.exports = gameModel;