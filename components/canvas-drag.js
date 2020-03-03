// components/canvas-drag.js
var CloseIcon = "/image/close.png";

var ScaleIcon = "/image/放大.png";

var dragImg = function (img, canvas) {
  this.x = 30;
  this.y = 30;
  this.w = img.width;
  this.h = img.height;
  this.url = img.url
  this.ctx = canvas;
  this.rotate = 0;
  this.selected = true;
};
dragImg.prototype = {
  paint(){
    
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
    
  },
  isInWhere(x,y){
    var selectW = this.w;
    var selectH = this.h;
    // 删除区域左上角的坐标和区域的高度宽度
    // var delW = 30;
    // var delH = 30;
    // var delX = this.x;
    // var delY = this.y;
    // // 旋转后的删除区域坐标
    // var transformDelX = this._getTransform(delX, delY, this.rotate - this._getAngle(this.centerX, this.centerY, delX, delY)).x - 15;
    // var transformDelY = this._getTransform(delX, delY, this.rotate - this._getAngle(this.centerX, this.centerY, delX, delY)).y - 15;
    // 变换区域左上角的坐标和区域的高度宽度
    var scaleW = 24;
    var scaleH = 24;
    var scaleX = this.x + selectW-12;
    var scaleY = this.y + selectH-12;
    // 旋转后的变换区域坐标
    // var transformScaleX = this._getTransform(scaleX, scaleY, this.rotate + this._getAngle(this.centerX, this.centerY, scaleX, scaleY)).x - 15;
    // var transformScaleY = this._getTransform(scaleX, scaleY, this.rotate + this._getAngle(this.centerX, this.centerY, scaleX, scaleY)).y - 15;
    var moveX = this.x;
    var moveY = this.y;
    console.log(x,scaleX)
    if (x - scaleX >= 0 && y - scaleY >= 0 && scaleX + scaleW - x >= 0 && scaleY + scaleH - y >= 0) {
      // 缩放区域
      return "transform";
    } 
    // else if (x - transformDelX >= 0 && y - transformDelY >= 0 && transformDelX + delW - x >= 0 && transformDelY + delH - y >= 0) {
    //   // 删除区域
    //   return "del";
    // } 
    // else if (x - moveX >= 0 && y - moveY >= 0 && moveX + selectW - x >= 0 && moveY + selectH - y >= 0) {
    //   // 移动区域
    //   return "move";
    // }
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
    ctx:null,
    dragArr:[]
  },
  ready(){
    this.data.ctx = wx.createCanvasContext("canvas",this);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    drag(){

    },
    onArrChange(arr){
      if(arr.length){
        const newImg = arr.slice(-1)[0]
        const item = new dragImg(newImg, this.data.ctx)
        this.data.dragArr.push(item)
        console.log(this.data.dragArr)
        this.data.dragArr.forEach((item)=>{
          item.paint()
        })
        this.data.ctx.draw()
      }
    },
    start(e){
      console.log(e)
      const {x,y} = e.touches[0]
      this.data.dragArr.forEach((item)=>{
        const place = item.isInWhere(x,y)
        console.log(place)
      })
    }
  }
})
