const jwt = require("jsonwebtoken");

module.exports = (req,res,next) =>{
    try{
        const token = req.headers.departmentauthorization.split(" ")[1];
        jwt.verify(token,"secret_string_for_department_login");
        next()
    }
    catch{
        res.status(401).json({
            message:"Auth Failed"
        })
    }
};