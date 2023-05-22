const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
    user_id: String,
    company_name: String,
    contactPhone:String,
    logo_url:String,
    state: String,
}, {timestamps:true})

exports.CompanyModel = mongoose.model("companies", schema)

exports.validateCompany = (_reqBody) => {
   return Joi.object({
        company_name:Joi.string().min(2).max(60).required(),
        contactPhone:Joi.string().min(5).max(15).required(),
        state:Joi.string().min(2).max(15).required()
    }).validate(_reqBody)
}