"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./assets/bootstrap.min");
require("./assets/bootstrap.min.css");
var jquery_1 = __importDefault(require("jquery"));
var i18next_1 = __importDefault(require("i18next"));
var translation_1 = require("./assets/translation/translation");
var resources = {
    en: {
        translation: translation_1.en,
    },
    zh: {
        translation: translation_1.zh,
    },
};
i18next_1.default.init({
    resources: resources,
}).then(function (t) {
    for (var key in translation_1.en) {
        jquery_1.default("." + key).html(i18next_1.default.t(key));
    }
});
location.search.substr(1).indexOf('lang=en') > -1 ? i18next_1.default.changeLanguage('en') : i18next_1.default.changeLanguage('zh');
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
