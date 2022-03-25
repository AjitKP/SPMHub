// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/ws/WebSocket",
    "sap/m/MessageToast"    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, WebSocket, MessageToast) {
        "use strict";

        return Controller.extend("hxm.spm.ui.controller.Detail", {
            onInit: function () {
                const oModel = this.getView().getModel();
                var connection = new WebSocket("/v2/hxm/spmhub/service/ws");
                // connection opened
                connection.attachOpen(function (oControlEvent) {
                    console.log(oControlEvent.getParameter("data"));
                });

                // server messages
                connection.attachMessage(function (oControlEvent) {
                    var oIdea = JSON.parse(oControlEvent.getParameter("data"));
                    MessageToast.show(JSON.stringify(oIdea));
                });

                // error handling
                connection.attachError(function (oControlEvent) {
                    console.log(oControlEvent.getParameter("data"));
                });

                // onConnectionClose
                connection.attachClose(function (oControlEvent) {
                    console.log(oControlEvent.getParameter("data"));
                });                
            },
            onAfterRendering: function(){
                const oModel = this.getView().getModel();
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
                let sProcessingUnit, sFromTime, sToTime, sCurrency, sReqEmail;
                switch (sOpType) {
                    case "Y2Y":
                        sProcessingUnit = this.getView().byId("idSBUY1").getSelectedKey(); 
                        sFromTime       = this.getView().byId("idDPY1").getValue();
                        sToTime         = this.getView().byId("idDPY2").getValue();
                        sCurrency       = this.getView().byId("idSY3").getSelectedKey();
                        break;
                    case "M2M":
                        sProcessingUnit = this.getView().byId("idSBUM1").getSelectedKey(); 
                        sFromTime       = this.getView().byId("idDPM1").getValue();
                        sToTime         = this.getView().byId("idDPM2").getValue();
                        sCurrency       = this.getView().byId("idSM3").getSelectedKey();                    
                        break;                        
                    case "D2D":
                        sProcessingUnit = this.getView().byId("idSBUD1").getSelectedKey(); 
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
                let oParameters = {OpType:sOpType, ProcessingUnitSeq:sProcessingUnit, Currency:sCurrency, FromTime:sFromTime, ToTime:sToTime, ReqEmail:oModel.getHeaders().reqemail}
                oModel.callFunction("/TransactionRepeater", {
                    method: 'POST',
                    urlParameters: oParameters,
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        console.log(oData);
                        var msg = JSON.parse(oData.TransactionRepeater).message;
                        MessageBox.success(msg, {styleClass: "sapUiSizeCompact"});                        
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
