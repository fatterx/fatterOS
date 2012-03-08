

/*
 * 	description	:	To creat windows with draggable, resizable, modal and so on 
 * 					proprosities.
 *	author 	: 	fatter
 *	email	:	lwn888@gmail.com
 *	date	:	2011-12-30
 * */

/*
 *声明命名空间
 * */
var fatterOS ={verson: "1.0"};
//fatterOS.window = fatterOS.window || {};

/*
 * 定义fatterOS.window构造函数
 * @name fatterOS.window
 * @param	{Object}	options		生成窗口的选项参数
 * @config	{String} 	[title]		窗口题目，默认"window"
 * @config	{Boolean}	[closeable]	窗口是否能由用户关闭,默认true
 * @config	{Boolean}	[draggable]	窗口是否可拖动，默认true
 * @config	{Boolean}	[resizable]	窗口是否可改变大小，默认true
 * @config	{Boolean}	[center]	是否居中显示，默认true
 * @config	{Boolean}	[show]		是否立刻显示，默认true
 * @config	{Boolean}	[modal]		是否模态窗口，默认false
 * @config	{Number}	[width]		窗口宽度，默认600px
 * @config	{Number}	[height]	窗口高度，默认400px
 * @config	{Number}	[minWidth]	窗口最小宽度，默认300px
 * @config	{Number}	[minHeight]	窗口最小高度，默认200px
 * @config	{Function}	[resizeCallback]	窗口改变大小后的回调函数，默认null
 * @config	{Boolean}	[hasBound]	窗口移动时是否有边界限制，默认false
 */

fatterOS.window = function(options) {

	this.defaults = {
        title		:	"window",
        closeable	:	true,
        draggable	:	true,
		resizable	:	true,
        center		:	true,
        show		:	true,
        modal		:	false,
		width		:	600,
		height		:	400,	
		minWidth	:	300,
		minHeight	: 	200,
		hashBound	:	false,
		ResizeCallback:	null,
		onClose		:	null
	};

	//fwindow 的options
	this.options = $.extend({}, this.defaults, options || {});
	//fwindow 的title
	this.fwindow_title = $("<div class=\"fwindow-title\">"+this.options.title+"</div>");
	this.fwindow_tools = $("<div class=\"fwindow-tools\"><div class=\"fwindow-tools-close\"></div><div class=\"fwindow-tools-max\"></div><div class=\"fwindow-tools-min\"></div></div>");
	this.fwindow_body  = $("<div class=\"fwindow-body\" />");
	//fwindow 的resize
	this.fwindow_resize = this.options.resizable ? $("<div class=\"fwindow-resize\"><div class=\"fwindow-resize-l\"></div><div class=\"fwindow-resize-t\"></div><div class=\"fwindow-resize-r\"></div><div class=\"fwindow-resize-b\"></div><div class=\"fwindow-resize-lt\"></div><div class=\"fwindow-resize-rt\"></div><div class=\"fwindow-resize-lb\"></div><div class=\"fwindow-resize-rb\"></div></div>") : null;
	this.fwindow_header = $("<div class=\"fwindow-header\" />").append(this.fwindow_title).append(this.fwindow_tools);
	//fwindow 的html主体
	this.target = $("<div class=\"fwindow\" id=\"fwindow_app_"+fatterOS.window.nextId()+"\" />")
					.append(this.fwindow_header)
					.append(this.fwindow_body)
					.append(this.fwindow_resize);

	//定义fwindow的父div，用来确定fwindow的drag&resize范围
	//this.parent=$(document.body);

	//将fwindow插入到父div中
	$(document.body).append(this.target);

	this.resizeHelper = $("div.fwindow-resize-helper");
	//是否最大化，状态
	this.maxed = false;
	//定义fwindow的padding宽度
	this.paddingWidth = this.getSize().outerWidth-this.getSize().width;
	//定义fwindow的padding高度
	this.paddingHeight = this.getSize().outerHeight-this.getSize().height;

	//定义fwindow的边界//TODO 自动判断父窗口范围
/*	var maxRegion 	 = fatterOS.tools.getMaxRegion();
	
	this.boundLeft   = maxRegion.left;
	this.boundTop    = maxRegion.top;
	this.boundRight  = maxRegion.right;
	this.boundBottom = maxRegion.bottom;
	
*/

	//处理边界问题

/*
	function region(){
		var left   = self.getParentOffset().left + self.getParentPadding().p_w + self.options.boundLeft;
		var right  = self.getParentOffset().left + self.getParentPadding().p_w + self.parent.width() - self.options.boundLeft;
		var top    = self.getParentOffset().top + self.getParentPadding().p_h + self.options.boundTop;
		var bottom = self.getParentOffset().top + self.getParentPadding().p_h + self.parent.height() - self.options.boundTop;	
		var left   =	0;
		var right  = $(document.body).width();
		var top    = 	0;
		var bottom = $(document.body).height();	

		return  {
					boundLeft:left, boundTop:top,boundRight:right,boundBottom:bottom
				};

	}

*/
	this.init();	
}


