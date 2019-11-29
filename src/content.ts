import './assets/bootstrap.min';
import './assets/bootstrap.min.css';

// export function getCgi(tokenUrl: string) {
// 	// 测试用代码，开发者请忽略
// 	// Test code, developers please ignore
// 	if (location.search) {
// 		const arrConfig = location.search.substr(1).split('&');
// 		let appId: number;
// 		let server: string;
//     let cgiToken: string;

// 		arrConfig.forEach(function(item) {
// 			const key = item.split('=')[0],
// 				value = item.split('=')[1];

// 			if (key == 'appid') {
// 				appId = Number(value);
// 			}

// 			if (key == 'server') {
// 				server = decodeURIComponent(value);
// 			}

// 			if (key == 'cgi_token') {
// 				cgiToken = decodeURIComponent(value);
// 				if (cgiToken && tokenUrl == 'https://wsliveroom-demo.zego.im:8282/token') {
// 					$.get(cgiToken, (rsp) => {
// 						cgiToken = rsp.data;
// 						console.log(cgiToken);
// 					});
// 				}
// 			}
// 		});

// 		return {appId, server, cgiToken};
// 	}
// 	// 测试用代码 end
// 	// Test code end
// }
