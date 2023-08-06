const express = require("express");
const { auth } = require("../middlewares/auth");
const { ContenderModel, validateContender } = require("../models/contenderModel");
const { UserModel } = require("../models/userModel");
const { JobModel } = require("../models/jobModel");
const { CompanyModel } = require("../models/companyModel");
const { ObjectID, ObjectId } = require("bson");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const perPage = req.query.perPage || 5;
  const page = req.query.page - 1 || 0;
  const sort = req.query.sort || "_id";
  const reverse = req.query.reverse == "yes" ? 1 : -1;
  const job_id = req.query.job_id;
  const user_id = req.query.user_id;
  //?s=
  const search = req.query.s;
  const user_name = req.query.user_name;
  const job_title = req.query.job_title;
  try {
    let filter = [];
    const company = await CompanyModel.findOne({ user_id: req.tokenData._id });
    if (company) {
      const jobs = await JobModel.find({ company_id: company._id }, { _id: 1 });
      const jobIds = jobs.map((job) => job._id.toString());
      filter.push({ job_id: { $in: jobIds } });
    }
    // בודק אם קיבלנו קווארי של קטגוריה ואם כן משנה את הפליטר של הפיינד
    // למציאת פריטים שקשורים לקגטוריה
    if (job_id) {
      filter.push({ job_id: job_id });
    }
    if (user_id) {
      filter.push({ user_id });
    }
    if (search) {
      // כדי שיחפש ביטוי בטייטל ולא את הסטרינג כמו שהוא
      const searchExp = new RegExp(search, "i")
      // מחפש את הביטוי או בטייטל או באינפו של הרשומות
      filter.push({ notes: searchExp });
    }
    if (user_name) {
      const nameExp = new RegExp(user_name, "i")
      const users = await UserModel.find({ full_name: nameExp }, { _id: 1 });
      const userIds = users.map((user) => user._id.toString());
      filter.push({ user_id: { $in: userIds } });
    }
    if (job_title) {
      const titleExp = new RegExp(job_title, "i")
      const jobs = await JobModel.find({ job_title: titleExp }, { _id: 1 });
      const jobIds = jobs.map((job) => job._id.toString());
      filter.push({ job_id: { $in: jobIds } });
    }
    const filterFind = { $and: filter };
    let data = await ContenderModel
      .find(filterFind)
      .limit(perPage)
      .skip(page * perPage)
      .sort({ [sort]: reverse });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/myContenders", auth, async (req, res) => {
  const perPage = req.query.perPage || 5;
  const page = req.query.page - 1 || 0;
  const sort = req.query.sort || "_id";
  const reverse = req.query.reverse == "yes" ? 1 : -1;
  const job_id = req.query.job_id;
  const user_id = req.query.user_id;
  //?s=
  const search = req.query.s;
  const user_name = req.query.user_name;
  const job_title = req.query.job_title;
  try {
    let filter = [];
    const company = await CompanyModel.findOne({ user_id: req.tokenData._id });
    if (company) {
      const jobs = await JobModel.find({ company_id: company._id }, { _id: 1 });
      const jobIds = jobs.map((job) => job._id.toString());
      filter.push({ job_id: { $in: jobIds } });
    }
    // בודק אם קיבלנו קווארי של קטגוריה ואם כן משנה את הפליטר של הפיינד
    // למציאת פריטים שקשורים לקגטוריה
    if (job_id) {
      filter.push({ job_id: job_id });
    }
    if (user_id) {
      filter.push({ user_id });
    }
    if (search) {
      // כדי שיחפש ביטוי בטייטל ולא את הסטרינג כמו שהוא
      const searchExp = new RegExp(search, "i")
      // מחפש את הביטוי או בטייטל או באינפו של הרשומות
      filter.push({ notes: searchExp });
    }
    if (user_name) {
      const nameExp = new RegExp(user_name, "i")
      const users = await UserModel.find({ full_name: nameExp }, { _id: 1 });
      const userIds = users.map((user) => user._id.toString());
      filter.push({ user_id: { $in: userIds } });
    }
    if (job_title) {
      const titleExp = new RegExp(job_title, "i")
      const jobs = await JobModel.find({ job_title: titleExp }, { _id: 1 });
      const jobIds = jobs.map((job) => job._id.toString());
      filter.push({ job_id: { $in: jobIds } });
    }
    const filterFind = { $and: filter };
    let data = await ContenderModel
      .find(filterFind)
      .limit(perPage)
      .skip(page * perPage)
      .sort({ [sort]: reverse }).populate({ path: 'user_id', select: 'full_name' }).populate({ path: 'job_id', select: 'job_title' });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/jobslist", async (req, res) => {
  const user_id = req.query.user_id; // Get user_id from the query

  try {
    // Find all contenders with the specified user_id
    const contenders = await ContenderModel.find({ user_id }).populate('job_id');

    // Get an array of job_ids from the contenders collection
    const jobIds = contenders.map(contender => contender.job_id);

    // Find all jobs with _id in the array of job_ids
    const jobs = await JobModel.find({ _id: { $in: jobIds } });

    // Return the combined data in the response
    res.json(jobs);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
});

router.get("/single/:id", async (req, res) => {
  try {
    const id = req.params.id
    let data = await ContenderModel.findOne({ _id: id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/count", auth, async (req, res) => {
  try {
    const job_id = req.query.job_id;
    const user_id = req.query.user_id;
    const search = req.query.s;
    const user_name = req.query.user_name;
    const job_title = req.query.job_title;
    const perPage = req.query.perPage || 5;
    const company = await CompanyModel.findOne({ user_id: req.tokenData._id });
    let filter = [];
    if (company) {
      const jobs = await JobModel.find({ company_id: company._id }, { _id: 1 });
      const jobIds = jobs.map((job) => job._id.toString());
      filter = [{ job_id: { $in: jobIds } }];
    }
    let filterFind = {}; // Initialize the default filter

    if (job_id) {
      filter.push({ job_id: job_id });
    }
    if (user_id) {
      filter.push({ user_id });
    }
    if (search) {
      const searchExp = new RegExp(search, "i");
      filter.push({ notes: searchExp });
    }
    if (user_name) {
      const nameExp = new RegExp(user_name, "i");
      const users = await UserModel.find({ full_name: nameExp }, { _id: 1 });
      const userIds = users.map((user) => user._id.toString());
      filter.push({ user_id: { $in: userIds } });
    }
    if (job_title) {
      const titleExp = new RegExp(job_title, "i");
      const jobs = await JobModel.find({ job_title: titleExp }, { _id: 1 });
      const jobIds = jobs.map((job) => job._id.toString());
      filter.push({ job_id: { $in: jobIds } });
    }
    filterFind.$and = filter;
    const count = await ContenderModel.countDocuments(filterFind);
    res.json({ count, pages: Math.ceil(count / perPage) });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});


router.get("/exists", auth, async (req, res) => {
  // ?job_id=
  const job_id = req.query.job_id;
  // const user_id = req.query.user_id;

  try {
    let data = await ContenderModel.findOne({ user_id: req.tokenData._id, job_id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
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
    contender.user_id = new ObjectId(req.tokenData._id);
    const job_id = contender.job_id;
    contender.job_id = new ObjectID(job_id);
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

router.delete("/", auth, async (req, res) => {
  const job_id = req.query.job_id;
  try {
    if (job_id) {
      let data;
      const id = (req.tokenData._id).toString(); // Convert user ID to string

      const dataContender = await ContenderModel.findOne({ user_id: id, job_id });

      if (!dataContender) {
        return res.status(404).json({ error: "Contender not found" });
      }
      if (req.tokenData.role === "admin") {
        data = await ContenderModel.deleteOne({ _id: dataContender._id });
      } else {
        data = await ContenderModel.deleteOne({ _id: dataContender._id });
      }

      res.json(data);
    }
    else {
      let id = req.query.id;
      let data;
      const contender = await ContenderModel.findOne({ _id: id }).populate('job_id');
      console.log(contender.job_id.company_id.toString());
      const company = await CompanyModel.findOne({ _id: contender.job_id.company_id.toString() });
      console.log(company);
      if (req.tokenData._id == company.user_id) {
        data = await ContenderModel.deleteOne({ _id: id });
      }
      else data = await ContenderModel.deleteOne({ _id: id, user_id: req.tokenData._id });
      res.json(data)
    }

  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

module.exports = router;
