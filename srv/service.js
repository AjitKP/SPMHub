const cds = require("@sap/cds");
const commController = require('./controller');
module.exports = cds.service.impl(async function () {

    const { BusinessUnits } = this.entities;
    
    this.fnInstantiateCommService = (req, sReqType)=>{
        const sUrl=req.headers["tenant"], sUser=req.headers["user"], sPassword=req.headers["pass"], sReqUser=req.headers["requser"], sReqEmail=req.headers["reqemail"];
        return  new commController(sUrl, sUser, sPassword, sReqType, sReqUser, sReqEmail);        
    }

    this.on('READ', BusinessUnits, async(req)=>{
        //console.log(req.query)
        console.log(req.headers);
        // const CommissionsApi = await cds.connect.to("CommissionsApi");
        // return CommissionsApi.tx(req).run(req.query);
        const sUrl=req.headers["tenant"], sUser=req.headers["user"], sPassword=req.headers["pass"];
        const commSrv = new commController(sUrl, sUser, sPassword);
        return await commSrv.commBusinessUnit('READ');
    })

    this.on('VerifyCredentials',async(req)=>{
        console.log("reached VerifyCredentials")
        const commSrv = this.fnInstantiateCommService(req, 'Credentials');
        return await commSrv.verifyCommCredentials();
    })

    this.on('GetUserInfo',async(req)=>{
        console.log("reached GetUserInfo")
        console.log(JSON.stringify(req.headers));
        return req.headers["LoggedInUserInfo"];
    })    

    this.on('GetAllLogs',async(req)=>{
        console.log("reached GetAllLogs")
        const commSrv = this.fnInstantiateCommService(req, 'AllLogs');
        return commSrv.getAllLogs();
    })        

    this.on('TransactionRepeater', async(req)=>{
        console.log(JSON.stringify(process.env));
        console.log("reached TransactionRepeater")
        const commSrv = this.fnInstantiateCommService(req, req.data.OpType);
        const sLogId  = await commSrv.createLogHead(req.data);
        console.log('TransactionRepeater'+sLogId);
        commSrv.transactionRepeater(req.data);
        return JSON.stringify({log:sLogId, message: 'Request for Transaction repeater submittted successfully!'});
    })

})