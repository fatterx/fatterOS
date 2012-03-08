(function($) {
	
	fatterOS.filemgr = function(options){

	this.defaults = {
        title: 			'filemgr',
		width: 			800,
		height: 		500,
		cookie: 		{
							expires : 30,
							domain  : '',
							path    : '/',
							secure  : false
						},
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
		resizeCallback:	function(){
									this.autoFixWindow();
									this.checkFrameScroll();
						},
	};

	this.options = $.extend({}, this.defaults, options || {});
	this.elem_shortcut_button = $("<ul class=\"shortcut-button\" />");
	this.elem_clear_div = $("<div class=\"clear\" />");
	this.elem_address = $("<div class=\"address\"><span>地址</span><div title=\"back\" id=\"back_button\" class=\"disabled\"/><div title=\"forword\" id=\"forword_button\" class=\"disabled\"/><div title=\"Go\" id=\"go_button\"/><div class=\"input-border\"><input type=\"text\" id=\"url_text\"/></div></div>");
	this.elem_file_tree = $("<ul class=\"file-tree\" />");
	this.elem_left_nav_tree = $("<div class=\"left-nav-tree\" />").append(this.elem_file_tree);
	this.elem_filemgr_tag = $("<div class=\"filemgr-tag\"><span class=\"tag-scroll-left tag-scroll\">&lt;</span><ul class=\"tag\"></ul><span class=\"tag-scroll-right tag-scroll\">&gt;</span></div>");
	this.elem_filemgr_resize = $("<div class=\"filemgr-resize\" />");
	this.elem_filemgr_content_box = $("<div class=\"filemgr-content-box\" />");
	this.elem_state_bar = $("<div class=\"filemgr-state-bar\" />");
	this.elem_filemgr_content_wrap = $("<div class=\"filemgr-content-wrap frame-current\" />")
							.append(this.elem_filemgr_tag)
							.append(this.elem_filemgr_content_box);
	this.target = $("<div class=\"filemgr-wrap\" />")
							.append(this.elem_shortcut_button)
							.append(this.elem_clear_div)
							.append(this.elem_address)
							.append(this.elem_left_nav_tree)
							.append(this.elem_filemgr_resize)
							.append(this.elem_filemgr_content_wrap)
							.append("<div class=\"clear\" />")
							.append(this.elem_state_bar);
	this.window = new fatterOS.window(this.options).setContent(this.target);
	this.init();	
};

fatterOS.filemgr.prototype = {

		constructor: fatterOS.filemgr,

		init: function(){

			this.window.resize(this.options.width,this.options.height);

			var tools = this.options.toolbar,
				lengths = tools.length,
				isSplit = false,
				i = 0,
				n;
			//生成toolbar
			for ( ; i < lengths; i++ ) {

				if ( isSplit ) {
					this.elem_shortcut_button.append('<li class="split" />');
				}
				isSplit = false;

				for ( var j = 0,length = tools[i].length; j < length; j++ ) {
					
					n = tools[i][j];
					if (n) {
						isSplit = true;
						$('<li class="'+n+'" title="'+n+'" name="'+n+'"/>')
							.appendTo(this.elem_shortcut_button)
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
			this.resizeBind(this.elem_filemgr_resize,this.elem_left_nav_tree);
			this.eventBind();
			this.dragSelect();
			this.autoFixWindow();
			this.showFile("/我的文档","我的文档");
		},

		resizeBind: function( resizeHandle ){

			var self = this,
				left_nav_tree = self.elem_left_nav_tree,
				left_frame = self.elem_filemgr_content_wrap;

			( function( self ){

				resizeHandle.bind("mousedown.frame_resize",function(e){
					e.preventDefault();
					e.stopPropagation();
					onBeforeResize(e);
				});

				$(document).bind("mousemove.frame_resize",function(e){
					e.preventDefault(); 
					e.stopPropagation();
					if( self.onResizeLeftSide ){
							onResizeLeft(e);
					} else {
							onResizeRight(e);
					}
				});

				$(document).bind("mouseup.frame_resize",function(e){
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

						if( self.target.find(".right-frame").html() ){
							var right_frame = self.target.find(".right-frame"),
							    r_width = (self.target.parent().width()-l_width)/2 - 7;
							left_frame.css("width",r_width);
							right_frame.css("width",r_width);
						}
					}

				}

				function onResizeRight(e){

					if(self.isResize){

							var left_width  = left_nav_tree.width();
							var right_frame = self.target.find(".right-frame");
							var right_totol = right_frame.width() + left_frame.width();
							var _width = Math.max( Math.min( e.pageX - self.target.offset().left - left_width, 500 ), 150 );
							left_frame.css("width",_width);
							right_frame.css("width",right_totol - _width);
					}

				}

				function onResizeEnd(){

					if(self.isResize){
						if(self.options.resizeCallback)
							//self.options.resizeCallback();
							self.isResize = false;
					}
				}

			})(self);
		},

		autoFixWindow: function(){

			var windowSize = this.window.getSize(),
				curWidth  = windowSize.width,
				curHeight = windowSize.height,
			    contentWrapHeight = curHeight - this.elem_address.height() - this.elem_shortcut_button.height() - this.elem_state_bar.height() - 2 - 10,//减去address 35px shortcut 30px 2px border;
			    contentWrapWidth = 0,
			    contentBoxHeight = contentWrapHeight - this.elem_filemgr_tag.height();

				if( this.target.data("twice") === true ){
				
					contentWrapWidth=(curWidth-this.elem_left_nav_tree.width())/2-6;  //减去padding 5，左边导航 双显
					this.target.find(".filemgr-content-wrap").css({"width":contentWrapWidth,"float":"left"});
				
				} else {
					this.target.find(".filemgr-content-wrap").css({"width":"auto","float":"none"});
				}

				this.target.css({height:curHeight});
				this.elem_left_nav_tree.css("height",contentWrapHeight);
				this.target.find(".filemgr-content-wrap").css("height",contentWrapHeight);
				this.target.find(".filemgr-content-box").css("height",contentBoxHeight);
				this.target.find(".filemgr-resize").css("height",contentBoxHeight);
		},

		updateShortcutButton: function(target){
	
				var buttons = this.elem_shortcut_button;
				var fileButtons = buttons.find(".file");
	//			var executButton = ['open','copy','rm','rename','edit','info'];
//				var target = this.target.find(".frame-current .content-cur .selected");
				
	//			executButton.push(mkdir);
	//
				if(target){
						
					fileButtons.removeClass("disabled");
				
				}else{
			
					fileButtons.addClass("disabled");

				}

				if(fatterOS.cache.clipBoard.length !== 0 ){
				
					buttons.find(".paste").removeClass("disabled");
				
				}
						 
		},

		checkBackForwordButton: function(currentContent){

			var hashList = currentContent.data("data").hashList,

			    hashNo = currentContent.data("data").hashNo;

			this.elem_address.find("#back_button").attr("className","disabled");

			this.elem_address.find("#forword_button").attr("className","disabled");

			if(hashList.length>1){

				if(hashNo>0){

					this.elem_address.find("#back_button").removeClass("disabled");
				}
				
				if(hashNo<(hashList.length-1)){
					this.elem_address.find("#forword_button").removeClass("disabled");
				}

			}

		},

		checkFrameScroll: function(){
			var currentFrame = this.target.find(".frame-current>.filemgr-tag"),
				tags = currentFrame.find("ul.tag>li"),
				tagWidth = tags.outerWidth(),
			    tagsWidth = tags.length * tagWidth,
			    frameWidth = currentFrame.width(),
			    scroll = this.target.find(".frame-current .tag-scroll");
				if( tagsWidth > frameWidth ){
					scroll.show();
					return true;
				}
				else{
					scroll.hide();
					return false;
				}
		},

		scrollTags: function( direction ){

			var ul = this.target.find(".frame-current ul.tag"),
				tagWidth = parseFloat(ul.find("li").outerWidth()) + parseFloat(ul.find("li").css("marginLeft")),
				left = parseFloat(ul.css("left"));
			direction < 0 ? left += tagWidth : left -= tagWidth;
			ul.css({left:left});
		},

		rightScroll: function(){
//TODO

			//this.target.find(".frame-current ul.tag>li:hidden").last().css("display","block");
		},

		getFileTree: function(){

			var self = this;

			$.ajax({
					url:"file.php",
					data:"get=filetree",
					dataType:'json',
					success:function(d){
										
							$.each(d,function(i){

									$("<li>"+d[i].name+"</li>")
										.appendTo(self.elem_file_tree)
										.bind("click",function(e){
											e.stopPropagation();
											self.elem_file_tree.find("li").removeClass("selected");
											$(this).addClass("selected");
											self.showFile("/"+encodeChinese(this.innerHTML),this.innerHTML);
										});
							});

						}
					});

		},		

		//显示文件
		showFile: function(url,title,target,back){
			var self = this,
				content_box = self.target.find(".frame-current>.filemgr-content-box"),
				tag_ul = self.target.find(".frame-current ul.tag"),
				target = target || "_blank",
				cur_tag_id = "tag_li_" + fatterOS.filemgr.id,
				$backBtn = self.elem_address.find("#back_button"),
				$forwordBtn = self.elem_address.find("#forword_button"),
				files_html = "",
				hashNo = 0,
				$tag,hashList;
			
			hashList = new Array();
			hashList[0] = url;
			
			$.ajax({
					url:"file.php",
					data:"path="+url,
					dataType:"json",
					success:function(data){
						$.each(data,function(i){
							
							files_html += "<div class=\"docs-list\"><div class=\"file-"+data[i].type+"\"><img src=\"images/exe/"+data[i].type+".png\" alt=\"\" /><input type=\"text\" value="+data[i].name+" class=\"rename-text\" /></div></div>";
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
							$("<div id=\"content_"+cur_tag_id+"\" class=\"content-inner\">"+files_html+"</div>").appendTo(content_box)
																												.data("data",{url:url,hashList:hashList,hashNo:hashNo});
							
							self.switchTag(cur_tag_id);
							$backBtn.attr("className","disabled");
							$forwordBtn.attr("className","disabled");
							fatterOS.filemgr.id++;
							if(self.checkFrameScroll()){
								self.scrollTags();
							};

						} else {
							var cur_tag_li = self.target.find(".frame-current .tag-cur"),
								cur_content = self.target.find(".frame-current .content-cur");
							
							hashList = cur_content.data("data").hashList;
							hashNo = cur_content.data("data").hashNo;

							if( back == undefined ){

								hashList[hashList.length] = url;
								hashNo = hashList.length - 1;
							} else if( hashNo != (hashList.length - 1) ){  
									 //删除此页标识编号以后的数组项
									 //hashList.splice(hashNo+1,(hashList.length-(hashNo+1)));
							}
							cur_content.html(files_html).data("data",{url:url,hashList:hashList,hashNo:hashNo});
							cur_tag_li.children("a").html(title);
							self.setAddress(url);
							self.showState(target);
							self.checkBackForwordButton(cur_content);

						}

						self.target.find(".file-folder").bind("dblclick",function(e){
								e.stopPropagation();
								var cur_title = this.childNodes[1].value,
									cur_url = url + "/" + encodeChinese(cur_title);
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

		//向前
		goForword:function(currentContent){

			var hashNo=currentContent.data("data").hashNo;
			var hashList=currentContent.data("data").hashList;
			var url=hashList[++hashNo];

			if(url==null)return;
			currentContent.data("data",{url:url,hashList:hashList,hashNo:hashNo});
			this.showFile(url,this.getTagNameFromURL(url),"_self","back");

			},
		//向后
		goBack:function(currentContent){

			var hashNo=currentContent.data("data").hashNo;
			var hashList=currentContent.data("data").hashList;
			var url=hashList[--hashNo];

			if(url==null)return;
			currentContent.data("data",{url:url,hashList:hashList,hashNo:hashNo});
			this.showFile(url,this.getTagNameFromURL(url),"_self","back");

			},
		//得到隐藏地址
		getHideAddress:function(tag_id){
			return this.target.find("#content_"+tag_id).data("data").url;
			},
		//状态栏显示
		showState:function(tag_id){
			var source=$("#content_"+tag_id+">div.docs-list");
			var state=$(".state-bar>span");
			var s="";
			s+="共"+source.length+"项";
			state.html(s);	
		},
		//切换标签
		switchTag:function(tag_id){
			var content_cur=this.target.find("#content_"+tag_id);	
			var tag_li_cur=this.target.find("#"+tag_id);
			var _contents=this.target.find(".frame-current .content-inner");
			var _tags_lis=this.target.find(".frame-current ul.tag>li");
			var address=this.getHideAddress(tag_id);
			_tags_lis.removeClass("tag-cur");//隐式递归
			_contents.removeClass("content-cur");
			content_cur.addClass("content-cur");
			tag_li_cur.addClass("tag-cur").css("display","block");
			this.setAddress(address);
			this.showState(tag_id);
			this.checkBackForwordButton(content_cur);

		},
		//关闭标签
		closeTag:function(tag_id){
			var li=this.target.find("#"+tag_id);
			var content=this.target.find("#content_"+tag_id);
			var prevLi=li.prev("li");
			var nextLi=li.next("li");
			if(prevLi.html()!=null && !prevLi.hasClass("tag-scroll")){
				li.remove();
				content.remove();
				this.checkFrameScroll();
				this.switchTag(prevLi.attr("id"));
			}
			else if(nextLi.html()!=null){
				li.remove();
				content.remove();
				this.checkFrameScroll();
				this.switchTag(nextLi.attr("id"));
			}
			else{
				return;
			}
		},

		getTagNameFromURL:function(str){
			var l=str.length;
			if(str.substring(l-1,l)=="/"||str.substring(l-1,l)=="\\"){
				str=str.substring(0,l-1);
			}
			var url=str.split("/");
			return decodeChinese(url[url.length-1]);
		},

		
		openFile:function(){
			alert("fileOpened")
		},

		copyFile:function(){
			var cur_file=$(".frame-current .selected");
			var docs=$(".frame-current .docs-list");
				docs.removeClass("copying");
				cur_file.addClass("copying").removeClass("selected");
		},
		pasteFile:function(){
			var source_file=$(".copying");
			if(source_file.html()!=null){
				source_file.each(function(i){
			var _source_file=$(source_file[i]);
			var clone_file=_source_file.clone(true,true).removeClass("cutting copying").addClass("selected").addClass("copied");
				$(".frame-current .content-cur").append(clone_file);
				$(".frame-current .selected").removeClass("selected");
				if(source_file.hasClass('cutting'))
				{
					source_file.remove();
				}
			var span=clone_file.children("div").children("span");
			var _name=span.html();
			var sub_name=_name.substring(0,_name.lastIndexOf("."));
			var _exe=_name.substring(_name.lastIndexOf("."),_name.length);
			var	new_name=sub_name+"_复制"+_exe;
				span.html(new_name);
			});
			}
		},
		delFile:function(){
			var cur_file=$(".frame-current .selected");
			var msg="确定要删除这"+$(".frame-current .selected").length+"个文件(夹)么？";
			if($(".frame-current .selected").length>0){
				Fwindow.confirm(msg,function(){
						cur_file.remove();
				});
			}
			else{
				Fwindow.alert('请选择要删除的文件(夹)');
			}
		},
		saveFile:function(){
			alert('saveFile')	 
		},
		cutFile:function(){
			var cur_file=$(".frame-current .selected");
			var docs=$(".frame-current .docs-list");
				docs.removeClass("cutting copying");
				cur_file.addClass("cutting copying").removeClass("selected");
		},
		renameFile:function(){
			var source_file=this.target.find(".frame-current .content-cur .selected");
			var input=source_file.children("div").children("input");
				input.focus();
		},
		upFile:function(){
			alert('upfiles')
		},
		downFile:function(){
			alert('downfiles')
		},
		reload:function(){
			var currentContent=this.target.find(".frame-current .content-cur");
			var url=currentContent.data("data").url;
			this.showFile(url,this.getTagNameFromURL(url),"_self","back")
		},
		showAttr:function(){
			alert('attr')
		},
		createFolder:function(){
			var cur_content=this.target.find(".frame-current .content-cur");
			var s="<div class=\"docs-list\"><div class=\"file-folder\"><img alt=\"\" src=\"images/exe/folder.png\"/><input type=\"text\" value=\"新建文件夹\" /></div></div>";//<ul><li>大小:0MB</li><li>用户:fatter</li><li>日期:"+getDate(5)+"</li></ul></div></div>";
			cur_content.append(s);

		},
		
		getSelf:function(){
			return this.target;
		},

		selectTarget : function(target){
		
			$(target).addClass("selected");
			this.updateShortcutButton(target);

					   
		},

		selectAllTarget : function(){
		
			this.target.find(".frame-current .content-cur div.docs-list").addClass("selected");
			this.updateShortcutButton('target');

		},

		unSelectTarget : function(target){
			target.removeClass("selected");
			this.updateShortcutButton();

		},

		unSelectAllTarget : function(){
			
			this.target.find(".frame-current .content-cur div.docs-list").removeClass("selected");
			this.updateShortcutButton();

		},

		showOtherWindow:function(){
			
				var self=this;
				if(this.target.data("twice")!="undefined" && this.target.data("twice")==true){
					this.target.data("twice",false);
					$(this.target.find(".filemgr-content-wrap")[1]).remove();
					this.target.find(".filemgr-content-wrap").addClass("frame-current");
					this.autoFixWindow();
				}
				else
				{

					this.target.data("twice",true);	
					this.elem_filemgr_content_wrap
							.removeClass("frame-current")
							.after("<div class=\"filemgr-resize dbframe\" /><div class=\"filemgr-content-wrap frame-current right-frame\"><div class=\"filemgr-tag\"><ul class=\"tag\"><li class=\"tag-scroll-left tag-scroll\">&lt;</li><li class=\"tag-scroll-right tag-scroll\">&gt;</li></ul></div><div class=\"filemgr-content-box\" /></div>");
					
					var url=this.getAddress();
					this.showFile(url,this.getTagNameFromURL(url));
					this.autoFixWindow();
					if(this.checkFrameScroll()){
						this.leftScrollTag();
					}
					//new this.dragSelect().dragSelect(this);
					new this.dragSelect(this);
					this.resizeBind(self.target.find(".dbframe"));

					this.target.find(".tag-scroll-left.tag-scroll").bind("click",function(){self.leftScrollTag();})
					this.target.find(".tag-scroll-right.tag-scroll").bind("click",function(){self.rightScrollTag();})
					this.target.find(".filemgr-content-wrap").bind("mousedown.toggleCurrent",function(e){

						e.preventDefault();
						e.stopPropagation();
						self.target.find(".filemgr-content-wrap").removeClass("frame-current");
						
						$(this).addClass("frame-current");
					});
				}	
		},
	
		dragSelect: function(){
			var self = this,
				filemgrContentBox = this.target.find(".frame-current .filemgr-content-box"),
				selectDiv = $("div.fwindow-resize-helper"),
				target;
			
			function selectBind(){
				
				filemgrContentBox.bind("mousedown.drag_select",function(e){
					target = $(e.target).parents(".docs-list");
					if( target.length != 0 ){  //选中文件
						//如果没有按住shift or ctrl键
						if( !e.shiftKey && !e.ctrlKey ){
					//		if( e.button != "2" ){
								self.unSelectAllTarget();
					//		}
							self.selectTarget(target);
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

				//selectDiv.css({'background-color':'#C3D5ED',filter:'alpha(opacity:60)',opacity:'0.6'});
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

					var targets = self.target.find(".content-cur .docs-list");

					if( targets.length != 0 ){
						$.each(targets,function(i){
							if(isInnerRegion(selectDiv,$(targets[i]))){
								self.selectTarget($(targets[i]));
							} else {
								self.unSelectTarget($(targets[i]));
							}
						});
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
				$filemgrContentBox = this.target.find(".frame-current .filemgr-content-box");
			
			this.elem_address.find("#go_button").bind("click",function(){
				var url = self.getAddress();
				self.showFile(fixURL(url),self.getTagNameFromURL(url));
			});

			this.elem_address.find("#forword_button").bind("click",function(){
				if(this.className == "disabled")return;
				var currentContent = self.target.find(".frame-current .content-cur");
				self.goForword(currentContent);
			});

			this.elem_address.find("#back_button").bind("click",function(){
				if(this.className == "disabled")return;
				var currentContent = self.target.find(".frame-current .content-cur");
				self.goBack(currentContent);
			});

			this.target.find(".frame-current .tag-scroll-left").bind("click",function(){
				self.scrollTags();
			});

			this.target.find(".frame-current .tag-scroll-right").bind("click",function(){
				self.scrollTags(-1);
			});
			//Enter键
			this.target.find("#url_text").keypress(function(e){
				if(e.which == 13)
				{
					e.preventDefault();
					var url = self.getAddress();
					self.showFile(fixURL(url),self.getTagNameFromURL(url));
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
		
}

$.extend(fatterOS.filemgr, {

	id:1,

	nextId:function(){
	
		return fatterOS.id++;
	
	},

});
/*
fatterOS.filemgr.prototype.dragSelect = function(fm){
		
		var self=this;

};

//右键菜单
fatterOS.filemgr.prototype.context = function(fm,target,contextmenu){

	var contextDiv  = $("div.fwindow-contextmenu");
	var self        = this;
	var _offsetX     = 10;
	var _offsetY     = 10;

	function menu(e){

			var ul=$("<ul/>");
			var t=fm.options.contextmenu,c=false,i,j,n;
			var i, j, a, html="", l, src = contextmenu || fm.options.contextmenu.workplace;
			var parent = fm.target.find(".frame-current .content-cur");

				for (i=0; i < src.length; i++) {
					if (src[i] == 'split') {

						ul.append('<div class="split" />');

					}
					else{
					/*
					a = src[i];
					html = '';

					if (a.length) {
						html = '<span/><div class="el-finder-contextmenu-sub" style="z-index:'+(options.zindex+1)+'">';
						for (var j=0; j < a.length; j++) {
							html += '<div name="'+src[i]+'" argc="'+a[j].argc+'" class="'+a[j]['class']+'">'+a[j].text+'</div>';
						};
						html += '</div>';
					}*/
/*
						$('<li class="'+src[i]+'" name="'+src[i]+'">'+html+src[i]+'</li>')
								.appendTo(ul);
					}
				};
				contextDiv.append(ul);
				var size = {
	    						height : parent.height(),
      							width  : parent.width(),
      							offsetLeft  : parent.offset().left,
								offsetTop   : parent.offset().top,
							}
				var cw=contextDiv.width();
				var ch=contextDiv.height();

                var offsetX = ( e.pageX + cw + _offsetX ) > size.width + size.offsetLeft  ? ( e.pageX - _offsetX - cw ) : ( e.pageX + _offsetX );
                var offsetY = ( e.pageY + ch + _offsetY ) > size.height + size.offsetTop  ? ( e.pageY - _offsetY - ch ) : ( e.pageY + _offsetY );
				
				contextDiv.css('top' , offsetY );
                contextDiv.css('left', offsetX );

				contextDiv.find("li").bind("click.contextmenu",function(e){

							e.stopPropagation();
							//cmdName=$(this).attr("className");
							//filemgr.execut(cmdName);

							});
				contextDiv.hover(function(){}, function(){
							
							contextDiv.empty();

						});

	  	 	};

	$(target).bind("contextmenu.contextmenu",function(e){

		e.preventDefault();
		e.stopPropagation();
		contextDiv.empty();	
		menu(e);
		return false;
		
	});

    $(target).bind("mousedown.contextmenu",function(e){

		if(e.button == "2"){

           contextDiv.show();
           contextDiv.css('display','block');

		}else {

       		contextDiv.empty();

       }

	});

}*/
//TODO 将所有selectDIV换成 document内的静态div
})(jQuery);
