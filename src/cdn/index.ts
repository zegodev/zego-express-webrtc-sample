import '../common';
import { checkAnRun, logout, publishStreamId, zg } from '../common';
import { getBrowser } from '../assets/utils';
import flvjs from 'flv.js';

$(async () => {
    await checkAnRun();
    $('#cdnAddPush').click(async () => {
        const result = await zg.addPublishCDNURL(publishStreamId, $('#cdnPushUrl').val() + publishStreamId);
        if (result.errorCode == 0) {
            console.warn('add push target success');
        } else {
            console.warn('add push target fail ' + result.errorCode);
        }
    });

    $('#cdnDelPush').click(async () => {
        const result = await zg.removePublishCDNURL(publishStreamId, $('#cdnPushUrl').val() + publishStreamId);
        if (result.errorCode == 0) {
            console.warn('del push target success');
        } else {
            console.warn('del push target fail ' + result.errorCode);
        }
    });

    $('#cdnClearPush').click(async () => {
        const result = await zg.clearPublishCDNURL(publishStreamId, $('#cdnPushUrl').val() + publishStreamId);
        if (result.errorCode == 0) {
            console.warn('clear push target success');
        } else {
            console.warn('clear push target fail ' + result.errorCode);
        }
    });
});
