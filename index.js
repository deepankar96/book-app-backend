const mysql = require('mysql');
const express = require('express')
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// const storage = multer.diskStorage({
//   destination:'./AudioFiles',
//   filename: function(req,file,cb){
//     cb(null,file.filename+'-'+Date.now()+path.extname(file.originalname));
//   }
// });

const app = express()
 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'book-app',
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
        "Origin,X-Requested-With,Content-Type,Accept"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
        "GET,POST,PATCH,DELETE,OPTIONS"
    );
    next();
  })
    


// //Get department info all
// app.post('/api/department',collegeauth,(req,res)=>{
//   collegeId = req.body.collegeId;
//   department=[];
//   var sql = 'SELECT * FROM `department-table` where collegeId = ?';
//         mysqlConnection.query(sql, [collegeId], (err,rows) => {
//         if(err) throw err;
//         for(row of rows){
//           const dept ={
//             id:row.id,
//             collegeid:row.collegeId,
//             departmentid:row.departmentId,
//             departmentname:row.departmentName,
//           }
//         department.push(dept);
//         }
//       res.status(200).json({
//         message:"Successfull",
//         post:department
//       }
//       );
//       });
// });


// //Get college info all
// app.get('/api/college',(req,res)=>{
//   college=[];
//   var sql = 'SELECT * FROM `college`';
//         mysqlConnection.query(sql, (err,rows) => {
//         if(err) throw err;
//         for(row of rows){
//           const dataVar ={
//             id:row.sl,
//             collegeName:row.collegename,
//             collegeId:row.collegeid,
//             collegePassword:row.collegepassword,
//             collegeLocation:row.collegelocation,
//             collegeAddress:row.collegeaddress,
//           }
//         college.push(dataVar);
//         }
//       res.status(200).json({
//         message:"Successfull",
//         post:college
//       }
//       );
//       });
// });

// //Get course info all
// app.get('/api/courses',(req,res)=>{
//   courses=[];
//   var sql = 'SELECT * FROM `course-table`';
//         mysqlConnection.query(sql, (err,rows) => {
//         if(err) throw err;
//         for(row of rows){
//           const course ={
//             id:row.id,
//             courseid:row.courseid,
//             collegeid:row.collegeid,
//             departmentid:row.departmentid,
//             coursename:row.coursename,
//           }
//         courses.push(course);
//         }
//       res.status(200).json({
//         message:"Successfull",
//         post:courses
//       }
//       );
//       });
// });

// //Send data to the database
// app.post('/api/adddept',collegeauth,(req,res)=>{
//   const dept = req.body;
//   var data = []
//   //data.push(dept.id.toString())
//   data.push(dept.collegeid.toString())
//   data.push(dept.departmentid.toString())
//   data.push(dept.departmentname.toString())
//   data.push(dept.hodid.toString())
//   data.push(dept.departmentemail.toString())
//   data.push(dept.departmentpassword.toString())
//   var sql = "INSERT INTO `department-table` (collegeId,departmentId,departmentName,hodId,departmentEmail,departmentPassword) VALUES (?)";
//   mysqlConnection.query(sql, [data], function (err, result) {
//     if (err) throw err;
//     res.status(201).json({
//       message:"success"
//     });  
//   });
  
// });

// //Login to a college using a json web token
// app.post('/api/collegeLogin',(req,res,next)=>{
//   collegeId = req.body.collegeId;
//   collegePassword = req.body.password;
//   var sql = 'SELECT `collegepassword` FROM `college` WHERE `collegeid` = ?';
//   mysqlConnection.query(sql, [collegeId], function (err, rows) {
//     if (err) throw err;
//     for(row of rows){
//       password = row.collegepassword
//     }
//     if(password === collegePassword){
//       const token = jwt.sign(
//         {collegeId:collegeId},
//         "secret_string_for_college_login",
//         {expiresIn:"10h"}
//       );
//       res.status(200).json({
//         message:"success",
//         token:token,
//         collegeId:collegeId
//       });
//     }
//     else{
//       res.status(201).json({
//         message:"failed",
//       });
//     }
//   });
// });

// //Login To a Department
// app.post('/api/departmentLogin',(req,res,next)=>{
//   collegeId = req.body.collegeId;
//   departmentId = req.body.departmentId;
//   departmentPassword = req.body.password;
//   var sql = 'SELECT `departmentPassword` FROM `department-table` WHERE `collegeid` = ? AND `departmentId` = ?';
//   mysqlConnection.query(sql, [collegeId,departmentId], function (err, rows) {
//     if (err) throw err;
//     for(row of rows){
//       password = row.departmentPassword
//     }
//     if(password === departmentPassword){
//       const token = jwt.sign(
//         {collegeId:collegeId,departmentId:departmentId},
//         "secret_string_for_department_login",
//         {expiresIn:"10h"}
//       );
//       res.status(200).json({
//         message:"success",
//         token:token,
//         collegeId:collegeId,
//         departmentId:departmentId
//       });
//     }
//     else{
//       res.status(201).json({
//         message:"failed",
//       });
//     }
//   });
// });

// app.post('/api/addCollege',(req,res,next)=>{
//   const college = req.body
//   var data = []
//   data.push(college.collegeId)
//   data.push(college.collegeName)
//   data.push(college.collegeCity)
//   data.push(college.collegeState)
//   data.push(college.collegeAddress)
//   data.push(college.collegeLocationLat)
//   data.push(college.collegeLocationLong)
//   data.push(college.collegeType)
//   data.push(college.collegeAffiliatedTo)
//   data.push(college.collegeEstablishment)
//   data.push(college.collegeEmail)
//   data.push(college.collegePassword)
//   var sql = "INSERT INTO `college` (collegeid,collegename,collegecity,collegestate,collegeaddress,collegelocationLat,collegelocationLong,collegetype,collegeaffiliatedto,yearofestablishment,collegeemail,collegepassword) VALUES (?)";
//   mysqlConnection.query(sql, [data], function (err, result) {
//     if (err) throw err;
//     res.status(201).json({
//       message:"success"
//     });  
//   });
// });

