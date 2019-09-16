let app=getApp()
var applyUrl ='wxapp.php?c=return&a=listOfReturn_v2'//获取售后列表
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    uid:'',
    return_list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid=wx.getStorageSync('userUid')
    this.setData({uid})
    this.getReturnList()
  },
  // 获取售后列表
  getReturnList(){
    var {uid,page}=this.data
    var params = { uid: 142994,page}
    app.api.postApi(applyUrl,{params},(err,res)=>{
      if(res.err_code==0){
        this.setData({ return_list: res.err_msg.return_list})
      }
    })
  },
  // 查看详情
  goDetail(e){
    var returnid = e.currentTarget.dataset.returnid
    wx.navigateTo({
      url: './purchase-detail?theId=' + returnid,
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