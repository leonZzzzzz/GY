let app=getApp()
const couponListUrl ='wxapp.php?c=coupon&a=get_coupon_list'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isoff:'',
    uid:'',
    store_id:'',
    couponlist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var isoff=options.isoff
    var store_id=options.store_id
    if (store_id){
      this.setData({ store_id })
    }
    var uid=wx.getStorageSync('userUid')
    this.setData({isoff,uid})
  },
  // 获取优惠券列表
  getcouponList(){
    var {uid,isoff}=this.data
    if(isoff==1){
      var params = { uid: uid, is_platform: 1, store_id:0}
    }else if(isoff==2){
      var params = { uid: uid, is_platform: 0, store_id: this.data.store_id }
    }
    app.api.postApi(couponListUrl,{params},(err,res)=>{
      this.setData({couponlist:res.err_msg.list})
    })
  },
  // 领取优惠券
  receivecoupon(e){
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: './card_get?id='+id,
    })
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
    this.getcouponList()
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