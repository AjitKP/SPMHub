var nodemailer = require('nodemailer');
let dotenv = require('dotenv');


class srvMailer{

    constructor(){
        dotenv.config();
        console.log(process.env.SPMHUB_MAIL_USER);
        console.log(process.env.SPMHUB_MAIL_PASS);
        this.transporter = nodemailer.createTransport({
            //host: "smtp-mail.outlook.com",                          // hostname
            host: "smtp.office365.com",   
            secureConnection: false,                                // TLS requires secureConnection to be false
            port: 587,                                              // port for secure SMTP
            tls: { ciphers:'SSLv3' },
            auth: { user: process.env.SPMHUB_MAIL_USER, pass: process.env.SPMHUB_MAIL_PASS }
        });
        this.from = `"SPM Hub" <${process.env.SPMHUB_MAIL_USER}>`;
    }

    sendEmail(sTo, sSubject, sHtmlBody){
        let oMailConfig = {};
        oMailConfig.from    = this.from;
        oMailConfig.to      = sTo;
        oMailConfig.subject = sSubject;
        oMailConfig.html    = sHtmlBody;

        this.transporter.sendMail(oMailConfig, function(error, info){
            if(error){ return console.log(error); }        
            console.log('Message sent: ' + info.response);
        });
    }

}

module.exports = srvMailer;