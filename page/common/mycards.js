let app = getApp();
var _tapLock = false;    // 点击锁
const categoryUrl = 'wxapp.php?c=coupon&a=my';//优惠券

Page({
  data: {
    type:'unused',
    store_id: '',
    uid: '',
    page:1,
    list:[],
    loadingone:false
  },

  onLoad: function (options) {
    var that = this;
    var store_id = app.store_id;//store_id
    var uid = wx.getStorageSync('userUid');

    that.setData({ uid: uid, store_id: store_id });
    that.loadData();
  },
  //加载页面数据
  loadData: function () {
    let that = this;
    let { store_id, uid,page,type } = that.data;
    wx.showLoading({
      title: 'loading...',
    })
    var params = { "page": this.data.page, "uid": uid, "keyword": "", "type": type }
    app.api.postApi(categoryUrl, { params }, (err, res) => {
      wx.hideLoading();
      if (res.err_code != 0) { that.setData({ refreshone: true }); return; }
      var { coupon_list = [],next_page } = res.err_msg;
      var list = this.data.list;
      coupon_list.forEach(item => {
        list.push(item)
      })
      //更新数据
      that.setData({
        loadingone: next_page,
        refreshone: false,
        offlineData: list,
      });
    });
  },
  // 点击切换优惠券类型
  swichSwiperItem(e){
    var type=e.currentTarget.dataset.type;
    this.setData({type})
    this.getoneData()
  },
  // 加载第一页数据
  getoneData(){
    let that = this;
    let { store_id, uid, page, type } = that.data;
    wx.showLoading({
      title: 'loading...',
    })
    var params = { "page": 1, "uid": uid, "keyword": "", "type": type }
    app.api.postApi(categoryUrl, { params }, (err, res) => {
      wx.hideLoading();
      if (res.err_code == 0) {
        var { coupon_list = [], next_page } = res.err_msg;
      }else{
        var  coupon_list=[]
      }
     
      //更新数据
      that.setData({
        loadingone: next_page,
        refreshone: false,
        offlineData: coupon_list,
      });
    });
  },

  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {

  },
  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    var {loadingone,page}=this.data
    if (loadingone){
      this.data.page++;
      this.loadData()
    }else{
      wx.showToast({
        title: '加载完毕',
        icon:'none'
      })
    }
  },
  goAll(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    let store = e.currentTarget.dataset.store;
    let package_id = this.data.offlineData[index].package_id;
    wx.navigateTo({
      url: `./allcard?package_id=${package_id}&store_id=${store}&index=${index}`,
    })

  },
  closeOverlay: function () {
    this.setData({ showOverlay: false });
  },
  showCheckQr: function (event) {
    let qrUrl = event.currentTarget.dataset.qrImageUrl;
    this.setData({ qrImageUrl: qrUrl, showOverlay: true });
  },


  goHistory(e) {
    wx.navigateTo({
      url: './mycardHistory?store_id=' + app.store_id
    })
  },
  goDetail(e) {
    console.log(e)
    // 判断是品台券还是商户券
    var isplat = e.currentTarget.dataset.isplat;
    var store_id = e.currentTarget.dataset.storeid;
    if(isplat==1){
      wx.switchTab({
        url: '../tabBar/home/index-new',
      })
    }else{
      wx.navigateTo({
        url: './wholesaler?store_id=' + store_id,
      })
    }
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
    wx.showActionSheet({
      itemList: ['删除卡券'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex === 0) {   // 确认删除
          console.log('删除');
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    });
  }
})