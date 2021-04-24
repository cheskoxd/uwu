const bcrypt = require('bcrypt')
const helpers = {}

helpers.generateRandomString = (length) => {
    let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let charactersLength = characters.length;
    randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters[Math.floor(Math.random() * (charactersLength - 1))];
    }
    return randomString;
}

helpers.validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

helpers.encryptPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt)
    return hash
}

helpers.matchPassword = async (password,savedPassword)=>{
    try {
        if (bcrypt.compare(password,savedPassword)) {
            return false
        } else {
            return true
        } 
    } catch (err) {
        console.log(err);
        return false;
    }
};

helpers.mailSender = async (newMail)=>{

    var transporter = nodemailer.createTransport({
        host: 'in-v3.mailjet.com',
        port: 587,
        secure:false,
        auth: {
            user: '26d90316747e18dca5f5aba7562b7c2b',
            pass: '85521af0ca9c8ef69b4efe451f6850dd'
        },
        tls:{
            rejectUnauthorized:false
        }

    });
    const mailOptions = {
        from: '"Name of the website" <franchesko77lacayo@gmail.com>', // sender address
        to: newMail.to, // list of receivers
        subject: newMail.subject, // Subject line
        html: newMail.body // html body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err) {
            console.log(err)
            return false
        }
        
        console.log(info);
        return true
    });

}

module.exports = helpers;