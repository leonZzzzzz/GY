let app = getApp();
let lesalerUrl ='wxapp.php?c=product&a=get_product_list'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    uid:'',
    store_id:'',
    order_by_field:'sales',
    productList:[],
    next_page:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var uid=wx.getStorageSync('userUid')
    var that=this
    that.setData({store_id: options.store_id,uid})
    that.getlesaler()
  },
  // 获取列表
  getlesaler(){
    var { store_id, page, uid, order_by_field}=this.data
    var params = { store_id: store_id, "cat_fid": "", "cat_sid": "", "page": page, "keyword": "", "order_by_field": order_by_field,"order_by_method":"desc", "uid":uid } 
    app.api.postApi(lesalerUrl,{params},(err,res)=>{
      if(res.err_code==0){
        var {data,next_page,params}=res.err_msg
        this.setData({ productList: data, next_page})
      }
    })
  },
  // 跳转商品详情
  godetail(e){
    var product_id = e.currentTarget.dataset.productid
    wx.navigateTo({
      url: './goods-detail?product_id=' + product_id,
    })
  },
  // 跳转到供应商详情
  golesalerDetail(){
    wx.navigateTo({
      url: './lesalerDetail?store_id='+this.data.store_id,
    })
  },
  gocoupon(){
    wx.navigateTo({
      url: './coupons?isoff=2' + '&store_id=' + this.data.store_id,
    })
  },
  // 切换销量-价格
  checkItem(e){
    var meth = e.currentTarget.dataset.meth;
    this.setData({order_by_field:meth})
    this.getlesaler()
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