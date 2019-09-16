let app=getApp()
const payUrl ='wxapp.php?c=pay_order&a=pay_order'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:'',
    is_bank:'',//支持何种付款方式
    order_info:[],
    dealmoney:'0.00',//应付金额
    actual:'0.00',//实际支付金额
    pattern:[
      {value:1,name:'微信支付',checked:true},
      { value: 2, name: '农行支付', checked: false},
      { value: 3, name: '余额支付', checked: false},
    ],
    pay_type:'1',
    orderPayNo:[],//需支付订单的订单号数组
    creditorder: [],//账期结算订单
    payable:[],
    unpayable:[],
    whether:true,
    matteShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid=wx.getStorageSync('userUid')
    var order_info = wx.getStorageSync('order_info')
    var dealmoney=0//应付金额
    var actual=0//实付金额
    var payable=[]//可支付的订单
    var unpayable=[]//接单时间外的订单
    var orderPayNo=[]//不含接单时间外和账期结算的订单
    order_info.forEach(item=>{
      if(item.is_pay==1){
        payable.push(item)
      }else{
        unpayable.push(item)
      }
    })
    console.log(payable)
    if (payable.length > 0) {
      payable.forEach(val => {
        val.checked = false
        val.pay_money = Number(val.pay_money).toFixed(2)
        dealmoney += Number(val.pay_money)
        orderPayNo.push(val.order_no)
      })
    } else {
      this.setData({ whether: false})
    }
    console.log(this.data.whether)
    dealmoney = Number(dealmoney).toFixed(2)
    this.setData({ uid, is_bank: options.is_bank, payable, unpayable, order_info, dealmoney, actual: dealmoney, orderPayNo})
  },
  // 选中的店铺为账期结算的店铺
  checkitem(e){
    var { index, orderno } = e.currentTarget.dataset
    var payable = this.data.payable
    var checked = payable[index].checked
    // 反选
    payable[index].checked=!checked
    this.setData({ payable})
    // 计算选中的店铺的金额
    var actual=0
    var orderPayNo=[]//自己支付订单
    var creditorder = []//账期结算订单
    payable.forEach(item => {
      if(item.checked==false){
        actual += Number(item.pay_money)
        orderPayNo.push(item.order_no)
      }else{
        creditorder.push(item.order_no)//账期结算订单
      }
    })
    console.log(orderPayNo)
    if (orderPayNo.length == 0) {
      this.setData({ whether: false })
    }else{
      this.setData({ whether: true })
    }
    actual = Number(actual).toFixed(2)
    this.setData({ actual, orderPayNo, creditorder})
  },

  // 选择付款方式
  milkbrand(e){
    console.log(e)
    var index = e.currentTarget.dataset.index//选中的哪个店铺
    this.setData({ pay_type:index})
  },

  // 去支付
  goPay(){
    var openid=wx.getStorageSync('openid')
    var { orderPayNo, creditorder, pay_type,uid}=this.data
    var params={
      order_no: orderPayNo,
      payment_order_no: creditorder,
      pay_type: pay_type,
      open_id: openid,
      uid
    }
    wx.showLoading({
      title: '请稍候...',
    })
    app.api.postApi(payUrl,{params},(err,resp)=>{
      wx.hideLoading();
      if (resp.err_code == 0) {
        if (resp.err_msg.data.return_code=='NOPAY') {
          this.setData({ matteShow:true})
        } else {
          // 调起微信支付
          this._startPay(resp.err_msg.data);
        }
      } else {
        wx.showModal({
          title: '支付失败',
          content: err || resp.err_msg,
          confirmText: '好的',
          showCancel: false,
          success: function () {
            that.setData({ submitOk: true });
            //推送消息
            // app.send(that.data.orderId);
            wx.switchTab({
              url: '../tabBar/home/index-new',
            })
          }
        }); return;
      }
    })
  },
  /**微信支付*/
  _startPay(payParams) {
    console.log(payParams)
    var obj = Object.assign({
      success: res => this._onPaySuccess(res),
      fail: err => this._onPayFail(err)
    }, payParams);
    wx.requestPayment(obj);
  },

  /**支付成功*/
  _onPaySuccess(res) {
    console.log(res)
    let that = this;
    if (res.errMsg == 'requestPayment:ok') {
      var params = { "uid": that.data.uid, "store_id": that.data.storeId, "order_no": that.data.orderId }
      app.api.postApi('wxapp.php?c=order_v2&a=pay_mark', { params }, (err, res) => {
        console.log(res)
        if (err || res.err_code != 0) { console.error(err || res.err_msg) }
      })
    }
    wx.removeStorageSync('couponInfo');
    //推送消息
    // app.send(that.data.orderId);
    that.setData({
      matteShow: true, submitOk: true
    });
  },
  /**支付失败*/
  _onPayFail(err) {
    console.log(err)
    let that = this;
    //推送消息
    // app.send(that.data.orderId);
    that.setData({
      submitOk: true
    });
    wx.showModal({
      title: '支付失败',
      content: '订单支付失败，请到[订单-待付款]列表里重新支付',
      // cancelColor: '#FF0000',
      showCancel: false,
      confirmText: '好的',
      success: function (res) {
        wx.navigateTo({
          url: './my-order',
        })
      },
    });
  },
  //关闭弹窗
  closeBtn() {
    var that = this;
    that.setData({
      matteShow: false
    });
    wx.navigateTo({
      url: './my-order',
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