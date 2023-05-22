const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
    user_id: String,
    content: String,
    date_created: {
        type: Date, default: Date.now
    },
    stars: Number,
    likes: {
        type: Array, default: []
    }
})
exports.CommentModel = mongoose.model("comments", schema)

exports.validateComment = (_reqBody) => {
    let joiSchema = Joi.object({
        content: Joi.string().min(2).max(1200).allow(null, ""),
        stars: Joi.number().min(1).max(5).required(),
    })
    return joiSchema.validate(_reqBody)
}