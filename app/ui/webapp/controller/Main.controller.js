// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("hxm.spm.ui.controller.Main", {
            
            onInit: function () {
                var sReqUser='', sReqEmail='';
                const oModel = this.getView().getModel();
                oModel.setHeaders({ "spmhub_action":"GetUserInfo"});
                oModel.read("/GetUserInfo()", {
                    async: false,
                    groupId:"GetUserInfo",
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        sReqEmail   = oData.GetUserInfo.reqemail;
                        sReqUser    = oData.GetUserInfo.requser;
                        var x = oModel.getHeaders();
                        console.log(x);
                        oModel.setHeaders({ "requser":sReqUser, "reqemail":sReqEmail});
                        var oHtmlModel = new JSONModel({HTML : "<h3>Welcome "+sReqUser+"!!</h3>"});
                        this.getView().setModel(oHtmlModel, "user");                         
                    }).bind(this),
                    // eslint-disable-next-line no-undef
                    error: jQuery.proxy(function (oError) {
                        console.log('Error in getting logged in email and name')
                        console.log(oError);                    
                    })
                });                
                // oModel.setHeaders({ "ReqUser":sReqUser, "ReqEmail":sReqEmail});
                // oModel.setHeaders({ "ReqUser":sReqUser});
				// var oHtmlModel = new JSONModel({HTML : "<h3>Welcome "+sReqUser+"!!</h3>"});
				// this.getView().setModel(oHtmlModel, "user");                
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
