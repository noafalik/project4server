const mongoose = require("mongoose");
const Joi = require("joi");
const { UserModel } = require("./userModel");

let schema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
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
        state:Joi.string().min(2).max(15).required(),
        logo_url:Joi.string().min(2).max(199).allow("",null)
    }).validate(_reqBody)
}