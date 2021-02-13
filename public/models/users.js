const mongoose = require('mongoose');

const userModel = mongoose.model(
    'User', 
    new mongoose.Schema({
      username: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      }
    })
  );

module.exports = userModel;