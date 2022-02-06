using { hxm } from '../db/schema';

@path:'hxm/spmhub/service'
service SPMHubService {

    @Capabilities.FilterRestrictions:{
        Filterable:false,
        
    }
    entity BusinessUnits as projection on hxm.BusinessUnits;

    function VerifyCredentials() returns String(20);

}
