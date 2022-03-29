using { hxm } from '../db/schema';

@path:'hxm/spmhub/service'
@(restrict: [{ to: 'SPMHubUser' }])
service SPMHubService {

    entity BusinessUnits as projection on hxm.BusinessUnits;
    entity SpmHubRequest as projection on hxm.SpmHubRequest;

    function VerifyCredentials() returns String(20);
    function GetUserInfo() returns String;
    function GetAllLogs() returns String;
    function GetLogsByUUID(LogUUID:String) returns String;
    function GetAllTxRepeaters() returns String;
    action TransactionRepeater (OpType:String, ProcessingUnitSeq:String, BusinessUnit:String, Currency:String, FromTime:String, ToTime:String, ReqEmail:String, ReqUser:String) returns String(200);

}
