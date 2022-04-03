sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {

        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createAppHeaderModel: function(){
            var oAppHeaderModel = new JSONModel({EnableMenu:false, ChangeTenant:false, NewRequest:false});
            return oAppHeaderModel;
        }

    };
});