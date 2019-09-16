let app = getApp();
const cataUrl = 'wxapp.php?c=store&a=cat_list';
const providerUrl ='wxapp.php?c=store&a=get_store_list'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:'',
    coninx:0,
    meth:0,
    procList:[],
    cat_fid:'',
    uid:'',
    page:1,
    providerList:[],
    next_page:false,
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  // 获取分类
  getclassify() {
    var uid = this.data.uid
    app.api.postApi(cataUrl, {uid:uid?uid:0}, (err, res) => {
      console.log(res)
      var procList = res.err_msg.data
      console.log(procList[0].cat_id )
      this.setData({ procList, cat_fid: procList[0].cat_id })
      // this.getproviderList()
      this.choosesidebar()
    })
  },
  // 获取供应商列表---加载多页
  getproviderList(){
    var {cat_fid,page,uid}=this.data
    var params = {"cat_fid":cat_fid,"cat_sid":"0","page":page,"keyword":"","uid":uid}
    app.api.postApi(providerUrl,{params},(err,res)=>{
      if (res.err_code == 0) {
        var providerList=res.err_msg.data;
        var list = this.data.list
        providerList.forEach(item => {
          list.push(item)
        })
        this.setData({ providerList:list,next_page:res.err_msg.next_page })
      } else {
        this.setData({ providerList: [] })
        wx.showToast({
          title: res.err_msg.err_log,
          icon: 'none'
        })
      }
    })
  },
  // 点击侧边栏
  choosesidebar(e){
    var cat_fid;
    if(e){
      cat_fid = e.currentTarget.dataset.catid
    }else{
      cat_fid = this.data.cat_fid
    }
    this.setData({ cat_fid: cat_fid})
    var params = { "cat_fid": cat_fid, "cat_sid": "0", "page":1, "keyword": "", "uid": this.data.uid }
    app.api.postApi(providerUrl,{params},(err,res)=>{
      if(res.err_code==0){
        this.setData({ providerList: res.err_msg.data })
      }else{
        // this.setData({ providerList:[] })
        wx.showToast({
          title: res.err_msg.err_log,
          icon:'none',
          duration:1000
        })
      }
      
    })
  },
  // 进入批发商
  gowholesaler(e){
    console.log(e)
    var storeid=e.currentTarget.dataset.storeid
    wx.navigateTo({
      url: '../../common/wholesaler?store_id='+storeid,
    })
  },
  // 跳转商品详情
  godetail(e){
    var productid = e.currentTarget.dataset.productid
    wx.navigateTo({
      url: '../../common/goods-detail?product_id=' + productid,
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
    var uid = wx.getStorageSync('userUid')
    this.setData({ uid })
    if (app.cartNum > 0) {
      wx.setTabBarBadge({//这个方法的意思是，为小程序某一项的tabbar右上角添加文本
        index: 3,   //代表哪个tabbar（从0开始）
        text: app.cartNum	//显示的内容
      })
    }
    this.getclassify()
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
      this.data.page++
      this.getproviderList()
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