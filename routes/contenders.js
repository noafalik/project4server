const express = require("express");
const { auth } = require("../middlewares/auth");
const {ContenderModel, validateContender} = require("../models/contenderModel");
const router = express.Router();

router.get("/",auth, async (req, res) => {
  const perPage = req.query.perPage || 5;
  const page = req.query.page - 1 || 0;
  const sort = req.query.sort || "_id";
  const reverse = req.query.reverse == "yes" ? 1 : -1;
  const job_id = req.query.job_id;
  const user_id = req.query.user_id;
  //?s=
  const search = req.query.s;
  
  try {
    let filterFind = {}
    // בודק אם קיבלנו קווארי של קטגוריה ואם כן משנה את הפליטר של הפיינד
    // למציאת פריטים שקשורים לקגטוריה
    if(job_id){
      filterFind = {job_id:job_id}
    }
    else if(user_id){
      filterFind = {user_id}
    }
    else if(search){
      // כדי שיחפש ביטוי בטייטל ולא את הסטרינג כמו שהוא
      const searchExp = new RegExp(search,"i")
      // מחפש את הביטוי או בטייטל או באינפו של הרשומות
      filterFind = {notes:searchExp}
    }
    let data = await ContenderModel
      .find(filterFind)
      .limit(perPage)
      .skip(page * perPage)
      .sort({ [sort]: reverse })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/single/:id", async (req, res) => {
  try {
    const id = req.params.id
    let data = await VideoModel.findOne({ _id: id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/count" , async(req,res) => {
  // ?user_id=
  const user_id = req.query.user_id;
  const search = req.query.s;
  const job_id = req.query.job_id;
  try{
    let filterFind = {}
    // כדי לשלוף רק מספר רשומות של משתמש לפי איי די שלו שנשלח בקווארי
    if(user_id){
      // filterFind = {user_id:user_id}
      filterFind = {user_id}
    }
    else if(search){
      const searchExp = new RegExp(search,"i")
      // מחפש את הביטוי או בטייטל או באינפו של הרשומות
      filterFind = {notes:searchExp};
    }
    else if(job_id){
      filterFind = {job_id:job_id}
    }
    let perPage = req.query.perPage || 5;
    // יקבל רק את כמות הרשומות בקולקשן
    const count = await ContenderModel.countDocuments(filterFind)
    res.json({count,pages:Math.ceil(count/perPage)})
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})


// FOR TESTING IN QUERY IN MONGO
// שאילתא טובה בשביל לשלוף מועדפים של משתמש, בנוסף מאפשר נניח לשלוף
// רשימת וידיאו שאני רוצה לפרסם ביותר קלות ואפשרויות נוספות לשליפה כאשר יש לי צורך 
// בוידיאוים מסויימים

router.post("/", auth, async (req, res) => {
  let validBody = validateContender(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let contender = new ContenderModel(req.body);
    contender.user_id = req.tokenData._id
    await contender.save();
    res.json(contender)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.put("/:id", auth, async (req, res) => {
  let validBody = validateContender(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let id = req.params.id;
    let data;
    // בודק אם המשתמש הוא אדמין ונותן לו אפשרות לערוך את
    // כל הרשומות גם כאלו שלא שלו
    if (req.tokenData.role == "admin") {
      data = await ContenderModel.updateOne({ _id: id }, req.body);
    }
    else {
      data = await ContenderModel.updateOne({ _id: id, user_id: req.tokenData._id }, req.body);
    }
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// increment - מעלה ב1

router.delete("/:id", auth, async (req, res) => {
  try {
    let id = req.params.id;
    let data;
    // נותן אפשרות לאדמין למחוק את כל הרשומות
    if (req.tokenData.role == "admin") {
      data = await ContenderModel.deleteOne({ _id: id});
    }
    else{
      data = await ContenderModel.deleteOne({ _id: id, user_id: req.tokenData._id });
    }
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

module.exports = router;