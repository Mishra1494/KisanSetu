const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const autopopulate = require("mongoose-autopopulate");
const { types } = require("joi");

const userSchema = new mongoose.Schema({
    Name: String,
    UserName: String,
    isFarmer : {
        type : Boolean,
        default : true
    },
    location : {
        type : String,
    },
    order : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Order'
    }]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(autopopulate);

const User = mongoose.model("User", userSchema);
module.exports = User;
