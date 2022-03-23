const cds = require("@sap/cds");
const commController = require('./controller');
module.exports = cds.service.impl(async function () {

    const { BusinessUnits } = this.entities;
    
    this.fnInstantiateCommService = (req, sReqType)=>{
        const sUrl=req.headers["tenant"], sUser=req.headers["user"], sPassword=req.headers["pass"];
        return  new commController(sUrl, sUser, sPassword, sReqType);        
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
        const commSrv = this.fnInstantiateCommService(req, 'Credentials');
        return await commSrv.verifyCommCredentials();
    })

    this.on('TransactionRepeater', async(req)=>{
        const commSrv = this.fnInstantiateCommService(req, req.data.OpType);
        console.log('Starting');
        commSrv.transactionRepeater(req.data);
        console.log('end');
        return {status:200, message: 'Request for Transaction repeater submittted successfully!'};
    })

})