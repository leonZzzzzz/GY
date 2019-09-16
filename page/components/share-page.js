// page/components/share-page.js
import Poster from './poster/poster/poster'

let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    codeFlag: {
      type: Boolean,
      value: false
    },
    opt: {
      type: Object,
      value: {}
    },
    shareShade: {
      type: Boolean,
      value: false
    },
    posterShade: {
      type: Boolean,
      value: false
    },
    promote:{
      type: Boolean,
      value:false
    },
    product: {
      type: Object,
      value: {}
    },
    jdImg: {
      type: String,
      value: null
    },
    qrImg: {
      type: String,
      value: null
    },
    posterConfig: {
      type: Object,
      value: {}
    },
    storeId:Number,
    poster: Object
  },


  /**
   * 组件的初始数据
   */
  ready() { 
    console.log(this.properties);
  },
  attached: function () { },
  moved: function () { },
  detached: function () { },
  /**
   * 组件的方法列表
   */
  methods: {
    onTap: function () {
      this.setData({ shareShade: false })
    },
    onClose: function () {
      this.setData({ posterShade: false, })
    },
    offpromote(){
      this.setData({
        promote:false
      })
    },
    codeclose() {
      this.setData({
        codeFlag: false
      })
    },
    // 弹出小程序二维码
    onshowCode(e) {
      this.setData({
        codeFlag: true
      })
    },
    // 保存小程序二维码
    saveCode(e) {
      let that = this;
      var jdImg = that.data.jdImg
      // const { jdImg } = that.properties;
      wx.downloadFile({
        url: jdImg,
        success: function (res) {
          //图片保存到本地
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (data) {
              console.log(data)
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500
              })
            },
            fail: function (err) {
              wx.showToast({
                title: '保存图片失败',
                icon: 'none'
              })
            },
            complete(res) {
              console.log(res);
            }
          })
        }
      })

    },
    /**弹出海报 */
    onshowposter(e) {
      this.setData({ posterShade: true })
    },
    // 保存图文卡片
    onPosterSuccess(e) {
      console.log(this.properties)
      let that = this;
      const { detail } = e;
      console.log(e.detail);
      wx.saveImageToPhotosAlbum({
        filePath: e.detail,
        success: function (data) {
          console.log(data)
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 1500
          })
        },
        fail: function (err) {
          wx.showToast({
            title: '保存图片失败',
            icon: 'none'
          })
        },
        complete(res) {
          console.log(res);
        }
      })
      // wx.downloadFile({
      //   url: e.detail,
      //   success: function (res) {
      //     console.log(res)
      //     //图片保存到本地
          
      //   }
      // })

    },
    onPosterFail(err) {
      console.error(err);
    },


  }
})
