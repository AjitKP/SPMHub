// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, JSONModel, MessageToast, Filter, FilterOperator) {
        "use strict";
        //bSubmitSuccess = false;
        return Controller.extend("hxm.spm.ui.controller.TxRSummary", {
            onInit: function () {
                this.getView().byId("idSummaryCardHeader").setTitle("Logged In Tenant : "+this.getOwnerComponent().getModel().getHeaders()["tenant"]);
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteTxRSummary").attachMatched(this._onRouteMatched, this);                      
            },     
            _onRouteMatched : function (oEvent) {
                var oModel = this.getView().getModel();  
                if(oModel == undefined){oModel = this.getOwnerComponent().getModel();}
                oModel.read("/GetAllTxRepeaters()", {
                    // eslint-disable-next-line no-undef
                    success: jQuery.proxy(function (oData) {
                        console.log(oData);   
                        var oAllLogList     = JSON.parse(oData.GetAllTxRepeaters), oStatusCount={SubmittedCnt:0, InProcessCnt:0,CompletedCnt:0};
                        for(let i=0; i<oAllLogList.LogHead.length; i++){
                            oAllLogList.LogHead[i].reqinput = JSON.parse(oAllLogList.LogHead[i].reqinput);
                            switch (oAllLogList.LogHead[i].reqtype) {
                                case 'D2D':
                                    oAllLogList.LogHead[i].reqtypedesc = 'Day to Day'; break;  
                                case 'M2M':
                                    oAllLogList.LogHead[i].reqtypedesc = 'Month to Month'; break;  
                                case 'Y2Y':
                                    oAllLogList.LogHead[i].reqtypedesc = 'Year to Year'; break;                            
                            }
                            switch (oAllLogList.LogHead[i].reqstatus) {
                                case 'Submitted':
                                    oStatusCount.SubmittedCnt = oStatusCount.SubmittedCnt + 1; break;  
                                case 'In Process':
                                    oStatusCount.InProcessCnt = oStatusCount.InProcessCnt + 1; break;  
                                case 'Complete':
                                    oStatusCount.CompletedCnt = oStatusCount.CompletedCnt + 1; break;                            
                            }                            
                        }   
                        oAllLogList.TotalLogHeadCount = oAllLogList.LogHead.length;
                        oAllLogList.StatusCount = oStatusCount;
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
            onSBRTSelectionChange: function(oEvent) {
                let sSelectedKey = this.byId("idSBReqType").getSelectedKey(), aFilters;
                let oBinding = this.getView().byId("idLogItemTable").getBinding('items');   
                switch (sSelectedKey) {
                    case 'ALL': 
                        this.getView().byId("idTitleLogItemTable").setText("All Requests");
                        aFilters = [];
                        break;   
                    case 'TXR': 
                        this.getView().byId("idTitleLogItemTable").setText("All Transaction Repeater Requests");  
                        aFilters = new Filter({ filters:[   new Filter({path:'reqtype', operator:FilterOperator.EQ, value1:'D2D'}),
                                                            new Filter({path:'reqtype', operator:FilterOperator.EQ, value1:'M2M'}),
                                                            new Filter({path:'reqtype', operator:FilterOperator.EQ, value1:'Y2Y'})  ],
                                                and     : false  });                                         
                        break;                                     
                    case 'TXM': 
                        this.getView().byId("idTitleLogItemTable").setText("All Transaction Multiplier Requests");  
                        aFilters = new Filter({ filters:[   new Filter({path:'reqtype', operator:FilterOperator.NE, value1:'D2D'}),
                                                            new Filter({path:'reqtype', operator:FilterOperator.NE, value1:'M2M'}),
                                                            new Filter({path:'reqtype', operator:FilterOperator.NE, value1:'Y2Y'})  ],
                                                and     : true  });                                                 
                    break;                        
                }
                oBinding.filter(aFilters);
            },
            onLogItemTablePress: function(oEvent){
                var iLogIndex   = parseInt(oEvent.getSource().getBindingContextPath().split('/')[2]);
                var sLogUUID    = this.getView().getModel("TxRLog").getData().LogHead[iLogIndex].ID;
                this.getOwnerComponent().getRouter().navTo("RouteDetail",{LogUUID:sLogUUID});
            },
            onAfterRendering: function(){
                // var oModel = this.getView().getModel();  
                // if(oModel == undefined){oModel = this.getOwnerComponent().getModel();}
                // oModel.read("/GetAllTxRepeaters()", {
                //     // eslint-disable-next-line no-undef
                //     success: jQuery.proxy(function (oData) {
                //         console.log(oData);   
                //         var oAllLogList     = JSON.parse(oData.GetAllTxRepeaters), oStatusCount={SubmittedCnt:0, InProcessCnt:0,CompletedCnt:0};
                //         for(let i=0; i<oAllLogList.LogHead.length; i++){
                //             oAllLogList.LogHead[i].reqinput = JSON.parse(oAllLogList.LogHead[i].reqinput);
                //             switch (oAllLogList.LogHead[i].reqtype) {
                //                 case 'D2D':
                //                     oAllLogList.LogHead[i].reqtypedesc = 'Day to Day'; break;  
                //                 case 'M2M':
                //                     oAllLogList.LogHead[i].reqtypedesc = 'Month to Month'; break;  
                //                 case 'Y2Y':
                //                     oAllLogList.LogHead[i].reqtypedesc = 'Year to Year'; break;                            
                //             }
                //             switch (oAllLogList.LogHead[i].reqstatus) {
                //                 case 'Submitted':
                //                     oStatusCount.SubmittedCnt = oStatusCount.SubmittedCnt + 1; break;  
                //                 case 'In Process':
                //                     oStatusCount.InProcessCnt = oStatusCount.InProcessCnt + 1; break;  
                //                 case 'Complete':
                //                     oStatusCount.CompletedCnt = oStatusCount.CompletedCnt + 1; break;                            
                //             }                            
                //         }   
                //         oAllLogList.TotalLogHeadCount = oAllLogList.LogHead.length;
                //         oAllLogList.StatusCount = oStatusCount;
                //         var oJSONModel      = new JSONModel(oAllLogList);
                //         this.getView().setModel(oJSONModel, "TxRLog");
                //         this.getView().getModel("TxRLog").refresh();                       
                //     }).bind(this),
                //     // eslint-disable-next-line no-undef
                //     error: jQuery.proxy(function (oError) {
                //         console.log(oError);
                //         var msg = "Technical error occurred while getting transaction summary logs. Please reach out to adiministrator."
                //         MessageBox.error(msg, {styleClass: "sapUiSizeCompact"});
                //     })
                // });                 
            },

            onRequestSubmit: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("RouteDetail",{LogUUID:"Create"});
            }            
        });
    });
