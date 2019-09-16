let app = getApp()
const getUserUid ='wxapp.php?c=wechatapp&a=buyer_login'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    methsend:[
      {value:1,name:'个人',checked:true},
      { value: 2, name: '企业',checked:false}
    ],
    istype:'1',
    phone:'',
    inviter_phone:'',
    company:'',
    name:'',
    code:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.code){
      this.setData({code:options.code})
    }
    this.setData({phone:options.phone})
  },
  milkbrand(e) {
    console.log(e)
    var istype = e.detail.value
    this.setData({ istype })
  },
  // 获取公司名
  getcompany(e){
    var company=e.detail.value
    this.setData({company})
  },
  // 获取姓名
  getusername(e){
    this.setData({name:e.detail.value})
  },
  // 获取推荐人手机号
  interphone(e){
    this.setData({ inviter_phone:e.detail.value})
  },
  // 登陆提交
  getUserUid(){
    var openid=wx.getStorageSync('openid')
    var { phone, name, istype, inviter_phone, company,code}=this.data
    wx.showLoading({
      title: '正在提交',
    })
    var params = { "phone": phone, "name": name, "openid": openid, "type": istype, "inviter_phone": inviter_phone, "company": company, "code":code}
    app.api.postApi(getUserUid,{params},(err,res)=>{
      wx.hideLoading()
      if(res.err_code==0){
        wx.showToast({
          title: '登录成功',
          icon: 'none'
        })
        wx.setStorageSync('userUid', res.err_msg.uid)
        wx.setStorageSync('phone', res.err_msg.phone)
        var enter=wx.getStorageSync('enter')
        if(enter=='cart'){
          setTimeout(function () {
            wx.switchTab({
              url: '../tabBar/goods/cart',
            })
          }, 2000)
        }else if(enter=='myself'){
          setTimeout(function () {
            wx.switchTab({
              url: '../tabBar/my/myself',
            })
          }, 2000)
        }
      }else{
        wx.showToast({
          title: res.err_msg,
          icon: 'none'
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