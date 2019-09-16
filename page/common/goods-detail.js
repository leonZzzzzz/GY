let app = getApp();
var goodsdetailUrl ='wxapp.php?c=product&a=detail'
var celletUrl = 'wxapp.php?c=collect&a=add';//收藏接口 type-1:收藏商品  type-1:收藏店铺 
var couponUrl ='wxapp.php?c=coupon&a=store_coupon';//优惠券
var addCartUrl = 'wxapp.php?c=cart&a=add';//加入到购物车
var cartListUrl ='wxapp.php?c=cart&a=cart_list';//购物车列表
Page({
  data: {
    valueList: [{
      txt: '一手货源',
      src: '../../img/gy-icon_27.png'
    }, {
      txt: '新鲜保证',
      src: '../../img/gy-icon_27.png'
    }, {
      txt: '品质质检',
      src: '../../img/gy-icon_27.png'
    }, {
      txt: '商家直供',
      src: '../../img/gy-icon_27.png'
    }],
    product_id:'',
    uid:'0',
    detailData:{},
    product_image_list:[],
    attr_detail:[],
    store_info:{},
    property_list:[],
    sku_list:[],
    sku_id: null,//多属性id
    sku_arr: [],//选择的多属性数组
    amount:'1',//加入购物车数量
    tel:'',
    coupons:[],
    whostore:'',
    showModalStatus:false,
    shareOpt: {
      title: '立即分享给好友',
      tip: '朋友通过你分享的页面成功购买后，你可获得对应的佣金',
      shareImg: '../image/distribution/qugo_03.png',
      shareTxt: '微信好友',
      posterImg: '../image/distribution/qugo_08.png',
      posterTxt: '小程序',
      picImg: '../image/distribution/pic.png',
      picTxt: '图文卡片'
    },
    shareShade: false,
    cart_list_number:'',//购物车显示有几条数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var uid=wx.getStorageSync('userUid')
    this.setData({ product_id: options.product_id, uid:uid?uid:0})
    this.getDetails()
    this.getCouponList()
    this.shopCart()
  },
  // 获取详情
  getDetails(){
    var {product_id,uid}=this.data
    var params={
      product_id,uid
    }
    app.api.postApi(goodsdetailUrl,{params},(err,res)=>{
      var detailData = res.err_msg.product
      this.setData({ 
        detailData: detailData, 
        price: detailData.price,
        quantity: detailData.quantity,
        product_image_list: detailData.product_image_list, 
        attr_detail: detailData.attr_detail, 
        store_info: res.err_msg.store_info,
        property_list: res.err_msg.property_list ? res.err_msg.property_list:[],
        sku_list: res.err_msg.sku_list ? res.err_msg.sku_list:[],
        tel: res.err_msg.store_info.tel
      })
    })
  },
  // 获取优惠券
  getCouponList(){
    var {uid, product_id}=this.data
    var params = { "uid": uid, "product_id": product_id}
    // var params={"uid":uid,"product_id":"5062"}
    app.api.postApi(couponUrl,{params},(err,res)=>{
      this.setData({ coupons: res.err_msg.coupon_value, whostore: res.err_msg.store_id})
    })
  },
  // 进入对应店铺
  enterStore(e){
    console.log(e)
    var storeid = e.currentTarget.dataset.storeid
    wx.navigateTo({
      url: './wholesaler?store_id=' + storeid,
    })
  },
  // 点击图片预览
  previewImg: function (e) {
    console.log(e)
    var imagelist = [];
    var index = e.currentTarget.dataset.index;
    var imgArr = this.data.product_image_list;
    imgArr.forEach(item => {
      imagelist.push(item.image);
    })
    console.log(imagelist)
    wx.previewImage({
      current: imagelist[index],     //当前图片地址
      urls: imagelist,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  // 选中规格
  chooseProperty(e) {
    let that = this;
    let { pid, vid, x, j, image } = e.currentTarget.dataset;
    let { sku_list, property_list,sku_id, sku_arr} = that.data;
    // if (image) {
    //   wx.setStorageSync('img', image)
    //   this.setData({ image: image })
    // } else {
    //   image = wx.getStorageSync('img')
    //   if (image) {
    //     this.setData({ image: image })
    //   } else {
    //     image = this.data.pros.image
    //     this.setData({ image: image })
    //   }
    // }
    let len = property_list.length || 0;
    if (len < 1) { return; }
    let arr = property_list[x]["values"];
    for (let k = 0; k < property_list[x]["values"].length; k++) {
      if (k == j) {
        property_list[x]["values"][k].checked = property_list[x]["values"][k].checked ? false : true;
        if (property_list[x]["values"][k].checked) {
          sku_arr[x] = j;
        } else {
          sku_arr[x] = null;
        }
      } else {
        property_list[x]["values"][k].checked = false;
      }
    }
    that.setData({ property_list, sku_arr })
    let properties = '', num = 0;
    for (let n = 0; n < sku_arr.length; n++) {
      if (sku_arr[n] !== null) {
        num++;
        properties = properties + property_list[n].pid + ':' + property_list[n]['values'][sku_arr[n]].vid + ';';
        console.log(properties)
      } else {
        num--;
      }
    }
    if (num < len) { console.log('属性没有选择完'); return; }
    for (let p of sku_list) {
      var m = p.properties + ';';
      if (m == properties) {
        if (p.quantity < 1) {
          wx.showLoading({
            title: '卖完了'
          });
          that.setData({
            price: p.price,
            quantity: p.quantity,
            // image: image,
            sku_id: p.sku_id
          })
          setTimeout(function () {
            wx.hideLoading();
          }, 2000);

        } else {
          that.setData({
            price: p.price,
            quantity: p.quantity,
            // image: image,
            sku_id: p.sku_id
          })
        }
      }
    }
  },
  // 收藏
  collect(){
    var {uid,product_id}=this.data;
    var params = { "type":1, "uid":uid, "id":product_id}
    app.api.postApi(celletUrl,{params},(err,res)=>{
      if(res.err_code==0){
        wx.showToast({
          title: res.err_msg,
          icon:'none'
        })
      }else{
        wx.showToast({
          title: res.err_msg,
          icon:'none'
        })
      }
    })
  },
  // 分享
  onshare(){
    var that = this
    // 显示遮罩层
    this.setData({ showModalStatus: true, shareShade:true})
    if (that.data.uid) {
      var prodId = that.data.product_id;
      var datalist = that.data;
      var is_supplier = that.data.is_supplier;
      app.creatImg(prodId, that, isFx).then(data => {
        console.log(data)
        let jdConfig = that.data.jdConfig;
        jdConfig.images[1].url = data;
        that.setData({ qrcodeUrl: data, jdConfig })
      })
    }
  },
  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  // 去领券
  goCouponGift(e){
    var store_id = e.currentTarget.dataset.storeid
    wx.navigateTo({
      url: './coupons?store_id=' + store_id +'&isoff=2',
    })
  },
  // 加入购物车数量----加
  addcart(){
    var amount=this.data.amount
    amount++;
    this.setData({
      amount
    })
  },
  // 减
  reducecart(){
    var amount = this.data.amount
    if(amount==1){
      return;
    }else{
      amount--;
      this.setData({
        amount
      })
    }
  },

  // 点击拨号
  openphone:function() {
    wx.makePhoneCall({
      phoneNumber: this.data.tel, //此号码并非真实电话号码，仅用于测试  
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  // 跳转回首页
  goNewIndex(){
    wx.switchTab({
      url: '../tabBar/home/index-new',
    })
  },
  // 跳转购物车
  goCart(){
    wx.switchTab({
      url: '../tabBar/goods/cart',
    })
  },

  // 加入购物车
  addShopCart(){
    var { uid, product_id, sku_id, amount}=this.data
    var params = { "uid": uid, "product_id": product_id, "quantity": amount, "sku_id":sku_id?sku_id:0 }
    app.api.postApi(addCartUrl,{params},(err,res)=>{
      if(res.err_code==0){
        wx.showToast({
          title: res.err_msg,
          icon:'none'
        })
        this.shopCart()
      }else{
        wx.showToast({
          title: res.err_msg,
          icon:'none'
        })
      }
    })
  },
  // 当前购物车有几条数据
  shopCart(){
    app.api.postApi(cartListUrl,{params:{uid:this.data.uid}},(err,res)=>{
      if(res.err_code==0){
        var cart_list_number = res.err_msg.cart_list_number
        app.cartNum = cart_list_number
        this.setData({
          cart_list_number 
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