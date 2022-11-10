const mongoose = require('mongoose');

const userArtSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    itemForSales: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'art',
        }
    ],
    itemSold: [
       {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'art',
       }
    ],
    itemBought: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'art',
        }
    ]
}, {
    timestamps: true
});

const userArt = mongoose.model("UserArt", userArtSchema);

module.exports = userArt;