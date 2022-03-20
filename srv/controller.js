const commapi = require('./commissions');
const moment  = require('moment');
const constants = require('./constants');
const logger = require('./logger');

class commController {

    aDateTypeFields = ['compensationDate','accountingDate','modificationDate','genericDate1','genericDate2','genericDate3','genericDate4','genericDate5','genericDate6'];
    aDeleteFields   = ['salesTransactionSeq','pipelineRun','originTypeId','modelSeq'];
    aTxAssignFields = ['payeeId','setNumber', 'genericNumber1'];
    sDateToDate     = constants.DATE_TO_DATE; 
    sMonthToMonth   = constants.MONTH_TO_MONTH; 
    sYearToYear     = constants.YEAR_TO_YEAR;
    sDateFormat     = constants.DATE_FORMAT;
    sDays           = constants.TIME_DAYS; 
    sMonths         = constants.TIME_MONTHS;

    constructor(sTenantId, sUserName, sPassword, sReqType){
        sReqType == undefined ? sReqType = 'Credentials' : sReqType = sReqType;
        this.commAPI = new commapi(sTenantId, sUserName, sPassword);
        this.logger  = new logger(sTenantId, sReqType);
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
        sQuery = sQuery + '/v2/salesTransactions?inlineCount=true&orderBy=compensationDate&top=100&expand=transactionAssignments&$filter='; 
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
                        let mDate = moment(sDate, sDateFormat);
                        let mFrom = moment(sFrom, sDateFormat);
                        let mTo   = moment(sTo, sDateFormat);
                        sDate != sFrom ? oTxDataOut[sFieldKey] = mTo.subtract(mDate.diff(mFrom, this.sDays), this.sDays).format(sDateFormat) : oTxDataOut[sFieldKey] = sTo;            
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

    putTxLine(oTxDataIn, sText){
        let oTxDataOut = JSON.parse(JSON.stringify(oTxDataIn));
        oTxDataOut.lineNumber.value = sText.replace(/-/g, '');
        return oTxDataOut;
    }    

    deleteTxFields(oTxDataIn){
        let oTxDataOut = JSON.parse(JSON.stringify(oTxDataIn));
        
        //Delete Fields from aDeltFlds
        this.aDeleteFields.forEach(sFieldKey => {
            delete oTxDataOut[sFieldKey];
        });
    
        //Delete fields with null value
        let aFields = Object.keys(oTxDataOut);
        aFields.forEach(sFieldKey => {
            if(oTxDataOut[sFieldKey] == null){
                delete oTxDataOut[sFieldKey];
            }
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
                if(aTxAssignFields.includes(oTxAsgnKeys[j]) == false && oTxAsgnKeys[j].includes('generic') == false){
                    delete oTxDataOut.transactionAssignments[i][oTxAsgnKeys[j]];
                }
            }
            aTxAsgn.push(JSON.parse(JSON.stringify(oTxDataOut.transactionAssignments[i])));
        }
        oTxDataOut.transactionAssignments = aTxAsgn;    
        oTxDataOut.isRunnable = true;    
        return oTxDataOut;    
    }    

    async commTxRepeaterD2D(oConfig){

        let sLogUUID = this.logger.postLogHead();

        let sProcessingUnitSeq = oConfig.ProcessingUnitSeq, sQuery, sFromDate = oConfig.FromDate, sToDate = oConfig.ToDate;  
        sQuery =  this.prepareTxQuery(sFromDate, sProcessingUnitSeq);

        let aTxData = await this.commAPI.getTxByQuery(sQuery), oTxData;
        if(aTxData.length <= 0){
            throw `No Transaction found for date ${sFromDate}`;
        }
 
        for(let i=0; i<aTxData.length; i++){

            oTxData = JSON.parse(JSON.stringify(aTxData[i]));
            if(oTxData.value.unitType.name != oConfig.Currency){continue;}      
            
            oTxData = this.putTxDateFields(this.sDateToDate, oTxData, sFromDate, sToDate);
            oTxData = this.putTxLine(oTxData, sToDate);
            oTxData = this.deleteTxFields(oTxData);
            oTxData = this.changeTxFields(oTxData);
            let aTxAsgnData = JSON.parse(JSON.stringify(oTxData.transactionAssignments));
            //delete oTxData.transactionAssignments;
            try {
                let oTxResponse = await this.commAPI.createTransaction(oTxData); 
                let sTxId = oTxResponse.salesOrder.orderId + ':' + oTxResponse.lineNumber.value;
                this.logger.postLogItem(sLogUUID, 'Success', 'Transaction creation is successful'+sTxId);               
            } catch (error) {
                this.logger.postLogItem(sLogUUID, 'Error', 'Transaction creation is failed', JSON.stringify(error));
                continue;
            }
            //let oTxAsgnData = {salesTransactionSeq:oTxResponse.salesTransactionSeq, transactionAssignments:aTxAsgnData}
        }


    }

}

module.exports = commController;