const mysql = require('mysql');
const express = require('express')
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const collegeauth = require('./middleware/college-auth');

const app = express()
 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'college-system',
  multipleStatements: true
  });

  mysqlConnection.connect((err)=> {
    if(!err)
    console.log('Connection Established Successfully');
    else
    console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
    });

  app.use((req,res,next)=>{
    res.setHeader(
        "Access-Control-Allow-Origin","*"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept,collegeauthorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
        "GET,POST,PATCH,DELETE,OPTIONS"
    );
    next();
  })
    


//Get department info all
app.post('/api/department',collegeauth,(req,res)=>{
  collegeId = req.body.collegeId;
  department=[];
  var sql = 'SELECT * FROM `department-table` where collegeId = ?';
        mysqlConnection.query(sql, [collegeId], (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const dept ={
            id:row.id,
            collegeid:row.collegeId,
            departmentid:row.departmentId,
            departmentname:row.departmentName,
          }
        department.push(dept);
        }
      res.status(200).json({
        message:"Successfull",
        post:department
      }
      );
      });
});


//Get college info all
app.get('/api/college',(req,res)=>{
  college=[];
  var sql = 'SELECT * FROM `college`';
        mysqlConnection.query(sql, (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const dataVar ={
            id:row.sl,
            collegeName:row.collegename,
            collegeId:row.collegeid,
            collegePassword:row.collegepassword,
            collegeLocation:row.collegelocation,
            collegeAddress:row.collegeaddress,
          }
        college.push(dataVar);
        }
      res.status(200).json({
        message:"Successfull",
        post:college
      }
      );
      });
});

//Get course info all
app.get('/api/courses',(req,res)=>{
  courses=[];
  var sql = 'SELECT * FROM `course-table`';
        mysqlConnection.query(sql, (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const course ={
            id:row.id,
            courseid:row.courseid,
            collegeid:row.collegeid,
            departmentid:row.departmentid,
            coursename:row.coursename,
          }
        courses.push(course);
        }
      res.status(200).json({
        message:"Successfull",
        post:courses
      }
      );
      });
});

//Send data to the database
app.post('/api/adddept',collegeauth,(req,res)=>{
  const dept = req.body;
  var data = []
  //data.push(dept.id.toString())
  data.push(dept.collegeid.toString())
  data.push(dept.departmentid.toString())
  data.push(dept.departmentname.toString())
  data.push(dept.hodid.toString())
  data.push(dept.departmentemail.toString())
  data.push(dept.departmentpassword.toString())
  var sql = "INSERT INTO `department-table` (collegeId,departmentId,departmentName,hodId,departmentEmail,departmentPassword) VALUES (?)";
  mysqlConnection.query(sql, [data], function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success"
    });  
  });
  
});

//Login to a college using a json web token
app.post('/api/collegeLogin',(req,res,next)=>{
  collegeId = req.body.collegeId;
  collegePassword = req.body.password;
  var sql = 'SELECT `collegepassword` FROM `college` WHERE `collegeid` = ?';
  mysqlConnection.query(sql, [collegeId], function (err, rows) {
    if (err) throw err;
    for(row of rows){
      password = row.collegepassword
    }
    if(password === collegePassword){
      const token = jwt.sign(
        {collegeId:collegeId},
        "secret_string_for_college_login",
        {expiresIn:"10h"}
      );
      res.status(200).json({
        message:"success",
        token:token,
        collegeId:collegeId
      });
    }
    else{
      res.status(201).json({
        message:"failed",
      });
    }
  });
});

//Login To a Department
app.post('/api/departmentLogin',(req,res,next)=>{
  collegeId = req.body.collegeId;
  departmentId = req.body.departmentId;
  departmentPassword = req.body.password;
  var sql = 'SELECT `departmentPassword` FROM `department-table` WHERE `collegeid` = ? AND `departmentId` = ?';
  mysqlConnection.query(sql, [collegeId,departmentId], function (err, rows) {
    if (err) throw err;
    for(row of rows){
      password = row.departmentPassword
    }
    if(password === departmentPassword){
      const token = jwt.sign(
        {collegeId:collegeId,departmentId:departmentId},
        "secret_string_for_department_login",
        {expiresIn:"10h"}
      );
      res.status(200).json({
        message:"success",
        token:token,
        collegeId:collegeId,
        departmentId:departmentId
      });
    }
    else{
      res.status(201).json({
        message:"failed",
      });
    }
  });
});

app.post('/api/addCollege',(req,res,next)=>{
  const college = req.body
  var data = []
  data.push(college.collegeId)
  data.push(college.collegeName)
  data.push(college.collegeCity)
  data.push(college.collegeState)
  data.push(college.collegeAddress)
  data.push(college.collegeLocationLat)
  data.push(college.collegeLocationLong)
  data.push(college.collegeType)
  data.push(college.collegeAffiliatedTo)
  data.push(college.collegeEstablishment)
  data.push(college.collegeEmail)
  data.push(college.collegePassword)
  var sql = "INSERT INTO `college` (collegeid,collegename,collegecity,collegestate,collegeaddress,collegelocationLat,collegelocationLong,collegetype,collegeaffiliatedto,yearofestablishment,collegeemail,collegepassword) VALUES (?)";
  mysqlConnection.query(sql, [data], function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success"
    });  
  });
});


const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Listening on port ${port}..`);
})

