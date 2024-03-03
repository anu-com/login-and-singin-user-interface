const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const config = require('../config/config');

const randormString = require('randomstring');
const securePassword = async(password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.massage);
    }
}
//for sen mail
const sendVerifyMail = (name, email, id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "Email verification",
            html:'<h1>Hii '+name+',please click here to <a href="http://localhost:3000/verify?id='+id+'">Verify</a> your account</h1>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        })
    } catch (error) {
        console.log(error.massage);
    }
}

//for reset password send mail

const sendResetPasswordMail = (name, email,token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "For reset password",
            html:'<h1>Hii '+name+',please click here to <a href="http://localhost:3000/forget-password?token='+token+'">Reset</a> your password</h1>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        })
    } catch (error) {
        console.log(error.massage);
    }
}



//for load register
const loadRegister = async(req, res) => {
    try {
        res.render('registration');
    }
    catch(error) {
        console.log(error.massage);
    }
};
const insertUser = async(req, res) => {
    
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            Image: req.file.filename,
            password: spassword,
            is_admin:0,
           
        });
        const userData = await user.save();
        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration', { massage: "Registration Successfully. please verify your mail." });
        }else {
            res.render('registration', { massage: "Registration Failed" });
        }
    } catch (error) {
        console.log(error.massage);
    }
}
const verifyMail = async(req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        console.log(updateInfo);
        res.render("email-verified");
    } catch (error) {
        console.log(error.massage);
    }
}

//login method start start

const loginLoad = async(req, res) => {
    try {

       res.render('login');
        
    }catch(error) {
        console.log(error.massage);
    }
}

const verifyLogin = async(req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        
        const userData = await User.findOne({ email:email });

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password);

            if(passwordMatch){
                if(userData.is_verified === 0){
                    res.render('login', { massage: "Please verify your mail" });
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
            } else {
                res.render('login', { massage: "Email and password incorrect" });
            }

        } else {
            res.render('login', { massage: "Email and password incorrect" });
        }

    } catch (error) {
        console.log(error.massage);
    }
}

const loadHome = async(req, res) => {
    try {

        const userData = await User.findById({ _id: req.session.user_id});
        res.render('home',{user:userData});
        
    } catch {
        console.log(error.massage);
    }
}

const userLogout = async(req, res) => {
    try {

        req.session.destroy();
        res.redirect('/');
        
    } catch {
        console.log(error.massage);
    }
}
//forget pasword code start

const forgetLoad = async(req, res) => {
    try {
        res.render('forget');
    }
    catch(error) {
        console.log(error.massage);
    }
}

const forgetVerify = async(req, res) => {
    try {

        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            
            if(userData.is_verified === 0){
                req.render('forget', { massage: "Please verify your mail" });
            } 
            else {
                const randomString = randormString.generate();
                const updatedData = await User.updateOne({email: email}, { $set: { resetToken: randomString } });
                sendResetPasswordMail(userData.name, userData.email, randomString);
                res.render('forget', { massage: "Please check your mail to reset your password" });
            }
        }
        else {
            res.render('forget', { massage: "Email not found" });
        }
        
    }
    catch(error) {
        console.log(error.massage);
    }
}

const forgetPasswordLoad = async(req, res) => {
    try {

        const token = req.query.token;
        const tokenData = await User.findOne({token: token});
        if(tokenData){
            res.render('forget-password', {user_id: tokenData._id});
        }
        else {
            res.render('404', { massage: "Token is  invalid." });
        }
        
    }
    catch(error) {
        console.log(error.massage);
    }
}

const resetPassword = async(req, res) => {
    try {

        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } });
        
        res.redirect('/');
    }
    catch(error) {
        console.log(error.massage);
    }
}

// for verifaction send email link

const verificationLoad = async(req, res) => {
    try {

        res.render('verification');
        
    }
    catch(error) {
        console.log(error.massage);
    }
}

const sentVerificationLink = async(req, res) => {
    try {

        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            
            sendVerifyMail(userData.name, userData.email, userData._id);
            
            res.render('verification', { massage: "Please check your email to verify your account" });
        }
        else {
            res.render('verification', { massage: "Email not found" });
        }
    }
    catch(error) {
        console.log(error.massage);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sentVerificationLink

}