import './assets/bootstrap.min';
import './assets/bootstrap.min.css';

export function getCgi(appId: number, serverUrl: string, cgi: string, tokenUrl: string) {
    // 测试用代码，开发者请忽略
    // Test code, developers please ignore
    let appID: number = appId;
    let server: string = serverUrl;
    let cgiToken: string = cgi;
    if (location.search) {
        const arrConfig = location.search.substr(1).split('&');

        arrConfig.forEach(function(item) {
            const key = item.split('=')[0],
                value = item.split('=')[1];

            if (key == 'appid') {
                appID = Number(value);
            }

            if (key == 'server') {
                server = decodeURIComponent(value);
            }

            if (key == 'cgi_token') {
                cgiToken = decodeURIComponent(value);
                if (cgiToken && tokenUrl == 'https://wsliveroom-demo.zego.im:8282/token') {
                    $.get(cgiToken, rsp => {
                        cgiToken = rsp.data;
                        console.log(cgiToken);
                    });
                }
            }
        });
    }
    return { appID, server, cgiToken };
    // 测试用代码 end
    // Test code end
}
