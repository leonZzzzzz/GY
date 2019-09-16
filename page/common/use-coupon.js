var app = getApp();
var _tapLock = false;    // 点击锁
Page({
  data: {
    loading: true,
    status: true,
    windowHeight: '',
    windowWidth: '',
    msgList: [],
    usedMsg: [],
    expiredMsg: [],
    scrollTop: 0,
    scrollHeight: 0,
    pagesone: 1,
    pagestwo: 1,
    pagesthree: 1,
    dataStatus: 0,
    normal_coupon_count: 0, //可用优惠券数量
    unnormal_coupon_count: 0, //不可用优惠券数量
    thetype: false,
    borId: '',
    cname: '',
    couponid: '',
    face_money: 0,
    index: '',
    recid: '',
    couponInfo: [],
    uid: '',
    store_id:'',
    showSuccessModal: false,//显示成功模态框
    zhang: 0,
    lastPay: '',
    pro_price: '',
  },

  onLoad: function (options) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    this.setData({ uid, store_id:options.store_id });
    that.setData({ curSwiperIdx: 0, curActIndex: 0, pro_price: options.pro_price });
    // 自动获取手机宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    var pro_price = options.pro_price;//商品总价
    var product_id = options.product_id;//商品总id
    that.loadCouponData();
  },
  loadCouponData: function () {
    var that = this;
    var store_cart_id = wx.getStorageSync('store_cart')
    store_cart_id = JSON.parse(store_cart_id)
    wx.showLoading({
      title: '加载中'
    })
    var params = {
      "store_id":this.data.store_id,
      "uid": that.data.uid,
      "is_cart":1,
      "store_cart_id": store_cart_id,
    };

    var url = 'wxapp.php?c=coupon&a=store_coupon_use';
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) { that._showError(err || resp.err_msg); return; }
      var data = resp.err_msg.data
      if (resp.err_msg.data) {
        var normal = data[0].list.normal_coupon_list;
        var expired = data[0].list.unnormal_coupon_list;
        var normal_coupon_count = data[0].list.normal_coupon_count
        var unnormal_coupon_count = data[0].list.unnormal_coupon_count
        var bor = wx.getStorageSync('borId')
        var face = wx.getStorageSync('face_money')
        var a = { select: 0, id: '1001', cname: '', face_money: '', coupon_id: '' }
        if (normal.length > 0) {
          normal.unshift(a)
        }
        normal.forEach(item => {
          console.log(item.select)
          if (bor) {
            this.setData({ borId: bor, zhang: 1, face_money: face })
          } else {
            if (item.select == 1) {
              console.log(item.face_money)
              this.setData({ borId: item.id, cname: item.cname, face_money: item.face_money, zhang: 1 })
            }
          }
        })
        //更新数据
        that.setData({
          loading: false,
          normal: normal,
          expired: expired,
          normal_coupon_count,
          unnormal_coupon_count,
        });
        console.log(normal)
      }
    });
  },
  goChooseCard(e) {
    var that = this;
    console.log(e, 'e')
    var index = e.currentTarget.dataset.index;
    let recId = e.currentTarget.dataset.recid;
    var normal = that.data.normal;
    var borId = normal[index].id;
    wx.setStorageSync('borId', borId)
    let couponid = e.currentTarget.dataset.couponid;
    let cname = e.currentTarget.dataset.cname;
    let face_money = e.currentTarget.dataset.face_money;
    wx.setStorageSync('face_money', face_money)
    that.setData({
      borId,
      recid: recId,
      index: index,
      face_money: face_money,
      cname: cname,
      couponid: couponid,
      zhang: 1
    })

  },
  goConfirm(e) {
    console.log(e)
    var that = this;
    var cname = e.currentTarget.dataset.cname;
    console.log(cname, this.data.cname)
    var couponid = e.currentTarget.dataset.couponid;
    var face_money = e.currentTarget.dataset.face_money;
    var pro_price = that.data.pro_price;
    var index = e.currentTarget.dataset.index;
    var recid = e.currentTarget.dataset.recid;
    console.log('1', recid, '2', this.data.borId)
    if (recid) {
      if (recid == '1001') {
        recid = ''
      } else {
        recid = recid;
      }
    } else {
      recid = this.data.borId
      // cname = this.data.cname
      cname = cname
      face_money = this.data.face_money
    }
    console.log(parseFloat(pro_price), face_money)
    // if (parseFloat(pro_price)< face_money) {
    //   wx.showModal({
    //     title: '',
    //     content: '优惠券金额必须小于付款金额',
    //     success: function (res) {
    //       if (res.cancel) {
    //         //点击取消,默认隐藏弹框
    //       } else {
    //         //点击确定
    //         wx: wx.navigateBack({
    //           delta: 1,
    //         })
    //       }
    //     }
    //   })
    // }else{
    var couponInfo = [];
    if(face_money){
      var select = 1
      couponInfo.push(recid); //要是的我的优惠券记录id而不是优惠券的id
      couponInfo.push(cname);
      couponInfo.push(face_money);
      couponInfo.push(this.data.store_id);
      couponInfo.push(select);
    }else{
      var select=2
      couponInfo.push(recid); //要是的我的优惠券记录id而不是优惠券的id
      couponInfo.push(cname);
      couponInfo.push(face_money);
      couponInfo.push(this.data.store_id);
      couponInfo.push(select);
    }
    wx.setStorageSync('couponInfo', couponInfo)
    that.setData({
      couponInfo: couponInfo
    })
    wx: wx.navigateBack({
      delta: 1,
    })
    // }
  },
  goDetails() {
    this.showModal('success');
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  // 滑动切换
  swiperChange: function (event) {
    var that = this;
    this.setData({
      curActIndex: event.detail.current,
      dataStatus: event.detail.current
    });
  },
  // 点击切换
  swichSwiperItem: function (event) {
    var that = this;
    this.setData({
      curSwiperIdx: event.target.dataset.idx,
      curActIndex: event.target.dataset.idx,
      dataStatus: event.target.dataset.idx
    });
  },


  closeOverlay: function () {
    this.setData({ showOverlay: false });
  },
  showCheckQr: function (event) {
    let qrUrl = event.currentTarget.dataset.qrImageUrl;
    this.setData({ qrImageUrl: qrUrl, showOverlay: true });
  },
  scroll: function (event) {
    var that = this;
    that.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  //加载页面数据
  gotoDetail(e) {
    if (_tapLock) return;
    console.log(this.tabLock);
    let param = e.currentTarget.dataset.urlParam;
    let checkQrImgUrl = e.currentTarget.dataset.qrUrl;
    wx.setStorageSync('checkQrImgUrl', checkQrImgUrl);
    wx.navigateTo({
      url: '../card/card_summary?' + param
    })
  },
  pullUpLoadone(e) {
    return;//不需要这个东西 2017年12月25日10:01:39 by leo
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function () {
      var pagesone = that.data.pagesone;
      pagesone++;
      that.setData({
        pagesone: pagesone
      })
      that.loadData1(that);
      wx.hideLoading()
    }, 1000)
    // 上拉加载结束 
  },
  pullUpLoadonetwo(e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function () {
      var pagestwo = that.data.pagestwo;
      pagestwo++;
      that.setData({
        pagestwo: pagestwo
      })
      that.loadData2(that);
      wx.hideLoading()
    }, 1000)

    // 上拉加载结束 
  },
  pullUpLoadthree(e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function () {
      var pagesthree = that.data.pagesthree;
      pagesthree++;
      that.setData({
        pagesthree: pagesthree
      })
      that.loadData3(that);
      wx.hideLoading()
    }, 1000)
    // 上拉加载结束
  },
  /**
   * 长按删除
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  deleteCard(e) {
    _tapLock = true;
    let recId = e.currentTarget.dataset.recid;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认删除卡券',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          app.api.postApi('card/deleteCardRecord', { recId: recId }, (err, response) => {
            if (err) return;
            let { rtnCode } = response;
            let tip = '';
            if (rtnCode != 0) {
              tip = '系统繁忙，删除失败。';
            } else {
              tip = '删除成功';
            }
            wx.showToast({
              title: tip,
            });
            that.loadData();
            wx.hideLoading();
          });


        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
      complete: () => _tapLock = false

    });

  },

  /**
  * 显示模态框
  */
  showModal(type = 'err', config) {  // type: success||err
    var successModalConfig = {
      image: '../../image/conupon-img.png',
      title: '优惠券使用说明',
      firstText: '1、通用券和指定券不能同时使用',
      secondText: '2、当券的金额大于订单应付金额时，差额不予退还。',
      threeText: '3、通用券和指定券都不能叠加使用。',
      confirmText: '确定'
    }
    if (type === 'success') {
      successModalConfig = Object.assign(successModalConfig, config);
      this.setData({
        successModalConfig: successModalConfig,
        showSuccessModal: true
      });
    } else {
      errModalConfig = Object.assign(errModalConfig, config);
      this.setData({
        errModalConfig: errModalConfig,
        showErrModal: true
      });
    }
  },

  /**
   * 点击隐藏模态框(错误模态框)
   */
  tabModal() {
    this.setData({ showErrModal: false });
  },

  /**
   * 点击模态框的确定(关闭确定模态框)
   */
  tabConfirm() {
    this.setData({ showSuccessModal: false });
  },
})