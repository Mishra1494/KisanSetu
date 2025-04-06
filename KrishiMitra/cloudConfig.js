const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.APT_KEY,
    api_secret : process.env.API_SECERET
});

// console.log("cloud detail",{
//   cloud_name : process.env.CLOUD_NAME,
//   api_key : process.env.APT_KEY,
//   api_secret : process.env.API_SECERET
// })
const storage = new CloudinaryStorage({


    cloudinary: cloudinary,
    params: {
      folder: 'hackthoneImages',
      allowedFormats : ["png","jpg","jpeg"],// supports promises as well
    },
  });

const cloudinaryUpload =  async (req,res,next)=>{
  try{
    const {listings}= req.body;
    console.log(req.body); 
    const image = "C:/Users/Admin/OneDrive/Pictures/Screenshots/ScreenShot.png"
    if(!image){
      console.log(image);
      return res.status(400).json({error : "no image provided"});
    }
      const result = await cloudinary.uploader.upload(image,{
        folder : 'hackthoneImages',
        allowed_formats : ['png','jpeg','jpg'],
      })
    
    req.uploadImage = result;
    next()
  }catch(error){
      console.log(error);
      res.status(500).json({error:"image upload failed"});
  }
}


module.exports = {cloudinary,cloudinaryUpload,storage};

