// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageBox",
    "sap/ui/core/Core"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Core) {
        "use strict";

        return Controller.extend("hxm.spm.ui.controller.Main", {
            
            onInit: function () {
                // var sReqUser='', sReqEmail='';
                // const oModel = this.getOwnerComponent().getModel();
                // oModel.setHeaders({ "spmhub_action":"GetUserInfo"});
                // oModel.read("/GetUserInfo()", {
                //     async: false,
                //     groupId:"GetUserInfo",
                //     // eslint-disable-next-line no-undef
                //     success: jQuery.proxy(function (oData) {
                //         sReqEmail   = oData.GetUserInfo.reqemail;
                //         sReqUser    = oData.GetUserInfo.requser;
                //         var x = oModel.getHeaders();
                //         console.log(x);
                //         this.getView().byId("idTitleUserName").setText(sReqUser);
                //         oModel.setHeaders({ "requser":sReqUser, "reqemail":sReqEmail});
                //         var oHtmlModel = new JSONModel({HTML : "<h3>Welcome "+sReqUser+"!!</h3>"});
                //         this.getView().setModel(oHtmlModel, "user");                         
                //     }).bind(this),
                //     // eslint-disable-next-line no-undef
                //     error: jQuery.proxy(function (oError) {
                //         console.log('Error in getting logged in email and name')
                //         console.log(oError);                    
                //     })
                // });                             
            },

            onChangeTheme: function(oEvent){
                var value = oEvent.getSource().getText();
                switch (value) {
                    case "Fiori 3":
                        Core.applyTheme("sap_fiori_3");
                        break;
                    case "Fiori 3 Dark":
                        Core.applyTheme("sap_fiori_3_dark");
                        break;
                    case "High Contrast White":
                        Core.applyTheme("sap_belize_hcw");
                        break;
                    case "Belize Plus":
                        Core.applyTheme("sap_belize_plus");
                        break;
                    case "High Contrast Black":
                        Core.applyTheme("sap_belize_hcb");
                        break;
                    case "Belize":
                        Core.applyTheme("sap_belize");
                        break;
                    case "Horizon":
                        Core.applyTheme("sap_horizon");
                        break;                        
                }                
            },

            onContinueLogin: function(){
                // eslint-disable-next-line no-unused-vars
                //var bSuccessfullLogin = false;
                const sTenant   = this.getView().byId("idTenantInput").getValue();
                const sUser     = this.getView().byId("idUserInput").getValue();
                const sPass     = this.getView().byId("idPasswordInput").getValue();
                const oModel    = this.getView().getModel();
                let oHeaders    = oModel.getHeaders();
                oHeaders["tenant"]  = sTenant;
                oHeaders["user"]    = sUser;
                oHeaders["pass"]    = sPass;
                oModel.setHeaders(oHeaders);
                oModel.read("/VerifyCredentials()", {
                    async: false,
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        var msg = "Either user id or Password is Incorrect. Try again!"
                        oData.VerifyCredentials == sUser ? this.getOwnerComponent().getRouter().navTo("RouteTxRSummary"): MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});
                    }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log(oError);
                        var msg = "Technical error occurred. Please reach out to adiministrator."
                        MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});
                    })
                });
            }
        });
    });
