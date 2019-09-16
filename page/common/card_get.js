var app = getApp();
const store_id = app.store_id;
let uid = wx.getStorageSync('userUid');
let saveNewUrl = 'wxapp.php?c=coupon&a=get_coupon';//保存优化券
let getNewUrl = 'wxapp.php?c=coupon&a=coupon_list_detail';//优惠券详情
let isDoGetCard = false;//是否显示按钮，false显示，true不显示
Page({
  data: {
    showPopup: true,
    showErrMsg: false,
    isTrue: false,
    endTime: '',
    faceMoney: '',
    name: '',
    originalPrice: '',
    startTime: '',
    id: '',
    activityId: '',
    codeFlag: true,//是否显示条形码
    detailData: "",
    lotteryId: null,//大转盘抽奖传过来的参数
    distinguish: false,// 判断是否从卡包进来 0是卡包入口
    source: "",
    page: '',//什么页面过来的，‘index’表示index-new过来用新接口
    qrUrl: null,//核销二维码，线上券没有核销二维码
    abled: true,
  },
  onLoad: function (options) {
    var that = this;
    uid = wx.getStorageSync('userUid');
    let {id} = options;
    that.setData({
      id,uid
    })
    // 请求详情页数据
    let params = {id}
    that.getNewLoad(params)

  },
  /**
   * 首页优惠券领取，接新接口，没有核销二维码
   */
  getNewLoad(params) {
    var that = this;
    app.api.postApi(getNewUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        return;
      }
      var detailData = resp.err_msg;
      detailData.toface_money = parseFloat(detailData.face_money)
      that.setData({
        detailData,
      })
    });
  },

  /**
   * 保存优惠券
   */
  saveCardNew() {
    let that = this;
    var {id,store_id,uid}=this.data;
    var params = { "id":id, "uid": uid }
    wx.showLoading({
      title: '保存优惠券',
    })
    app.api.postApi(saveNewUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        isDoGetCard = true;//isUsedOrGet隐藏按钮
        that.setData({ isDoGetCard });//将按钮隐藏
        // that.setData({ source: false });//将按钮变成立即使用
        if (that.data.lotteryId) {
          that.getLottery();
        }
        // 领取成功
        wx.showModal({
          title: '该优惠券已放进"卡包·待使用"',
          showCancel: false,
          confirmText: '去看看',
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: './mycards'
              })
            } else if (res.cancel) {
              return false;
            }
          }
        })

      } else {
        // 券已经被领完了
        wx.showToast({
          title: resp.err_msg,
          icon: 'none'
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      }
    });
  },

  //关闭弹出层
  colorPopup() {
    this.setData({
      showPopup: false
    })
  },
  getCards() {
    console.log(111)
    this.setData({
      isTrue: true
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    uid = wx.getStorageSync('userUid');
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

})