if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    console.log("Environment variables loaded ✅");
}

const express = require('express');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require('multer');

// Models
const Farmer = require("./models/farmer.js");
const User = require("./models/Users.js");
const Product = require("./models/products.js");

// Multer + Cloudinary setup
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage: storage });

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Session Config
const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
};
app.use(session(sessionConfig));

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

// Strategies
passport.use("farmer-local", new LocalStrategy({
    usernameField: "UserName"
}, Farmer.authenticate()));

passport.use("user-local", new LocalStrategy({
    usernameField: "email"
}, User.authenticate()));

// Serialize & Deserialize
passport.serializeUser((user, done) => {
    done(null, { id: user._id, type: user instanceof Farmer ? "Farmer" : "User" });
});

passport.deserializeUser(async (obj, done) => {
    try {
        let user;
        if (obj.type === "Farmer") {
            user = await Farmer.findById(obj.id);
        } else {
            user = await User.findById(obj.id);
        }
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Global currentUser
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Connect MongoDB Atlas
async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected successfully");
      } catch (err) {
        console.error("❌ MongoDB Atlas Error:", err);
      }
}
main()
    // .then(() => console.log("MongoDB Atlas Connected ✅"))
    // .catch(err => console.log("❌ MongoDB Atlas Error:", err));

// Middleware: Protect Routes
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    next();
}

// ==========================
//         ROUTES
// ==========================

// Home
app.get("/", async (req, res) => {
    try {
        const products = await Product.find().limit(4);
        const farmer = await Farmer.find().limit(4);
        res.render("HomePage.ejs", { products, currentUser: req.user, farmer });
    } catch (err) {
        console.error("❌ Error:", err);
        res.render("HomePage.ejs", { products: [], currentUser: req.user });
    }
});

// Farmer Info Page
app.get("/farmer/:id", async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id).populate("product");
        if (!farmer) return res.status(404).send("Farmer not found");
        res.render("farmerdetail.ejs", { farmer });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Product Page
app.get("/product/:id", async (req, res) => {
    try {
        const mainProduct = await Product.findById(req.params.id).populate("farmer");
        if (!mainProduct) return res.status(404).send("Product not found");

        const similarProducts = await Product.find({
            name: mainProduct.name,
            _id: { $ne: req.params.id }
        }).populate("farmer");

        res.render("product.ejs", { mainProduct, similarProducts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Upload Product
app.get("/addproduct", isLoggedIn, (req, res) => {
    res.render("uploadImage.ejs");
});

app.post("/add", isLoggedIn, upload.single("image"), async (req, res) => {
    try {
        const { name, description, price, quantity } = req.body;
        const newProduct = new Product({
            name,
            description,
            price,
            quantity,
            farmer: req.user._id,
            image: {
                url: req.file.path,
                filename: req.file.filename
            }
        });

        await newProduct.save();

        const farmer = await Farmer.findById(req.user._id);
        farmer.product.push(newProduct._id);
        await farmer.save();

        res.redirect("/");
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).send("Upload failed.");
    }
});

// Search Route
app.post("/search", async (req, res) => {
    try {
        const products = await Product.find({
            name: { $regex: new RegExp(req.body.searchQuery, "i") }
        }).populate("farmer");

        res.render("searchResult.ejs", {
            products,
            query: req.body.searchQuery,
            currentUser: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error while searching");
    }
});

// Order Page
app.get("/order/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("farmer");
        if (!product) return res.status(404).send("Product not found");
        res.render("order.ejs", { product });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Handle Order (Redirect to Razorpay)
app.post("/order/:id", (req, res) => {
    const { quantity } = req.body;
    const productId = req.params.id;

    // Optional: Save order to DB here

    res.redirect("https://rzp.io/rzp/izCwKTva");
});

// Signup Form
app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

// Signup Logic
app.post("/signup", upload.single("image"), async (req, res) => {
    const { Name, username, email, password, role } = req.body;

    try {
        if (role === "farmer") {
            const newFarmer = new Farmer({
                Name,
                username,
                email,
                image: {
                    url: req.file?.path || "",
                    filename: req.file?.filename || ""
                },
                isFarmer: true
            });

            const registeredFarmer = await Farmer.register(newFarmer, password);
            req.login(registeredFarmer, (err) => {
                if (err) return next(err);
                res.redirect("/");
            });
        } else {
            const newUser = new User({
                Name,
                username,
                email,
                image: {
                    url: req.file?.path || "",
                    filename: req.file?.filename || ""
                },
                isFarmer: false
            });

            const registeredUser = await User.register(newUser, password);
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                res.redirect("/");
            });
        }
    } catch (err) {
        console.error("Signup error:", err);
        res.redirect("/signup");
    }
});

// Login Form
app.get("/login", (req, res) => {
    res.render("login.ejs");
});

// Login Logic
app.post("/login", (req, res, next) => {
    passport.authenticate("farmer-local", (err, user) => {
        if (err) return next(err);
        if (!user) return res.redirect("/login");
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect("/");
        });
    })(req, res, next);
});

// Logout
app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        res.redirect("/");
    });
});

// Start Server
app.listen(8080, () => {
    console.log("Server running on http://localhost:8080 🚀");
});
