let app=getApp()
const orderDetailUrl ='wxapp.php?c=wxapp_order&a=order_detail'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var order_id = options.order_id
    this.setData({order_id:order_id})
    
  },
  // 详情
  getOrderDetail(){
    app.api.postApi(orderDetailUrl,{params:{order_id:this.data.order_id}},(err,res)=>{
      if(res.err_code==0){
        
      }
    })
  },
  // 申请售后
  applySales(){
    wx.navigateTo({
      url: './apply-sales',
    })
  },
  // 去评分
  gograde(){
    wx.navigateTo({
      url: './grade',
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
    this.getOrderDetail()
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