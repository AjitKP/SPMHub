// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/ws/WebSocket",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, WebSocket, JSONModel, MessageToast) {
        "use strict";
        //bSubmitSuccess = false;
        return Controller.extend("hxm.spm.ui.controller.Detail", {
            onInit: function () {
                const oModel = this.getView().getModel();            
            },
            onReturnToHome: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("RouteTxRSummary");
            },            
            getLog: function(oView){
                var oModel = oView.getModel(), oLog;
                var sLogUUID = oModel.getHeaders().LogUUID;
                if(sLogUUID == "" || sLogUUID == undefined){
                    setTimeout(this.getLog(oView), 5000); 
                }
                oModel.read("/GetLogsByUUID()", {
                    urlParameters:{LogUUID:sLogUUID},
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        console.log(oData);   
                        oLog = JSON.parse(oData.GetLogsByUUID);   
                        this.getView().byId("idPanelLogHead").setVisible(true);
                        this.getView().byId("idPanelLogItem").setVisible(true);
                        this.getView().byId("idInputReqCreateOn").setText(oLog.LogHead.modifiedAt.replaceAll('T', ' ').substring(0,19));
                        this.getView().byId("idInputReqUpdateOn").setText(oLog.LogHead.createdAt.replaceAll('T', ' ').substring(0,19));
                        this.getView().byId("idInputReqUser").setText(oLog.LogHead.requser);
                        this.getView().byId("idInputReqStatus").setText(oLog.LogHead.reqstatus);
                        var oJSONModel = new JSONModel(oLog);
                        this.getView().setModel(oJSONModel, "Log");
                        this.getView().getModel("Log").refresh();
                        if(oLog.LogHead.reqstatus != "Complete"){
                            setTimeout(this.getLog(this.getView()), 5000);              
                        }                        
                    }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log(oError);
                        var msg = "Technical error occurred while getting logs. Please reach out to adiministrator."
                        MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});
                    })
                });                               
            },            
            onAfterRendering: function(){
            },
            onSBSelectionChange: function(oEvent){
                console.log(oEvent);
                let sSelectedKey = this.byId("SBtn1").getSelectedKey();
                switch (sSelectedKey) {
                    case "Y2Y":
                        this.byId("PY2Y").setVisible(true);
                        this.byId("PM2M").setVisible(false);
                        this.byId("PD2D").setVisible(false);
                        break;       
                    case "M2M":
                        this.byId("PY2Y").setVisible(false);
                        this.byId("PM2M").setVisible(true);
                        this.byId("PD2D").setVisible(false);
                        break; 
                    case "D2D":
                        this.byId("PY2Y").setVisible(false);
                        this.byId("PM2M").setVisible(false);
                        this.byId("PD2D").setVisible(true);
                        break;                                                               
                    default:
                        break;
                }
            },
            onRequestSubmit: function(oEvent){
                let sOpType = this.byId("SBtn1").getSelectedKey();
                let sProcessingUnit, sFromTime, sToTime, sCurrency, sReqEmail, sBusinessUnit;
                switch (sOpType) {
                    case "Y2Y":
                        sProcessingUnit = this.getView().byId("idSBUY1").getSelectedKey(); 
                        sBusinessUnit   = this.getView().byId("idSBUY1").getSelectedItem().getText();
                        sFromTime       = this.getView().byId("idDPY1").getValue();
                        sToTime         = this.getView().byId("idDPY2").getValue();
                        sCurrency       = this.getView().byId("idSY3").getSelectedKey();
                        break;
                    case "M2M":
                        sProcessingUnit = this.getView().byId("idSBUM1").getSelectedKey(); 
                        sBusinessUnit   = this.getView().byId("idSBUM1").getSelectedItem().getText();
                        sFromTime       = this.getView().byId("idDPM1").getValue();
                        sToTime         = this.getView().byId("idDPM2").getValue();
                        sCurrency       = this.getView().byId("idSM3").getSelectedKey();                    
                        break;                        
                    case "D2D":
                        sProcessingUnit = this.getView().byId("idSBUD1").getSelectedKey(); 
                        sBusinessUnit   = this.getView().byId("idSBUD1").getSelectedItem().getText();
                        sFromTime       = this.getView().byId("idDPD1").getValue();
                        sToTime         = this.getView().byId("idDPD2").getValue();
                        sCurrency       = this.getView().byId("idSD3").getSelectedKey();                    
                        break;                
                    default:
                        break;
                }
                if(sProcessingUnit == '' || sFromTime == '' || sToTime == '' || sCurrency == ''){
                    var msg = "All input fields are mandatory. Kindly check your input."
                    MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});  
                    return;                  
                }
                let oModel = this.getView().getModel();  
                let oParameters = { OpType:sOpType, ProcessingUnitSeq:sProcessingUnit, BusinessUnit:sBusinessUnit, Currency:sCurrency, FromTime:sFromTime, 
                                    ToTime:sToTime, ReqEmail:oModel.getHeaders().reqemail, ReqUser:oModel.getHeaders().requser}
                oModel.callFunction("/TransactionRepeater", {
                    method: 'POST',
                    urlParameters: oParameters,
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        console.log(oData);
                        var msg = JSON.parse(oData.TransactionRepeater).message;
                        var sTxLogUUID      = JSON.parse(oData.TransactionRepeater).log;
                        let oHeaders        = this.getView().getModel().getHeaders();
                        oHeaders["LogUUID"]    = sTxLogUUID;
                        this.getView().getModel().setHeaders(oHeaders);   

                        switch (this.getView().byId("SBtn1").getSelectedKey()) {
                            case "D2D":
                                this.getView().byId("SBtn1").setEnabled(false);
                                this.getView().byId("idSBUD1").setEditable(false);
                                this.getView().byId("idDPD1").setEditable(false);
                                this.getView().byId("idDPD2").setEditable(false);
                                this.getView().byId("idSD3").setEditable(false);
                                this.getView().byId("idBtnDSubmit").setVisible(false);
                                break;  
                            case "M2M":
                                this.getView().byId("SBtn1").setEnabled(false);
                                this.getView().byId("idSBUM1").setEnabled(false);
                                this.getView().byId("idDPM1").setEnabled(false);
                                this.getView().byId("idDPM2").setEnabled(false);
                                this.getView().byId("idSM3").setEnabled(false);
                                this.getView().byId("idBtnMSubmit").setVisible(false);                                
                                break; 
                            case "Y2Y":
                                this.getView().byId("SBtn1").setEnabled(false);
                                this.getView().byId("idSBUY1").setEnabled(false);
                                this.getView().byId("idDPY1").setEnabled(false);
                                this.getView().byId("idDPY2").setEnabled(false);
                                this.getView().byId("idSY3").setEnabled(false);
                                this.getView().byId("idBtnYSubmit").setVisible(false);
                                break;                                                                                       
                            default:
                                break;
                        } 

                        MessageBox.success(msg, {
                            styleClass: "sapUiSizeCompact",
                            title:"Success!!",
                            onClose: jQuery.proxy(function (oAction) {
                                this.getLog(this.getView());
                            }).bind(this)
                        });                        
                    }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log('Error in TransactionRepeater request')
                        console.log(oError);                    
                    })
                });                                
            }            
        });
    });
