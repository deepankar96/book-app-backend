const mysql = require('mysql');
const express = require('express')
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

var filenameForAudioFile;

const audioStorage = multer.diskStorage({
  destination:'./AudioFiles',
  filename: function(req,file,cb){
    const name = file.originalname.toLowerCase().split('.')[0].split(' ').join('-');
    const ext = file.mimetype.split('/')[1]
    filenameForAudioFile =name+'-'+Date.now()+'.'+ext; 
    cb(null,filenameForAudioFile);
  }
});
const audioUpload = multer({storage:audioStorage})

const coverImageStorage = multer.diskStorage({
  destination:'./BookCoverImages',
  filename: function(req,file,cb){
    const name = file.originalname.toLowerCase().split('.')[0].split(' ').join('-');
    const ext = file.mimetype.split('/')[1]
    filenameForImageFile =name+'-'+Date.now()+'.'+ext; 
    cb(null,filenameForImageFile);
  }
});
const ImageUpload = multer({storage:coverImageStorage})


const app = express()
 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use("/AudioFiles",express.static(__dirname + '/AudioFiles'));
app.use("/BookCoverImages",express.static(__dirname + '/BookCoverImages'));

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
    
//Login as a contributor using json web token
app.post('/api/contributorLogin',(req,res,next)=>{
  try{
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
  }
  catch(error){

  }
});

//Login as a User
app.post('/api/userLogin',(req,res,next)=>{
  try{
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
}
catch(error){

}
});

//Add book to database
app.post('/api/addbook',(req,res)=>{
  try{
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
}catch(error){

}
});


//Get books form database
app.post('/api/getBooksForContributor',(req,res)=>{
  try{
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
            viewCount:row.viewCount,
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
    }
    catch(error){

    }
});
//Getting books according to the language
app.post('/api/getBooksPerLanguage',(req,res)=>{
  try{
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
            viewCount:row.viewCount,
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
    }
    catch(error){

    }
});


app.post('/api/likeBook',(req,res)=>{
  try{
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
}
catch(error){

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
  try{
  bookId = req.body.bookId+"-content";
  var sql = "CREATE TABLE `"+ bookId + "` (sl INT AUTO_INCREMENT PRIMARY KEY, paragraphNumber VARCHAR(255),paragraphLink VARCHAR(255),paragraphTitle VARCHAR(255))";
  mysqlConnection.query(sql, function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success"
    });  
  });
}
catch(error){

}
});

//Add paragraph
app.post('/api/addParagraph',audioUpload.single('paragraphAudio'),(req,res)=>{
  try{
  var paragraphDetails = req.body;
  var bookId = req.body.bookId
  var data = []
  data.push(paragraphDetails.paragraphNumber);
  data.push(paragraphDetails.paragraphTitle);
  data.push(filenameForAudioFile);
  try {
    var sql = "INSERT INTO `"+bookId+"-content"+"` (paragraphNumber,paragraphTitle,paragraphLink) VALUES (?)";
    mysqlConnection.query(sql, [data], function (err, result) {
      //if (err) throw err;
      res.status(201).json({
        message:"success"
      });  
    }); 
  } catch (error) {
    
  }
}
catch(error){

}
});

app.post('/api/getParagraphsForBooks',(req,res)=>{
  try{
  bookId = req.body.bookId;
  paragraphs=[];
  var sql = "SELECT * FROM `" + bookId + "-content` ORDER BY `paragraphNumber` ASC";
  try {
    mysqlConnection.query(sql, (err,rows) => {
      if(err) throw err;
      for(row of rows){
        const paragraph ={
          paragraphNumber:row.paragraphNumber,
          paragraphLink:row.paragraphLink,
          paragraphTitle:row.paragraphTitle,
          }
      paragraphs.push(paragraph)
      }
    res.status(200).json({
      message:"successfull",
      post:paragraphs
    }
    );
    paragraphs = []
    }); 
  } catch (error) {
    
  }
}
catch(error){
}
});

//Sign up Users
app.post('/api/signupUser',(req,res)=>{
    const user = req.body;
    var data = []
    data.push(user.userId)
    data.push(user.userPassword)
    data.push(user.userName)
    var sql = "INSERT INTO `user-login-table` (userId,userPassword,userName) VALUES (?)";
    mysqlConnection.query(sql, [data], function (err, result) {
      if (err) throw err;
      res.status(201).json({
        message:"success",
        userId:user.userId,
      });  
    });
});
//Manage View Counts
app.post('/api/updateViewCount',(req,res)=>{
  try {
  const bookId = req.body.bookId;
  var sql = "UPDATE `book-list-table` SET `viewCount` = `viewCount`+ 1 WHERE bookId = ? ";
  mysqlConnection.query(sql,[bookId], function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success",
    });  
  });
} catch (error) {
    
}
});


const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Listening on port ${port}..`);
})

//
