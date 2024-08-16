"use strict";
exports.__esModule = true;
/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
var serverBase_1 = require("./serverBase");
var SERVER_PORT = 8081;
// try to read from environment variable to check if the users have set up a specific port to use
try {
    var customPort = parseInt(process.env.AZURE_IOT_EXPLORER_PORT); // tslint:disable-line:radix
    if (isNaN(customPort)) {
        customPort = SERVER_PORT;
    }
    (new serverBase_1.ServerBase(customPort || SERVER_PORT)).init();
}
catch (_a) {
    (new serverBase_1.ServerBase(SERVER_PORT)).init();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyRWxlY3Ryb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVyL3NlcnZlckVsZWN0cm9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs0REFHNEQ7QUFDNUQsMkNBQTBDO0FBRTFDLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQztBQUN6QixpR0FBaUc7QUFDakcsSUFBSTtJQUNBLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyw0QkFBNEI7SUFDNUYsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDbkIsVUFBVSxHQUFHLFdBQVcsQ0FBQztLQUM1QjtJQUNELENBQUMsSUFBSSx1QkFBVSxDQUFDLFVBQVUsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3REO0FBQ0QsV0FBTTtJQUNGLENBQUMsSUFBSSx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDeEMifQ==