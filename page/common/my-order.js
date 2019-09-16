let app=getApp()
var orderListUrl ='wxapp.php?c=wxapp_order&a=order_list';//订单列表
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curSwiperIdx:'all',
    orderList:[],
    next_page:false,
    page:1,
    list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 获取订单列表
  getOrder(){
    var params = { "status_type": this.data.curSwiperIdx, "page": this.data.page}
    app.api.postApi(orderListUrl,{params},(err,res)=>{
      if(res.err_code==0){
        var orderList = res.err_msg.list
        var list = this.data.list;
        orderList.forEach(item=>{
          list.push(item)
        })
        this.setData({orderList:list,next_page:res.err_msg.next_page})
      }
    })
  },
  // 切换订单类型
  swichSwiperItem(e){
    console.log(e)
    var idx = e.currentTarget.dataset.idx;
    this.setData({ curSwiperIdx:idx})
    wx.showLoading({
      title: '正在加载',
    })
    var params = { "status_type":idx,"page": "1" }
    app.api.postApi(orderListUrl, { params }, (err, res) => {
      wx.hideLoading();
      if (res.err_code == 0) {
        var orderList=res.err_msg.list
        var list=[]
        orderList.forEach(item=>{
          list.push(item)
        })
        this.setData({ orderList:list, next_page: res.err_msg.next_page })
      }else{
        this.setData({orderList: []})
      }
    })
  },
  // 跳转订单详情
  goOrderDetail(e){
    console.log(e)
    var orderid=e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: './order-detail?order_id='+orderid,
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
    this.getOrder()
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
    if (this.data.next_page){
      this.data.page++;
      this.getOrder();
    }else{
      wx.showToast({
        title: '没有更多数据了',
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