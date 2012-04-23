/*
 * 	description	:	fatterOS is a simple webOS
 *	author 		: 	fatter
 *	email		:	lwn888@gmail.com
 *	date		:	2011-12-30
 * */

$(document).ready(function(){

	/*
	 *声明命名空间
	 * */
	var fatterOS = {verson: "1.0"};

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
	 * @config	{Boolean}	[hasBound]	窗口移动时是否有边界限制，默认false
	 * @config	{Function}	[onClose]	窗口关闭时触发事件，默认为null
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

		this.mask  = $("div.fwindow-mask");
		this.resizeHelper = $("div.fwindow-resize-helper");
		//是否最大化，状态
		this.maxed = false;
		
		//定义fwindow的padding宽度
		this.paddingWidth = this.getSize().outerWidth-this.getSize().width;
		//定义fwindow的padding高度
		this.paddingHeight = this.getSize().outerHeight-this.getSize().height;
		
		this.resizeCallback = null;
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
			} else {
				this.fwindow_header.find(".fwindow-title").css("cursor","default");
			}

			if(this.options.resizable){
				this.resizeBind();
			} else {
				this.fwindow_tools.find(".fwindow-tools-max").remove();
				this.fwindow_tools.find(".fwindow-tools-min").remove();
			}

			if(!this.options.closeable){
				this.target.find(".fwindow-tools-close").remove();
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

				} else {
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

			this.mask.hide();
			
			if( typeof onClose === "function" )
				onClose();
		},

		maxFwindow:function(){

			var width  = $( document.body ).width(),
				height = $( document.body ).height();
			
			this.resize( width,height );
			this.moveTo( 0,0 );

			return this;
		},
	//TODO filemgr resize callback!!!
		resize: function( width, height, callback, args ) {
			var fixedWidth  = width  - this.paddingWidth,
				fixedHeight = height - this.paddingHeight;

			this.target.css({	"width" : fixedWidth,
								"height": fixedHeight
							});
			this.fwindow_body.css({	"width" : fixedWidth,
									"height": fixedHeight-22
							});

			if( typeof callback === "function" )
				callback(args);

			if( typeof this.resizeCallback === "function" )
				this.resizeCallback();

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
			var width  = fatterOS.clientInfo.clientWidth,
				height = fatterOS.clientInfo.clientHeight;
			this.mask.css({width : width, height : height, "z-index" : (fatterOS.window.zindex-1)});
			console.log(this.mask.css("z-index"));
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

		confirm: function( msg, callback, options ){
		
			options = $.extend({ 
								title:"注意",
								resizable:false,
								width:250,
								height:120,
								modal:true
								},options||{});
			new fatterOS.window( options ).setAskMessage( msg, ["确定","取消"], "question", function(btn){
					if(typeof callback === "function"){
						if( btn == "确定" )
							callback(true);
						else
							callback(false);
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
			var wrap = "<div class=\"fwindow-grid\"><iframe src=" + url + " border=0 width=100% height=100% overflow=auto /></div>";
				options = $.extend({width:600,height:400},options||{});
				new fatterOS.window( options ).setContent( wrap );	
		}
	});

	//实现小部件，tips
	fatterOS.widget  = fatterOS.widget  || {};



		
	fatterOS.filemgr = function(options){

		this.defaults = {
			title: 			'filemgr',
			width: 			800,
			height: 		500,
			toolbar: 		[
								['reload', 'mkdir', 'mkfile', 'upload'],
								['open file disabled', 'copy file disabled', 'paste disabled', 'rm file disabled'],
								['rename file disabled', 'edit file disabled'],
								['info', 'quicklook file disabled', 'resize file disabled'],
								['icons disabled', 'list disabled'],
								['help']
							],
			contextmenu : 	{
								'workplace'   : ['reload', 'split', 'mkdir', 'mkfile', 'upload', 'split', 'paste', 'split', 'info'],
								'file'  : ['select', 'open', 'quicklook', 'split', 'copy', 'cut', 'rm', 'split', 'duplicate', 'rename', 'edit', 'resize', 'archive', 'extract', 'split', 'info'],
								'group' : ['select', 'copy', 'cut', 'rm', 'split', 'archive', 'extract', 'split', 'info']
							},
			/*resizeCallback:	function(){
										//self.adjustWindow();
									//	self.checkFrameScroll();
							},*/
		};

		this.options = $.extend({}, this.defaults, options || {});
		this.$shortcut_button = $("<ul class=\"shortcut-button\" />");
		this.$clear_div = $("<div class=\"clear\" />");
		this.$address = $("<div class=\"fwindow-address\"><span>地址</span><div title=\"back\" id=\"back_button\" class=\"disabled\"/><div title=\"forword\" id=\"forword_button\" class=\"disabled\"/><div title=\"Go\" id=\"go_button\"/><div class=\"input-body\"><input type=\"text\" id=\"url_text\"/></div></div>");
		this.$file_tree = $("<ul class=\"file-tree\" />");
		this.$left_nav_tree = $("<div class=\"left-nav-tree\" />").append(this.$file_tree);
		this.$filemgr_tag = $("<div class=\"filemgr-tag\"><span class=\"tag-scroll-left tag-scroll\">&lt;</span><ul class=\"tag\"></ul><span class=\"tag-scroll-right tag-scroll\">&gt;</span></div>");
		this.$filemgr_resize = $("<div class=\"filemgr-resize\" />");
		this.$filemgr_content_box = $("<div class=\"filemgr-content-box\" />");
		this.$status_bar = $("<div class=\"filemgr-status-bar\" />");
		this.$filemgr_content_wrap = $("<div class=\"filemgr-content-wrap grid-current\" />")
								.append(this.$filemgr_tag)
								.append(this.$filemgr_content_box);
		this.target = $("<div class=\"filemgr-wrap\" />")
								.append(this.$shortcut_button)
								.append(this.$clear_div)
								.append(this.$address)
								.append(this.$left_nav_tree)
								.append(this.$filemgr_resize)
								.append(this.$filemgr_content_wrap)
								.append("<div class=\"clear\" />")
								.append(this.$status_bar);
		this.window = new fatterOS.window(this.options).setContent(this.target);
		this.init();	
	};

	fatterOS.filemgr.prototype = {

			constructor: fatterOS.filemgr,

			init: function(){
				var self = this;
				this.window.resize(this.options.width,this.options.height);
				this.window.resizeCallback = function(){
					self.adjustWindow();
					self.checkFrameScroll();
				}

				var tools = this.options.toolbar,
					lengths = tools.length,
					isSplit = false,
					i = 0,
					n;
				//生成toolbar
				for ( ; i < lengths; i++ ) {

					if ( isSplit ) {
						this.$shortcut_button.append('<li class="split" />');
					}
					isSplit = false;

					for ( var j = 0,length = tools[i].length; j < length; j++ ) {
						
						n = tools[i][j];
						if (n) {
							isSplit = true;
							$('<li class="'+n+'" title="'+n+'" name="'+n+'"/>')
								.appendTo(this.$shortcut_button)
								.bind('click',function() {
									var cmd = this.title.split(" ")[0];
									!$(this).hasClass('disabled') && (fatterOS.system[cmd])();
								})//.hover(
									//function() { !$(this).hasClass('disabled') && $(this).addClass('li-hover')},
									//function() { $(this).removeClass('li-hover')}
								//);
						}
					}
				}
				
				this.getFileTree();
				this.resizeBind(this.$filemgr_resize,this.$left_nav_tree);
				this.eventBind();
				this.dragSelect();
				this.adjustWindow();
				this.showFile("/我的文档","我的文档");
			},

			resizeBind: function( resizeHandle ){

				var self = this,
					left_nav_tree = self.$left_nav_tree,
					left_grid = self.$filemgr_content_wrap;

				(function( self ){

					resizeHandle.bind("mousedown.grid_resize",function(e){
						e.preventDefault();
						e.stopPropagation();
						onBeforeResize(e);
					});

					$(document).bind("mousemove.grid_resize",function(e){
						e.preventDefault(); 
						if( self.onResizeLeftSide ){
								onResizeLeft(e);
						} else {
								onResizeRight(e);
						}
					});

					$(document).bind("mouseup.grid_resize",function(e){
						onResizeEnd();
					});

					function onBeforeResize(e){		
					
						self.isResize = true;
						if( e.target.className === "filemgr-resize" ){
							self.onResizeLeftSide = true;
						} else {
							self.onResizeLeftSide = false;
						}
					}

					function onResizeLeft(e){

						if(self.isResize){
							var l_width = Math.max( Math.min( e.pageX - self.target.offset().left,300 ), 100 );
							left_nav_tree.css("width",l_width);

							if( self.target.find(".right-grid").html() ){
								var right_grid = self.target.find(".right-grid"),
									r_width = (self.target.parent().width()-l_width)/2 - 7;
								left_grid.css("width",r_width);
								right_grid.css("width",r_width);
							}
						}

					}

					function onResizeRight(e){

						if(self.isResize){

								var left_width  = left_nav_tree.width();
								var right_grid = self.target.find(".right-grid");
								var right_totol = right_grid.width() + left_grid.width();
								var _width = Math.max( Math.min( e.pageX - self.target.offset().left - left_width, 500 ), 150 );
								left_grid.css("width",_width);
								right_grid.css("width",right_totol - _width);
						}

					}

					function onResizeEnd(){

						if(self.isResize){
						//	if(self.options.resizeCallback)
								//self.options.resizeCallback();
								self.isResize = false;
						}
					}

				})(self);
			},

			adjustWindow: function(){

				var windowSize = this.window.getSize(),
					curWidth  = windowSize.width,
					curHeight = windowSize.height,
					windowTitle = 35,
					contentWrapHeight = curHeight - this.$address.height() - this.$shortcut_button.height() - this.$status_bar.height() - windowTitle,
					contentWrapWidth = 0,
					contentBoxHeight = contentWrapHeight - this.$filemgr_tag.height();
					if( this.target.data("dbgrid") === true ){
					
						contentWrapWidth=(curWidth-this.$left_nav_tree.width())/2-6;  //减去padding 5，左边导航 双显
						this.target.find(".filemgr-content-wrap").css({"width":contentWrapWidth,"float":"left"});
					
					} else {
						this.target.find(".filemgr-content-wrap").css({"width":"auto","float":"none"});
					}

					this.target.css({height:curHeight});
					this.$left_nav_tree.css("height",contentWrapHeight);
					this.target.find(".filemgr-content-wrap").css("height",contentWrapHeight);
					this.target.find(".filemgr-content-box").css("height",contentBoxHeight);
					this.target.find(".filemgr-resize").css("height",contentBoxHeight);
			},

			updateShortcutButton: function(target){
		
					var buttons = this.$shortcut_button,
						fileButtons = buttons.find(".file");

					if(target){
						fileButtons.removeClass("disabled");
					} else {
						fileButtons.addClass("disabled");
					}

					if(fatterOS.cache.clipBoard.length !== 0 ){
						buttons.find(".paste").removeClass("disabled");
					}
							 
			},

			checkBackForwordButton: function(tag_id){

				var data = fatterOS.cache.tabs[tag_id],
					hashList = data.hashList,
					hashNo = data.hashNo;

				this.$address.find("#back_button").attr("className","disabled");
				this.$address.find("#forword_button").attr("className","disabled");

				if(hashList.length>1){

					if(hashNo>0){

						this.$address.find("#back_button").removeClass("disabled");
					}
					
					if(hashNo<(hashList.length-1)){
						this.$address.find("#forword_button").removeClass("disabled");
					}

				}

			},

			checkFrameScroll: function(){
				var currentFrame = this.target.find(".grid-current>.filemgr-tag"),
					tags = currentFrame.find("ul.tag>li"),
					tagWidth = tags.outerWidth(),
					tagsWidth = tags.length * tagWidth,
				gridWidth = currentFrame.width(),
					scroll = this.target.find(".grid-current .tag-scroll");
					if( tagsWidth >gridWidth ){
						scroll.show();
						return true;
					}
					else{
						scroll.hide();
						return false;
					}
			},

			scrollTags: function( direction ){

				var ul = this.target.find(".grid-current ul.tag"),
					tagWidth = parseFloat(ul.find("li").outerWidth()) + parseFloat(ul.find("li").css("marginLeft")),
					left = parseFloat(ul.css("left"));
				direction < 0 ? left += tagWidth : left -= tagWidth;
				ul.css({left:left});
			},

			rightScroll: function(){
	//TODO
			},

			getFileTree: function(){
				var self = this;

				$.ajax({
						url:"file.php",
						data:"get=filetree",
						dataType:'json',
						success:function(d){
							$.each(d,function(i){
								$("<li>"+d[i].name+"</li>").appendTo(self.$file_tree)
														   .bind("click",function(e){
																e.stopPropagation();
																self.$file_tree.find("li").removeClass("selected");
																$(this).addClass("selected");
																self.showFile("/"+fatterOS.tools.encodeChinese(this.innerHTML),this.innerHTML);
								});
							});
						}
				});
			},		

			//显示文件
			showFile: function(url,title,target,back){
				var self = this,
					content_box = self.target.find(".grid-current>.filemgr-content-box"),
					tag_ul = self.target.find(".grid-current ul.tag"),
					target = target || "_blank",
					cur_tag_id = "tag_li_" + fatterOS.filemgr.id,
					$backBtn = self.$address.find("#back_button"),
					$forwordBtn = self.$address.find("#forword_button"),
					files_html = "",
					tabs = fatterOS.cache.tabs,
					hashNo = 0,
					hashList = [],
					fileName = [],
					$tag;
				
				$.ajax({
						url:"file.php",
						data:"path="+url,
						dataType:"json",
						success:function(data){
							$.each(data,function(i){		
								files_html += "<div data-name="+data[i].name+" data-key="+data[i].key+" class=\"docs-list\"><div class=\"file-"+data[i].type+"\"><img src=\"images/ext/"+data[i].type+".png\" alt=\"\" /><span class=\"filename\">"+data[i].name+"</span><input type=\"text\" value="+data[i].name+" class=\"rename-text\" /></div></div>";
								fileName.push(data[i].name);
							});

							if( target == "_blank" ){
								$tag = $("<li id=\""+cur_tag_id+"\"><a>"+title+"</a></li>").appendTo(tag_ul)
																						  .bind("click",function(e){
																								e.stopPropagation();
																								self.switchTag(this.id)
																							});
								$("<span class=\"tag-close\">X</span>").appendTo($tag)
																	   .bind("click",function(e){
																			e.stopPropagation();
																			self.closeTag(this.parentNode.id);
																		});
								$("<div id=\"content_"+cur_tag_id+"\" class=\"content-inner\">"+files_html+"</div>").appendTo(content_box);
								
								hashList[0] = {
												fileName: fileName,
												url: url
												};
								
								tabs[cur_tag_id] = {
														hashList: hashList,
														hashNo: hashNo,
												   };
								self.switchTag(cur_tag_id);
								$backBtn.attr("className","disabled");
								$forwordBtn.attr("className","disabled");
								fatterOS.filemgr.id++;
								if(self.checkFrameScroll()){
									self.scrollTags();
								};

							} else {
								var cur_tag_li = self.target.find(".grid-current .tag-current"),
									cur_content = self.target.find(".grid-current .content-current");

								cur_tag_id = cur_tag_li.attr("id");	
								hashList = tabs[cur_tag_id].hashList;
								hashNo = tabs[cur_tag_id].hashNo;

								if( back == undefined ){
									console.log(hashList.length)
									hashList[hashList.length] = {	fileName: fileName,
																	url: url
																};
									hashNo = hashList.length - 1;
								} else if( hashNo != (hashList.length - 1) ){  
									//删除此页标识编号以后的数组项
									hashList.splice(hashNo+1,(hashList.length-(hashNo+1)));
								}
								cur_content.html(files_html);
								
								tabs[cur_tag_id] = {
														hashList: hashList,
														hashNo: hashNo,
													};

								cur_tag_li.children("a").html(title);
								self.setAddress(url);
								self.showStatus(target);
								self.checkBackForwordButton(cur_tag_id);

							}

							self.target.find(".file-folder").bind("dblclick",function(e){
									e.stopPropagation();
									var cur_title = this.childNodes[2].value,
										cur_url = url + "/" + fatterOS.tools.encodeChinese(cur_title);
									self.showFile( cur_url, cur_title , "_self" );
							});

						}
				});	
			},

			//得到地址栏
			getAddress:function(){
				return this.target.find("#url_text").val();
			},

			//地址栏显示
			setAddress:function(url){
				var address=this.target.find("#url_text");
				address.val(decodeURI(decodeURI(url)));
			},

			goForword:function(tag_id){
				var data = fatterOS.cache.tabs[tag_id],
					hashList = data.hashList,
					url = hashList[++(data.hashNo)].url;

				if(url == null)return;
				
				this.showFile(url,this.getTagNameFromURL(url),"_self","back");

			},
			//向后
			goBack: function(tag_id){

				var data = fatterOS.cache.tabs[tag_id],
					hashList = data.hashList,
					url = hashList[--(data.hashNo)].url;

				if(url == null)return;

				this.showFile(url,this.getTagNameFromURL(url),"_self","back");

			},
			//得到隐藏地址
			getHideAddress: function(tag_id){
				return fatterOS.cache.tabs[tag_id].hashList[0].url;
			},
			//状态栏显示
			showStatus: function(tag_id){
				var source = $("#content_"+tag_id+">div.docs-list"),
					status = $(".status-bar>span"),
					s = "";
				s += "共" + source.length + "项";
				status.html(s);	
			},
			//切换标签
			switchTag: function(tag_id){
				var content_cur = this.target.find("#content_"+tag_id),
					tag_li_cur = this.target.find("#"+tag_id),
					contents = this.target.find(".grid-current .content-inner"),
					tags_lis = this.target.find(".grid-current ul.tag>li"),
					address = this.getHideAddress(tag_id);

				tags_lis.removeClass("tag-current");
				contents.removeClass("content-current");
				content_cur.addClass("content-current");
				tag_li_cur.addClass("tag-current").css("display","block");
				this.setAddress(address);
				this.showStatus(tag_id);
				this.checkBackForwordButton(tag_id);

			},
			//关闭标签
			closeTag: function(tag_id){
				var li = this.target.find("#"+tag_id),
					content = this.target.find("#content_"+tag_id),
					prevLi = li.prev("li"),
					nextLi = li.next("li");
				if(prevLi.length !== 0  &&  !prevLi.hasClass("tag-scroll")){
					li.remove();
					content.remove();
					window.fatterOS.cache.tabs[tag_id] = null;
					delete window.fatterOS.cache.tabs[tag_id];
					this.checkFrameScroll();
					this.switchTag(prevLi.attr("id"));
				} else if(nextLi.length !== 0){
					li.remove();
					content.remove();
					window.fatterOS.cache.tabs[tag_id] = null;
					delete window.fatterOS.cache.tabs[tag_id];
					this.checkFrameScroll();
					this.switchTag(nextLi.attr("id"));
				} else {
					return;
				}
			},

			getTagNameFromURL:function(str){
				var l=str.length;

				if(str.substring(l-1,l)=="/"||str.substring(l-1,l)=="\\"){
					str=str.substring(0,l-1);
				}
				var url=str.split("/");
				return fatterOS.tools.decodeChinese(url[url.length-1]);
			},
			
			selectTarget : function($target){
			//	var name = $target.find("input").val();
				var key = $target.attr("data-key");

				$target.addClass("selected");
				fatterOS.cache.select.push(key);
				this.updateShortcutButton($target);
			},

			selectAllTarget: function(){
				var $targets = this.target.find(".grid-current .content-current div.docs-list");
				
				$targets.addClass("selected");
				$.each($targets,function(i){
					//var name = $(targetWidth[i]).find("input").val();
					var key = $(target[i]).attr("data-key");

					fatterOS.cache.select.push(key);
				})
				this.updateShortcutButton('target');
			},

			unSelectTarget: function($target){
				//var name = $target.find("input").val();
				
				$target.removeClass("selected");
				fatterOS.cache.select.pop();
				this.updateShortcutButton();
			},

			unSelectAllTarget: function(){
				this.target.find(".grid-current .content-current div.docs-list").removeClass("selected");
				fatterOS.cache.select = [];
				this.updateShortcutButton();
			},
/*
			showDoubleGird:function(){
				var self = this;

				if(this.target.data("dbgrid")!="undefined" && this.target.data("dbgrid")==true){
					this.target.data("dbgrid",false);
					$(this.target.find(".filemgr-content-wrap")[1]).remove();
					this.target.find(".filemgr-content-wrap").addClass("grid-current");
					this.adjustWindow();
				} else {

					this.target.data("dbgrid",true);	
					this.$filemgr_content_wrap
							.removeClass("grid-current")
							.after("<div class=\"filemgr-resize dbgrid\" /><div class=\"filemgr-content-wrap grid-current right-grid\"><div class=\"filemgr-tag\"><ul class=\"tag\"><li class=\"tag-scroll-left tag-scroll\">&lt;</li><li class=\"tag-scroll-right tag-scroll\">&gt;</li></ul></div><div class=\"filemgr-content-box\" /></div>");
					
					var url=this.getAddress();
					this.showFile(url,this.getTagNameFromURL(url));
					this.adjustWindow();
					if(this.checkFrameScroll()){
						this.leftScrollTag();
					}
					//new this.dragSelect().dragSelect(this);
					new this.dragSelect(this);
					this.resizeBind(self.target.find(".dbgrid"));

					this.target.find(".tag-scroll-left.tag-scroll").bind("click",function(){self.leftScrollTag();})
					this.target.find(".tag-scroll-right.tag-scroll").bind("click",function(){self.rightScrollTag();})
					this.target.find(".filemgr-content-wrap").bind("mousedown.toggleCurrent",function(e){

						e.preventDefault();
						e.stopPropagation();
						self.target.find(".filemgr-content-wrap").removeClass("grid-current");
						
						$(this).addClass("grid-current");
					});
				}	
			},
*/		
			dragSelect: function(){
				var self = this,
					filemgrContentBox = this.target.find(".grid-current .filemgr-content-box"),
					selectDiv = $("div.fwindow-resize-helper"),
					target = null;
				
				function selectBind(){
					filemgrContentBox.bind("mousedown.drag_select",function(e){
						e.preventDefault();
					//	e.stopPropagation();
					target = $(e.target).parents(".docs-list");
					var	selectLength = fatterOS.cache.select.length;

						if( target.length != 0 ){  //选中文件
							//如果没有按住shift or ctrl键
							if( !e.shiftKey && !e.ctrlKey ){
								if( e.button != "2" ){
									self.unSelectAllTarget();
								} else if (selectLength == 0){
									self.selectTarget(target);
								}
							} else {
								target.toggleClass("selected");
							}
						} else {   //没有选中文件

							self.unSelectAllTarget();
						//	onEnd();
							onBeforeSelect(e);
							//e.preventDefault();
						}
					});

					$(document).bind("mousemove.drag_select",function(e){
						onSelect(e);
					});

					$(document).bind("mouseup.drag_select",function(e){
						onEnd();
					});
				}

				function onBeforeSelect(e){

					self.startX = e.pageX;//-fm.fw.getOffset().l;
					self.startY = e.pageY;//-fm.fw.getOffset().t;
					if( target.length != 0 ){
						//e.target.focus();
						self.isSelect = false;
					
					} else {
						self.isSelect = true;
					}
				}

				function onSelect(e){
					
					if( self.isSelect ){
						var region = fatterOS.tools.getRegion( filemgrContentBox ),
							posX = Math.max( Math.min( e.pageX, region.right ), region.left ),
							posY = Math.max( Math.min( e.pageY, region.bottom ), region.top ),
							left   = Math.min( posX, self.startX ),
							top    = Math.min( posY, self.startY ),
							width  = Math.abs( posX - self.startX ),
							height = Math.abs( posY - self.startY );

						e.preventDefault();
						selectDiv.css({"left":left,"top":top,"width":width,"height":height});
						selectDiv.show();

						var targets = self.target.find(".content-current .docs-list"),
							length = targets.length;

						if( length != 0 ){
							for( var i = 0; i < length; ++i ){
								if(isInnerRegion(selectDiv,$(targets[i]))){
									if(!$(targets[i]).hasClass("selected")){
										self.selectTarget($(targets[i]));
									}
								} else {
									if($(targets[i]).hasClass("selected")){
										self.unSelectTarget($(targets[i]));
									}
								}
							}
						}
					}
				}

				function onEnd(){

					if(selectDiv){

						selectDiv.hide();
					}
					
					self.isSelect = false;
				}

				function isInnerRegion(selDiv, region){

					var s_top = selDiv.offset().top,
						s_left = selDiv.offset().left,
						s_right = s_left + selDiv.width(),
						s_bottom = s_top + selDiv.height(),

						r_top = region.offset().top,
						r_left = region.offset().left,
						r_right = r_left + region.width(),
						r_bottom = r_top + region.height(),

						t = Math.max( s_top, r_top ),
						r = Math.min( s_right, r_right ),
						b = Math.min( s_bottom, r_bottom ),
						l = Math.max( s_left, r_left );

					if ( b>t+5 && r>l+5 ){
						return true;
					} else {
						return false;
					}
				}
				selectBind();
			},

			eventBind: function(){
				var self = this,		
					$filemgrContentBox = this.target.find(".grid-current .filemgr-content-box");
				
				this.$address.find("#go_button").bind("click",function(){
					var url = self.getAddress();
					self.showFile(fatterOS.tools.fixURL(url),self.getTagNameFromURL(url));
				});

				this.$address.find("#forword_button").bind("click",function(){
					if(this.className == "disabled")return;
					var currentTagId = self.target.find(".grid-current .tag-current").attr("id");
					self.goForword(currentTagId);
				});

				this.$address.find("#back_button").bind("click",function(){
					if(this.className == "disabled")return;
					var currentTagId = self.target.find(".grid-current .tag-current").attr("id");
					self.goBack(currentTagId);
				});

				this.target.find(".grid-current .tag-scroll-left").bind("click",function(){
					self.scrollTags();
				});

				this.target.find(".grid-current .tag-scroll-right").bind("click",function(){
					self.scrollTags(-1);
				});
				//Enter键
				this.target.find("#url_text").keypress(function(e){
					if(e.which == 13)
					{
						e.preventDefault();
						var url = self.getAddress();
						self.showFile(fatterOS.tools.fixURL(url),self.getTagNameFromURL(url));
					}
				});

				$filemgrContentBox.bind("contextmenu",function(e){
					e.preventDefault();
					e.stopPropagation();
					var target = $(e.target).parents(".selected");
					if(target.length != 0){
						fatterOS.system.contextmenu("target",e);
					} else {
						fatterOS.system.contextmenu("filemgr",e);
					}
				});

			},
	};

	$.extend(fatterOS.filemgr, {
		id:1,
		nextId:function(){
			return fatterOS.id++;
		},
	});

	//实现系统消息相关，复制、粘贴、重命名、登录、注销、锁屏、右键菜单
	fatterOS.system  = fatterOS.system  || {};

	
	fatterOS.system = {

		preload: function(){
			var $preload = 	$("#preload"),
				$startingBar = $("#starting_bar"),
				clientHeight = fatterOS.clientInfo.clientHeight(),
				clientWidth = fatterOS.clientInfo.clientWidth();

			$startingBar.progressBar(100,{speed:25,callback:function(data){
				if( data.running_value == data.value ){
					$preload.fadeOut("slow");
				}
			}});
			return this;
		},

		contextmenu: function(place,srcE){
			var content = {
					default:["刷新","粘贴","|","新建文件夹","新建文本","|","属性"],
					desktop:["打开应用","卸载应用"],
					filemgr:["刷新","粘贴","|","上传","全选","|","属性"],
					target :["下载","复制","删除","改名","|","属性"]
				},
				content_cmd = {
					default:["reload","paste","|","mkdir","mkfile","|","info"],
					desktop:["runApp","removeApp"],
					filemgr:["reload","paste","|","upload","selectAll","info"],
					target:["download","copy","rm","rename","|","info"]
				},
				clientWidth  = fatterOS.clientInfo.clientWidth(),
				clientHeight = fatterOS.clientInfo.clientHeight(),
				context = content[place],
				cmd = content_cmd[place],
				html = "",
				split = "<div class=\"split\"></div>",
				offsetX = 10,
				offsetY = 10,
				x = 0,
				y = 0,
				self= this;

			this.$context = $("#fatterOS_context");
			for(var i = 0; i != context.length; ++i){
				if(context[i] === "|")
					html += split;
				else
					html += "<li name=\""+cmd[i]+"\">"+context[i]+"</li>";
			}
			$("<ul class=\"fatterOS-contextmenu\" />").append($(html).bind("mousedown",function(e){
														e.stopPropagation();
														e.preventDefault();
														var cmd = $(this).attr("name");
														self[cmd] && self[cmd](srcE);
														//fatterOS.desktop[cmd] && fatterOS.desktop[cmd]();
														self.$context.empty();
														}))
						.appendTo(this.$context);
			
			if( srcE.pageX + offsetX + this.$context.width() > clientWidth )
				x = clientWidth - this.$context.width() - offsetX;
			else
				x = srcE.pageX + offsetX;
			//TODO y-->200
			if( srcE.pageY + offsetY + 200 > clientHeight )
				y = clientHeight - 200 - offsetY;
			else
				y = srcE.pageY + offsetY;
			this.$context.css({left:x,top:y}).show();
			this.$context.hover(function(){},function(){
				fatterOS.system.$context.empty();		
			});
		},
		/*select:	function(){
									
		},

		selectAll: function(){
							
		},
*/
		copy: function(){
		//	var targets = $(".content-current .selected");
			var targets = fatterOS.cache.select,
				place = $(".content-current");
			
			$.each(targets,function(i){
				fatterOS.cache.clipBoard.push(targets[i]);
			});
			fatterOS.cache.clipPlace = place.attr("id");

		},

		rm: function(place,keys,interactive){
			
			if(keys){
				if(!interactive){
					fatterOS.confirm("确定删除这"+targets.length+"项吗？",function(value){
						if(value){
							if(typeof keys == "string"){
								$("[data-key="+keys+"]",place).remove();
							} else {
								$.each(keys,function(i,key){
									$("[data-key="+key+"]",place).remove();
								})
							}
						}
					})
				} else {
					if(typeof keys == "string"){
						$("[data-key="+keys+"]",place).remove();
					} else {
						$.each(keys,function(i,key){
							$("[data-key="+key+"]",place).remove();
						})
					}
				}
			}
		},
//TODO	remove HashFile
		paste: function(){
			var self = this,
				clipBoard = fatterOS.cache.clipBoard,
				//place = $(".content-current"),
				src_content_id = fatterOS.cache.clipPlace,
				src_place = $("#"+src_content_id),
				place = $(".content-current"),
				content_id = place.attr("id");
			//	tag_id = content_id.substring(8,content_id.length);
			
			$.each(clipBoard,function(i,key){
				var src = $("[data-key="+key+"]",src_place).eq(0),
					fullName = src.attr("data-name"),
					clone = src.clone(),
					fileExist = false;
				
				if(src_content_id == content_id){
					var splitName = self.spiltFileName(fullName),
						name = splitName.name,
						ext = splitName.ext,
						fullName2 = self.uniqueName(name,ext,content_id);
					//TODO 优化这里
					clone.attr("data-name",fullName2).find("input").val(fullName2).end().find("span").html(fullName2).end().appendTo(place);
				} else {
					fileExist = self.isFileExist(fullName,content_id);
					if(fileExist){	// 同一place 复制， 不同 place 替换
						fatterOS.confirm("确定覆盖"+fullName+"吗？",function(value){
							if(value){
								self.rm(place,fileExist.attr("data-key"),"quite");
								place.append(clone);
							}
						})
					} else {
						place.append(clone);
					}
				}
			})
		},

		rename:	function(){
		//	var targets = $(".content-current .selected");
			var keys = fatterOS.cache.select,
				tag_id = $(".grid-current .tag-current").attr("id"),
				target = null;

			$.each(keys,function(i,key){
				fatterOS.cache.rename[i] = key;
				target = $("[data-key="+key+"]");
				target.find("span").hide();
				target.find("input").show().focus();
		
			});
			//this.updateHash(tag_id,,"rename");
		},

		mkdir: function(){
			var tag_id = $(".grid-current .tag-current").attr("id"),
				content_id = "content_" + tag_id,
				place = $("#"+content_id),
				name = '新建文件夹',
				fileName = this.uniqueName(name,"",content_id),		
				html = "<div class=\"docs-list\"><div class=\"file-text\"><img alt=\"\" src=\"images/ext/folder.png\"/><span class=\"fileName\">"+fileName+"</span><input type=\"text\" value="+fileName+" /></div></div>";
			place.append(html);
			//this.updateHash(tag_id,fileName,"add");
		},

		mkfile: function(){
			var tag_id = $(".grid-current .tag-current").attr("id"),
				content_id = "content_" + tag_id,
				place = $("#"+content_id),
				name = '新建文本',
				ext = '.txt',
				fileName = this.uniqueName(name,ext,content_id),		
				html = "<div class=\"docs-list\" data-name="+fileName+"><div class=\"file-text\"><img alt=\"\" src=\"images/ext/txt.png\"/><span class=\"fileName\">"+fileName+"</span><input type=\"text\" value="+fileName+" /></div></div>";

			place.append(html);
			//this.updateHash(tag_id,fileName,"add");
		},
	
		isValidName: function(name){
			return name.match(/^[^\\\/\<\>:]+$/);
		},

		isFileExist: function(name,content_id){
		
			var $currentContent = $("#"+content_id),
				$targets = $currentContent.find("div"),
				len = $targets.length,
				i = 0;
			
			for(; i<len; ++i){
				if(name == $($targets[i]).attr("data-name")){
					return $($targets[i]);
				}
			}
			return false;
	
		},

		uniqueName: function(name,ext,content_id){
			var i = 0;
			if(!this.isFileExist(name+ext,content_id)){
				return name+ext;
			}

			while(++i < 50){
				if(!this.isFileExist(name+i+ext,content_id)){
					return name+i+ext;
				}
			}

			return name+(Math.random()*100)+ext;
		},

		spiltFileName: function(fullName){
			var name = fullName.match(/^.*(?=\.)/g),
				ext	 = fullName.match(/\.[^\.]+$/);
			if(name == null){
				return {
					name: fullName,
					ext: ""
				}
			} else {
				return {
					name: name,
					ext: ext
				}
			}
		},

		upload: function(){
					
		},

		login: function(){
								
		},

		logoff:	function(){
							
		},

		runApp: function(srcE){
			fatterOS.desktop.openApp(srcE);	
		},
		/*
		updateHash:	function(tag_id){
			var	data = fatterOS.cache.tabs[tag_id],
				hashList = data.hashList,
				hashNo = data.hashNo;

			hashList[hashNo].fileName.push(fileName);

		}*/
	};

	fatterOS.clientInfo = {
		screenWidth:  window.screen.width,
		screenHeight: window.screen.height,
		availHeight:  window.screen.availHeight,
		availWidth:   window.screen.availWidth,

		clientHeight: function(){
			return document.documentElement.clientHeight;
		},

		clientWidth:  function(){
			return document.documentElement.clientWidth;
		}
	};

	fatterOS.cache = {
		select: [],
		rename: [],
		clipBoard:	[],
		clipPlace:	"",	
		tabs: {}
	};

	//实现全部的事件
	fatterOS.eventBind   = fatterOS.eventBind || {};
	fatterOS.eventBind = {
		
		windowBind:	function(){
			$(window).resize(function(){
				
			});	
		},

		documentBind: function(){
			this.$document = $(document);
			this.$context = fatterOS.system.$context || $("#fatterOS_context");
			/*全局点击事件开始*/
			this.$document.bind("mousedown.globle",function(e){
				//e.preventDefault();
				fatterOS.eventBind.$startMenu.hide();
				fatterOS.eventBind.$context.empty();
				if ( !$(e.target).is("input,textarea,select") ) {
					$("input,textarea").blur();
					var rename = fatterOS.cache.rename;
					if(rename.length !== 0){
						$.each(rename,function(i,key){
							var $file = $("[data-key="+key+"]");
							
							$file.find("input").hide();
							$file.find("span").show();
						})
					}

					fatterOS.cache.rename = [];
				}
			});
			/*全局点击事件结束*/

			/*全局右键事件开始*/
			this.$document.bind("contextmenu.globle",function(e){
				e.preventDefault();
				e.stopPropagation();
				fatterOS.system.contextmenu("default",e);
			});
			/*全局右键事件结束*/

			/*全局鼠标移动事件开始*/
			this.$document.bind("mousemove.globle",function(e){
			
			});
			/*全局鼠标移动事件结束*/

			/*全局键盘事件开始*/
			this.$document.bind("keydown.globle",function(e){
				//console.log(e.keyCode);		
			});
			/*全局键盘事件结束*/
			//搜索框
			var $searchInput=$("#search_input");
			var $searchBtn=$("#search_button");
			$searchInput.bind("click",function(){
				if($searchInput.val()=="搜索...")
					$searchInput.val("");
			}).blur(function(){
				if($searchInput.val()=="")
					$searchInput.val("搜索...");
			});

			return this;
		},

		desktopBind: function(){
			this.$desktop = $("#desktop");
	
			/*桌面程序单击开始*/
			this.$desktop.bind("click.openApp",function(e){
				e.preventDefault();
				fatterOS.desktop.openApp(e);
			});
			/*桌面程序单击结束*/
			
			/*桌面程序右键开始*/
			this.$desktop.bind("contextmenu.openApp",function(e){
				e.stopPropagation();
				e.preventDefault();
				fatterOS.system.contextmenu("desktop",e);
			});
			return this;
		},

		bottombarBind: function(){
				
		},

		startButtonBind: function(){
			this.$startBtn = $("#start_button"),
			this.$startImg = this.$startBtn.find("#start_icon"),
			this.$startMenu	= $("#start_menu");
			/*开始菜单点击开始*/
			this.$startBtn.bind("click.startmenu",function(e){
				e.stopPropagation();
				fatterOS.eventBind.$startMenu.toggle();
			});
			/*开始菜单点击结束*/

			/*开始菜单hover开始*/
			this.$startBtn.hover(function(){
					fatterOS.eventBind.$startImg.attr("src","images/start_3.png");
				},function(){
					fatterOS.eventBind.$startImg.attr("src","images/start_1.png");
				})
			return this;
		},

		startButtonUnbind: function(){
			this.$startBtn.unbind("click.startmenu");
		},

		showDesktopBind:function(){
			var $showDesktopButton = $("#showDesktop"),
				isHidden = false;

			$showDesktopButton.bind("click",function(){
				var $taskLists	= $("div.fwindow");
				if(isHidden){
					$taskLists.show();
					isHidden = false;
				}else{
					$taskLists.hide();
					isHidden = true;
				}
			});
			return this;
		},

	};

	/*
	 * @name fatterOS.desktop
	 * @function
	 * 实现桌面布局，壁纸，切换桌面、主题
	 *
	 */
	fatterOS.desktop = {
			
		init: function(){
			var $cloud = $(".scene-cloud"),
				cloud_x = -500,
				clientWidth  = fatterOS.clientInfo.clientWidth(),
				clientHeight = fatterOS.clientInfo.clientHeight();
			
			fatterOS.system.preload();
			this.creatTaskbarTime();

			setInterval(function(){
				$cloud.css("left",cloud_x);
				cloud_x += 0.1;
				if( cloud_x > clientWidth )
					cloud_x = -500;
			},100);

			document.body.style.width 	= clientWidth + "px";
			document.body.style.height  = clientHeight + "px";
			fatterOS.eventBind.startButtonBind();
			fatterOS.eventBind.documentBind().desktopBind().showDesktopBind();
			return this;
		},

		creatTaskbarTime: function(){
			var $timebar = $("#timebar");
			setInterval(function(){
					$timebar.html(fatterOS.tools.getDate(4));
					},1000);
			return this;
		},

		changeBackgroud: function(imgsrc){
			document.body.style.backgroundImage = "url(" + imgsrc + ")";
			return	this;
		},
		
		changeTheme: function(themeType){
			//TODO
			return this;
		},
	
		openApp: function(e){
			
			var target,name,type;
			if(e.target.className === "app-button")
				target = e.target;
			else
				if(e.target.parentNode.className === "app-button")
					target = e.target.parentNode;
				else
					if(e.target.parentNode.parentNode.className === "app-button")
						target = e.target.parentNode.parentNode;

			if(target){
				name = target.dataset.name;
				type = target.dataset.type;
				
				if(type === undefined)
					new fatterOS.window({title:name,onClose:function(){
							fatterOS.alert(name+"--成功关闭了!")
						}});
				else if(type === "filemgr")
						new fatterOS.filemgr({title:name,onClose:function(){
							fatterOS.alert("资源管理器已关闭！")	
						}});
				else if(type === "widget")
					new fatterOS.widget();
				else if(type === "douban"){
					fatterOS.iframe("http://douban.fm/partner/qq_plus",{title:"豆瓣FM",width:"550"})
				}

			}
		},
		
		removeApp: function(e){
		
		}
	};


	fatterOS.tools = {

		getDate: function(t){
			var d = new Date(),
				n = { Y: d.getFullYear(), M: d.getMonth() + 1, D: d.getDate(), h: d.getHours(), m: d.getMinutes(), s: d.getSeconds(), w: d.getDay() }
			switch (t) {
				case 0: return n.Y + '年' + n.M + '月' + n.D + '日';
				case 1: return n.h + ':' + n.m + ':' + n.s;
				case 2: return n.h + '点' + n.m + '分' + n.s + '秒';
				case 3: return n.Y + '年' + n.M + '月' + n.D + '日' + '　星期' + ('日一二三四五六').charAt(n.w);
				case 4: return "<div class='time_left'><div class='time_y'>"+n.Y + '年' + n.M + '月' + n.D + '日'+"</div>"+"<div class='time_w'>"+'星期' + ('日一二三四五六').charAt(n.w)+"</div></div>"+"<div class='time_m'>"+n.h + ':' + this.fixNum(n.m) + ':' + this.fixNum(n.s)+"</div>";
				case 5: return n.Y+"."+n.M+"."+n.D;
				default: return n.Y + '-' + n.M + '-' + n.D;
			}
		},

		fixNum: function(t){
			if (t < 10)
				return "0"+ t;
			else
				return t;
		},

		getFileType: function(name){
			var ext = name.split(".");
			return ext[ext.length-1];
		},

		hasChinese: function(str){
			if(escape(str).indexOf("%u")<0){
				return false;
			} else {
				return true;
			}
		},
						
		encodeChinese: function(str){
			if(this.hasChinese(str)){
				str = encodeURI(encodeURI(str));
			}
			return str;
		},

		decodeChinese: function(str){
			if(!this.hasChinese(str)){
				str = decodeURI(decodeURI(str));
			}
			return str;
		},

		fixURL: function(str){	
			var self = this,
				l = str.length;
				
			if(str.substring(0,1) == "/"  ||  str.substring(0,1) == "\\"){
				str = str.substring(1,str.length);
			}
			var ll = str.length;
			if(str.substring(ll-1,ll) == "/"  ||  str.substring(ll-1,ll) == "\\"){
				str = str.substring(0,ll-1);
			}
			var url = str.split("/"),
				s = "/";
			$.each(url,function(i){
				url[i] = self.encodeChinese(url[i]);
				s += url[i]+"/";
			});
			s = s.substring(0,s.length-1);
			return s;	
		},

		fixPageURL: function(str){
			if(str.substring(0,7) != "http://"){
				var str = "http://" + str;
			}
			return str;
		},

		getClientTop: function(){
					 
	//		return 0;			 
		},

		getClientLeft: function(){
	//		return 0;				 
		},

		getRegion: function( elem ){
	/*
			jQuery.each( ["Width","Height","Top","Left"], function(i,name){		
				console.log((fatterOS.tools["getClient"+name])());
			});
	*/		
			var l,r,t,b,
				elem = $(elem);
			l = elem.offset().left;
			r = l + elem.width();
			t = elem.offset().top;
			b = t + elem.height();

			return 	{
						left	: l,
						right	: r,
						top		: t,
						bottom	: b
					}
		},
		pushSelect: function(){
						
		},
		
	};

	fatterOS.desktop.init();
	fatterOS.tips("欢迎使用fatterOS!");
	window.fatterOS = fatterOS;
});
