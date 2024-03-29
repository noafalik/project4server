// קובץ שמכיל את כל המשתנים הסודיים
// dotEnv -> ספרייה שיודעת לקרוא משתנים מקובץ ENV
// ENV
require("dotenv").config();
// console.log(process.env.DBUSER)

exports.config = {
  mongoUrl:process.env.URLDB,
  tokenSecret:process.env.TOKENSECRET,
  cloudName:process.env.CLOUDNAME,
  apiKey:process.env.APIKEY,
  apiSecret:process.env.APISECRET
}