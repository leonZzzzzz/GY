// page/common/pages/search-catch.js
let app = getApp();
const productSearch = 'wxapp.php?c=product&a=get_product_list';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showdata: false,
    valpro: "",
    productList: [],
    err_code: '',
    page: 1,
    next_page: false,
    isHideLoadMore: true,
    isfalse: true,
    value: '',
    uid:'',
    order_by_field:'sales'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid = wx.getStorageSync('userUid')
    this.setData({ uid })
  },
  gotodetail(e) {
    var prodId = e.currentTarget.dataset.prodid;
    wx.navigateTo({
      url: 'goods-detail?product_id=' + prodId,
    })
  },
  // 清空input
  setValue: function () {
    this.setData({
      value: ""
    })
  },
  //输入商品名称
  searchProduct(e) {
    this.setData({
      valpro: e.detail.value,
    })
  },
  // 加载更多方法
  searchSubmit() {
    var that = this;
    var params = {
      "cat_fid": '',
      "cat_sid": '',
      "page": this.data.page,
      "keyword": this.data.valpro,
      "order_by_field": this.data.order_by_field,
      "order_by_method": "desc",
      "uid": this.data.uid
    }
    app.api.postApi(productSearch, {params}, (err, rep) => {
      var { err_code, err_msg } = rep;
      let productList = that.data.productList;
      if (err_code == 0) {
        var dataitem = err_msg.data;
        dataitem.forEach(item => {
          productList.push(item)
        })
        if (err_msg.next_page) {
          that.setData({
            isHideLoadMore: false,
            isfalse: true,
          })
        } else {
          if (productList.length > 0 && productList.length < 6) {
            that.setData({
              isHideLoadMore: true,
              isfalse: true,
            })
          } else {
            that.setData({
              isfalse: false
            })
          }
        }

      } else {
        that.setData({
          err_code,
        });
      }
      that.setData({
        productList: productList,
        err_code,
        next_page: err_msg.next_page
      })
    })
  },
  // 搜索
  submit() {
    var that = this;
    var params = {
      "cat_fid": '',
      "cat_sid": '',
      "page": 1,
      "keyword": this.data.valpro,
      "order_by_field": this.data.order_by_field,
      "order_by_method": "desc",
      "uid": this.data.uid
    }
    app.api.postApi(productSearch, { params}, (err, rep) => {
      var { err_code, err_msg } = rep;
      if (err_code == 0) {
        var dataitem = err_msg.data;
        if (err_msg.next_page) {
          console
          that.setData({
            isHideLoadMore: false,
            isfalse: true,
          })
        } else {
          if (dataitem.length > 0 && dataitem.length < 6) {
            that.setData({
              isHideLoadMore: true,
              isfalse: true,
            })
          } else {
            that.setData({
              isfalse: false
            })
          }
        }
        that.setData({
          productList: dataitem,
          err_code,
          next_page: err_msg.next_page
        });
      } else {
        that.setData({
          err_code,
        });
      }
      that.setData({
        productList: dataitem,
        err_code,
        next_page: err_msg.next_page
      })
    })
  },
  // 切换销量和价格
  checkList(e){
    var field=e.currentTarget.dataset.field;
    this.setData({order_by_field:field})
    this.submit()
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
    this.data.page++;
    if (this.data.next_page) {
      setTimeout(() => {
        this.setData({
          isHideLoadMore: false,
        })
        var opt = { page: this.data.page };
        this.searchSubmit();
      }, 1000)
    } else {
      this.setData({
        isHideLoadMore: true,
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})