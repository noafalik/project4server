const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
    job_title: String,
    company_id: String,
    category_id: String,
    info : String,
    salary: Number,
    location : String,
    approved: {
        type: Boolean, default: false
    },
    visa : String
},{timestamps:true})
exports.JobModel = mongoose.model("jobs", schema)

exports.validateJob = (_reqBody) => {
    return Joi.object({
        job_title: Joi.string().min(2).max(70).required(),
        info: Joi.string().min(2).max(1200).allow(null, ""),
        salary: Joi.number().min(1).max(10).required(),
        location: Joi.string().min(2).max(45).required(),
        visa: Joi.string().min(2).max(60).required()
    }).validate(_reqBody)
}