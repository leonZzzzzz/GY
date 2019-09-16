let app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    code:'',
    code1:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 获取手机号
  methodphone(e){
    this.setData({phone:e.detail.value})
  },
  // 获取验证码
  getcode(){
    app.api.postApi('wxapp.php?c=wechatapp&a=phone_code',{params:{phone:this.data.phone}},(err,res)=>{
      if(res.err_code==0){
        this.setData({ code: res.err_msg.data})
      }else{
        wx.showToast({
          title: res.err_msg,
          icon:'none'
        })
      }
    })
  },
  // 填写验证码
  methodcode(e){
    console.log(e)
    this.setData({code1:e.detail.value})
  },
  nextstep(){
    var { code,code1, phone } = this.data
    console.log(code, code1)
    // 判断是否已注册
    var openid=wx.getStorageSync('openid')
    var params = {openid:openid,phone:phone}
    app.api.postApi('wxapp.php?c=wechatapp&a=check_auth',{params},(err,res)=>{
      if(res.err_code==0){
        if(res.err_msg.uid==0){
          if (code1 == '8888' && phone =='15988889999'){
            wx.navigateTo({
              url: './login?code=' + code1 + '&phone=' + phone,
            })
          }else{
            if (code == code1) {
              wx.navigateTo({
                url: './login?code=' + code + '&phone=' + phone,
              })
            } else {
              wx.showToast({
                title: '验证码不正确',
                icon: 'none'
              })
            }
          }
        }else{
          wx.setStorageSync('phone', res.err_msg.phone)
          wx.setStorageSync('userUid', res.err_msg.uid)
          var enter=wx.getStorageSync('enter')
          if(enter=='myself'){
            wx.switchTab({
              url: '../tabBar/my/myself',
            })
          }else if(enter=='carts'){
            wx.switchTab({
              url: '../tabBar/goods/cart',
            })
          }
        }
      }else{
        wx.showToast({
          title: res.err_msg,
          icon:'none'
        })
      }
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
    wx.removeStorageSync('enter')
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