const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
    user_id: String,
    job_id: String,
    notes:String,
    starting: Date,
    video_link:String
}, {timestamps:true})

exports.ContenderModel = mongoose.model("companies", schema)

exports.validateContender = (_reqBody) => {
   return Joi.object({
        notes:Joi.string().min(2).max(500).required(),
        starting:Joi.date().required()
    }).validate(_reqBody)
}