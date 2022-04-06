sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (sDate) {

            return sDate == null || sDate == undefined || sDate == '' ? '' : sDate.replaceAll('T', ' ').substring(0,19);
            
        }
    };
}); 