let app = getApp()
const cellectListUrl = 'wxapp.php?c=collect&a=collect_goods'
const cancelCellectUrl ='wxapp.php?c=collect&a=cancel';//取消收藏
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:'',
    page:1,
    list:[],
    collectData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid=wx.getStorageSync('userUid')
    this.setData({uid})
    this.getCellectList()
  },

  getCellectList(){
    app.api.postApi(cellectListUrl,{params:{"page":this.data.page,"uid":this.data.uid}},(err,res)=>{
      var {data,next_page}=res.err_msg
      if(res.err_code==0){
        var list = this.data.list
        data.forEach(item=>{
          list.push(item)
        })
        this.setData({ collectData: list,next_page})
      }
    })
  },
  cancelCellectList() {
    app.api.postApi(cellectListUrl, { params: { "page": this.data.page, "uid": this.data.uid } }, (err, res) => {
      var { data, next_page } = res.err_msg
      if (res.err_code == 0) {
        var list = []
        data.forEach(item => {
          list.push(item)
        })
        this.setData({ collectData: list, next_page })
      }
    })
  },
  // 取消收藏
  cancelCel(e){
    var that = this
    var product_id = e.currentTarget.dataset.id;
    var params = { "type": 1, "uid": this.data.uid, "id": product_id}
    wx.showModal({
      content: '确定要删除吗？',
      success: function (res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          app.api.postApi(cancelCellectUrl, { params }, (err, res) => {
            if (res.err_code == 0) {
              wx.showToast({
                title: '取消成功',
                icon: 'none'
              })
              setTimeout(function () {
                that.cancelCellectList()
              }, 2000)
            } else {
              wx.showToast({
                title: res.err_msg.err_log,
                icon: 'none'
              })
            }
          })
        }
      },
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