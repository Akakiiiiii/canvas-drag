// components/canvas-drag.js

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
    }
    
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
    }
  }
})
