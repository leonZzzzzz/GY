let util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photos: [],
    pics: [],
    count: [1, 2, 3],
    isShow: true,
    turnStatus: null,
    product: [],
    dataList: '',
    orderId: '',
    productId: '',
    rtnCode: '',
    showHide: true,
    isSale: true,
    phoneTxt: app.config.phoneTxt,
    serverTxt: app.config.serverTxt,
    flag: false,
    milk: false,
    unfill: ['仅退款'],
    fill: ['退货退款', '换货', '补发商品'],
    fills: ['换货', '补发商品'],
    // reason: ['拍错/多拍/不喜欢', '质量问题', '商品描述不符', '商家发错货','商品破损/少件','其他'],
    reason: [],
    index: '',
    ind: '',
    is_packaged: '',// 0-商品未发货；1-商品已发货
    remark: '',
    phone: '',
    content_code: '',
    isfor: false,
    imagesPress: [],
  },
  calling() {
    app.calling();
  },

  // 图片上传
  chooseImage: function () {
    var _this = this,
      pics = this.data.pics;
    wx.chooseImage({
      count: 3 - pics.length, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var tempFilesSize = res.tempFiles[0].size;  //获取图片的大小，单位B
        if (tempFilesSize <= 2000000) {   //图片小于或者等于2M时 可以执行获取图片
          var FSM = wx.getFileSystemManager();
          var imgSrc = res.tempFilePaths;
          pics = pics.concat(imgSrc);
          var picture = [];
          for (let r in pics) {
            FSM.readFile({
              filePath: pics[r],
              encoding: "base64",
              success: function (data) {
                var img = 'data:image/jpg;base64,' + data.data
                picture.push(img)
                _this.setData({ photos: picture })
                // console.log(this.data.photos)
              }
            });
          }
        } else {
          wx.showToast({
            title: '上传图片不能大于1M',
            icon: 'none'
          })
        }


        // 控制触发添加图片的最多时隐藏
        if (pics.length >= 3) {
          _this.setData({
            isShow: (!_this.data.isShow)
          })
        } else {
          _this.setData({
            isShow: (_this.data.isShow)
          })
        }
        _this.setData({
          pics: pics
        })
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  // 图片预览
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.pics
    })
  },
  //删除图片
  deleteImg(e) {
    var pics = this.data.pics;
    var photos = this.data.photos;
    var index = e.currentTarget.dataset.index;
    pics.splice(index, 1);
    photos.splice(index, 1);
    this.setData({
      pics: pics,
      photos: photos
    });
    if (pics.length < 3) {
      this.setData({ isShow: true })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    isShow: (options.isShow == "true" ? true : false)
    var that = this;
    var orderId = options.orderId;
    var orderProductId = [options.orderProductId];
    var uid = options.uid;
    that.setData({
      attr: options.attr,
      id: options.id,
      img: options.img,
      name: options.name,
      price: options.price,
      pronum: options.pronum,
      value: options.value,
      orderId: orderId,
      orderProductId: orderProductId,
      uid: uid,
      is_packaged: options.is_packaged
    })

    var params = {
      "order_no": orderId,
      "pigcms_id": orderProductId,
      "uid": uid
    };
    // console.log('请求参数', params);

    // app.api.postApi('wxapp.php?c=return&a=applyReturn', { params }, (err, response) => {
    //   // console.log('applyReturn接口返回数据=', response);
    //   if (err) return;
    //   if (response.err_code != 0) {

    //     wx.showModal({
    //       title: '错误提示',
    //       content: response.err_msg.err_log,
    //       showCancel: true,
    //       cancelText: '取消',
    //       cancelColor: '#FF0000',
    //       confirmText: '好的',
    //     });
    //   } else {
    //     wx.hideLoading();
    //     var product = response.err_msg.returndata;
    //     var a = util.formatTime(product.add_time);//时间戳转日期格式
    //     product.even_time = a
    //     that.setData({
    //       dataList: product
    //     })
    //   }
    // });
    this.gainCause();
  },
  // 获取申请原因接口
  gainCause() {
    app.api.postApi('wxapp.php?c=return&a=ReturnSource', { params: { pigcms_id: this.data.orderProductId } }, (err, res) => {
      this.setData({ reason: res.err_msg })
    })
  },
  // 售后类型
  bindCasPickerChange(e) {
    console.log(e)
    this.setData({ index: e.detail.value, flag: true })
  },
  // 申请原因
  bindCasPickereason(e) {
    this.setData({ ind: e.detail.value, content_code: this.data.reason[e.detail.value].code, milk: true })
  },
  // 手机号
  getphone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  // 备注信息
  getreason(e) {
    this.setData({
      remark: e.detail.value
    })
  },
  save(e) {
    var that = this;
    // var phone = wx.getStorageSync('phone');
    var orderProductId = this.data.orderProductId;
    var orderId = this.data.orderId;
    var uid = this.data.uid;
    if (this.data.is_packaged == 0) {
      var type = 1
      var refund_type = 2
    } else if (this.data.is_packaged == 1) {
      if (this.data.index == 0) {
        var type = 1
        var refund_type = 1
      } else if (this.data.index == 1) {
        var type = 2
        var refund_type = 0
      } else if (this.data.index == 2) {
        var type = 4
        var refund_type = 0
      }
    } else {
      // fill: ['退货退款', '换货', '补发商品'],
      //   fills: ['换货', '补发商品'],
      if (this.data.index == 0) {
        var type = 2
        var refund_type = 0
      } else if (this.data.index == 1) {
        var type = 4
        var refund_type = 0
      }
    }
    var content = this.data.reason[this.data.ind].name;
    // var ind = this.data.ind;
    // if(ind==0 || ind==2 || ind==3 || ind==5){
    //   var content_code='01'
    // }else if(ind==1 ||ind==4){
    //   var content_code='02'
    // }
    if (this.data.index == '') {
      wx.showToast({
        title: '请选择售后类型',
        icon: 'none',
      })
      return;
    }
    if (this.data.ind == '') {
      wx.showToast({
        title: '请选择申请原因',
        icon: 'none',
      })
      return;
    }
    if (this.data.phone == '') {
      wx.showToast({
        title: '请填写手机号码',
        icon: 'none',
      })
      return;
    } else {
      var myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.data.phone)) {
        wx.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        })
        return;
      }
    }
    wx.showLoading({
      title: '加载中',
    })
    var params = {
      "order_no": orderId,
      "pigcms_id": orderProductId,
      "uid": uid,
      "type": type,// 退货类型，1、退货，2、换货，3、维修，4、补发商品，5、其它
      refund_type: refund_type,//退货类型；默认0；1-退货退款；2-仅退款。type非1时传0 
      content: content,
      content_code: this.data.content_code,
      phone: this.data.phone,
      remark: this.data.remark,
      images: this.data.photos
    };
    var url = 'wxapp.php?c=return&a=doReturn_v2';
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();
      if (resp.err_code == 0) {
        wx.showToast({
          title: resp.err_msg.message,
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          wx.navigateTo({
            url: './purchase-detail?theId=' + resp.err_msg.return_id,
          })
        }, 2000);

        // that.setData({
        //   isfor: true
        // })
      } else {
        wx.showToast({
          title: resp.err_msg.err_log,
          icon: 'none'
        })
      }
    });
  },
  // 验证手机号格式
  // checkMobile() {
  //   var sMobile = document.mobileform.mobile.value
  //   if (!(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/.test(sMobile))) {
  //     alert("不是完整的11位手机号或者正确的手机号前七位");
  //     document.mobileform.mobile.focus();
  //     return false;
  //   }
  // },
  // 提交申请
  goSubmit(e) {
    console.log(e)
    var that = this;
    var turnStatus = e.target.dataset.status;
    //var orderId = this.data.orderId;
    var orderProductId = this.data.orderProductId;
    var orderId = this.data.orderId;
    var uid = this.data.uid;

    if (turnStatus == null) {
      wx.showToast({
        title: '请选择服务类型',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    var params = {
      "order_no": orderId,
      "pigcms_id": orderProductId,
      "uid": uid,
      "type": turnStatus
    };
    that.setData({
      isSale: false,
    })
    var url = 'wxapp.php?c=return&a=doReturn';
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();
      if (resp.err_code == 0) {
        // that.setData({
        //   isSale: false,
        //   showHide: false
        // })
        wx.showToast({
          title: '提交成功',
          icon: 'loading',
          duration: 1500
        })
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.showToast({
          title: resp.err_msg.err_log,
          icon: 'none'
        })
        that.setData({
          isSale: true,
        })
      }
    });
  },
  // 选择服务类型
  turnColor(e) {
    var that = this;
    var turnStatus = e.target.dataset.status;
    that.setData({
      turnStatus: turnStatus
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