const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please provide a name']
    }, 
    email:{
        type:String,
        required:[true, 'Please provide an email'],
        unique:[true, 'Email already in use']
    },
    password:{
        type:String,
        required:[true, 'Please provide a password'],
    },
    groupID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group"
    }
})

module.exports = mongoose.model("User", UserSchema)