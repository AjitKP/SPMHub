namespace hxm;
using {managed} from '@sap/cds/common';

entity BusinessUnits {
    //tenantid                :Integer;
    key businessUnitSeq :Integer;
    virtual processingUnit  :Integer;
    virtual name            :String;
    virtual description     :String;
}

entity SpmHubRequest : managed {
    @Core.Computed:true
    requestid : UUID;
    reqdescr : String(200);
    effstdate : Date;
    reqstatus : String(50);
}
