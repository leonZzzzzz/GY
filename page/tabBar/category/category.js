let app = getApp();
let cataUrl ='wxapp.php?c=index&a=cat_list';
let productUrl ='wxapp.php?c=product&a=get_product_list';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:'',
    curSwiperIdx:0,
    meth:0,
    classifyList:[],
    showup:true,
    order_by_field: 'sales',//sales：销量  price 价格
    keyword:'',
    page:'1',
    cat_fid:'',//父级id
    cat_sid:'',//子级id
    products:[],
    next_page:false,
    catfid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    var uid = wx.getStorageSync('userUid')
    this.setData({ uid })
    if (app.cartNum > 0) {
      wx.setTabBarBadge({//这个方法的意思是，为小程序某一项的tabbar右上角添加文本
        index: 3,   //代表哪个tabbar（从0开始）
        text: app.cartNum	//显示的内容
      })
    }
    var catfid = app.catfid
    // 从首页跳转过来
    if (catfid) {
      app.api.postApi(cataUrl, { params: { page: 1, is_show_son: 1, is_all: 1 } }, (err, res) => {
        var classifyList = res.err_msg.data
        var cat_sid=''
        classifyList.forEach(item => {
          if (item.cat_id == catfid) {
            var son_cat = item.son_cat
            if (son_cat.length>0){
              cat_sid = son_cat[0].cat_id
            }else{
              cat_sid=''
            }
          }
        })
        this.setData({ classifyList, cat_fid: catfid, cat_sid: cat_sid })
        this.getproductList()// 商品列表
      })
    } else {
      this.getclassify()//头部分类
    }
  },
  // 获取分类
  getclassify(){
    app.api.postApi(cataUrl, { params: { page: 1, is_show_son: 1, is_all:1}},(err,res)=>{
      var classifyList = res.err_msg.data
      var left = classifyList[0].son_cat;
      if(left.length>0){
        var cat_sid = left[0].cat_id
      }else{
        var cat_sid=''
      }
      
      this.setData({ classifyList, cat_fid: classifyList[0].cat_id, cat_sid})
      this.getproductList()// 商品列表
    })
  },
  // 商品列表
  getproductList(){
    var { uid, keyword, order_by_field, page, cat_fid, cat_sid}=this.data
    var params={
      "cat_fid": cat_fid, 
      "cat_sid": cat_sid, 
      "page": page, 
      "keyword": keyword, 
      "order_by_field": order_by_field, 
      "order_by_method": "desc", 
      "uid": uid
    }
    app.api.postApi(productUrl,{params},(err,res)=>{
      var {err_code,err_msg}=res
      if(err_code==0){
        var products = err_msg.data
        this.setData({ products: products, next_page: err_msg.next_page})
      } else {
        this.setData({ products: [] })
      }
    })
  },
  // 切换头部和左侧分类
  swichSwiperItem(e){
    console.log(e)
    var { fid, sid,index } = e.currentTarget.dataset;
    if(fid){
      var son_cat = this.data.classifyList[index].son_cat;
      if (son_cat.length>0){
        var cat_sid = son_cat[0].cat_id
        this.setData({ cat_sid: cat_sid })
      }
      var cat_fid=fid
      this.setData({ cat_fid})
    }
    if(sid){
      var cat_sid=sid
      this.setData({ cat_sid })
    }
    this.getoneproducts()
  },
  // 切换销量，价格
  checkItem(e){
    console.log(e)
    var meth=e.currentTarget.dataset.meth
    this.setData({ order_by_field:meth})
    this.getoneproducts()
  },
  // 加载第一页数据
  getoneproducts(){
    var { uid, keyword, order_by_field, cat_fid, cat_sid } = this.data
    var params = {
      "cat_fid": cat_fid,
      "cat_sid": cat_sid,
      "page": 1,
      "keyword": keyword,
      "order_by_field": order_by_field,
      "order_by_method": "desc",
      "uid": uid
    }
    app.api.postApi(productUrl, { params }, (err, res) => {
      var { err_code, err_msg } = res
      if (err_code == 0) {
        var products = err_msg.data
        this.setData({ products: products,page:1 })
      } else {
        this.setData({ products: [],page:1 })
      }
    })
  },
  gotodetail(e){
    var product = e.currentTarget.dataset.product
    wx.navigateTo({
      url: '../../common/goods-detail?product_id=' + product,
    })
  },
  // 显示全部分类
  showdetail(){
    this.setData({showup:false})
  },
  // 隐藏全部分类
  hidedetail(){
    this.setData({showup: true})
  },
  // 点击全部分类列表
  choosemeth(e){
    var cat_id=e.currentTarget.dataset.catid;
    var index=e.currentTarget.dataset.index;
    this.setData({cat_fid:cat_id})
    var son_cat = this.data.classifyList[index].son_cat;
    if (son_cat.length > 0) {
      var cat_sid = son_cat[0].cat_id
      this.setData({ cat_sid: cat_sid })
    }
    this.getoneproducts()
    this.setData({ showup: true })
  },
  // 跳转到搜索列表
  gosearchList(){
    wx.navigateTo({
      url: '../../common/searchList',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
      this.getproductList()
    }else{
      wx.showToast({
        title: '商品加载完毕',
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