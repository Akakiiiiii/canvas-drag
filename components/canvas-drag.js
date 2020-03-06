// components/canvas-drag.js
var CloseIcon = "/image/close.png";

var ScaleIcon = "/image/放大.png";

class dragImg {
  constructor(img, canvas) {
    this.x = 30;
    this.y = 30;
    this.w = img.width;
    this.h = img.height;
    this.url = img.url
    this.ctx = canvas;
    this.rotate = 0;
    this.selected = true;
  }
  paint() {
    this.ctx.save();
    this.centerX = this.x + this.w / 2;
    this.centerY = this.y + this.h / 2;
    // 旋转元素
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotate * Math.PI / 180);
    this.ctx.translate(-this.centerX, -this.centerY);
    // 渲染元素
    this.ctx.drawImage(this.url, this.x, this.y, this.w, this.h);
    // 如果是选中状态，绘制选择虚线框，和缩放图标、删除图标
    if (this.selected) {
      this.ctx.setLineDash([10, 10]);
      this.ctx.setLineWidth(2);
      this.ctx.setStrokeStyle("red");
      this.ctx.lineDashOffset = 10;
      this.ctx.strokeRect(this.x, this.y, this.w, this.h);
      this.ctx.drawImage(CloseIcon, this.x - 15, this.y - 12, 24, 24);
      this.ctx.drawImage(ScaleIcon, this.x + this.w - 15, this.y + this.h - 12, 24, 24);
    }
    this.ctx.restore();
  }
  isInWhere(x, y) {
    // 变换区域左上角的坐标和区域的高度宽度
    let transformW = 24;
    let transformH = 24;
    let transformX = this.x + this.w ;
    let transformY = this.y + this.h ;
    let transformAngle = Math.atan2(transformY - this.centerY, transformX - this.centerX) / Math.PI * 180 + this.rotate
    let transformXY = this.getTransform(transformX, transformY, transformAngle);
    transformX = transformXY.x, transformY = transformXY.y
    // 删除区域左上角的坐标和区域的高度宽度
    let delW = 24;
    let delH = 24;
    let delX = this.x;
    let delY = this.y;
    let delAngle = Math.atan2(delY - this.centerY, delX - this.centerX) / Math.PI * 180 + this.rotate
    let delXY = this.getTransform(delX, delY, delAngle);
    delX = delXY.x, delY = delXY.y
    //移动区域的坐标
    let moveX = this.x;
    let moveY = this.y;
    if (x - transformX >= 0 && y - transformY >= 0 && transformX + transformW - x >= 0 && transformY + transformH - y >= 0) {
      // 缩放区域
      return "transform";
    }
    else if (x - delX >= 0 && y - delY >= 0 && delX + delW - x >= 0 && delY + delH - y >= 0) {
      // 删除区域
      return "del";
    }
    else if (x - moveX >= 0 && y - moveY >= 0 && moveX + this.w - x >= 0 && moveY + this.h - y >= 0) {
      // 移动区域
      return "move";
    }
    // 不在选择区域里面
    return false;
  }
  getTransform(x, y, rotate) {
    //将角度化为弧度
    var angle = Math.PI / 180 * rotate;
    //初始坐标与中点形成的直线长度不管怎么旋转都是不会变的，用勾股定理求出然后将其作为斜边
    var r = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
    //斜边乘sin值等于即可求出y坐标
    var a = Math.sin(angle) * r;
    //斜边乘cos值等于即可求出x坐标
    var b = Math.cos(angle) * r;
    //目前的xy坐标是相对于图片中点为原点的坐标轴，而我们的主坐标轴是canvas的坐标轴，所以要加上中点的坐标值才是标准的canvas坐标
    return {
      x: this.centerX + b - 12,
      y: this.centerY + a - 12
    };
  }
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgArr: {
      type: Array,
      value: [],
      observer: "onArrChange"
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    ctx: null,
    dragArr: []
  },
  ready() {
    this.data.ctx = wx.createCanvasContext("canvas", this);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    draw() {
      this.data.dragArr.forEach((item) => {
        item.paint()
      })
      this.data.ctx.draw()
    },
    onArrChange(arr) {
      if (arr.length) {
        const newImg = arr.slice(-1)[0]
        const item = new dragImg(newImg, this.data.ctx)
        this.data.dragArr.push(item)
        this.draw()
      }
    },
    start(e) {
      //初始化一个数组用于存放所有被点击到的图片对象
      this.data.clickedkArr = []
      const { x, y } = e.touches[0]
      this.data.dragArr.forEach((item,index) => {
        const place = item.isInWhere(x, y)
        item.place = place
        item.index = index
        //先将所有的item的selected变为flase
        item.selected = false
        if (place) {
          this.data.clickedkArr.push(item)
        }
      })
      const length = this.data.clickedkArr.length
      if (length) {
        //我们知道cavans绘制的图片的层级是越来越高的，因此我们取这个数组的最后一项，保证取到的图片实例是层级最高的
        const lastImg = this.data.clickedkArr[length - 1]
        //如果是删除的话就移除
        if(lastImg.place ==='del'){
          this.data.dragArr.splice(lastImg.index,1)
          //重新绘制
          this.draw()
          return
        }
        //将该实例的被选值设为true，下次重新绘制将绘制边框
        lastImg.selected = true
        //保存这个选中的实例
        this.data.lastImg = lastImg
        //保存这个实例的初始值，以后会用上
        this.data.initial = {
          initialX: lastImg.x,
          initialY: lastImg.y,
          initialH:lastImg.h,
          initialW:lastImg.w,
          initialRotate:lastImg.rotate
        }
      }
      //重新绘制
      this.draw()
      //保存点击的坐标，move时要用
      this.data.startTouch = { startX : x, startY : y }
    },
    move(e) {
      const { x, y } = e.touches[0]
      const { initialX, initialY } = this.data.initial
      const { startX, startY } = this.data.startTouch
      const lastImg = this.data.lastImg
      if (this.data.clickedkArr.length) {
        if (this.data.lastImg.place === 'move') {
          //算出移动后的xy坐标与点击时xy坐标的差（即平移量）与图片对象的初始坐标相加即可
          lastImg.x = initialX + (x - startX)
          lastImg.y = initialY + (y - startY)
        }
        if (this.data.lastImg.place === 'transform'){
          const { centerX, centerY } = lastImg
          //旋转部分
          const { initialRotate } = this.data.initial
          const angleBefore = Math.atan2(startY - centerY, startX - centerX) / Math.PI * 180;
          const angleAfter = Math.atan2(y - centerY, x - centerX) / Math.PI * 180;
          // 旋转的角度
          lastImg.rotate = initialRotate + angleAfter - angleBefore
          //缩放部分
          const { initialH, initialW } = this.data.initial
          //用勾股定理算出距离
          let lineA = Math.sqrt(Math.pow(centerX - startX, 2) + Math.pow(centerY - startY, 2));
          let lineB = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
          let w = initialW + (lineB - lineA);
          //由于是等比缩放，所以乘一个宽高比例。
          let h = initialH + (lineB - lineA) * (initialH / initialW);
          //定义最小宽高
          lastImg.w = w <= 5 ? 5 : w;
          lastImg.h = h <= 5 ? 5 : h;
          if (w > 5 && h > 5) {
            // 放大 或 缩小
            lastImg.x = initialX - (lineB - lineA) / 2;
            lastImg.y = initialY - (lineB - lineA) / 2;
          }
        }
        this.draw()
      }
    }
  }
})
