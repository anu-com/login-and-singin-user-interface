const isLogin = async(req,res,next) =>{
    try {

        if(req.session.user_id){}
     
    else {
        res.redirect('/')
    }
    next();
} catch {
    console.log(error.massage);
}
}


const isLogout = async(req,res,next) =>{
    try{

        if(req.session.user_id){
            res.redirect('/home')
        }
        next();
    } catch {
        console.log(error.massage);
    }
}


module.exports = {isLogin,isLogout}