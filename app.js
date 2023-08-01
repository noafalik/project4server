const express = require("express");
const http = require("http");
const path = require("path");
const cors  = require("cors");
const cookieParser = require("cookie-parser");
const upload = require("express-fileupload");
const {routesInit} = require("./routes/configRoutes");
// התחברות למסד 
require("./db/mongoConnect");

const app = express();
app.use(upload({
    // 1024 bytes in 1kb , 1024 kb in 1 mb , 5 (mb) = 5mb
    limits:{fileSize: 1024 * 1024 * 5}
  }))
// מבטל אבטחה , ומאפשר לבצע בקשת איי פי איי מדומיין משרת אחר
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}));
app.use(cookieParser());
// כדי שנוכל לשלוח באדי מצד לקוח
app.use(express.json({limit:'5mb'}));
// להגדיר תיקייה סטטית שתיהיה התיקייה בשם פאבליק
app.use(express.static(path.join(__dirname,"public")));

routesInit(app);


const server = http.createServer(app);
// נותן את האופציה שאני מעלה לשרת אמיתי שהשרת יספק
// את הפורט בעצמו במקום שאני אצטרך לשנות ידני
let port = process.env.PORT || 3001;
server.listen(port);
// npm install -> כדי להתקין פרוייקט מוכן, שיותקנו בו כל המודולים
