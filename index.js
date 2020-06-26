const mysql = require('mysql');
const express = require('express')
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

var filenameForAudioFile;
var filenameForImageFile;

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
/
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


//Add contributors
app.post('/api/addContributor',(req,res,next)=>{
  var data = [];
  data.push(req.body.contributorId)
  data.push(req.body.contributorPassword)
  data.push('active')
  var sql = "INSERT INTO `contributor-login-table` (contributorId,contributorPassword,status) VALUES (?)";
  mysqlConnection.query(sql, [data], function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success",
      contributorId:req.body.contributorId,
    });  
  });
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
app.post('/api/addbook',ImageUpload.single('bookCover'),(req,res)=>{
  const book = req.body;
  bookIdentity = book.bookId
  var data = []
  data.push(book.contributorId)
  data.push(book.bookId)
  data.push(book.bookName)
  data.push(book.bookLanguage)
  data.push(filenameForImageFile)
  data.push('waiting')
  var sql = "INSERT INTO `book-list-table` (contributorId,bookId,bookName,bookLanguage,coverImage,status) VALUES (?)";
  mysqlConnection.query(sql, [data], function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success",
      bookId:book.bookId,
    });  
  });
});


//Get books form database
app.post('/api/getBooksForContributor',(req,res)=>{
  try{
  contributorId = req.body.contributorId;
  books=[];
  var sql = "SELECT * FROM `book-list-table` where contributorId = ?";
        mysqlConnection.query(sql, [contributorId], (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const book ={
            contributorId:row.contributorId,
            bookId:row.bookId,
            bookName:row.bookName,
            bookLanguage:row.bookLanguage,
            viewCount:row.viewCount,
            coverImage:row.coverImage,
            status:row.status,
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
  var sql = "SELECT * FROM `book-list-table` where bookLanguage = ? and status = 'approved'";
        mysqlConnection.query(sql, [Language], (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const book ={
            contributorId:row.contributorId,
            bookId:row.bookId,
            bookName:row.bookName,
            bookLanguage:row.bookLanguage,
            viewCount:row.viewCount,
            coverImage:row.coverImage,
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
app.post('/api/createHistoryTableForUser',(req,res)=>{
  UserId = req.body.userId+"-history"
  var sql = "CREATE TABLE `"+ UserId + "` (id INT AUTO_INCREMENT PRIMARY KEY, bookId VARCHAR(255))";
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
      if (err) throw err;
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

//Get paragraphs
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

//Get Books for SuperAdmin
app.get('/api/getBooksForSuperAdmin',(req,res)=>{
  try {
  books=[];
  var sql = "SELECT * FROM `book-list-table`";
        mysqlConnection.query(sql, (err,rows) => {
        if(err) throw err;
        for(row of rows){
          const book ={
            contributorId:row.contributorId,
            bookId:row.bookId,
            bookName:row.bookName,
            bookLanguage:row.bookLanguage,
            viewCount:row.viewCount,
            status:row.status,
            coverImage:row.coverImage,
            contributorId:row.contributorId
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
    } catch (error) {
    
    }
});

//Change status of Books
app.post('/api/updateStatus',(req,res)=>{
  try {
  const bookId = req.body.bookId;
  const status = req.body.status;
  var sql = "UPDATE `book-list-table` SET `status` = ? WHERE bookId = ? ";
  mysqlConnection.query(sql,[status,bookId], function (err, result) {
    if (err) throw err;
    res.status(201).json({
      message:"success",
    });  
  });
} catch (error) {
    
}
});

//Maintaining user book history
app.post('/api/addBookToHistory',(req,res)=>{
  try {
    userId = req.body.userId;
    bookId = req.body.bookId;
    var sql = "INSERT INTO `" + userId + "` (bookId) VALUES (?)"
    mysqlConnection.query(sql, [bookId], function (err, result) {
      if (err) throw err;
      res.status(201).json({
        message:"success",
      });  
    });

  } catch (error) {
    
  }
});

//To view all the people that have viewed a book
app.post('/api/viewBookToHistory',(req,res)=>{
  userId = req.body.userId+"-history"
  books=[]
  var sql = "SELECT * FROM `" + userId +"`";
  mysqlConnection.query(sql, (err,rows) => {
    if(err) throw err;
    for(row of rows){
      books.push(row.bookId)
    }
    res.status(201).json({
      message:"success",
      post:books,
    });
  })
});

//superadmin code to view all the users
app.get('/api/viewUsers',(req,res)=>{
  users=[]
  var sql = "SELECT * FROM `user-login-table`";
  mysqlConnection.query(sql, (err,rows) => {
    if(err) throw err;
    for(row of rows){
      user = []
      user.push(row.userId)
      user.push(row.userName)
      users.push(user)
    }
    res.status(201).json({
      message:"success",
      post:users,
    });
  })
});

//superadmin code to view all the contributors
app.get('/api/viewContributors',(req,res)=>{
  contributors=[]
  var sql = "SELECT * FROM `contributor-login-table`";
  mysqlConnection.query(sql, (err,rows) => {
    if(err) throw err;
    for(row of rows){
      contributor = []
      contributor.push(row.contributorId)
      contributor.push(row.status)
      contributors.push(contributor)
    }
    res.status(201).json({
      message:"success",
      post:contributors,
    });
  })
});
//*

//Get All Languages
app.get('/api/getLanguages',(req,res)=>{
  languages=[]
  var sql = "SELECT * FROM `language-list-table`";
  mysqlConnection.query(sql, (err,rows) => {
    if(err) throw err;
    for(row of rows){
      languages.push(row.languageName)
    }
    res.status(201).json({
      message:"success",
      post:languages,
    });
  })
});

app.post('/api/addLanguage',(req,res)=>{
  language = req.body.languageName
  try {
  var sql = "INSERT IGNORE INTO `language-list-table` (languageName) VALUES (?)";
    mysqlConnection.query(sql, [language], function (err, result) {
      if (err) throw err;
      res.status(201).json({
        message:"success",
      });  
    });
  } catch (error) {
    
  }
});

//Create table for languages to add genres and types
app.post('/api/createDataTableForLanguage',(req,res)=>{
  try{
  language = req.body.languageName+"-content-language";
  var sql = "CREATE TABLE `"+ language + "` (sl INT AUTO_INCREMENT PRIMARY KEY, genre VARCHAR(255),type VARCHAR(255))";
  mysqlConnection.query(sql, function (err, result) {
    if (err) throw err;
    res.status(201).json({
      finalMessage:"Language Added Successfully"
    });  
  });
}
catch(error){

}
});

//Get genres
app.get('/api/getGenres',(req,res)=>{
  genres=[]
  var sql = "SELECT * FROM `genre-table`";
  mysqlConnection.query(sql, (err,rows) => {
    if(err) throw err;
    for(row of rows){
      genres.push(row.genre)
    }
    res.status(201).json({
      message:"success",
      post:genres,
    });
  })
});

//Get types
app.get('/api/getTypes',(req,res)=>{
  types=[]
  var sql = "SELECT * FROM `type-table`";
  mysqlConnection.query(sql, (err,rows) => {
    if(err) throw err;
    for(row of rows){
      types.push(row.type)
    }
    res.status(201).json({
      message:"success",
      post:types,
    });
  })
});
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Listening on port ${port}..`);
})

