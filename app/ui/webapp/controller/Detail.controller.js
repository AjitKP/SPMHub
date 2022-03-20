// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("hxm.spm.ui.controller.Detail", {
            onInit: function () {
                const oModel = this.getView().getModel();
            },
            onAfterRendering: function(){
                const oModel = this.getView().getModel();
            },
            onSBSelectionChange: function(oEvent){
                console.log(oEvent);
                let selectedKey = this.byId("SBtn1").getSelectedKey();
                switch (selectedKey) {
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
            }            
        });
    });
