const mongoose = require('mongoose') ; 

//--------- NOTES LEC 1 ------------------
// 1. Mongose is all about model
//    a model is a blue print  which we use to 
//    create a model its like objects in java script
// 2. for CRUD we need a model
// 3. for creation of model we need Schema 

// this is how we define SCHEMA  
const users_schema = new mongoose.Schema(
    {
      username: {
        type: String,
        required: [true, 'A username must have a name'],
        unique: true,
        trim : true 
      },
      email: {
         type: String,
         required: [true, 'email must '],
         unique: true,
         trin : true 
       },
      age: {
        type: Number,
        required: [true, 'age must ']
      },
      nickname: {
        type: String,
        required: [true, 'tour must']
      },
      rating: {
        type: Number,
        default: 3,
      },
      points: {
        type: Number,
        default : 500
      },
      description: {
        type: String,
        trim: true,
        required : true , 
      },
      year :{
       type : String , 
       required : true  
      },
      following : [
         { 
            type : mongoose.Schema.Types.ObjectId ,
            ref : "user"
         }
      ]
      ,
      followed :[
       { 
         type :  mongoose.Schema.Types.ObjectId  , 
         ref : "user"
       }
      ],
      queries : [
         {
            type : mongoose.Schema.Types.ObjectId , 
            ref : "query"
         }
       ] , 
       activity: [{
        date: {
          type: String,
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
      }]
    } , 
    {  timestamps : true });
  
    users_schema.statics.getRank = async function(userId) {
      try {
        const user = await this.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
    
        // Get the count of users with points greater than or equal to the current user's points
        // and with creation timestamp earlier than the current user's creation timestamp
        const rank = await this.countDocuments({
          $or: [
            { points: { $gt: user.points } },
            { points: user.points, createdAt: { $lt: user.createdAt } }
          ]
        });
    
        return rank + 1 ; // No need to add 1 for equal points (0-based index)
      } catch (error) {
        throw new Error(`Error getting rank: ${error.message}`);
      }
    };
    
//this is how we define MODEL 

// const model_variable = mongoose.model('model_name' , 'model_schema')
const user = mongoose.model('user' , users_schema) ; 
module.exports = user ; 