const app = getApp()

Page({
  data: {
    orderSn: '',
    openId: '',
    memberId: '',
    fontNum: 300,
    fontNumB: 300,
    stars: [0, 1, 2, 3, 4],
    starsB: [0, 1, 2, 3, 4],
    normalSrc: '../../img/xingxing.png',
    selectedSrc: '../../img/xingxing_1.png',
    key: 0,//评分
    keyB: 0,//评分
    isTrue: true, //是否多个商家
    imgbox: '',
    imgboxB: ''
  },
  onLoad(opt) {
    if (opt.length == 2) {
      that.setData({
        isTrue: true,
      })
    }

  },
  //点击右边递增,否则递减，评分，商品+商家B
  selectRight(e) {
    console.log(e)
    var key = e.currentTarget.dataset.key;  //评分
    if (this.data.key == 1 && e.currentTarget.dataset.key == 1) {
      //只有一颗星的时候,再次点击,变为0颗
      key = 0;
    }
    this.setData({
      key: key
    })
  },

 
  //发布评论不验证图片
  hrSubmit(t) { //提交发布,商品+商家
    var d = t.detail.value,
      orderSn = this.data.orderSn,
      memberId = this.data.memberId,
      evaG = JSON.stringify({ evaGoodsInfo: [{ goodsId: this.data.goodsId, evaGoodsGrade: this.data.key, evaGoodsContent: d.advice, evaGoodsImage: this.data.imgbox }] }),
      evaS = JSON.stringify({ evaStoreInfo: { evaServiceGrade: this.data.keyB, evaServiceContent: d.adviceB, evaStoreImage: this.data.imgboxB } });
    $http({
      url: `v4/shop/evaluate/goodsOrStore/${orderSn}/${memberId}`,  //{orderSn}/{memberId}
      method: 'POST',
      data: {
        evaGoodsInfo: evaG,  //商品评价
        evaStoreInfo: evaS,  //商家评价
        inway: 2
      }
    }).then(response => {
      if (response.isSuccess === true) {
        $toast('评价成功！')
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/myOrder/myOrder' })
        }, 1000)
      }
    }).catch((error) => {
      console.log(error)
    })
  },
  //上传图片，商品+商家B
  uploadPic: function (e) {
    var that = this;
    var imgbox = this.data.imgbox;
    var picid = e.currentTarget.dataset.pic;
    var n = 4;
    if (4 > imgbox.length > 0) {
      n = 4 - imgbox.length;
    } else if (imgbox.length == 4) {
      n = 1;
    }
    wx.chooseImage({
      count: n, // 默认数量
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        if (imgbox.length == 0) {
          imgbox = tempFilePaths
        } else if (4 > imgbox.length) {
          imgbox = imgbox.concat(tempFilePaths);

        } else {
          imgbox[picid] = tempFilePaths[0];
        }
        $uploadFile({
          filePath: tempFilePaths[0],
          formData: {
            evaluateType: 'store'
          },
          name: 'evaluteImage',
          url: 'v4/shop/file/uploadBySmall'
        }).then((res) => {
          if (res.isSuccess) {
            let url = res.resultData
            that.setData({
              imgbox: [url],
              imgbox: imgbox,
            })
            //$toast('图片上传成功')
          } else {
            //$toast(res.message)
          }
        })
      }
    })
  },
  uploadPicB: function (e) {
    var that = this;
    var imgboxB = this.data.imgboxB;
    var picid = e.currentTarget.dataset.pic;
    var n = 4;
    if (4 > imgboxB.length > 0) {
      n = 4 - imgboxB.length;
    } else if (imgboxB.length == 4) {
      n = 1;
    }
    wx.chooseImage({
      count: n, // 默认图片数量
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        if (imgboxB.length == 0) {
          imgboxB = tempFilePaths;
        } else if (4 > imgboxB.length) {
          imgboxB = imgboxB.concat(tempFilePaths);
        } else {
          imgboxB[picid] = tempFilePaths[0];
        }
        $uploadFile({
          filePath: tempFilePaths[0],
          formData: {
            evaluateType: 'store'
          },
          name: 'evaluteImage',
          url: 'v4/shop/file/uploadBySmall'
        }).then((res) => {
          if (res.isSuccess) {
            let url = res.resultData
            that.setData({
              imgboxB: [url],
              imgboxB: imgboxB,
            })
            //$toast('图片上传成功')
          } else {
            //$toast(res.message)
          }
        })
      }
    })
  },
  // 上传图片
  uploadImgSuccess(res, file, fileList) {
    if (res.isSuccess) {
      let arr = res.resultData.split('/')
      this.data.imageListHD.push(arr[arr.length - 1])
    } else {
      fileList.splice(-1, 1)
      $toast(res.message)
      return
    }
  },
  //删除图片
  clearPic: function (e) {//删除图片
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let imgbox = this.data.imgbox;
    imgbox.splice(index, 1)
    that.setData({
      imgbox: imgbox
    });
  },
  clearPicB: function (e) {//删除图片
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let imgboxB = this.data.imgboxB;
    imgboxB.splice(index, 1)
    that.setData({
      imgboxB: imgboxB
    });
  },

  onShareAppMessage: function () {

  }
})