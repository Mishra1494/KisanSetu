const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const autopopulate = require("mongoose-autopopulate");
const { boolean } = require("joi");

const farmerSchema = new mongoose.Schema({
    Name: String,
    UserName: String,
    
    email:String,
    product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            
        }
    ],
    image: {
        url: String,          // Cloudinary image URL
        filename: String      // Public ID or filename on Cloudinary
      },
    isFarmer : {
        type:Boolean,
        default:false
    }
});

farmerSchema.plugin(passportLocalMongoose);
farmerSchema.plugin(autopopulate);

const Farmer = mongoose.model("Farmer", farmerSchema);
module.exports = Farmer;
