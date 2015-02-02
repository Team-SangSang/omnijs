/**
 *
 * 브랜치 (if문 역할)
 * 
 * orientation: true-right, false-left
 */
OMNI.Element.Branch = function(orientation) {

    // 부모 객체 (line)
    this.parent;

    // 그래픽
    this.graphics = new PIXI.DisplayObjectContainer();

    // 진입 블록
    this.entry = new OMNI.Element.Block();

    // 분기된 라인
    this.ifLine = new OMNI.Element.Line();
    this.elseLine = new OMNI.Element.Line();

    // 보조선
    this.horizontal_top = new OMNI.Element.HelperLine(false);
    this.horizontal_bottom = new OMNI.Element.HelperLine(false);
    
    // 접힌 방향
    this.orientation_ = orientation;
    
    // 부모 설정
    this.entry.parent = this;
    this.ifLine.parent = this;
    this.elseLine.parent = this;
    this.horizontal_top.parent = this;
    this.horizontal_bottom.parent = this;

    var ifContainer = new PIXI.DisplayObjectContainer();
    var elseContainer = new PIXI.DisplayObjectContainer();

    ifContainer.addChild(this.horizontal_top.graphics);
    ifContainer.addChild(this.horizontal_bottom.graphics);
    ifContainer.addChild(this.ifLine.graphics);

    elseContainer.addChild(this.elseLine.graphics);

    this.graphics.addChild(ifContainer);
    this.graphics.addChild(elseContainer);
    this.graphics.addChild(this.elseLine.elementsContainer);
    this.graphics.addChild(this.ifLine.elementsContainer);
    this.graphics.addChild(this.entry.graphics);

    // 이벤트 등록
    ifContainer.interactive = true;
    elseContainer.interactive = true;

    var that = this;

    var tempBlock = new OMNI.Element.Block();
    ifContainer.mouseover = function(eventData) { that.highlightIf(true); setTimeout(showPreview,1); };
    ifContainer.mouseout = function(eventData) { that.highlightIf(false); setTimeout(closePreview,1); };
    elseContainer.mouseover = function(eventData) { that.highlightElse(true); };
    elseContainer.mouseout = function(eventData) { that.highlightElse(false);  };
    this.entry.mouseover = function(eventData) { that.highlightEntry(true); };
    this.entry.mouseout = function(eventData) { that.highlightEntry(false); };

    function showPreview(){
        that.ifLine.addElement(tempBlock, true);
    }

    function closePreview(){
        that.ifLine.removeElement(tempBlock, true);
    }

    // 트윈
    this.tween = new TWEEN.Tween(this.graphics);
    this.targetX = 0;
    this.targetY = 0;
    this.targetWidth = 0;
    this.targetHeight = 0;

    this.update();
};

// public 메서드
OMNI.Element.Branch.prototype = {

    get width () { return this.widthOfLeft + this.widthOfRight; },

    get height () { return this.targetHeight; },

    get widthOfLeft () { 
        if (this.orientation) {
            return Math.max(this.elseLine.elementsWidthOfLeft, this.entry.width / 2);
        } else {
            return this.horizontal_top.width + this.ifLine.elementsWidthOfLeft + OMNI.Graphics.LINE_THICKNESS;
        }
    },
    get widthOfRight () { 
        if (this.orientation) {
            return this.horizontal_top.width + this.ifLine.elementsWidthOfRight  + OMNI.Graphics.LINE_THICKNESS;
        } else {
            return Math.max(this.elseLine.elementsWidthOfRight, this.entry.width / 2);
        }
    },

    get x () { return this.targetX; },
    set x (value) {
        this.targetX = value;
        this.updateTween();
    },

    get y () { return this.targetY; },
    set y (value) {
        this.targetY = value;
        this.updateTween();
    },

    get orientation () { return this.orientation_; },
    set orientation (value) { this.orientation_ = value; this.update(); },

    get ifProcedure () { return this.ifLine; },

    get elseProcedure () { return this.elseLine; }

}

/**
 *
 * 그래픽, 위치 업데이트
 *
 */
