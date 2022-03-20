// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("hxm.spm.ui.controller.Main", {
            onInit: function () {
                const oModel = this.getView().getModel();
            },


            onContinueLogin: function(){
                // eslint-disable-next-line no-unused-vars
                var bSuccessfullLogin = false;
                const sTenant = this.getView().byId("idTenantInput").getValue();
                const sUser = this.getView().byId("idUserInput").getValue();
                const sPass = this.getView().byId("idPasswordInput").getValue();
                const oModel = this.getView().getModel();
                oModel.setHeaders({ "tenant":sTenant, "user":sUser, "pass":sPass });
                oModel.read("/VerifyCredentials()", {
                    async: false,
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        var msg = "Either user id or Password is Incorrect. Try again!"
                        oData.VerifyCredentials == sUser ? this.getOwnerComponent().getRouter().navTo("RouteDetail"): MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});
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
