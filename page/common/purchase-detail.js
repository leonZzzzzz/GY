var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: '',
    theId: '',
    order_no: '',
    status: '',
    statustxt: '',
    phoneTxt: app.config.phoneTxt,
    serverTxt: app.config.serverTxt,
    storeContent: '',
    return_list:[],
  },
  calling() {
    app.calling();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    var theId = options.theId;
    that.setData({ theId })
    // this.setData({ theId, order_no, status, statustxt, storeContent, dis: options.dis, type_txt: options.type_txt, list: lists, heartMsg: options.heartMsg })
  },
  // 获取数据
  getcontent() {
    app.api.postApi('wxapp.php?c=return&a=return_detail', { params: { return_id: this.data.theId } }, (err, resp) => {
      let return_list = resp.err_msg.return_list;
      this.setData({ return_list })
    })
  },
  // 点击图片预览
  previewImg: function (e) {
    var imagelist = [];
    var index = e.currentTarget.dataset.index;
    var return_list = this.data.return_list;
    var imgArr = return_list[0].images
    imgArr.forEach(item => {
      imagelist.push(item);
    })
    console.log(imagelist)
    wx.previewImage({
      current: imagelist[index],     //当前图片地址
      urls: imagelist,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  // 跳转到填写物流信息页面
  gotologis() {
    var id = this.data.return_list[0].id;
    var type = this.data.return_list[0].type;
    wx.navigateTo({
      url: '/page/common/pages/return-log?id=' + id + '&type=' + type,
    })
  },
  goStoreServer() {
    wx.navigateTo({
      url: '../../my/pages/server-wechat'
    });
  },
  // 确认收货
  confimtake() {
    var that = this
    var id = this.data.return_list[0].id;
    app.api.postApi('wxapp.php?c=return&a=return_get_product', { params: { id: id } }, (err, resp) => {
      console.log(resp)
      if (resp.err_code == 0) {
        wx.showModal({
          content: resp.err_msg,
          success(res) {
            if (res.cancel) {

            } else if (res.confirm) {
              that.onShow()
            }
          }
        })
      } else {
        wx.showToast({
          title: resp.err_msg,
        })
      }
    })
  },
  // 查看物流
  checkExpress(e) {
    let { orderid } = e.currentTarget.dataset;
    wx.navigateTo(
      { url: `../../common/pages/logistics?oid=${orderid}` }
    );
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getcontent();
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
    // wx.reLaunch({
    //   url: '../../shopping/pages/order-detail'
    // })
    wx.redirectTo({
      url: '../../common/pages/my-order?list=5'
    });
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