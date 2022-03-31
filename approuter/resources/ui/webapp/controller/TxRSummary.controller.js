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
        return Controller.extend("hxm.spm.ui.controller.TxRSummary", {
            onInit: function () {
                // var oHeaders = this.getOwnerComponent().getModel().getHeaders();
                // this.getView().byId("idTitleUserName").setText(oHeaders["requser"]);
            },           
            onAfterRendering: function(){
                var oModel = this.getView().getModel();  
                if(oModel == undefined){oModel = this.getOwnerComponent().getModel();}
                oModel.read("/GetAllTxRepeaters()", {
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        console.log(oData);   
                        var oAllLogList     = JSON.parse(oData.GetAllTxRepeaters);
                        for(let i=0; i<oAllLogList.LogHead.length; i++){
                            oAllLogList.LogHead[i].reqinput = JSON.parse(oAllLogList.LogHead[i].reqinput);
                            switch (oAllLogList.LogHead[i].reqtype) {
                                case 'D2D':
                                    oAllLogList.LogHead[i].reqtype = 'Day to Day'; break;  
                                case 'M2M':
                                    oAllLogList.LogHead[i].reqtype = 'Month to Month'; break;  
                                case 'Y2Y':
                                    oAllLogList.LogHead[i].reqtype = 'Year to Year'; break;                            
                            }
                        }   
                        var oJSONModel      = new JSONModel(oAllLogList);
                        this.getView().setModel(oJSONModel, "TxRLog");
                        this.getView().getModel("TxRLog").refresh();                       
                    }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log(oError);
                        var msg = "Technical error occurred while getting transaction summary logs. Please reach out to adiministrator."
                        MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});
                    })
                });                 
            },

            onRequestSubmit: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("RouteDetail");
            }            
        });
    });
