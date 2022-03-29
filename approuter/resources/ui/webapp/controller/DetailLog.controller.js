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

        return Controller.extend("hxm.spm.ui.controller.DetailLog", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteDetailLog").attachPatternMatched(this._onObjectMatched, this);
            },
            _onObjectMatched: function (oEvent) {
                var sLogUUID    = oEvent.getParameter("arguments").LogUUID;
                var oModel      = this.getView().getModel();
                let oHeaders    = oModel.getHeaders();
                oHeaders["LogUUID"] = sLogUUID;
                oModel.setHeaders(oHeaders);
                this.getLog(this.getView(), sLogUUID);
            },
            onAfterRendering: function(){
                const oModel = this.getView().getModel();
            },
            getLog: function(oView, sLogUUID){
                var oModel = oView.getModel(), oLog;
                oModel.read("/GetLogsByUUID()", {
                    urlParameters:{LogUUID:sLogUUID},
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        console.log(oData);   
                        oLog = JSON.parse(oData.GetLogsByUUID);   
                        setTimeout(this.getLog(oModel,sLogUUID), 5000);              
                    }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log(oError);
                        var msg = "Technical error occurred while getting logs. Please reach out to adiministrator."
                        MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});
                    })
                });                               
            } 
        
        });
    });
