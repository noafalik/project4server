const express = require("express");
const path = require("path");
const cloudinary = require("cloudinary").v2

const { auth } = require("../middlewares/auth");
const { config } = require("../config/secret");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Upload work" });

})

// כל המידע כאן המשתנים צריכים להיות ב
// ENV 
// במיוחד הקיי והסקיריט
cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret
});

// WORK
router.post("/cloud", auth, async (req, res) => {
    try {
        const dataUpload = await cloudinary.uploader.upload(req.body.image, { unique_filename: true })
        res.json({ data: dataUpload });
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
});



module.exports = router;