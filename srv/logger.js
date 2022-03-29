const fs    = require('fs');                  
const path  = require('path'); 
const {v4: uuid4} = require('uuid')
//const df    = require('dateformat');
const moment = require('moment');
const constants = require('./constants');

//console.log(__dirname);

const sLogHeaderFilePath = path.join(__dirname, 'data', 'logHeader.json');
const sLogDetailFilePath = path.join(__dirname, 'data', 'logDetail.json');
//console.log(sLogHeaderFilePath+sLogDetailFilePath);

class srvLogger {

    constructor(sTenantId, sReqType, sReqUser, sReqEmail){
        this.TenantId   = sTenantId;
        this.ReqType    = sReqType;
        this.ReqUser    = sReqUser;
        this.ReqEmail   = sReqEmail;
    }

    postLogHead(oInput){
        let oLogHead = {}; if(oInput == undefined){oInput='';}
        oLogHead.TenantId   = this.TenantId;
        oLogHead.CDateTime  = moment(new Date()).format(constants.DATE_DISPLAY_FORMAT);
        oLogHead.LogUUID    = uuid4();
        oLogHead.ReqType    = this.ReqType;
        oLogHead.ReqUser    = this.ReqUser;
        oLogHead.ReqEmail   = this.ReqEmail;
        oLogHead.UDateTime  = oLogHead.CDateTime;
        oLogHead.ReqStatus  = constants.LOG_STAT_SUBMIT;
        oLogHead.ReqInput   = JSON.parse(JSON.stringify(oInput));
        let aLogHeadData    = JSON.parse(fs.readFileSync(sLogHeaderFilePath));
        aLogHeadData.push(oLogHead);
        fs.writeFileSync(sLogHeaderFilePath, JSON.stringify(aLogHeadData)); 
        return oLogHead.LogUUID;
    }

    setLogHeadStatus(sLogUUID, sStatus){
        let aLogHeadData    = JSON.parse(fs.readFileSync(sLogHeaderFilePath));
        for(let i=0; i<aLogHeadData.length; i++){
            if(aLogHeadData[i].LogUUID == sLogUUID){
                aLogHeadData[i].UDateTime   = moment(new Date()).format(constants.DATE_DISPLAY_FORMAT);
                aLogHeadData[i].ReqStatus   = sStatus;
                fs.writeFileSync(sLogHeaderFilePath, JSON.stringify(aLogHeadData)); 
                break;
            }
        }
    }

    postLogItem(sLogUUID,sLogType,sLogMsg, sLogData){
        let oLogHeadItem = {}, oLogItem = {}, iRowIndex = -1;
        let aLogHeadItems       = JSON.parse(fs.readFileSync(sLogDetailFilePath));
        for(let i=0; i<aLogHeadItems.length; i++){
            if(aLogHeadItems[i].LogUUID == sLogUUID){
                iRowIndex = i;
            }
        }
        if(iRowIndex == -1){
            oLogHeadItem.LogUUID    = sLogUUID;
            oLogHeadItem.LogItems   = []
        }else{
            oLogHeadItem = JSON.parse(JSON.stringify(aLogHeadItems[iRowIndex]));
            aLogHeadItems.splice(iRowIndex, 1);
        }        
        oLogItem.DateTime       = moment(new Date()).format(constants.DATE_DISPLAY_FORMAT)
        oLogItem.LogItemType    = sLogType;
        oLogItem.LogItemMessage = sLogMsg;
        sLogData == undefined? oLogItem.LogItemData = '' : oLogItem.LogItemData = sLogData;
        oLogHeadItem.LogItems.push(oLogItem);
        aLogHeadItems.push(oLogHeadItem);
        fs.writeFileSync(sLogDetailFilePath, JSON.stringify(aLogHeadItems)); 
        return oLogItem;        
    }

    getLogCountByUUID(sLogUUID){
        let aLogHeadItems = JSON.parse(fs.readFileSync(sLogDetailFilePath)), iSuccessCount=0, iErrorCount=0;
        for(let i=0; i<aLogHeadItems.length; i++){
            if(aLogHeadItems[i].LogUUID == sLogUUID){
                for(let j=0; j<aLogHeadItems[i].LogItems.length; j++){
                    if(aLogHeadItems[i].LogItems[j].LogItemType == constants.LOG_TYPE_SUCCESS){
                        iSuccessCount = iSuccessCount + 1;
                    }
                    if(aLogHeadItems[i].LogItems[j].LogItemType == constants.LOG_TYPE_ERROR){
                        iErrorCount = iErrorCount + 1;
                    }                    
                }
            }
        }
        return {SuccessCount:iSuccessCount, ErrorCount:iErrorCount};
    }

    getLogsByUUID(sLogUUID){
        let oLog = {};
        let aLogHeadData    = JSON.parse(fs.readFileSync(sLogHeaderFilePath));
        let aLogHeadItems   = JSON.parse(fs.readFileSync(sLogDetailFilePath));
        for(let i=0; i<aLogHeadData.length; i++){
            if(aLogHeadData[i].LogUUID == sLogUUID){
                oLog.LogHead = JSON.parse(JSON.stringify(aLogHeadData[i])); break;
            }
        }        
        for(let j=0; j<aLogHeadItems.length; j++){
            if(aLogHeadItems[j].LogUUID == sLogUUID){
                oLog.LogItems = JSON.parse(JSON.stringify(aLogHeadItems[j])); break;
            }
        }    
        return oLog;          
    }

    getAllTxRepeaterRequestsByTenantId(){
        let oLog = {}, aLogRequests = [];
        let aLogHeadData    = JSON.parse(fs.readFileSync(sLogHeaderFilePath));
        // let aLogHeadItems   = JSON.parse(fs.readFileSync(sLogDetailFilePath));
        for(let i=0; i<aLogHeadData.length; i++){
            if(aLogHeadData[i].TenantId == this.TenantId){   
                switch (aLogHeadData[i].ReqType) {
                    case constants.DATE_TO_DATE:
                        aLogHeadData[i].ReqType = 'Day to Day'
                        break;    
                    case constants.MONTH_TO_MONTH:
                        aLogHeadData[i].ReqType = 'Month to Month'
                        break; 
                    case constants.YEAR_TO_YEAR:
                        aLogHeadData[i].ReqType = 'Year to Year'
                        break;                                                                 
                    default:
                        break;
                }             
                aLogRequests.push(JSON.parse(JSON.stringify(aLogHeadData[i])));               
            }
        };        
        oLog.LogHead = JSON.parse(JSON.stringify(aLogRequests)); 
        return oLog;          
    }

    getCompleteLogs(){
        let aLogHeadData    = JSON.parse(fs.readFileSync(sLogHeaderFilePath));
        let aLogHeadItems   = JSON.parse(fs.readFileSync(sLogDetailFilePath));
        let oAllLogs        = {LogHeads:aLogHeadData,LogItems:aLogHeadItems};
        return oAllLogs;
    }

}

module.exports = srvLogger;