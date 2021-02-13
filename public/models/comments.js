const mongoose = require('mongoose');

const commentModel = mongoose.model(
    "Comment",
    new mongoose.Schema({
        date: {
        type: Date,
        default: Date.now()
        },
        content: {
        type: "String",
        required: true
        },
        package: {
        type: "String"
        }
    })
);

module.exports = commentModel;