fatterOS.window.prototype = {

	constructor: fatterOS.window,

	init: function(){

		var self = this;
		//设置初始测试内容
		this.setContent("初始化ing……</br></br>");

		//改变fwindow大小为预定义的大小
		this.resize(this.options.width,this.options.height);

		//将fwindow移动到父div的中心
		if(this.options.center){

			this.center("x","y");

		}
		//置顶
		this.toTop();	

		if(this.options.draggable){

			this.dndBind();

		}else{

			this.fwindow_header.find(".fwindow-title").css("cursor","default");

		}

		if(this.options.resizable){

			this.resizeBind();

		}else{

			this.fwindow_tools.find(".fwindow-tools-max").remove();
			this.fwindow_tools.find(".fwindow-tools-min").remove();

		}

		if(!this.options.closeable){

			this.target.find(".fwindow-tools-close").remove();

		}
//TODO
		if(this.options.filemgr){

			this.filemgr=new this.filemgr(this,{});

		}

		if(this.options.modal){

			this.showMask();

		}

		this.target.bind("mousedown.fw_toTop",function(){

			self.toTop();

		});

		this.fwindow_tools.find( ".fwindow-tools-close" ).bind( "click.fw_tools",function(){

			self.close();

		});

		this.fwindow_tools.find( ".fwindow-tools-min" ).bind( "click.fw_tools",function(){
		
			self.hide();

		});

		this.fwindow_tools.find( ".fwindow-tools-max" ).bind( "click.fw_tools",function(){
				
			var	data   = self.target.data( 'posAndSize' );

			if( self.isMaxed ){

				//从data中获取原来的位置、大小
				var	top    = data.top,
				 	left   = data.left,
				 	width  = data.width,
				 	height = data.height;

				self.resize( width,height );
				self.moveTo( left,top );
				self.isMaxed = false;

			}else{

				self.target.data( 'posAndSize',
						{
							top    : self.getPosition().top,
							left   : self.getPosition().left,
							width  : self.getSize().width  + self.paddingWidth,
							height : self.getSize().height + self.paddingHeight
						}
					);

				self.maxFwindow();
				self.isMaxed=true;
			}
		});

  	},

	getSize: function() {

        return {
					width      : this.target.width(),
					height     : this.target.height(),
					outerWidth : this.target.outerWidth(),
					outerHeight: this.target.outerHeight()
			   };
    },
    
    getContentSize: function() {
       
        return {
					width  : this.target.find(".fwindow-body").width(),
					height : this.target.find(".fwindow-body").height()
			   };
    },
    
    getPosition: function() {
					 
        return {
					left : this.target.position().left,
					top  : this.target.position().top
			   };
    },

	getOffset : function(){

		return {
					left : this.target.offset().left,
	 				top  : this.target.offset().top
			   };

	},
	//parent的padding
	/*
    getParentPadding: function(){
		return {p_w:(this.parent.outerWidth()-this.parent.width())/2,p_h:(this.parent.outerHeight()-this.parent.height())/2}
    },

	getParentOffset:function(){
		return {left:this.parent.offset().left,top:this.parent.offset().top}
	},
	*/
    getTitle: function(){
		return this.fwindow_title.html();
    },

    setTitle: function( newTitle ){
		this.fwindow_title.html( newTitle );
		return this;
    },

    getContent: function() {
	
        return this.fwindow_body.find(".fwindow-body");
    },
    
    setContent: function( newContent ) {
		
		this.fwindow_body.html( newContent );
        return this;

    },

    setAskMessage: function( msg,aws,type,callback,options ){

	    var self = this,
		 	btn = "";
		$.each(aws,function(i){
					btn += "<input type=button class=\"fwindow-button\" value=\""+aws[i]+"\"/>";
				});
		var button = $("<div class=\"fwindow-button-div\">"+btn+"</div>"),
		    wrap = $("<div class=\"fwindow-body-ask\" ><div class=\"fwindow-ask-icon fwindow-ask-icon-"+type+"\"></div><div class=\"fwindow-ask-text\">"+msg+"</div><div class=\"clear\"></div></div>")
					.append(button);
		this.setContent( wrap );

		$("input[type=button]",button).bind("click",function(){
					var clicked = this;
					self.close();
					if(callback){
						callback(clicked.value);
					}
				});
    	return this;
	},

    show:function(){
		this.target.show();
		return this;
    },

    hide:function(){
		this.target.hide();
		return this;
    },

    close:function( callback, args ){

		var onClose = this.options.onClose;
		this.target.remove();

		if(this.mask){
			this.mask.remove();
		}
		
		if( onClose !== null && typeof onClose === "function" )
			onClose();
	},

    maxFwindow:function(){

		var width  = $( document.body ).width(),
			height = $( document.body ).height();
//		var _top=this.getParentPadding().p_h+this.options.boundTop;
//		var _left=this.getParentPadding().p_w+this.options.boundLeft;
		this.resize( width,height );
		this.moveTo( 0,0 );

		return this;
    },
    
    resize: function( width, height, callback, args ) {
	//	var padding_w=this.getSize().outerWidth-this.getSize().w;
	//	var padding_h=this.getSize().oh-this.getSize().h;
		var fixedWidth  = width  - this.paddingWidth,
			fixedHeight = height - this.paddingHeight;

		this.target.css({	"width" : fixedWidth,
							"height": fixedHeight
						});
		this.fwindow_body.css({	"width" : fixedWidth,
								"height": fixedHeight-22
						});

		if( callback !== null && typeof callback === "function" )
			callback(args);

		return this;
    },

    moveTo: function( x, y, callback, args ) {

        this.target.css( {"left" : x, "top" : y} );

		if( callback !== null && typeof callback === "function" )
			callback(args);

        return this;
    },

	removePadding: function(){
		this.fwindow-body.css("padding","0px");
		this.resize(this.target.outerWidth,this.target.outerHeight,true);
		return this;
	},

  	animate:function(height){
		this.target.animate({
			top:'-='+height+'px',
				},1500);
		return this;
	}, 
//TODO
    center: function(x,y) {

		this.target.show();
        var size = this.getSize(),
		    parentWidth = $(window).width(),
		    parentHeight = $(window).height(),
		    targetWidth = size.outerWidth,
		    targetHeight = size.outerHeight,
		    targetLeft = this.getPosition().left,
		    targetTop = this.getPosition().top,
		//TODO
		    scrollTop = Math.max(document.body.scrollTop,document.documentElement.scrollTop),
		    scrollLeft = document.body.scrollLeft;
		if(x){
			targetLeft = (parentWidth-targetWidth)/2 + scrollLeft;
		}
		if(y){
			targetTop = (parentHeight-targetHeight)/2 + scrollTop;
		}
		this.moveTo(targetLeft,targetTop);
		return this;
    },
      
    // Move this dialog box above all other fwindow instances
    toTop: function() {
        this.target.css({zIndex: fatterOS.window.nextZindex()});
        return this;
    },

	showMask: function(options){
    	this.mask  = $("<div class=\"fwindow-mask\" id=\"fwindow_mask_"+(fatterOS.window.id-1)+"\"></div>").appendTo($(document.body));
		var width  = $(window).width(),
		 	height = $(window).height();
			this.mask.css({width : width, height : height, "z-index" : fatterOS.window.zIndex+1});
	 },
	
	 /* 事件绑定部分*/
	dndBind: function(){
		var self = this;	
		this.fwindow_title.bind("mousedown.fw_dnd",function(e){

			e.preventDefault();
			e.stopPropagation();
			self.toTop();
			onBeforeMove(e);

		});

		$(document).bind("mousemove.fw_dnd",function(e){		
			e.preventDefault(); 
			e.stopPropagation();
			onMove(e);
		});

		$(document).bind("mouseup.fw_dnd",function(e){
			onMoveEnd();
		});
		function onBeforeMove(e){	
			//保存初始鼠标坐标
			self.startX = e.pageX;
			self.startY = e.pageY;
			self.resizeHelper.css({left:self.getOffset().left,top:self.getOffset().top});
			self.resizeHelper.show();
			self.isDrag = true;

		}

		function onMove(e){

			if( self.isDrag ){

				var posX = e.pageX,
				    posY = e.pageY,

				//fwindow的外宽度、高度
				    outerWidth   = self.getSize().outerWidth,
				    outerHeight  = self.getSize().outerHeight,
				
				//fwindow相对于上一级父div的top,left, 作为相对坐标的原点
				    originX	  = self.getOffset().left,
				    originY	  = self.getOffset().top,

					left,top;

				//拖动后fwindow的left=_left+(posX-self.startX)
				//拖动后fwindow的top=_top+(posY-self.startY)
				//右边界的left：Math.min(_left+posX-self.startX,self.boundRight-outerWidth)//右边界boundRight-fwindow的外宽度
				if(self.options.hasBound){
					region = this.getRegion( target.parent() );
					regionLeft = region.left;
					regionTop = region.top;
					regionRight = region.right;
					regionBottom = region.bottom;
					left = Math.max( Math.min( originX  + posX - target.startX, regionRight  - outerWidth  ), regionLeft );
					top  = Math.max( Math.min( originY  + posY - target.startY, regionBottom - outerHeight ), regionTop  );
				} else {
					left = originX + posX - self.startX;
					top  = originY + posY - self.startY;
				}
				self.resizeHelper.css({"left":left,"top":top,"width":outerWidth,"height":outerHeight});
				
			}

		}

		function onMoveEnd(){

			if(self.isDrag){

				var left = parseInt(self.resizeHelper.css("left")), //- self.getParentOffset().left;
				    top  = parseInt(self.resizeHelper.css("top"));  //- self.getParentOffset().top;

				self.resizeHelper.hide();
				self.moveTo( left, top );
				self.isDrag = false;

			}
		}
	},

	dndUnbind:	function(){
		
		this.fwindow_title.unbind( "mousedown.fw_dnd" );
		$(document).unbind( "mousemove.fw_dnd", "mouseup.fw_dnd" );
	},

	resizeBind:	function(){
	
		var self = this;
		this.fwindow_resize.find("div").bind("mousedown.fw_resize",function(e){
	
				e.preventDefault();
				e.stopPropagation();
				self.toTop();
				self.resize_handler_class=this.className;
				onBeforeResize(e);
	
		});

		$(document).bind("mousemove.fw_resize",function(e){

				e.preventDefault(); 
				e.stopPropagation();
				onResize(e);

		});

		$(document).bind("mouseup.fw_resize",function(e){
				onResizeEnd();
		});

		function onBeforeResize(e){
			
			var size = self.getSize(),
				pos  = self.getOffset();
			//fwindow的起始位置，大小
			self.startOuterWidth	= size.outerWidth;
			self.startOuterHeight	= size.outerHeight;
			self.startWidth			= size.width;
			self.startHeight		= size.height;
			self.startTop			= pos.top;
			self.startLeft			= pos.left;
			self.startBottom		= self.startTop  + self.startOuterHeight;
			self.startRight			= self.startLeft + self.startOuterWidth;

			self.resizeHelper.css({"top":self.startTop,"left":self.startLeft,"width":self.startOuterWidth,"height":self.startOuterHeight});
			self.resizeHelper.show();

			self.isResize = true;

		}

		function onResize(e){

			if(self.isResize){

				//闭包
				(function(){

					var	posX,posY, 
						//resize direction
					    direction = self.resize_handler_class.split("-")[2],
						//设定初值
					    top	      = self.startTop, 
						left      = self.startLeft, 
						width     = self.startOuterWidth, 
						height    = self.startOuterHeight,
					    minHeight = self.options.minHeight,
						minWidth  = self.options.minWidth;
					
					if( self.options.hasBound ){
						posX = Math.max( Math.min( e.pageX, self.boundRight  ), self.boundLeft );
						posY = Math.max( Math.min( e.pageY, self.boundBottom ), self.boundTop  );
					} else {
						posX = e.pageX;
						posY = e.pageY;
					}

					switch( direction ){
						case "t"  : resizeTop();break;
						case "b"  : resizeBottom();break;
						case "l"  : resizeLeft();break;
						case "r"  : resizeRight();break;
						case "lt" : resizeLeft();resizeTop();break;
						case "rt" : resizeRight();resizeTop();break;
						case "lb" : resizeLeft();resizeBottom();break;
						case "rb" : resizeRight();resizeBottom();break;
						default:return;
					}

					function resizeTop(){

						top = Math.min( posY, self.startBottom - minHeight );
						height = self.startOuterHeight - ( top - self.startTop );

					}

					function resizeBottom(){

						height = Math.max( posY - self.startTop, minHeight );

					}

					function resizeLeft(){

						left = Math.min( posX, self.startRight - minWidth );
						width = self.startOuterWidth - ( left - self.startLeft );

					}

					function resizeRight(){

						width = Math.max( posX - self.startLeft, minWidth );

					}

					self.resizeHelper.css( {"left":left, "top":top, "width":width, "height":height} );

				})();
			}

		}

		function onResizeEnd(){

			if(self.isResize){

				var left   = parseInt(self.resizeHelper.css("left")); //- self.getParentOffset().left;
				var top    = parseInt(self.resizeHelper.css("top"));  //- self.getParentOffset().top;
				var width  = self.resizeHelper.width();
				var height = self.resizeHelper.height();

				//清除resizeDiv
				self.resizeHelper.hide();
				//清除缓存
				self.startOuterWidth	= null;
				self.startOuterHeight	= null;
				self.startWidth			= null;
				self.startHeight		= null;
				self.startTop			= null;
				self.startLeft			= null;
				self.startBottom		= null;
				self.startRight			= null;

				//resize fwindow
				self.resize(width,height);
				//move fwindow
				self.moveTo(left,top);
				self.isResize = false;
			}

		}

},

	resizeUnbind:	function(){
	
		this.fwindow_resize.unbind( "mousedown.fw_resize" );
		$(document).unbind( "mousemove.fw_resize", "mouseup.fw_resize" );

	},
};

