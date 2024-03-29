const md5 = require('./md5.js');
import __config from '../config.js';
const HOST = __config.host;
const IS_PARAMS = __config.isParams;
const AGENT_ID = 2;
function signUrl(url, tokenId, secretKey, timestamp) {
  if (!url) url = '';
  // TODO: 有bug，参数里带有=号，会被split掉
  let params = url.split('&').filter(x => x[0] != '_').sort().join('').split('=').join('') + '';
  params = params + timestamp + tokenId + secretKey;
  console.debug('排序后请求参数：%s', params);
  let sign = md5(params);
  console.debug('签名: %s', sign);
  return sign;
}

let ajax = {
  // GET 方式请求，要自己拼装URL参数
  fetchApi(url, callback) {
    let timestamp = parseInt(new Date().getTime() / 1000) + '';
    let pos = url.indexOf('?') + 1;
    let urlparams = pos === 0 ? '' : url.substring(pos);
    let sign = signUrl(urlparams, timestamp);
    let header = { 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };

    wx.request({
      url: `${HOST}${url}`,
      data: {},
      header: header,
      success(res) {
        typeof callback === 'function' && callback(null, res.data, res.statusCode)
      },
      fail(e) {
        typeof callback === 'function' && callback(e)
      }
    })
  },
  // POST 方式请求
  postApi(url, params, callback) {//模块化
    let formdata = '';
    for (var key in params) {
      formdata += '&' + key + '=' + params[key];
    }
    let timestamp = parseInt(new Date().getTime() / 1000) + "";
    let sign = signUrl(formdata, timestamp);
    let header = { 'Content-Type': 'application/json', 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };
    wx.request({
      url: `${HOST}${url}`,
      data: params,
      method: 'POST',
      header: header,
      success(res) {
        if (params && IS_PARAMS) {
          console.log("请求: " + url + " 传参: " + JSON.stringify(params) + " 返回：" + JSON.stringify(res.data));
        }
        typeof callback === 'function' && callback(null, res.data, res.statusCode)
      },
      fail(e) {
        if (params && IS_PARAMS) {
          console.log("请求！！: " + url + " 传参: " + JSON.stringify(params) + " 异常返回：" + JSON.stringify(e));
        }
        typeof callback === 'function' && callback(e)
      }
    })
  }

}
module.exports = ajax;