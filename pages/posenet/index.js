//index.js
const posenet = require("@tensorflow-models/posenet")
const tf = require("@tensorflow/tfjs-core")

const FRAME_NUM = 1
Page({

  async onReady() {

    //获取camera和canvas上下文
    const {
      camera,
      canvas
    } = this.init()

    this.drawLine(canvas, {
      x: 0,
      y: 0
    }, {
      x: 100,
      y: 100
    })
    //异步加载model
    this.loadModel()

    let count = 0
    camera.onCameraFrame((frame) => {
      //每FRAME_NUM帧处理一次帧数据
      if (this.net && ++count >= FRAME_NUM) {

        count = 0
        //异步处理一次帧数据
        this.detect(frame, this.net, canvas)
      }
    }).start()
  },

  init() {
    const camera = wx.createCameraContext(this)
    const canvas = wx.createCanvasContext("canvas", this)
    return {
      camera,
      canvas
    }
  },

  async loadModel() {
    await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 193,
      multiplier: 0.5,
      maxDetections: 1,
      modelUrl: "https://www.gstaticcnapps.cn/tfjs-models/savedmodel/posenet/mobilenet/float/050/model-stride16.json"
    }).then(model =>{
      this.net = model
      console.log("模型加载完成");
    }).catch(e=>{
      console.log("模型加载失败");
    })
    
  },


  async detect(frame, net, canvas) {
    const data = tf.tidy(() => {
      const temp = tf.tensor(new Uint8Array(frame.data), [frame.height, frame.width, 4])
      return temp.slice([0, 0, 0], [-1, -1, 3])
    })
    const result = await net.estimateSinglePose(
      data, {
        flipHorizontal: false
      })
    data.dispose()
    //输出结果
    this.showResult(result, canvas)
  },


  async showResult(result, canvas) {
    if (result == null || canvas == null) {
      return
    }
    if (result.score >= 0.2) {
      for (let i in result.keypoints) {
        const point = result.keypoints[i]
        if (point.score >= 0.5) {
          const {
            x,
            y
          } = point.position
          this.drawCircicle(canvas, x, y)
        }
      }
      const adjacentKeyPoints = posenet.getAdjacentKeyPoints(result.keypoints, 0.5)
      for (let i in adjacentKeyPoints) {
        const points = adjacentKeyPoints[i]
        this.drawLine(canvas, points[0].position, points[1].position)
      }
    }
    canvas.draw()
  },
  drawCircicle(canvas, x, y) {
    canvas.beginPath()
    canvas.fillStyle = 'aqua'
    canvas.arc(x * 1.4, y, 3, 0, 2 * Math.PI)
    canvas.fill()
  },
  drawLine(canvas, pos0, pos1) {
    canvas.beginPath()
    canvas.moveTo(pos0.x * 1.4, pos0.y)
    canvas.lineTo(pos1.x * 1.4, pos1.y)
    canvas.lineWidth = 2
    canvas.strokeStyle = `aqua`
    canvas.stroke()
  }
})