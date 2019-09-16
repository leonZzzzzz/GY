Component({
  properties: {
    config: {
      type: Object,
      value: {},
    },
    preload: {  // 是否预下载图片资源
      type: Boolean,
      value: false,
    },
    hideLoading: {  // 是否隐藏loading
      type: Boolean,
      value: false,
    }
  },
  ready() {
    if (this.data.preload) {
      console.log(this.data.config)
      const poster = this.selectComponent('#poster');
      this.downloadStatus = 'doing';
      console.log(poster)
      console.log(this.data.config.images)
      poster.downloadResource(this.data.config.images).then(() => {
        this.downloadStatus = 'success';
        this.trigger('downloadSuccess');
      }).catch((e) => {
        console.log(2222)
        this.downloadStatus = 'fail';
        this.trigger('downloadFail', e);
      });
    }
  },
  methods: {
    trigger(event, data) {
      console.log(event,data)
      if (this.listener && typeof this.listener[event] === 'function') {
        this.listener[event](data);
      }
    },
    once(event, fun) {
      console.log(4444)
      if (typeof this.listener === 'undefined') {
        this.listener = {};
      }
      this.listener[event] = fun;
    },
    downloadResource() {
      
      return new Promise((resolve, reject) => {
        const poster = this.selectComponent('#poster');
        if (this.downloadStatus && this.downloadStatus !== 'fail') {
          if (this.downloadStatus === 'success') {
            console.log(5555)
            resolve();
          } else {
            this.once('downloadSuccess', () => resolve());
            this.once('downloadFail', (e) => reject(e));
          }
        } else {
          console.log(6666)
          poster.downloadResource(this.data.config.images)
            .then(() => {
              console.log(7777)
              this.downloadStatus = 'success';
              resolve();
            })
            .catch((e) =>{
              console.log(8888)
              reject(e)
            });
        }
      })
    },
    onCreate() {
      !this.data.hideLoading && wx.showLoading({ mask: true, title: '生成中' });
      return this.downloadResource().then(() => {
        console.log(9999)
        this.data.hideLoading && wx.hideLoading();
        const poster = this.selectComponent('#poster');
        poster.create(this.data.config);
      })
        .catch((err) => {
          !this.data.hideLoading && wx.hideLoading();
          wx.showToast({ icon: 'none', title: err.errMsg || '生成失败' });
          console.error(err);
        })
    },
    onCreateSuccess(e) {
      const { detail } = e;
      this.triggerEvent('success', detail);
    },
    onCreateFail(err) {
      console.error(err);
      this.triggerEvent('fail', detail);
    }
  }
})