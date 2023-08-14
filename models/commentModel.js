const mongoose = require("mongoose");
const Joi = require("joi");
const { UserModel } = require("./userModel");

let schema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    content: String,
    stars: Number,
    likes: {
        type: Array, default: []
    }
}, {timestamps:true})
exports.CommentModel = mongoose.model("comments", schema)

exports.validateComment = (_reqBody) => {
    let joiSchema = Joi.object({
        content: Joi.string().min(2).max(1200).allow(null, ""),
        stars: Joi.number().min(1).max(5).required(),
    })
    return joiSchema.validate(_reqBody)
}