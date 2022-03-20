const cds = require("@sap/cds");
const commController = require('./controller');
module.exports = cds.service.impl(async function () {

    const { BusinessUnits } = this.entities;
    
    this.fnInstantiateCommService = (req)=>{
        const sUrl=req.headers["tenant"], sUser=req.headers["user"], sPassword=req.headers["pass"];
        return  new commController(sUrl, sUser, sPassword);        
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
        const commSrv = this.fnInstantiateCommService(req);
        return await commSrv.verifyCommCredentials();
    })

    this.on('TransactionRepeater', async(req)=>{
        console.log(req.data);
        console.log(req.headers);
        console.log(req.query);
        console.log(req.params);
        return null;
    })

})