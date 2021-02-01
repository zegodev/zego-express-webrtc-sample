import './assets/bootstrap.min';
import './assets/bootstrap.min.css';
import $ from 'jquery';
import i18n from 'i18next';
import { en, zh } from './assets/translation/translation';

const resources = {
    en: {
        translation: en,
    },
    zh: {
        translation: zh,
    },
};

i18n.init({
    resources,
}).then(t => {
    for (const key in en) {
        $(`.${key}`).html(i18n.t(key));
    }
});

location.search.substr(1).indexOf('lang=en') > -1 ? i18n.changeLanguage('en') : i18n.changeLanguage('zh');

export function getCgi(appId, serverUrl, cgi) {
    // 测试用代码，开发者请忽略
    // Test code, developers please ignore
    let appID = appId;
    let server = serverUrl;
    let cgiToken = cgi;
    let userID = "";
    if (location.search) {
        const arrConfig = location.search.substr(1).split('&');

        arrConfig.forEach(function(item) {
            const key = item.split('=')[0],
                value = item.split('=')[1];

            if (key == 'appid') {
                appID = Number(value);
            }

            if (key == 'server') {
                const _server = decodeURIComponent(value);
                console.warn('server', _server);
                const _serArr = _server.split('|');
                if (_serArr.length > 1) {
                    server = _serArr;
                } else {
                    server = _server;
                }
                console.warn('server', server);
            }

            if (key == 'cgi_token') {
              cgiToken = decodeURIComponent(value);
            }

            if (key == 'user_id') {
              userID = value;
            }
        });
    }
    return { appID, server, cgiToken, userID };
    // 测试用代码 end
    // Test code end
}
