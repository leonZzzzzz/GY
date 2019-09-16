let app = getApp()
var cartbuyUrl = 'wxapp.php?c=create_cart_order&a=confirm_order'//购物车去结算
var creatOrderUrl ='wxapp.php?c=create_cart_order&a=add'//生成订单
var couponUrl ='wxapp.php?c=coupon&a=store_coupon_use'//获取优惠券
var addressUrl ='wxapp.php?c=address&a=MyAddress'//获取收货地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:'',
    ids:[],
    total_money:'', 
    total_postage:'', 
    total_product_money:'', 
    product:[],
    productList:[],
    modeis:'3',//判断当前是什么配送方式
    couponlist:[],
    couponInfo:[],//重新选择优惠券后穿的参数
    stallcoupon:0,//档口优惠总计
    istime:false,//选择谷裕配送显示配送时间
    addresslist:[],//全部收货地址
    address:{},//当前收货地址
    addressId:'',//当前收货地址id
    birflag:true,
    bir:'',//配送时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var uid=wx.getStorageSync("userUid")
    this.setData({ids:JSON.parse(options.ids),uid:uid?uid:0})
    this.getcomfirm()
    
  },
  // 获取数据
  getcomfirm(){
    var {uid,ids}=this.data
    var params = {uid, ids: ids }
    app.api.postApi(cartbuyUrl, { params }, (err, res) => {
      if (res.err_code == 0) {
        var productList=res.err_msg.product
        var {total_money, total_postage, total_product_money, product}=res.err_msg
        total_postage = Number(total_postage).toFixed(2);
        total_money = Number(total_money).toFixed(2);
        total_product_money = Number(total_product_money).toFixed(2);
        product.forEach(item=>{
          var postage = item.postage
          var send_type=item.send_type;
          postage = Number(postage).toFixed(2)
          item.postage = postage
          var methsend=[]
          if(send_type.length>1){
            var a={value:"1",name:"档口自提/自提"}
            var b={value:"3",name:"谷裕配送"}
            methsend.push(b)
            methsend.push(a)
            var modeis = send_type[0]
            item.modeis = modeis
            // 判断当前默认配送方式
            methsend.forEach(pro=>{
              if(pro.value==modeis){
                pro.checked=true
              }
            })
          } else if (send_type.length == 1){
            if(send_type[0]=='1'){
              var a = { value: "1", name: "档口自提/自提" }
              methsend.push(a)
            } else if (send_type[0] == '3'){
              var b = { value: "3", name: "谷裕配送" }
              methsend.push(b)
            }
            var modeis = send_type[0]
            item.modeis = modeis
            // 判断当前默认配送方式
            // methsend.forEach(pro => {
              if (methsend[0].value == modeis) {
                methsend[0].checked = true
              }
            // })
          }
          item.methsend=methsend
        })
        this.setData({ total_money, total_postage, total_product_money, product,productList})
        this.getCoupon()
      } else {
        wx.showToast({
          title: res.err_msg,
          icon: 'none'
        })
      }

    })
  },
  // 获取优惠券
  getCoupon(){
    var store_cart_id = wx.getStorageSync('store_cart')
    store_cart_id = JSON.parse(store_cart_id)
    var params={
      // "store_id": 2041,
      "uid": this.data.uid,
      "is_cart": 1,
      "store_cart_id":store_cart_id
    }
    app.api.postApi(couponUrl,{params},(err,res)=>{
      if(res.err_code==0){
        var { product, total_money, stallcoupon } = this.data
        var couponlist=res.err_msg.data
        product.forEach(item=>{
          item.coupous=[]
          item.retotal_money=item.total_money
          couponlist.forEach(cou=>{
            var normal = cou.list.normal_coupon_list
            if(normal.length>0){
              normal.forEach(nor=>{
                if (item.store_id == nor.store_id) {
                  if (nor.select == 1) {
                    var face_money=Number(nor.face_money)*100
                    stallcoupon += face_money
                    item.coupous.push(nor)
                    item.retotal_money=Number(item.total_money)-Number(nor.face_money)
                    if(item.retotal_money<=0){
                      item.retotal_money='0.00'
                    }
                  } 
                } 
              })
            } else{
              // item.retotal_money = item.total_money
            }
          })
        })
        var totals = 0//应付金额统计
        product.forEach(info => {
          totals += Number(info.retotal_money);//使用优惠券的商品总价
        })
        totals = Number(totals).toFixed(2)
        if (totals <= 0) {
          totals = '0.00'
        }
        //档口总优惠
        var stallcoupon=Number(stallcoupon/100).toFixed(2);
        
        this.setData({ couponlist: res.err_msg.data, product, stallcoupon, total_money: totals})
        console.log(this.data.product)
      }
    })
  },
  // 获取收货地址
  getAdress(){
    app.api.postApi(addressUrl,{params:{uid:this.data.uid}},(err,res)=>{
      if(res.err_code==0){
        var address=null;
        var addressList = res.err_msg.addresslist;
        if (addressList.length) {
          if (addressList.length > 1) {
            //设置默认地址
            for (var i in addressList) {
              if (addressList[i].default == 1) {
                console.log('默认地址 ', addressList[i]);
                address = addressList[i];
              }
            }
          } else if (addressList.length == 1) {
            address = addressList[0];
          }
          console.log(address.address_id)
          this.setData({
            address: address,
            addressList: addressList,
            addressId: address.address_id,
          });
        } else {
          wx.showModal({
            title: '请先设置收货地址',
            content: '你还没有设置收货地址，请点击这里设置！',
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: './address-list',
                })
              } else if (res.cancel) {
                return;
              }
            }
          })
        }
      }else{
        this.setData({ address:''})
      }
    })
  },
  // 选择配送方式
  milkbrand(e){
    console.log(e)
    var index = e.currentTarget.dataset.index//选中的哪个店铺
    var val = e.detail.value//何种配送方式
    var product = this.data.product
    product.forEach(item=>{
      var methsend = product[index].methsend
      methsend.forEach(meth=>{
        if(meth.value==val){
          meth.checked=true
        }else{
          meth.checked = false
        }
        if(meth.checked){
          product[index].modeis=meth.value
        }
      })
    })
    console.log(product)
    this.setData({product})
  },
  // 选择配送时间
  bindDateChange(e){
    console.log(e)
    var birth=e.detail.value
    this.setData({ birflag:false,bir:birth})
  },
  // 获取更多优惠券
  gousecoupon(e){
    var storeid=e.currentTarget.dataset.storeid
    wx.navigateTo({
      url: './use-coupon?store_id='+storeid,
    })
  },
  // 填写或更改收货地址
  addrViewClick() {
    wx.navigateTo({
      url: './address_list?addressId=' + this.data.addressId
    });
  },
  // 跳转收银台
  payformoney(){
    wx.navigateTo({
      url: './payment',
    })
  },
  // 生成订单
  getCreatOrder(){
    var { uid, ids, product,addressId}=this.data
    if (!addressId){
      wx.showToast({
        title: '请添加收货地址',
        icon:'none'
      })
      return
    }
    var whichList={}
    whichList.uid = uid
    whichList.platform_coupon_id = 0;//
    whichList.address_id = addressId
    whichList.cart_ids=ids
    whichList.store_product = []
    product.forEach(item=>{
      var list_a={}
      list_a.store_id = item.store_id
      var coupous = item.coupous
      if (coupous.length>0){
        list_a.store_coupon_id = coupous[0].id
      }else{
        list_a.store_coupon_id =0
      }
      list_a.send_type=1;//
      list_a.remark=''
      var prodinfos = item.product_infos
      list_a.products=[]
      prodinfos.forEach(info=>{
        var list_b = {}
        list_b.product_id = info.product_id
        list_b.quantity = info.quantity
        list_b.sku_id = info.sku_id
        list_a.products.push(list_b)
      })
      whichList.store_product.push(list_a)
    })
    app.api.postApi(creatOrderUrl, {params:whichList},(err,res)=>{
      if(res.err_code==0){
        wx.setStorageSync('order_info', res.err_msg.order_info)
        wx.navigateTo({
          url: './payment?is_bank=' + res.err_msg.is_bank,
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
    var couponInfo = wx.getStorageSync('couponInfo')
    var { product, productList, total_money, stallcoupon, couponlist } = this.data
    if (couponInfo){
      product.forEach(item => {
        if (item.store_id == couponInfo[3]) {
          var a = { id: couponInfo[0], cname: couponInfo[1], face_money: couponInfo[2], store_id: couponInfo[3], select: couponInfo[4] }
          item.coupous = []
          item.coupous.push(a)
          var coupous = item.coupous
          coupous.forEach(nor => {
            if (item.store_id == nor.store_id) {
              if (nor.select == 1) {
                if (nor.face_money) {
                  var face_money = Number(nor.face_money) * 100
                  item.retotal_money = Number(item.total_money) - Number(nor.face_money)
                  if (item.retotal_money <= 0) {
                    item.retotal_money = '0.00'
                  }
                }
              } else {
                item.retotal_money = item.total_money
              }
            }
          })
        }
      })
      var totals = 0
      var stallcoupon=0
      product.forEach(info => {
        totals += Number(info.retotal_money);//使用优惠券的商品总价
        var coupous = info.coupous
        coupous.forEach(cou => {
          var face_money = Number(cou.face_money) ;
          stallcoupon += face_money;//已使用优惠券总金额
          console.log(stallcoupon)
        })
      })
      stallcoupon = Number(stallcoupon).toFixed(2)
      totals = Number(totals).toFixed(2)
      console.log(product)
      this.setData({ product, stallcoupon, total_money: totals})
    }
    
    // 获取收货地址
    this.getAdress()
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
    wx.removeStorageSync('couponInfo')
    wx.removeStorageSync('recid');
    wx.removeStorageSync('cname');
    wx.removeStorageSync('face_money');
    wx.removeStorageSync('borId')
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