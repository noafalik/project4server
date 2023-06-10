const indexR = require("./index");
const usersR = require("./users");
const jobsR = require("./jobs");
const contendersR = require("./contenders");
const companiesR = require("./companies");
const commentsR = require("./comments");
const categoriesR = require("./categories");





exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/jobs",jobsR);
  app.use("/contenders",contendersR);
  app.use("/companies",companiesR);
  app.use("/comments",commentsR);
  app.use("/categories",categoriesR);



  //show 404 routes
  app.use("/*",(req,res) =>{
    res.status(404).json({msg:"Endpoint/page not found, 404"})
  })
}