const mongoose= require('mongoose');

const artSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    totalPiece: {
        type: Number,
    },
    pictures: [
        {
            type: String,
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }
},{
    timestamps: true,
});

const art = mongoose.model('Arts', artSchema);

module.exports = art;