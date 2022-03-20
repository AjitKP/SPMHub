using { hxm } from '../db/schema';

@path:'hxm/spmhub/service'
service SPMHubService {

    @Capabilities.FilterRestrictions:{
        Filterable:false        
    }
    entity BusinessUnits as projection on hxm.BusinessUnits;
    entity SpmHubRequest as projection on hxm.SpmHubRequest;

    function VerifyCredentials() returns String(20);
    action TransactionRepeater (OpType:String, ProcessingUnitSeq:String, Currency:String, FromTime:String, ToTime:String) returns String(200);

}
