let app = getApp();
var cartbuyUrl ='wxapp.php?c=create_cart_order&a=confirm_order'//购物车去结算 在此页面加载数据后通过storage传到下单页面会有延迟，通过链接传参，数组转字符串时如有空格传参会中断
var cartListUrl ='wxapp.php?c=cart&a=cart_list';//购物车列表
var reviseUrl ='wxapp.php?c=cart&a=quantity';//修改购物车数量
var deteleUrl ='wxapp.php?c=cart&a=del'//删除购物车数据
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasPhone:true,
    uid:'0',
    cartData:[],
    allcheck:true,//全选
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //检查是否有手机号
    app.checkphone().then(data => {
      if (data.is_phone == 1) {
        var uid = app.config.uid ? app.config.uid : data.uid;
        that.setData({
          hasPhone: false,
          uid: uid,
          phone: data.phone
        })
      }
      app.globalData.uid = uid;
      app.globalData.phone = data.phone;
      wx.setStorageSync('userUid', uid); //存储uid
      wx.setStorageSync('phone', data.phone); //存储uid
    }).catch(data => {
      that.setData({
        hasPhone: true,
      });
    })
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
        if (data.phone) {
          if (data.uid == 0) {
            wx.setStorageSync('enter','cart')
            wx.navigateTo({
              url: '../../template/login?phone=' + data.phone,
            })
          } else {
            this.onShow()
            // wx.switchTab({
            //   url: '../goods/cart',
            // })
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
  // 获取购物车列表
  cartList(){
    app.api.postApi(cartListUrl,{params:{uid:this.data.uid}},(err,res)=>{
      if(res.err_code==0){
        var cartData = res.err_msg.data
        var cartnum=res.err_msg.cart_list_number;
        var store_cart_id = res.err_msg.store_cart_id;
        wx.setStorageSync('store_cart', JSON.stringify(store_cart_id))
        app.cartNum = cartnum
        if (cartnum > 0) {
          wx.setTabBarBadge({//这个方法的意思是，为小程序某一项的tabbar右上角添加文本
            index: 3,   //代表哪个tabbar（从0开始）
            text: cartnum	//显示的内容
          })
        }
        if(cartData.length>0){
          cartData.forEach(item => {
            item.checked = true
            var list = item.list
            list.forEach(value => {
              value.checked = true
            })
          })
        }else{
          cartData=[]
        }
        
        this.setData({
          cartData
        })
        this.sum()
      }
    })
    
  },
  //计算金额
  sum() {
    var that = this;
    var carts = this.data.cartData;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < carts.length; i++) {
      var list = carts[i].list
      list.forEach(item=>{
        if(item.checked){
          total += item.pro_price*item.pro_num
        }
      })
    }
    total = total.toFixed(2);
    that.setData({
      total: total
    });
    if (carts.length <= 0) {
      that.setData({
        cartSHow: false
      })
    } else {
      that.setData({
        cartSHow: true
      })
    }
  },
  // 增加购物车数量---加
  bindPlus(e){
    var cartid = e.currentTarget.dataset.cartid
    var productid = e.currentTarget.dataset.productid
    var pronum = e.currentTarget.dataset.pronum
    var skuid = e.currentTarget.dataset.skuid
    var index = e.currentTarget.dataset.index
    pronum++
    var params = { "uid": this.data.uid, "cart_id": cartid, "product_id": productid, "sku_id": skuid, "quantity": pronum}
    app.api.postApi(reviseUrl,{params},(err,res)=>{
      if(res.err_code==0){
        this.numList(productid,index, pronum)
      }else{
        wx.showToast({
          title:res.err_msg,
          icon:'none',
          duration:1000
        })
      }
    })
  },
  // 减
  bindMinus(e) {
    var cartid = e.currentTarget.dataset.cartid
    var productid = e.currentTarget.dataset.productid
    var pronum = e.currentTarget.dataset.pronum
    var skuid = e.currentTarget.dataset.skuid
    var index = e.currentTarget.dataset.index
    pronum--
    var params = { "uid": this.data.uid, "cart_id": cartid, "product_id": productid, "sku_id": skuid, "quantity": pronum }
    app.api.postApi(reviseUrl, { params }, (err, res) => {
      if (res.err_code == 0) {
        this.numList(productid, index, pronum)
      } else {
        wx.showToast({
          title: res.err_msg,
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  /**数量cart_list.pro_num数量变化 index 下标 num 数量*/
  numList(productid,index, num) {
    var that = this;
    var cartData = that.data.cartData;
    if (num) {//有传数量参数就是加减
      cartData.forEach(item=>{
        var list = item.list;
        list.forEach(value=>{
          if (value.product_id == productid){
            list[index].pro_num=num
          }
        })
      })
    } else {//无就是删除商品
      // cartData.splice(index, 1);
    }
    that.setData({ cartData});
    //计算金额
    that.sum();
  },
  // 删除购物车数据
  deteleNum(e){
    var cartid = e.currentTarget.dataset.cartid
    var carts=[]
    carts.push(cartid)
    var params = { "uid":this.data.uid, "cart_id": carts}
    app.api.postApi(deteleUrl,{params},(err,res)=>{
      if(res.err_code==0){
        wx.showToast({
          title: res.err_msg,
          icon:'none'
        })
        this.cartList()
      }else{
        wx.showToast({
          title: res.err_msg,
          icon: 'none'
        })
      }
    })
    this.sum()
  },
  // 列表选择事件--单个
  bindCheckbox: function (e){
    console.log(e)
    var that = this;
    var flag=0
    var allcheck=this.data.allcheck
    //拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    var cartId = e.currentTarget.dataset.catid;
    var cart_list = that.data.cartData;
    cart_list.forEach(item=>{
      var list=item.list;
      list.forEach(value=>{
        if (value.pigcms_id == cartId){
          var checked = value.checked
          value.checked=!checked
        }
        if (value.checked == false){
          item.checked = false
          allcheck=false
        }
        if (value.checked==true){
          flag++;
          if (flag == list.length) {
            item.checked = true;
            allcheck = true
          }
        }
      })
    })
    this.setData({ cartData: cart_list, allcheck})
    this.sum();
    // var selected = cart_list[index].selected;
    
    // var selectedAllStatus = that.data.selectedAllStatus;
    // // 对勾选状态取反
    // cart_list[index].selected = !selected;

    // var flag = 0;
    // for (var i in cart_list) {
    //   if (!cart_list[i].selected) {//有一个不选中都取消全选
    //     selectedAllStatus = false;
    //   }
    //   if (cart_list[i].selected) {
    //     flag++;
    //   }
    // };
    // if (flag == cart_list.length) {
    //   selectedAllStatus = true;
    // }

    // that.setData({ selectedAllStatus, cart_list });
    
  },
  // 选中整个店铺--店铺
  selectCheckbox(e){
    console.log(e)
    var flag=0
    var allcheck=this.data.allcheck;
    var index = parseInt(e.currentTarget.dataset.index);
    var cartData = this.data.cartData;
    var checked = cartData[index].checked
    cartData[index].checked = !checked
    cartData.forEach(item=>{
      var list = item.list;
      if(item.checked==false){
        allcheck=false
      }
      //太牛了
      if (item.checked){
        flag++;
      }
      if (flag == cartData.length) {
        allcheck = true;
      }
      list.forEach(value=>{
        if (item.checked == false) {
          value.checked=false
        }else{
          value.checked=true
        }
      })
    })
    this.setData({ cartData,allcheck})
    this.sum();
  },
  // 全选
  allCheckbox: function () {
    var that = this;
    // 环境中目前已选状态
    var allcheck = this.data.allcheck;
    // 取反操作
    allcheck = !allcheck;
    // 购物车数据，关键是处理selected值
    var cartData = this.data.cartData;
    for (var i = 0; i < cartData.length; i++) {
      cartData[i].checked = allcheck;
    }
    that.setData({ allcheck, cartData });
    that.sum();
  },
  // 去结算
  gobuy(){
    var cartData = this.data.cartData;
    var ids=[]
    // 获取已选中的商品
    cartData.forEach(item=>{
      var list = item.list;
      list.forEach(value=>{
        if(value.checked){
          var pigcms_id = value.pigcms_id
          ids.push(pigcms_id)
        }
      })
    })
    wx.navigateTo({
      url: '../../common/buy?ids=' + JSON.stringify(ids),
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
    var uid = wx.getStorageSync('userUid');
    this.setData({ uid: uid ? uid : 0 })
    this.cartList()
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