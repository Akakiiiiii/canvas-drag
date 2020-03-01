//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    imgArr:[]
  },
  addImg(e){
    const this1 = this
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album"],
      success(res) {
        const tempFilePaths = res.tempFilePaths[0]
        wx.getImageInfo({
          src: tempFilePaths,
          success(res) {
            const {width,height} = res
            const scale = this1.getScale(width,height)
            const obj = {
              width:width/scale,
              height:height/scale,
              url: tempFilePaths
            }
            const imgArr = this1.data.imgArr
            imgArr.push(obj)
            setTimeout(()=>{
              this1.setData({
                imgArr
              })
            },100)
          }
        })
      }
    })
  },
  getScale(width,height){
    if (width >= height) {
      if (height <= 120) {
        return 1;
      } else {
        return height / 120;
      }
    } else if (height > width) {
      if (width <= 120) {
        return 1;
      } else return width / 120;
    }
  }
})
