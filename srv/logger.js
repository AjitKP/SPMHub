const fs    = require('fs');                  
const path  = require('path'); 
const {v4: uuid4} = require('uuid')
//const df    = require('dateformat');
const moment = require('moment');

const sLogHeaderFilePath = path.join(path.dirname(require.main.filename), 'data', 'logHeader.json');
const sLogDetailFilePath = path.join(path.dirname(require.main.filename), 'data', 'logDetail.json');


class srvLogger {

    constructor(sTenantId, sReqType){
        this.TenantId   = sTenantId;
        this.ReqType    = sReqType;
    }

    postLogHead(){
        let oLogHead = {};
        oLogHead.TenantId   = this.TenantId;
        oLogHead.DateTime   = moment(new Date()).format("yyyy-MM-DDTHH:mm:ss")
        oLogHead.LogUUID    = uuid4();
        oLogHead.ReqType    = this.ReqType;
        let aLogHeadData    = JSON.parse(fs.readFileSync(sLogHeaderFilePath));
        aLogHeadData.push(oLogHead);
        fs.writeFileSync(sLogHeaderFilePath, JSON.stringify(aLogHeadData)); 
        return oLogHead.LogUUID;
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
        oLogItem.DateTime       = moment(new Date()).format("yyyy-MM-DDTHH:mm:ss")
        oLogItem.LogItemType    = sLogType;
        oLogItem.LogItemMessage = sLogMsg;
        oLogItem.LogItemData    = sLogData;
        oLogHeadItem.LogItems.push(oLogItem);
        aLogHeadItems.push(oLogHead);
        fs.writeFileSync(sLogDetailFilePath, JSON.stringify(aLogHeadItems)); 
        return oLogItem;        
    }

}

module.exports = srvLogger;