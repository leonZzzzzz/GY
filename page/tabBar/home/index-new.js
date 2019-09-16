import {
  getUrlQueryParam,
  checkBingPhone,
  getPhoneNumber,
  getLocation
} from '../../../utils/util';
let app = getApp();
let bannerUrl ='wxapp.php?c=index&a=banner';
let classifyUrl ='wxapp.php?c=index&a=cat_list'
let productlistUrl ='wxapp.php?c=index&a=product'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    valueList: [{
      txt: '次日送达',
      src: '../../../img/gy-icon_27.png'
    }, {
      txt: '新鲜保证',
        src: '../../../img/gy-icon_27.png'
    }, {
      txt: '品质质检',
        src: '../../../img/gy-icon_27.png'
    }, {
      txt: '售后服务',
        src: '../../../img/gy-icon_27.png'
    }],
    hasPhone:true,
    bannerList:[],
    methodList:[],
    iswiper:false,
    productData:[],
    uid:'0',
    list:[],
    next_page:false,
    page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // app.checkphone().then(data => {
    //   if (data.is_phone == 1) {
    //     var uid = app.config.uid ? app.config.uid : data.uid;
    //     that.setData({
    //       hasPhone: false,
    //       uid: uid,
    //       phone: data.phone
    //     })
    //   }
    //   app.globalData.uid = uid;
    //   app.globalData.phone = data.phone;
    //   wx.setStorageSync('userUid', uid); //存储uid
    //   wx.setStorageSync('phone', data.phone); //存储uid
    // }).catch(data => {
    //   that.setData({
    //     hasPhone: true,
    //   });
    // })
  },
  // 获取轮播图
  getbannerindex(){
    app.api.postApi(bannerUrl,{params:{store_id:0}},(err,res)=>{
      this.setData({bannerList:res.err_msg.data})
    })
  },
  // 分类
  getmethod(){
    app.api.postApi(classifyUrl, { params: { page: 1, is_show_son: 0, is_all:1}},(err,res)=>{
      console.log(res)
      if (res.err_msg.next_page){
        var iswiper=true
      }else{
        var iswiper = false
      }
      this.setData({ methodList: res.err_msg.data, iswiper: iswiper})
    })
  },
  // 商品列表--获取第一页数据
  getproductList(){
    app.api.postApi(productlistUrl,{params:{page:1,uid:this.data.uid}},(err,res)=>{
      var {err_code,err_msg}=res;
      var productData=err_msg.data
      var list=[]
      productData.forEach(item => {
        list.push(item)
      })
      console.log(list)
      this.setData({ productData: list,next_page:err_msg.next_page})
    })
  },
  // 获取多页数据
  getproListpage() {
    app.api.postApi(productlistUrl, { params: { page: this.data.page, uid: this.data.uid } }, (err, res) => {
      var { err_code, err_msg } = res;
      var productData = err_msg.data
      var list = this.data.list
      productData.forEach(item => {
        list.push(item)
      })
      this.setData({ productData: list, next_page: err_msg.next_page })
    })
  },

  // 跳转到领券页面
  gocoupon(){
    wx.navigateTo({
      url: '../../common/coupons?isoff=1',
    })
  },
  // 跳转到搜索列表
  gosearch() {
    wx.navigateTo({
      url: '../../common/searchList',
    })
  },
  // 跳转到详情
  gotodetail(e){
    var product_id=e.currentTarget.dataset.product;
    wx.navigateTo({
      url: '../../common/goods-detail?product_id=' + product_id,
    })
  },
  // 跳转商品分类页
  gomethod(e){
    console.log(e)
    var cat_id = e.currentTarget.dataset.catid;
    app.catfid=cat_id
    wx.switchTab({
      url: '../category/category'
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
    var that = this;
    var uid = wx.getStorageSync('userUid')
    var phone = wx.getStorageSync('phone')
    var cartNum = wx.getStorageSync('cartNum')
    if (phone) {
      var hasPhone = true
    } else {
      var hasPhone = false
    }
    this.setData({ uid: uid ? uid : 0, hasPhone: hasPhone })
    if (cartNum > 0) {
      wx.setTabBarBadge({//这个方法的意思是，为小程序某一项的tabbar右上角添加文本
        index: 3,   //代表哪个tabbar（从0开始）
        text: cartNum	//显示的内容
      })
    }
    //检查是否有手机号
    var that = this
    that.getbannerindex()
    that.getmethod()
    that.getproductList()
    // 避免不是正常从下单页面退出的情况
    wx.removeStorageSync('couponInfo')
    wx.removeStorageSync('borId')
    wx.removeStorageSync('face_money');
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
    if(this.data.next_page){
      this.data.page++;
      this.getproListpage()
    }else{
      wx.showToast({
        title: '加载完毕',
        icon:'none'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})