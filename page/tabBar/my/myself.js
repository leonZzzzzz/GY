// var template = require('../../common/template/nav.js');
var app = getApp();
let hasPhone = wx.getStorageSync('hasPhone');
let phone = wx.getStorageSync('phone');
let uid = wx.getStorageSync('userUid');
const _urlFxEn = "wxapp.php?c=fx_user&a=fx_entrance";//计划内容
const impower = "wxapp.php?c=wechatapp&a=my_info";//判断是否获取了用户信息
const getuserinfoUrl ='wxapp.php?c=wechatapp&a=bind_userinfo'//获取用户信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabbar: {},
    uid: uid,
    phone: phone,
    hasPhone: true,//是否有手机login
    isCheck: 1,//是否审核点击，1是 0否
    sid: app.store_id,
    // showDistri: true,
    isInfo: false,
    isheart: true,
    auth:'', 
    cart_count:'', 
    coupon_count:'', 
    user_info:{}
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this
    //检查是否有手机号
    app.checkphone().then(data => {
      if (data.is_phone == 1) {
        var uid = app.config.uid ? app.config.uid : data.uid;
        that.setData({
          hasPhone: false,
          uid: uid,
          phone: data.phone
        })
      }
      app.globalData.uid = uid;
      app.globalData.phone = data.phone;
      wx.setStorageSync('userUid', uid); //存储uid
      wx.setStorageSync('phone', data.phone); //存储uid
    }).catch(data => {
      that.setData({
        hasPhone: true,
      });
    })
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    wx.hideShareMenu();
    var that = this;
    var uid = wx.getStorageSync('userUid');
    var phone = wx.getStorageSync("phone");
    var ismyself = wx.getStorageSync('ismyself')
    wx.removeStorageSync('ismyself')
    if (uid) {
      this.setData({uid,phone})
      var params = { "uid": uid };
      app.api.postApi(impower, { params }, (err, res) => {
        var { auth, cart_count, coupon_count, user_info } = res.err_msg
        this.setData({ auth, cart_count, coupon_count, user_info })
        if (cart_count > 0) {
          wx.setTabBarBadge({//这个方法的意思是，为小程序某一项的tabbar右上角添加文本
            index: 3,   //代表哪个tabbar（从0开始）
            text: cart_count	//显示的内容
          })
        }
        if(auth==0){
          // 如果是刚注册回到我的页面不显示授权弹窗
          if (ismyself!=1){
            this.setData({
              isInfo: true
            })
          }
        }
      })
    }else{
      this.setData({ uid:0, phone })
    }
  },
  // 获取用户信息
  onGotUserInfo(e) {
    console.log(e)
    let that = this;
    var errok = e.detail.errMsg;
    wx.setStorageSync('errok', errok);
    if (e.detail.errMsg == "getUserInfo:ok") {
      that.setData({
        isInfo: true
      });
      let userTimer = setInterval(() => {
        clearInterval(userTimer);
        var params = { "uid": this.data.uid,"userinfo": e.detail.userInfo } 
        wx.showLoading({
          title: '授权中...',
        })
        app.api.postApi(getuserinfoUrl, { params }, (err, res) => { 
          wx.hideLoading();
          this.setData({ isInfo:false}) 
        })
      }, 1000);
    } else {
      that.setData({
        isInfo: false
      });
    }
  },

  // 去登陆
  gologin(){
    wx.setStorageSync('enter','myself')
    wx.navigateTo({
      url: '../../template/getpower',
    })
  },
  // 跳转售后页面
  afterSale(){
    wx.navigateTo({
      url: '../../common/after-sales',
    })
  },
  // 跳转到收藏页面
  gocollect(){
    wx.navigateTo({
      url: '../../common/collect',
    })
  },
  /** 去设置页面*/
  goSetting() {
    wx.navigateTo({
      url: '../../common/setting'
    });
  },
  // 去到我的订单
  goSearch() {
    wx.navigateTo({
      url: '../../common/my-order'
    });
  },
  // 去优惠券
  mycard() {
    wx.navigateTo({
      url: '../../common/mycards'
    });
  },
  // 跳转收货地址
  goaddress(){
    wx.navigateTo({
      url: '../../common/address_list?is_from_my=0',
    })
  },

  // 获取uid
  getUserid() {
    var opt = {
      distri: 3
    }
    wx.setStorageSync("index", opt)
    wx.navigateTo({
      url: '../../common/template/getpower',
    })
  },
  /**手机号脱敏 */
  substring(str) {
    if (typeof str == 'string') { //参数为字符串类型
      let ruten = str.substring(3, 8); //提取字符串下标之间的字符。
      return str.replace(ruten, '*****'); //字符串中用字符替换另外字符，或替换一个与正则表达式匹配的子串。
    }
  },
  showPhone(opt) {
    var phone = opt;
    phone = this.substring(phone);
    this.setData({ phone })
  },


  // 心选分销
  goMoney() {
    console.log(7867)
    let that = this,
      params = {
        uid: this.data.uid,
        store_id: this.data.sid,
        // store_id: 7,
        is_supplier: '1'
      };
    app.api.postApi(_urlFxEn, { params }, (err, rep) => {
      if (rep.err_code == 0) {
        let status = rep.err_msg.status;
        let isCheck = (status == -1 || status == 2 || status == 0) ? 1 : 0;//0审核中，1审核通过，2已经拉黑，-1审核拒绝
        that.setData({ isCheck }, () => {
          if (isCheck != 1) {
            wx.navigateTo({
              url: '../../distribution/moneyIndex?store_id=' + this.data.sid + '&is_supplier=' + 1 + '&title=心选分享'
            })
          } else {
            wx.navigateTo({
              url: '../../distribution/invite?store_id=' + this.data.sid + '&is_supplier=' + 1 + '&title=心选分享'
            });
          }
        })
      } else {
        wx.showToast({
          title: '请先登录账户',
          icon: 'none'
        })
      }
    })
  },
  // 销售跟踪
  market() {
    let that = this,
      params = {
        uid: this.data.uid,
        store_id: this.data.sid,
        is_supplier: '0'
      };
    app.api.postApi(_urlFxEn, { params }, (err, rep) => {
      // if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
      if (rep.err_code == 0) {
        let status = rep.err_msg.status;
        let isCheck = (status == -1 || status == 2 || status == 0) ? 1 : 0;//0审核中，1审核通过，2已经拉黑，-1审核拒绝
        that.setData({ isCheck }, () => {
          if (isCheck != 1) {
            wx.navigateTo({
              url: '../../distribution/moneyIndex?store_id=' + this.data.sid + '&is_supplier=' + 0 + '&title=销售跟踪',
            })
          } else {
            wx.navigateTo({
              url: '../../distribution/invite?store_id=' + this.data.sid + '&is_supplier=' + 0 + '&title=销售跟踪'
            });
          }
        })
      } else {
        wx.showToast({
          title: '请先登录账户',
          icon: 'none'
        })
      }
    })
  },

  gogroup(e) {
    var group = e.currentTarget.dataset.group
    
  },
  goToList(e) {
    var list = e.currentTarget.dataset.list
    
  },
  goStoreServer() {
    
  },
  myGroupGo() {
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})