const axios = require('axios').default;

class CommissionsApi extends cds.RemoteService {
    async init() {
  
    //   this.before("READ", "*", (req) => {
    //   });
  
      this.on("READ", "*", async (req) => {
        // invoke the REST service and translate the response
        console.log(req);
        const responseData = await axios({
            method: 'get',
            url: '/businessUnits',
            baseURL:'https://0438.callidusondemand.com/api/v2',
            auth: { username: 'CompAdmin', password: 'SapAdmin@123' },
            responseType: 'json'
        })
        const bu = responseData.data.businessUnits;
        return bu;
      });
  
      super.init();
    }
}
module.exports={CommissionsApi}