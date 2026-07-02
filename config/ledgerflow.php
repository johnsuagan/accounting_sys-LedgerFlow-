<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company Session Keys
    |--------------------------------------------------------------------------
    |
    | The active company tenant is stored in the Laravel session under these
    | keys. Only company_id is authoritative for scoping; role is resolved
    | from the company_users pivot on each request.
    |
    */

    'session' => [
        'company_id' => 'ledgerflow.company_id',
    ],

];
