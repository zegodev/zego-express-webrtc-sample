"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./assets/bootstrap.min");
require("./assets/bootstrap.min.css");
function getCgi(appId, serverUrl, cgi) {
    // 测试用代码，开发者请忽略
    // Test code, developers please ignore
    var appID = appId;
    var server = serverUrl;
    var cgiToken = cgi;
    if (location.search) {
        var arrConfig = location.search.substr(1).split('&');
        arrConfig.forEach(function (item) {
            var key = item.split('=')[0], value = item.split('=')[1];
            if (key == 'appid') {
                appID = Number(value);
            }
            if (key == 'server') {
                server = decodeURIComponent(value);
            }
            if (key == 'cgi_token') {
                cgiToken = decodeURIComponent(value);
            }
        });
    }
    return { appID: appID, server: server, cgiToken: cgiToken };
    // 测试用代码 end
    // Test code end
}
exports.getCgi = getCgi;