//Login as a contributor using json web token
app.post('/api/contributorLogin',(req,res,next)=>{
  contributorId = req.body.contributorId;
  contributorPassword = req.body.contributorPassword;
  var sql = 'SELECT `contributorPassword` FROM `contributor-login-table` WHERE `contributorId` = ?';
  mysqlConnection.query(sql, [contributorId], function (err, rows) {
    if (err) throw err;
    passwordFromDatabase = '';
    for(row of rows){
      passwordFromDatabase =  row.contributorPassword;
    }
    if(passwordFromDatabase==''){
      res.status(201).json({
        message:"Invalid UserId",
      });
    }
    else if(passwordFromDatabase === contributorPassword){
      //Creating a json web token to verify further transactions
      const token = jwt.sign(
        {contributorId:contributorId},
        "secret_string_for_contributor_login",
      );
      res.status(200).json({
        message:"success",
        token:token,
        contributorId:contributorId,
      });
    }
    else{
      res.status(201).json({
        message:"Invalid Password",
      });
    }
  });
});

//Login as a User
app.post('/api/userLogin',(req,res,next)=>{
  userId = req.body.userId;
  userPassword = req.body.userPassword;
  var sql = 'SELECT `userPassword` FROM `user-login-table` WHERE `userId` = ?';
  mysqlConnection.query(sql, [userId], function (err, rows) {
    if (err) throw err;
    passwordFromDatabase = '';
    for(row of rows){
      passwordFromDatabase =  row.userPassword;
    }
    if(passwordFromDatabase==''){
      res.status(201).json({
        message:"Invalid UserId",
      });
    }
    else if(passwordFromDatabase === userPassword){
      res.status(200).json({
        message:"success",
        userId:userId,
      });
    }
    else{
      res.status(201).json({
        message:"Invalid Password",
      });
    }
  });
});

//Add book to database
app.post('/api/addbook',(req,res)=>{
  const book = req.body;
  bookIdentity = book.bookId
  var data = []
  data.push(book.contributorId)
  data.push(book.bookId)
  data.push(book.bookName)
  data.push(book.bookLanguage)
  var sql = "INSERT INTO `book-list-table` (contributorId,bookId,bookName,bookLanguage) VALUES (?)";
  mysqlConnection.query(sql, [data], function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success",
      bookId:book.bookId,
    });  
  });
});

//Create book history to database
// app.post('/api/addbookHistory',(req,res)=>{
//   const bookId = req.body.bookId;
//   var sql = `CREATE TABLE {bookId} (sl INT AUTO_INCREMENT PRIMARY KEY,userId VARCHAR(255))`;
//   mysqlConnection.query(sql, [data], function (err, result) {
//     if (err) throw err;
//     res.status(201).json({
//       message:"success"
//     });  
//   });
// });

//Get books form database
app.post('/api/getBooksForContributor',(req,res)=>{
  contributorId = req.body.contributorId;
  books=[];
  var sql = 'SELECT * FROM `book-list-table` where contributorId = ?';
        mysqlConnection.query(sql, [contributorId], (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const book ={
            contributorId:row.contributorId,
            bookId:row.bookId,
            bookName:row.bookName,
            bookLanguage:row.bookLanguage,
            }
        books.push(book);
        }
      res.status(200).json({
        message:"successfull",
        post:books,
      }
      );
      books = []
      });
});
//Getting books according to the language
app.post('/api/getBooksPerLanguage',(req,res)=>{
  Language = req.body.Language;
  books=[];
  var sql = 'SELECT * FROM `book-list-table` where bookLanguage = ?';
        mysqlConnection.query(sql, [Language], (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const book ={
            contributorId:row.contributorId,
            bookId:row.bookId,
            bookName:row.bookName,
            bookLanguage:row.bookLanguage,
            }
        books.push(book);
        }
      res.status(200).json({
        message:"successfull",
        post:books,
      }
      );
      books = []
      });
});


app.post('/api/likeBook',(req,res)=>{
  const book = req.body;
  var data = []
  data.push(book.userId)
  data.push(book.bookId)
  data.push(book.bookName)
  console.log(data)
  try {
    var sql = "INSERT INTO `user-liked-book-table` (userId,bookId,bookName) VALUES (?)";
    mysqlConnection.query(sql, [data], function (err, result) {
      //if (err) throw err;
      res.status(201).json({
        message:"success"
      });  
    }); 
  } catch (error) {
  }
});


//Create dynamic table for history
app.post('/api/createHistoryTableForBook',(req,res)=>{
  bookId = req.body.bookId
  var sql = "CREATE TABLE `"+ bookId + "` (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), address VARCHAR(255))";
  mysqlConnection.query(sql, function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success"
    });  
  });
});

//Test to create dynamic for content
app.post('/api/createDataTableForBook',(req,res)=>{
  bookId = req.body.bookId+"-content";
  var sql = "CREATE TABLE `"+ bookId + "` (sl INT AUTO_INCREMENT PRIMARY KEY, paragraphId VARCHAR(255),paragraphLink VARCHAR(255))";
  mysqlConnection.query(sql, function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success"
    });  
  });
});

//Add paragraph
app.post('/api/addParagraph',(req,res)=>{
  console.log(req.body)
});

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Listening on port ${port}..`);
})

