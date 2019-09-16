
import __config from './config'
import ajax from './utils/api_1'
import { getLocation } from './utils/util'
import WxService from './utils/WxService'
App({
  onShow(options) {
    console.log(options)
    var scene = options.scene;//代表从何处进入小程序的。代表小程序的入口场景值。目前仅可以在 App 的 onlaunch 和 onshow 中获取上述场景值
    // this.autoUpdate();//发布了新的小程序后可以自行更新
  },
  onLaunch: function () {
    // console.log = () => { }//不顯示打印內容
    // if (!__config.uid) { wx.removeStorageSync("userUid"); }
    // getLocation();
    // this.getTelWx();
    this.getcartNum()
  },
  api: ajax,
  store_id: __config.sid,
  edema: __config.edema,
  isheart: true,
  WxService: new WxService,
  config: __config,
  cartNum:'0',
  list: [

  ],
  catfid:'',
  globalData: {
    isBtnStatus: {
      login: '0',
      NetworkStatus: '0',
    },
    code: null,
    userInfo: null,
    sessionKey: null,
    phone: null,
    openid: null,
    uid: null, //用户id
    sid: __config.sid, //商店id
    logLat: null, //当前位置
    formIds: [], //消息推送id,
  },

  // 获取购物车数量
  getcartNum(uid){
    var uid = wx.getStorageSync('userUid');
    var that = this;
    that.api.postApi('wxapp.php?c=cart&a=number',{params:{uid:uid?uid:0}},(err,res)=>{
      if(res.err_code==0){
        that.cartNum=res.err_msg.data
        wx.setStorageSync('cartNum', res.err_msg.data)
      }
    })
  },
  checkphone: function () {
    let that = this;
    let uid = wx.getStorageSync('userUid');
    if (uid) {
      console.log('已经有uid了,不弹窗');
      return new Promise(resolve => {
        var opts = { is_phone: 1, uid: uid, openid: wx.getStorageSync('openid'), phone: wx.getStorageSync('phone') }
        resolve(opts);
      });
    }
    //1、登录
    return new Promise((resolve, reject) => {
      that.WxService.login()
        .then(data => {
          console.log('jscode', data);
          that.globalData.code = data.code;
          var params = {
            "jscode": data.code,
          };
          // 2、获取sessionkey
          return that.getSessionkey(params);
        }).then(data => {
          console.log('获取sessionkey', data);
          that.globalData.sessionKey = data.session_key;
          that.globalData.openid = data.openid;
          wx.setStorageSync('sessionKey', data.session_key);
          wx.setStorageSync('openid', data.openid);
          var params = {
            "store_id": __config.sid,
            "openid": data.openid
          }
          // 3、是否绑定手机
          // return that.checkPhone(params)
        })
        // .then(data => {
        //   resolve(data);
        // }).catch(data => {
        //   reject(data)
        // })
    })
  },
  login: function (__opts) {
    console.log('弹窗登陆。。。');
    let that = this, uid = null;
    let iv = __opts.iv, encryptedData = __opts.encryptedData, key = that.globalData.sessionKey;
    var params = { "session_key": key, iv, encryptedData};
    return that.getPhone(params)
      .then(data => {
        console.log(data)
        that.globalData.phone = data.phone;
        wx.setStorageSync('phone', data.phone);
        var params = {
          "openid": that.globalData.openid,
          "phone": data.phone
        }
        return that.iswhether(params);
        // return data.phone
      }).then(data => {
        console.log(data)
        that.globalData.uid = data.uid;
        //绑定门店
        if (__opts.locationid) {
          var opts = {
            store_id: __config.sid,
            item_store_id: __opts.locationid,
            uid: data.uid
          }
          that.bingUserScreen(opts);
        }
        return data;
      })
  },
  // 是否授权用户信息
  iswhether(params){
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('auth', params);
      that.api.postApi(__config.isgetDetail, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_code == 0) {
          resolve(rep.err_msg);
          wx.setStorageSync('userUid', rep.err_msg.uid)
          that.getcartNum()
        }
      })
    })
  },
  autoUpdate: function () {
    console.log(new Date())
    var self = this
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      //1. 检查小程序是否有新版本发布
      updateManager.onCheckForUpdate(function (res) {
        console.log(res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //2. 小程序有新版本，则静默下载新版本，做好更新准备
          updateManager.onUpdateReady(function () {
            console.log(new Date())
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  //3. 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                } else if (res.cancel) {
                  //如果需要强制更新，则给出二次弹窗，如果不需要，则这里的代码都可以删掉了
                  wx.showModal({
                    title: '温馨提示~',
                    content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
                    success: function (res) {
                      self.autoUpdate()
                      return;
                      //第二次提示后，强制更新                      
                      if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                      } else if (res.cancel) {
                        //重新回到版本更新提示
                        self.autoUpdate()
                      }
                    }
                  })
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  /**
  *1、 获取sessionkey
  */
  getSessionkey: function (params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('key-params', params);
      wx.showLoading({
        title: '加载中',
      })
      that.api.postApi(__config.sessionUrl, {
        params
      }, (err, rep) => {
        wx.hideLoading();
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_code == 0) {
          resolve(rep.err_msg);
        }
      })
    })
  },
  /**
   *2、 判断用户是否已经绑定了手机号码
   */
  checkPhone(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('ppone--params', params);
      that.api.postApi(__config.checkBingUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0 || rep.err_msg.is_phone == 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_msg.is_phone == 1) {
          resolve(rep.err_msg);
          wx.setStorageSync('userUid', rep.err_msg.uid)
          that.getcartNum()
        }
      })
    })
  },
  /**
 *3、 如果没有绑定手机，调用小程序的授权获取手机号码
 */
  getPhone(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('checkPhone--params', params);
      wx.showLoading({
        title: '加载中',
      })
      that.api.postApi(__config.getPhoneUrl, {
        params
      }, (err, rep) => {
        wx.hideLoading();
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_code == 0) {
          resolve(rep.err_msg);
        }
      })
    })
  },
  /**
   * 4、获取到手机号码之后，开始第四个接口，创建用户，返回uid
   */
  loginNew(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('login--params', params);
      that.api.postApi(__config.loginNewUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_code == 0) {
          resolve(rep.err_msg);
          wx.setStorageSync('userUid', rep.err_msg.uid)
          that.getcartNum()
        }
      })
    })
  },
  /**
   * 5、绑定用户归属门店
   */
  bingUserScreen(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('bingUserScreen--params', params);
      that.api.postApi(__config.bingScreenUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg.err_log)
        }
        if (rep.err_code == 0) {
          console.log(rep.err_msg.result);
          wx.removeStorageSync('locationid');
        }
      })
    })
  },
  getTelWx: function () {
    let that = this;
    let params = { store_id: that.store_id };
    that.api.postApi(that.config.getTelWxUrl, { params }, (err, res) => {
      if (res.err_code == 0) {
        //客服电话
        that.config.serverPhone = res.err_msg.TelnWx.service_tel;

        //客服电话txt
        that.config.phoneTxt = res.err_msg.TelnWx.service_tel.replace(/(.{3})/g, "$1-");
        // that.config.phoneTxt = res.err_msg.TelnWx.service_tel;

        //客服微信
        that.config.serverTxt = res.err_msg.TelnWx.service_weixin;
      }
    })
  },
  /**
   * 拨打电话
   */
  // calling: function (phone = __config.serverPhone) {
  //   wx.makePhoneCall({
  //     phoneNumber: phone,
  //     success: function () {
  //       console.log("拨打电话成功！")
  //     },
  //     fail: function () {
  //       console.log("拨打电话失败！")
  //     }
  //   })
  // },
  /**
   **推送消息
   *formId  获取form的ids数组
   */
  pushId(e) {
    console.info('form提交..... ', e.detail);
    var that = this;
    return new Promise((resolve, reject) => {
      var uid = wx.getStorageSync('userUid');
      if (uid == undefined || uid == '') {
        // wx.switchTab({
        //   url: './page/tabBar/home/index-new',
        // })
        // console.error('uid为空');
        // reject('uid为空');
      } else {
        that.globalData.uid = uid;
      }
      let { detail: { formId = '' } } = e;
      let timeStamp = Date.parse(new Date()) / 1000;//时间戳
      if (formId.includes('formId')) {
        reject('要使用手机调试才有formId！');
        return;
      };

      if (formId == '') { reject('formId不能为空'); return; }
      // let re = new RegExp(/\d{13}$/g);
      // if (!re.test(formId)) { reject('formId不符合要求'); return;}
      let ids = [];
      ids.push({
        timeStamp,
        token: formId,
      })
      console.info('form提交.....ids ', ids);
      resolve(ids);
    })
  },
  /**
   * 将form的formid保存到数据库
   */
  saveId: function (formIds) {
    console.log("formIds", formIds)
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: './page/tabBar/home/index-new',
      })
      console.error('uid为空');
      return;
    } else {
      that.globalData.uid = uid;
    }
    if (!formIds || formIds.length == 0) {
      wx.showToast({
        title: '推送消息失败，无formIds',
      });
      return;
    };
    let arr = [];
    if (formIds.length > 1) {
      for (var i in formIds) {
        var item = formIds[i];
        if (item.timeStamp != undefined && item.token != undefined && item.timeStamp != '' && item.token != '') {
          arr.push(item);
          break;
        }
      };
    }
    let arr2 = arr.length > 0 ? arr : formIds;
    var params = {
      "uid": uid,
      "sid": that.globalData.sid,
      "tokens": arr2
    }
    console.log('submit params', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=formid_save', {
      params
    }, (err, rep) => {
      console.log('submit ', rep);
      if (err && rep.err_code != 0) {
        console.error(err || rep.err_msg)
      };
    });
  },
  /**推送模板消息 */
  send: function (order_no) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: './page/tabBar/home/index-new',
      })
      console.error('uid为空');
      return;
    } else {
      that.globalData.uid = uid;
    }
    var params = {
      "uid": uid,
      "sid": that.globalData.sid,
      order_no
    };
    console.info('send.......', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=send', {
      params
    }, (err, rep) => {
      if (err || rep.err_code != 0) {
        console.log(err || rep.err_msg);
        console.error(err || rep.err_msg);
        return;
      }
    })
  },
  //弹窗提示参团信息
  loadJumpPin() {
    var that = this;
    var params = {
      "num": 4,//显示数据量 只需返回四条数据
      "store_id": that.store_id
    };
    return new Promise(resolve => {
      that.api.postApi(__config.jumpintuanUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          //console.error(err || rep.err_msg);
          return;
        } else {
          resolve(rep.err_msg);
        }
      })
    })
  },
  //生成二维码图片
  creatImg(id, that, isFx) {
    if (that.data.product) {
      var store = that.data.product.store_id;
    } else {
      var store = that.data.detail.store_id;
    }

    var is_supplier = '';
    if (store == 7) {
      is_supplier = '1'
    } else {
      is_supplier = '0'
    }
    var params;
    var url = 'wxapp.php?c=promote&a=wxapp_qrcode_v2';
    // var url = 'wxapp.php?c=promote&a=wxapp_qrcode';
    // 二维码类型: 1 推广商品的二维码 2 发展下级分销员的二维码 3 普通商品二维码 4 拼团商品的二维码
    if (id) {
      if (that.data.isFx == 1) {
        params = { "uid": that.data.uid, "store_id": that.data.store_id, "type": 1, "product_id": id, "is_supplier": is_supplier };
      }
      if (that.data.isFx == 0) {
        params = { "uid": that.data.uid, "store_id": that.data.store_id, "type": 3, "product_id": that.data.product_id, "is_supplier": is_supplier };
      }
      if (that.data.isFx == 2) {
        params = { "uid": that.data.uid, "store_id": that.data.store_id, "type": 4, "product_id": that.data.product_id, "is_supplier": "0", "tuanId": that.data.tuanId }
      }
      if (that.data.isFx == 3) {
        params = { "uid": that.data.uid, "store_id": that.data.store_id, "type": 5, "is_supplier": that.data.is_supplier }
      }
    } else {
      params = { "uid": that.data.uid, "store_id": that.data.store_id, "type": 2, "is_supplier": is_supplier };
    }
    // }
    return new Promise((resolve, reject) => {
      this.api.postApi(url, { params }, (err, res) => {
        console.log(res)
        if (res.err_code == 0) {
          resolve(res.err_msg.url);
        } else {
          wx.showToast({
            title: res.err_msg,
            icon: 'none'
          })
          // return;
          // console.error(err || res.err_msg);
          // reject(res.err_msg);
        }
      })
    })
  },

})