$.extend(fatterOS.window, {

	id:1,

	zindex:100,

	nextId:function() {

		return fatterOS.window.id++;		
	
	},
	
	nextZindex: function() {

		return fatterOS.window.zindex++;

	}
});

$.extend(fatterOS, {

	alert: function( msg, type, options ){

		options = $.extend({
							title:"注意",
							resizable:false,
							width:250,
							height:120,
							modal:true
							},options||{});

		type = type || "warning";
		new fatterOS.window( options ).setAskMessage( msg, ["确定"], type, function(){} );
    },

	confirm: function( msg, callback_t, callback_f, options ){
	
		var callback_f = callback_f || function(){};
		options = $.extend({ 
							title:"注意",
							resizable:false,
							width:250,
							height:120,
							modal:true
							},options||{});
		new fatterOS.window( options ).setAskMessage( msg, ["确定","取消"], "question", function(btn){
				if( callback_t ){
					if( btn == "确定" )
						callback_t();
					else
						callback_f();
				}
			});
	},

	tips: function( msg, options ){
		options = $.extend({
							title:"通知",
							resizable:false,
							width:200,
							height:200,
							draggable:false,
							center:false
							}, options||{} );

		var left = $(window).width() - options.width - 2,
		    top  = $(window).height() - 32;
		new fatterOS.window( options )
					.setContent( msg )
					.moveTo( left, top )
					.animate( options.height );
	},

	load: function( url, options, parent ) {

        options = $.extend({width:600,height:400},options||{});
        var ajax = {
            url: url, type: 'GET', dataType: 'html', cache: false, success: function(html) {
                html = $(html);
                if (options.filter) html = $(options.filter, html);
                new fatterOS.window(options).setContent(html);
            }
        };
	 	jQuery.ajax(ajax);
    },

	iframe: function( url, options ) {
		var wrap = "<div class=\"fwindow-iframe\"><iframe src=" + url + " border=0 width=100% height=100% overflow=auto /></div>";
            options = $.extend({width:600,height:400},options||{});
			new fatterOS.window( options ).setContent( wrap );	
    }
});
