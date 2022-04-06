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
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteDetail").attachMatched(this._onRouteMatched, this);                          
            },
            initializeUIConfig: function(){
                var oUIConfigData = {
                                        "SBtn1" :{  "enabled":true, "selectedKey":"Y2Y"             },
                                        "PY2Y"  :{  "visible":true, 
                                                    "idSBUY1":{"selectedKey":"", "editable":true},
                                                    "idDPY1":{"value":"", "editable":true},
                                                    "idDPY2":{"value":"", "editable":true}, 
                                                    "idSY3":{"selectedKey":"", "editable":true},
                                                    "idBtnYSubmit":{"visible":true}                 },
                                        "PM2M"  :{  "visible":false, 
                                                    "idSBUM1":{"selectedKey":"", "editable":true},
                                                    "idDPM1":{"value":"", "editable":true},
                                                    "idDPM2":{"value":"", "editable":true}, 
                                                    "idSM3":{"selectedKey":"", "editable":true},                 
                                                    "idBtnMSubmit":{"visible":true}                 },
                                        "PD2D"  :{  "visible":false, 
                                                    "idSBUD1":{"selectedKey":"", "editable":true},
                                                    "idDPD1":{"value":"", "editable":true},
                                                    "idDPD2":{"value":"", "editable":true}, 
                                                    "idSD3":{"selectedKey":"", "editable":true},                
                                                    "idBtnDSubmit":{"visible":true}                 },
                                        "idPanelLogHead":{  "visible":false,
                                                    "idInputReqCreateOn":{"text":""},
                                                    "idInputReqUser":{"text":""},
                                                    "idInputReqStatus":{"text":""},
                                                    "idInputReqUpdateOn":{"text":""}                },
                                        "idPanelLogItem":{  "visible":false                         }
                                    }; 
                return oUIConfigData;
            },     
            _onRouteMatched : function (oEvent) {
                this.getOwnerComponent().getModel("appheader").setData({EnableMenu:true, ChangeTenant:true, NewRequest:true});
                this.getOwnerComponent().getModel("appheader").refresh();
                var oView = this.getView(), oModel, oJSONModel, sLogUUID, oUIConfigData, oHeaders;
                sLogUUID = oEvent.getParameter("arguments").LogUUID; 
                if(sLogUUID == "" || sLogUUID == undefined || sLogUUID == "Create"){
                    if(this.getView().getModel("Log") != undefined){this.getView().getModel("Log").setData({LogHead:'', LogItems:[]});}
                    oUIConfigData = this.initializeUIConfig();
                }else{
                    oHeaders        = this.getView().getModel().getHeaders();
                    oHeaders["LogUUID"]    = sLogUUID;
                    this.getView().getModel().setHeaders(oHeaders); 
                    this.getLog(this.getView(), true);
                }
                         
                if(this.getView().getModel("DetailUI") == undefined){
                    oJSONModel = new JSONModel(oUIConfigData);
                    this.getView().setModel(oJSONModel, "DetailUI");
                    this.getView().getModel("DetailUI").refresh();
                }else{
                    this.getView().getModel("DetailUI").setData(oUIConfigData);
                }                                                                  
            },            
            onReturnToHome: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("RouteTxRSummary");
            },            
            getLog: function(oView, bUpdateInput){
                var oModel = oView.getModel(), oLog, oUIConfigData;
                var sLogUUID = oModel.getHeaders().LogUUID;
                if(sLogUUID == "" || sLogUUID == undefined){
                    setTimeout(this.getLog(oView), 5000); 
                }
                oView.setBusyIndicatorDelay(500);
                oView.setBusy(true);
                oModel.read("/GetLogsByUUID()", {
                    urlParameters:{LogUUID:sLogUUID},
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        console.log(oData);   
                        oLog = JSON.parse(oData.GetLogsByUUID);   
                        oLog.LogHead.reqinput = JSON.parse(oLog.LogHead.reqinput);

                        oUIConfigData = this.getView().getModel("DetailUI").getData();
                        if(oUIConfigData == undefined || Object.keys(oUIConfigData).length == 0){oUIConfigData = this.initializeUIConfig();}
                        if(bUpdateInput == true){
                            oUIConfigData.SBtn1.enabled = false;
                            oUIConfigData.SBtn1.selectedKey = oLog.LogHead.reqinput.OpType;
                            switch (oLog.LogHead.reqinput.OpType) {
                                case 'Y2Y':
                                    oUIConfigData.PY2Y.visible = true;
                                    oUIConfigData.PM2M.visible = false;
                                    oUIConfigData.PD2D.visible = false; 
                                    oUIConfigData.PY2Y.idSBUY1.selectedKey  = oLog.LogHead.reqinput.ProcessingUnitSeq;
                                    oUIConfigData.PY2Y.idSBUY1.editable     = false;
                                    oUIConfigData.PY2Y.idDPY1.value         = oLog.LogHead.reqinput.FromTime;
                                    oUIConfigData.PY2Y.idDPY1.editable      = false;
                                    oUIConfigData.PY2Y.idDPY2.value         = oLog.LogHead.reqinput.ToTime;
                                    oUIConfigData.PY2Y.idDPY2.editable      = false;
                                    oUIConfigData.PY2Y.idSY3.selectedKey    = oLog.LogHead.reqinput.Currency;
                                    oUIConfigData.PY2Y.idSY3.editable       = false;
                                    oUIConfigData.PY2Y.idBtnYSubmit.visible = false;
                                    break;
                                case 'M2M':  
                                    oUIConfigData.PY2Y.visible = false;
                                    oUIConfigData.PM2M.visible = true;
                                    oUIConfigData.PD2D.visible = false; 
                                    oUIConfigData.PM2M.idSBUM1.selectedKey  = oLog.LogHead.reqinput.ProcessingUnitSeq;
                                    oUIConfigData.PM2M.idSBUM1.editable     = false;
                                    oUIConfigData.PM2M.idDPM1.value         = oLog.LogHead.reqinput.FromTime;
                                    oUIConfigData.PM2M.idDPM1.editable      = false;
                                    oUIConfigData.PM2M.idDPM2.value         = oLog.LogHead.reqinput.ToTime;
                                    oUIConfigData.PM2M.idDPM2.editable      = false;
                                    oUIConfigData.PM2M.idSM3.selectedKey    = oLog.LogHead.reqinput.Currency;
                                    oUIConfigData.PM2M.idSM3.editable       = false;
                                    oUIConfigData.PM2M.idBtnMSubmit.visible = false;                                                                     
                                    break;
                                case 'D2D': 
                                    oUIConfigData.PY2Y.visible = false;
                                    oUIConfigData.PM2M.visible = false;
                                    oUIConfigData.PD2D.visible = true;   
                                    oUIConfigData.PD2D.idSBUD1.selectedKey  = oLog.LogHead.reqinput.ProcessingUnitSeq;
                                    oUIConfigData.PD2D.idSBUD1.editable     = false;
                                    oUIConfigData.PD2D.idDPD1.value         = oLog.LogHead.reqinput.FromTime;
                                    oUIConfigData.PD2D.idDPD1.editable      = false;
                                    oUIConfigData.PD2D.idDPD2.value         = oLog.LogHead.reqinput.ToTime;
                                    oUIConfigData.PD2D.idDPD2.editable      = false;
                                    oUIConfigData.PD2D.idSD3.selectedKey    = oLog.LogHead.reqinput.Currency;
                                    oUIConfigData.PD2D.idSD3.editable       = false;
                                    oUIConfigData.PD2D.idBtnDSubmit.visible = false;                                                                                                    
                                    break;
                            }
                        }
                        oUIConfigData.idPanelLogHead.visible = true;
                        oUIConfigData.idPanelLogItem.visible = true;
                        oUIConfigData.idPanelLogHead.idInputReqCreateOn.text = oLog.LogHead.modifiedAt.replaceAll('T', ' ').substring(0,19);
                        oUIConfigData.idPanelLogHead.idInputReqUpdateOn.text = oLog.LogHead.createdAt.replaceAll('T', ' ').substring(0,19);
                        oUIConfigData.idPanelLogHead.idInputReqUser.text = oLog.LogHead.requser;
                        oUIConfigData.idPanelLogHead.idInputReqStatus.text = oLog.LogHead.reqstatus;
                        oJSONModel = new JSONModel(oUIConfigData);
                        this.getView().setModel(oJSONModel, "DetailUI");
                        this.getView().getModel("DetailUI").refresh();
                        var oJSONModel = new JSONModel(oLog);
                        this.getView().setModel(oJSONModel, "Log");
                        this.getView().getModel("Log").refresh();
                        if(oLog.LogHead.reqstatus != "Complete"){ setTimeout(this.getLog(this.getView(), false), 5000); }  
                        this.getView().setBusy(false);                      
                    }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log(oError);
                        this.getView().setBusy(false);
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
                                this.getView().byId("idSBUM1").setEditable(false);
                                this.getView().byId("idDPM1").setEditable(false);
                                this.getView().byId("idDPM2").setEditable(false);
                                this.getView().byId("idSM3").setEditable(false);
                                this.getView().byId("idBtnMSubmit").setVisible(false);                                
                                break; 
                            case "Y2Y":
                                this.getView().byId("SBtn1").setEnabled(false);
                                this.getView().byId("idSBUY1").setEditable(false);
                                this.getView().byId("idDPY1").setEditable(false);
                                this.getView().byId("idDPY2").setEditable(false);
                                this.getView().byId("idSY3").setEditable(false);
                                this.getView().byId("idBtnYSubmit").setVisible(false);
                                break;                                                                                       
                            default:
                                break;
                        } 

                        MessageBox.success(msg, {   styleClass: "sapUiSizeCompact",
                                                    title:"Success!!",
                                                    onClose: jQuery.proxy(function (oAction) { this.getLog(this.getView(),false); }).bind(this)});                        
                                            }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log('Error in TransactionRepeater request');
                        console.log(oError);                    
                    })
                });                                
            }            
        });
    });
