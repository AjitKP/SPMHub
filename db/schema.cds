namespace hxm;
using {managed, cuid } from '@sap/cds/common';

entity BusinessUnits {
    //tenantid                :Integer;
    key businessUnitSeq :Integer;
    virtual processingUnit  :Integer;
    virtual name            :String;
    virtual description     :String;
}

entity SpmHubRequestLog : cuid, managed {
    reqtype: String(20);
    tenantid: String(10);
    reqstatus : String(20);
    requser: String(100);
    reqemail: String(100);
    reqinput: String;
}

entity SpmHubRequestLogItem : cuid, managed {
    loguuid : UUID;
    itemtype: String(20);
    itemmessage: String(1024);
    itemdata : String;
}
