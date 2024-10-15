const mongoose = require("mongoose");
const sha256 = require ('js-sha256');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

  
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    
    const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;

    console.log("Received email:", email);


    if (!emailRegex.test(email)) throw "Email is not supported from your domain.";
    if (password.length < 6) throw "Password must be atleast 6 charaters long.";

    const userExists = await User.findOne({
        email,
    });

    if (userExists) throw "User with sand email already exists.";

    const user = new User({ 
        name, 
        email, 
        password: sha256(password + process.env.SALT) 
    });

    await user.save();
    
    res.json({
        message: "User [" + name + "] registered successifully !"
    })
};



exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });
  
  if (!user) throw "Email and password dit not macth.";

  const token = await jwt.sign({ id: user.id }, process.env.SECRET);

  // Création du token avec une durée d'expiration de 1 heure
  //const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: '1h' });


  res.json({
    message: "User logged in successfully!",
    token,
  })
};