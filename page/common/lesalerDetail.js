let app = getApp();
const detailUrl ='wxapp.php?c=store&a=detail'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    store_id:'',
    detailData:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({store_id:options.store_id})
    this.getDetailList()
  },
  getDetailList(){
    app.api.postApi(detailUrl, { params:{store_id:this.data.store_id} },(err,res)=>{
      this.setData({detailData:res.err_msg.data})
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