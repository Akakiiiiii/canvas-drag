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
      this.ctx.drawImage(CloseIcon, this.x - 15, this.y - 15, 24, 24);
      this.ctx.drawImage(ScaleIcon, this.x + this.w - 15, this.y + this.h - 15, 24, 24);
    }
    this.ctx.restore();
  }

  isInWhere(x, y) {
    var selectW = this.w;
    var selectH = this.h;
    // 删除区域左上角的坐标和区域的高度宽度
    var delW = 24;
    var delH = 24;
    var delX = this.x - 12;
    var delY = this.y - 12;
    // // 旋转后的删除区域坐标
    // var transformDelX = this._getTransform(delX, delY, this.rotate - this._getAngle(this.centerX, this.centerY, delX, delY)).x - 15;
    // var transformDelY = this._getTransform(delX, delY, this.rotate - this._getAngle(this.centerX, this.centerY, delX, delY)).y - 15;
    // 变换区域左上角的坐标和区域的高度宽度
    var scaleW = 24;
    var scaleH = 24;
    var scaleX = this.x + selectW - 12;
    var scaleY = this.y + selectH - 12;
    // 旋转后的变换区域坐标
    // var transformScaleX = this._getTransform(scaleX, scaleY, this.rotate + this._getAngle(this.centerX, this.centerY, scaleX, scaleY)).x - 15;
    // var transformScaleY = this._getTransform(scaleX, scaleY, this.rotate + this._getAngle(this.centerX, this.centerY, scaleX, scaleY)).y - 15;
    var moveX = this.x;
    var moveY = this.y;
    if (x - scaleX >= 0 && y - scaleY >= 0 && scaleX + scaleW - x >= 0 && scaleY + scaleH - y >= 0) {
      // 缩放区域
      return "transform";
    }
    else if (x - delX >= 0 && y - delY >= 0 && delX + delW - x >= 0 && delY + delH - y >= 0) {
      // 删除区域
      return "del";
    }
    else if (x - moveX >= 0 && y - moveY >= 0 && moveX + selectW - x >= 0 && moveY + selectH - y >= 0) {
      // 移动区域
      return "move";
    }
    // 不在选择区域里面
    return false;
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
      this.data.dragArr.forEach((item) => {
        const place = item.isInWhere(x, y)
        item.place = place
        //先将所有的item的selected变为flase
        item.selected = false
        if (place) {
          //如果place不是false就push进这个数组中
          this.data.clickedkArr.push(item)
        }
      })
      const length = this.data.clickedkArr.length
      if (length) {
        //我们知道cavans绘制的图片的层级是越来越高的，因此我们取这个数组的最后一项，保证取到的图片实例是层级最高的
        const lastImg = this.data.clickedkArr[length - 1]
        //将该实例的被选值设为true，下次重新绘制将绘制边框
        lastImg.selected = true
        //保存这个选中的实例
        this.data.lastImg = lastImg
        //保存这个实例的初始xy坐标，move时要用
        this.data.initial = {
          initialX: lastImg.x,
          initialY: lastImg.y,
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
          const { centerX, centerY }= lastImg
          const { initialRotate } = this.data.initial
          const diffXBefore = startX - centerX;
          const diffYBefore = startY - centerY;
          const diffXAfter = x - centerX;
          const diffYAfter = y - centerY;
          console.log(initialX,)
          const angleBefore = Math.atan2(diffYBefore, diffXBefore) / Math.PI * 180;
          const angleAfter = Math.atan2(diffYAfter, diffXAfter) / Math.PI * 180;
          // 旋转的角度
          lastImg.rotate = initialRotate + angleAfter - angleBefore;
        }
        this.draw()
      }
    }
  }
})
