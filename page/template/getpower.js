let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasPhone:true
  },
  // 腾讯注册获取电话，uid
  getPhoneNumber(e) {
    let that = this;
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      var iv = e.detail.iv
      var encryptedData = e.detail.encryptedData
      var params = {
        iv,
        encryptedData,
      }
      app.login(params).then((data) => {
        console.log(data)
        if(data.phone){
          if(data.uid==0){
            wx.navigateTo({
              url: './login?phone=' + data.phone,
            })
          }else{
            wx.switchTab({
              url: '../tabBar/home/index-new',
            })
          }
        }
      }).catch(() => {
        that.setData({
          hasPhone: true,
        })
      })
    } else {
      that.setData({
        hasPhone: false,
      }, () => {
        // wx.navigateTo({
        //   url: '../../my/pages/bingPhone',
        // })
      })
    }
  },
  // 手机号注册
  phoneLogin(){
    wx.navigateTo({
      url: './phone-login',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    
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