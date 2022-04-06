const approuter = require('@sap/approuter');
const jwtDecode = require('jwt-decode');
var xssec = require('@sap/xssec');
var xsenv = require('@sap/xsenv');
var ar = approuter();

function getUserInfo(token) {
    return new Promise((resolve, reject) => {
        xssec.createSecurityContext(token, xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa,
            function (error, securityContext) {
                if (error) { console.log('Security Context creation failed'); return; }
                resolve(securityContext);
            });
    });
};

ar.beforeRequestHandler.use('/v2/hxm/spmhub/service/$batch', function (req, res, next) {
    // console.log("***Reached***");
    // console.log(JSON.stringify(process.env));
	if (!req.user) {
		// res.statusCode = 403;
		// res.end(`Missing JWT Token`);
	} else {
        var decodedJWTToken = jwtDecode(req.user.token.accessToken);
        var reqEmail   = decodedJWTToken.email;
        var reqUser    = decodedJWTToken.given_name + ' ' + decodedJWTToken.family_name;
        var oUserInfo  = {id:req.user.id, name:req.user.name, reqemail:reqEmail, requser:reqUser};
        if(req.headers["spmhub_action"] == "GetUserInfo"){
            // console.log("***spmhub_action=GetUserInfo Reached***");
            res.statusCode = 202;
            res.setHeader("Content-Type", "multipart/mixed;boundary=batch_743c-3239-79b7");
            var sUserInfo = JSON.stringify({"d":{"GetUserInfo":{id:req.user.id, name:req.user.name, reqemail:reqEmail, requser:reqUser}}});
            var aBody = [];
            aBody.push('--batch_743c-3239-79b7', 'content-type: application/http','content-transfer-encoding: binary','');
            aBody.push('HTTP/1.1 200 OK','content-type: application/json','dataserviceversion: 2.0','',sUserInfo, '--batch_743c-3239-79b7--');
            var sBody = aBody.join('\r\n');
            res.end(sBody);
        }        
        else{
            // console.log("***routed to cds service handle***");
            next()                        
        }

    }

});

ar.start();