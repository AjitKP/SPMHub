const commapi = require('./commissions');

class commController {

    constructor(sUrl, sUserName, sPassword){
        this.commAPI = new commapi(sUrl, sUserName, sPassword);
    }
    
    async verifyCommCredentials(){
        return await this.commAPI.verifyUser();
    }

    async commBusinessUnit(sAction){
        switch (sAction) {
            case 'READ':
                return await this.commAPI.getBusinessUnits();        
            default:
                break;
        }
    }


}

module.exports = commController;