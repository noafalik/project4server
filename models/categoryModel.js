const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
    category_name: String,
    info: String,
}, {timestamps:true})

exports.CategoryModel = mongoose.model("categories", schema)

exports.validateCategory = (_reqBody) => {
   return Joi.object({
        category_name:Joi.string().min(2).max(60).required(),
        info:Joi.string().min(1).max(500).required()
    }).validate(_reqBody)
}