OMNI.Element.Branch.prototype.update = function() {

    var that = this;

    // 엔트리 블록 중앙 정렬
    this.entry.x =  - this.entry.width / 2;
    this.entry.y = 0;

    // if와 else 중 더 긴 것으로 세로 길이 통일
    var maximumLineHeight = Math.max(this.ifLine.elementsHeight, this.elseLine.elementsHeight);

    that.ifLine.height = maximumLineHeight;
    that.elseLine.height = maximumLineHeight;    

    // 가로선 길이 설정
    var horizontalLineWidth;
    if (this.orientation == true) {
        horizontalLineWidth = Math.max(this.entry.width / 2, this.elseLine.elementsWidthOfRight);        
        horizontalLineWidth += Math.max(this.ifLine.elementsWidthOfLeft, OMNI.Graphics.MIN_LINE_LENGTH) + OMNI.Graphics.SPACE_X;
    } else {
        horizontalLineWidth = Math.max(this.entry.width / 2, this.elseLine.elementsWidthOfLeft);
        horizontalLineWidth += Math.max(this.ifLine.elementsWidthOfRight, OMNI.Graphics.MIN_LINE_LENGTH) + OMNI.Graphics.SPACE_X;
    }

    this.horizontal_top.width = horizontalLineWidth;
    this.horizontal_bottom.width = horizontalLineWidth;

    var startX = OMNI.Graphics.LINE_THICKNESS / 2;

    // 오른쪽
    if (this.orientation == true) {

        this.horizontal_top.x = startX;
        this.horizontal_top.y = (this.entry.height - this.horizontal_top.height) / 2;

        this.horizontal_bottom.x = this.horizontal_top.x;
        this.horizontal_bottom.y = this.horizontal_top.y + maximumLineHeight + OMNI.Graphics.LINE_THICKNESS;

        this.ifLine.x = - startX + horizontalLineWidth;
        this.ifLine.y = this.horizontal_top.y + OMNI.Graphics.LINE_THICKNESS;

        this.elseLine.x = - startX;
        this.elseLine.y = this.ifLine.y + OMNI.Graphics.LINE_THICKNESS;

    } else {

        this.horizontal_top.x = - startX - this.horizontal_top.width;
        this.horizontal_top.y = (this.entry.height - this.horizontal_top.height) / 2;
        
        this.horizontal_bottom.x = this.horizontal_top.x;
        this.horizontal_bottom.y = this.horizontal_top.y + maximumLineHeight + OMNI.Graphics.LINE_THICKNESS;

        this.ifLine.x = - startX - horizontalLineWidth;
        this.ifLine.y = this.horizontal_top.y + OMNI.Graphics.LINE_THICKNESS;

        this.elseLine.x = - startX;
        this.elseLine.y = this.ifLine.y + OMNI.Graphics.LINE_THICKNESS;
    }

    this.targetHeight = maximumLineHeight + this.entry.height / 2 + OMNI.Graphics.LINE_THICKNESS + OMNI.Graphics.SPACE_Y;

    // 부모 객체 업데이트 (상향 이벤트)
    if (this.parent != undefined) {
        this.parent.update();
    }
}

/**
 *
 * 트윈 업데이트
 *
 */
OMNI.Element.Branch.prototype.updateTween =  function() {
    this.tween.to({ x: this.targetX,
                    y: this.targetY }, 400).easing(OMNI.Graphics.EASING).start();
}

/**
 *
 * 진입점에 하이라이트 효과를 준다.
 *
 */
OMNI.Element.Branch.prototype.highlightEntry = function(on) {
    if (on) {
        this.entry.highlight(true);
    } else {
        this.entry.highlight(false);
    }
}      
  

/**
 *
 *if라인에 하이라이트 효과를 준다.
 *
 */
OMNI.Element.Branch.prototype.highlightIf = function(on) {
    if (on) {
        this.ifLine.highlight(true);
        this.horizontal_top.highlight(true);
        this.horizontal_bottom.highlight(true);
    } else {
        this.ifLine.highlight(false);
        this.horizontal_top.highlight(false);
        this.horizontal_bottom.highlight(false);
    }
}

/**
 *
 * else라인에 하이라이트 효과를 준다.
 *
 */
OMNI.Element.Branch.prototype.highlightElse = function(on) {
          
    if (on) { 
        this.elseLine.highlight(true);
    } else {
        this.elseLine.highlight(false);
    }
      
}