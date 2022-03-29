const commapi   = require('./commissions');
const moment    = require('moment');
const constants = require('./constants');
const logger    = require('./logger');
const mailer    = require('./mailer');
const WebSocketServer = require('ws').Server;

class commController {

    aDateTypeFields = ['compensationDate','accountingDate','modificationDate','genericDate1','genericDate2','genericDate3','genericDate4','genericDate5','genericDate6'];
    aDeleteFields   = ['salesTransactionSeq','pipelineRun','originTypeId','modelSeq','reason', 'billToAddress'];
    aTxAssignFields = ['payeeId','setNumber', 'genericNumber1'];
    sDateToDate     = constants.DATE_TO_DATE; 
    sMonthToMonth   = constants.MONTH_TO_MONTH; 
    sYearToYear     = constants.YEAR_TO_YEAR;
    sDateFormat     = constants.DATE_FORMAT;
    sDays           = constants.TIME_DAYS; 
    sMonths         = constants.TIME_MONTHS;
    sLogUUID        = '';
    // static ws = new WebSocketServer({ port: 8081 });


    constructor(sTenantId, sUserName, sPassword, sReqType, sReqUser, sReqEmail){
        sReqType == undefined ? sReqType = 'Credentials' : sReqType = sReqType;
        this.commAPI = new commapi(sTenantId, sUserName, sPassword);
        this.logger  = new logger(sTenantId, sReqType, sReqUser, sReqEmail);     
        // commController.ws.on('connection', function (socket) {
        //     socket.send('Hi, this is the Echo-Server');
        //     socket.on('message', function (message) {
        //       console.log('Received Message: ' +  message);
        //       socket.send('Echo: ' + message);
        //     });
        //   });                      
    }    
    
    async createLogHead(oInput){
        this.sLogUUID = this.logger.postLogHead(oInput);
        console.log("createLogHead"+this.sLogUUID);
        return this.sLogUUID;
    }
    
    async getAllLogs(){
        return JSON.stringify(this.logger.getCompleteLogs());
    }

    async getLogsByUUID(sLogUUID){
        return JSON.stringify(this.logger.getLogsByUUID(sLogUUID));
    }    

