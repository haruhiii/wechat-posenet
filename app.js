var fetchWechat = require('fetch-wechat');
var tf = require('@tensorflow/tfjs-core');
var plugin = requirePlugin('tfjsPlugin');


//app.js

App({
  globalData:{
    index:0,
    models:[]
  },
  onLaunch: function () {
    plugin.configPlugin({
      // polyfill fetch function
      fetchFunc: fetchWechat.fetchFunc(),
      // inject tfjs runtime
      tf,
      // provide webgl canvas
      canvas: wx.createOffscreenCanvas()
    })
  }
});