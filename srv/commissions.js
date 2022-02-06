const axios = require('axios');
const fs = require('fs');
const constants = require('./constants');
class srvCommissions {    

    constructor(sUrl, sUserName, sPassword){
        this.HostUrl    = 'https://'+sUrl+'.callidusondemand.com/api/v2';
        this.UserName   = sUserName;
        this.Password   = sPassword;
    }

    _getApiHeaders(){
        let bAuthorization = new Buffer.from(this.UserName+":"+this.Password);
        let sAuthorization = "Basic "+ bAuthorization.toString('base64'); 
        let objHeaders = {};
        objHeaders["Content-Type"] = "application/json";
        objHeaders["Accept"] = "application/json";
        objHeaders["authorization"] = sAuthorization;
        return objHeaders;               
    }

    async verifyUser(){
        try {
            const oResponse = await axios({ method:constants.HTTP_METHOD_GET, baseURL: this.HostUrl, url:'/users?$filter=id eq "'+this.UserName+'"', headers:this._getApiHeaders()})
            return oResponse.data.users.length > 0 ? this.UserName : '';
        } catch (error) {
            console.log(error);
        }        
    }
    
    async getPeriodTypes(){
        try {
            const oDefaults = fs.readFileSync(__dirname+'\\defaults.json','UTF-8');
            return JSON.parse(oDefaults)["periodtype"];
        } catch (error) {
            console.log(error);
        }        
    }

     async getBusinessUnits(){
        try {
            const oResponse = await axios({ method:constants.HTTP_METHOD_GET, baseURL: this.HostUrl, url:'/businessUnits', headers:this._getApiHeaders()})
            return oResponse.data.businessUnits;            
        } catch (error) {
            console.log(error);
        }
    }

     async createBusinessUnits(input){
        try {
            const oResponse = await axios({ method:constants.HTTP_METHOD_POST, baseURL: this.HostUrl, url:'/businessUnits', headers:this._getApiHeaders(), data:[input]})
            return oResponse.data.businessUnits[0];            
        } catch (error) {
            console.log(error);
        }
    }

    async getCalendars(){
        try {
            const oResponse = await axios({ method:constants.HTTP_METHOD_GET, baseURL: this.HostUrl, url:'/calendars?expand=majorPeriodType,minorPeriodType', headers:this._getApiHeaders()})
            return oResponse.data.calendars.map(x=>{ 
                return {calendarSeq:x.calendarSeq,calendar:x.name,description:x.description,
                        minorPeriodSeq:x.minorPeriodType.key,minorPeriod:x.minorPeriodType.displayName,
                        majorPeriodSeq:x.majorPeriodType.key,majorPeriod:x.majorPeriodType.displayName}
            });            
        } catch (error) {
            console.log(error);
        }
    }    
    async createCalendars(input){
        try {
            const oResponse = await axios({ method:constants.HTTP_METHOD_POST, baseURL: this.HostUrl, url:'/calendars', headers:this._getApiHeaders(), data:[input]})
            return oResponse.data.calendars[0];            
        } catch (error) {
            console.log(error);
        }
    }

}
module.exports = srvCommissions;