    async getAllTxRepeaterRequestsByTenantId(){
        return JSON.stringify(this.logger.getAllTxRepeaterRequestsByTenantId());
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

    prepareTxQuery(sDate, sProcessingUnitSeq){
        let sQuery = '';
        sQuery = sQuery + '/salesTransactions?inlineCount=true&orderBy=compensationDate&top=100&expand=transactionAssignments&$filter='; 
        sQuery = sQuery + 'processingUnit eq ' + sProcessingUnitSeq;
        sQuery = sQuery + ' and ' + 'compensationDate eq '+ sDate;        
        return sQuery;
    }

    putTxDateFields(sOpType, oTxDataIn, sFrom, sTo){
        let oTxDataOut = JSON.parse(JSON.stringify(oTxDataIn));
        switch (sOpType) {
            case this.sDateToDate:      //D2D
                this.aDateTypeFields.forEach(sFieldKey => {
                    if(oTxDataOut.hasOwnProperty(sFieldKey) && oTxDataOut[sFieldKey] != null){
                        let sDate = oTxDataOut[sFieldKey].substr(0,10);
                        let mDate = moment(sDate, this.sDateFormat);
                        let mFrom = moment(sFrom, this.sDateFormat);
                        let mTo   = moment(sTo, this.sDateFormat);
                        sDate != sFrom ? oTxDataOut[sFieldKey] = mTo.subtract(mDate.diff(mFrom, this.sDays), this.sDays).format(this.sDateFormat) : oTxDataOut[sFieldKey] = sTo;            
                    } 
                });                    
                break;
            case this.sMonthToMonth:    //M2M
                this.aDateTypeFields.forEach(sFieldKey => {
                    if(oTxDataOut.hasOwnProperty(sFieldKey) && oTxDataOut[sFieldKey] != null){
                        let sDate = oTxDataOut[sFieldKey].substr(0,10);
                        let mDate = moment(sDate, sDateFormat);
                        let mFrom = moment(sFrom, sDateFormat);
                        let mTo   = moment(sTo, sDateFormat);
                        sDate != sFrom ? oTxDataOut[sFieldKey] = mTo.subtract(mDate.diff(mFrom, this.sMonths), this.sMonths).format(sDateFormat) : oTxDataOut[sFieldKey] = sTo;            
                    } 
                });               
                break;        
            case this.sYearToYear:      //Y2Y
                this.aDateTypeFields.forEach(sFieldKey => {
                    if(oTxDataOut.hasOwnProperty(sFieldKey) && oTxDataOut[sFieldKey] != null){
                        let iYear = oTxDataOut[sFieldKey].substr(0,4);
                        iYear != iFrom ? oTxDataOut[sFieldKey] = oTxDataOut[sFieldKey].replace(iYear, iTo-(iFrom-iYear)) : oTxDataOut[sFieldKey] = oTxDataOut[sFieldKey].replace(iFrom, iTo);            
                    }
                });            
                break;                
            default:
                break;
        }        
        return oTxDataOut;
    }    

    getDatesList(sOpType, sFromTime, sToTime){
        let sStartDate, sEndDate, dMoment, aDateList=[], sDate, oDateList={};
        if(sOpType == this.sYearToYear){
            sStartDate  = moment(sFromTime, 'YYYY').clone().startOf('year').format(this.sDateFormat);
            sEndDate    = moment(sFromTime, 'YYYY').clone().endOf('year').format(this.sDateFormat);
        }else if (sOpType == this.sMonthToMonth) {
            sStartDate  = moment(sFromTime, 'YYYY-MM').clone().startOf('month').format(this.sDateFormat);
            sEndDate    = moment(sFromTime, 'YYYY-MM').clone().endOf('month').format(this.sDateFormat);
        } else {
            sStartDate  = moment(sFromTime, this.sDateFormat).clone().startOf('month').format(this.sDateFormat);
            sEndDate    = moment(sFromTime, this.sDateFormat).clone().endOf('month').format(this.sDateFormat);
        }
        dMoment = moment(sStartDate, this.sDateFormat);
        do {                        
            oDateList.FromDate = dMoment.format(this.sDateFormat);
            oDateList.ToDate = oDateList.FromDate.replace(sFromTime, sToTime);
            aDateList.push(JSON.parse(JSON.stringify(oDateList)));
            sDate = dMoment.add(1, this.sDays).format(this.sDateFormat);
        } while (sDate != sEndDate && sOpType != this.sDateToDate);
        return aDateList;
    }

    putTxLine(oTxDataIn, sText){
        let oTxDataOut = JSON.parse(JSON.stringify(oTxDataIn));
        oTxDataOut.lineNumber.value = parseInt(oTxDataOut.lineNumber.value.toString() + sText.replace(/-/g, '').toString());
        return oTxDataOut;
    }    

    deleteTxFields(oTxDataIn){
        let oTxDataOut = JSON.parse(JSON.stringify(oTxDataIn));
        
        //Delete Fields from aDeltFlds
        this.aDeleteFields.forEach(sFieldKey => { delete oTxDataOut[sFieldKey]; });
    
        //Delete fields with null value
        let aFields = Object.keys(oTxDataOut);
        aFields.forEach(sFieldKey => {
            if(oTxDataOut[sFieldKey] == null){ delete oTxDataOut[sFieldKey]; }
        });    
        return oTxDataOut;        
    }    
    
    changeTxFields = (oTxDataIn)=>{
        let oTxDataOut = JSON.parse(JSON.stringify(oTxDataIn));
                
        let sProcessingUnitSeq = oTxDataOut.processingUnit;                         //Processing Unit
        oTxDataOut.processingUnit = [{ processingUnitSeq:sProcessingUnitSeq }];            
        let sEventTypeSeq = oTxDataOut.eventType;                                   //Event Type
        oTxDataOut.eventType = { dataTypeSeq:sEventTypeSeq };            
        let sSalesOrderSeq = oTxDataOut.salesOrder;                                 //Sales Order
        oTxDataOut.salesOrder = { salesOrderSeq:sSalesOrderSeq };
                
        let aTxAsgn=[],oTxAsgn={}, oTxAsgnKeys=[];                                  //Tx Assignments
        for(let i=0; i<oTxDataOut.transactionAssignments.length; i++){
            oTxAsgnKeys = Object.keys(oTxDataOut.transactionAssignments[i])
            for(let j=0; j<oTxAsgnKeys.length; j++){
                if(this.aTxAssignFields.includes(oTxAsgnKeys[j]) == false && oTxAsgnKeys[j].includes('generic') == false){
                    delete oTxDataOut.transactionAssignments[i][oTxAsgnKeys[j]];
                }
            }
            aTxAsgn.push(JSON.parse(JSON.stringify(oTxDataOut.transactionAssignments[i])));
        }
        oTxDataOut.transactionAssignments = aTxAsgn;    
        oTxDataOut.isRunnable = true;    
        return oTxDataOut;    
    }    

    transactionRepeater(oConfig){
        setTimeout(() => {
            console.log('called');
            this.commTxRepeater(oConfig);;
        }, 2000);                
    }

    async commTxRepeater(oConfig){
        console.log('commTxRepeater:'+JSON.stringify(oConfig));        
        let sProcessingUnitSeq = oConfig.ProcessingUnitSeq, sQuery, sFromDate, sToDate, aTxData, oTxData, oLogItem;
        let sLogUUID = this.sLogUUID == ''? this.logger.postLogHead(): this.sLogUUID;
        this.logger.setLogHeadStatus(sLogUUID, constants.LOG_STAT_INPROCESS);
        let aDateList = this.getDatesList(oConfig.OpType, oConfig.FromTime, oConfig.ToTime);

        for(let iCnt=0; iCnt<aDateList.length; iCnt++){

            sFromDate = aDateList[iCnt].FromDate, sToDate = aDateList[iCnt].ToDate;
            sQuery =  this.prepareTxQuery(sFromDate, sProcessingUnitSeq);

            aTxData = await this.commAPI.getTxByQuery(sQuery);
            aTxData.length <= 0 ? this.logger.postLogItem(sLogUUID, constants.LOG_TYPE_WARNING, 'No transaction found for date: '+sFromDate) : this.logger.postLogItem(sLogUUID, 'Information', aTxData.length+' transactions found for date: '+sFromDate);
     
            for(let i=0; i<aTxData.length; i++){    
                oTxData = JSON.parse(JSON.stringify(aTxData[i]));
                if(oTxData.value.unitType.name != oConfig.Currency){continue;}      
                
                oTxData = this.putTxDateFields(this.sDateToDate, oTxData, sFromDate, sToDate);
                oTxData = this.putTxLine(oTxData, sToDate);
                oTxData = this.deleteTxFields(oTxData);
                oTxData = this.changeTxFields(oTxData);
                try {
                    let oTxResponse = await this.commAPI.createTransaction(oTxData); 
                    let sTxId = oTxResponse.salesOrder.orderId + ':' + oTxResponse.lineNumber.value;
                    oLogItem = this.logger.postLogItem(sLogUUID, constants.LOG_TYPE_SUCCESS, 'Transaction creation is successful - '+sTxId);
                    //for (const client of commController.ws.clients) { client.send(JSON.stringify(oLogItem)); }                                   
                } catch (error) {
                    oLogItem = this.logger.postLogItem(sLogUUID, constants.LOG_TYPE_ERROR, error.message, JSON.stringify(error));
                    //for (const client of commController.ws.clients) { client.send(JSON.stringify(oLogItem)); } 
                    continue;
                }
            }

        }
        this.logger.setLogHeadStatus(sLogUUID, constants.LOG_STAT_COMPLETE);
        let oLogInfo = this.logger.getLogCountByUUID(sLogUUID), sSubject, sHtmlBody='';
        sSubject    = 'Status update on your transaction repeater request';
        sHtmlBody   = sHtmlBody + `Hi,<br><br>Please find status on your transaction repeater request below:<br><br>`;
        sHtmlBody   = sHtmlBody + `No of Transaction repeated Successfully: ${oLogInfo.SuccessCount}<br>`;
        sHtmlBody   = sHtmlBody + `No of Transaction repeated Unsuccessfully: ${oLogInfo.ErrorCount}<br><br>`;
        sHtmlBody   = sHtmlBody + `Best Regards,<br>PreSales Engineering | SAP Successfactors`
        let oMailer = new mailer();
        oMailer.sendEmail(oConfig.ReqEmail, sSubject, sHtmlBody);
    }

}

module.exports = commController;