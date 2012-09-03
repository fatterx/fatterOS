/*
 * 	description	:	fatterOS is a simple webOS
 *	author 		: 	fatter
 *	email		:	lwn888@gmail.com
 *	date		:	2011-12-30
 * */

﻿$(document).ready(function(){

	/*
	 *声明命名空间
	 * */
	var fatterOS ={verson: "1.0"};

	//实现小部件，tips
	fatterOS.widget  = fatterOS.widget  || {};

		
	
	//实现系统消息相关，复制、粘贴、重命名、登录、注销、锁屏、右键菜单
	fatterOS.system  = fatterOS.system  || {};

	
	fatterOS.system = {
		contextmenu: function(place,e){
								var content = {
										default:["刷新","粘贴","|","新建文件夹","新建文本","|","属性"],
										desktop:["打开应用","卸载应用"],
										filemgr:["刷新","粘贴","|","上传","新建[...]","|","全选","对齐","查看方式","|","属性"],
										target :["下载","复制","删除","改名","|","属性"],
									},
									clientWidth  = fatterOS.clientInfo.clientWidth(),
									clientHeight = fatterOS.clientInfo.clientHeight(),
									context = eval("content."+place),
									html = "",
									split = "<div class=\"split\"></div>",
									offsetX = 10,
									offsetY = 10,
									x = 0,
									y = 0;

								this.$context = $("#fatterOS_context");
								for(var i = 0; i != context.length; ++i){
									if(context[i] === "|")
										html += split;
									else
										html += "<li>"+context[i]+"</li>";
								}
								this.$context.html("<ul class=\"fatterOS-contextmenu\">"+html+"</ul>");
								if( e.pageX + offsetX + this.$context.width() > clientWidth )
									x = clientWidth - this.$context.width() - offsetX;
								else
									x = e.pageX + offsetX;
								//TODO y-->200
								if( e.pageY + offsetY + 200 > clientHeight )
									y = clientHeight - 200 - offsetY;
								else
									y = e.pageY + offsetY;
								this.$context.css({left:x,top:y}).show();
								this.$context.hover(function(){},function(){
									fatterOS.system.$context.empty();		
								});
							},
		select			:	function(){
							
							},

		selectAll		:	function(){
							
							},

		copy: function(){
			var targets = $(".content-cur .selected");
			$.each(targets,function(i){
				fatterOS.cache.clipBoard.push(targets[i]);
			});
		},

		rm: function(){
			var targets = $(".content-cur .selected");
			$.each(targets,function(i){
				$(targets[i]).remove();
			})
		},

		paste: function(){
			var clipBoard = fatterOS.cache.clipBoard,
				place = $(".content-cur");
			$.each(clipBoard,function(i){
				place.append(clipBoard[i]);
			})
		},

		rename:	function(){
			var targets = $(".content-cur .selected");
			targets.find("input").focus();
		},

		mkdir: function(){
			var place = $(".content-cur"),
				html = "<div class=\"docs-list\"><div class=\"file-folder\"><img alt=\"\" src=\"images/exe/folder.png\"/><input type=\"text\" value=\"新建文件夹\" /></div></div>";
			place.append(html);
		},

		mkfile: function(){
			var place = $(".content-cur"),
				html = "<div class=\"docs-list\"><div class=\"file-text\"><img alt=\"\" src=\"images/exe/txt.png\"/><input type=\"text\" value=\"新建文本\" /></div></div>";
			place.append(html);
	
		},

		upload: function(){
					
		},

		login: function(){
								
		},

		logoff:	function(){
							
		},
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
		clipBoard: [],
		data: {}
	};

	//实现全部的事件
	fatterOS.eventBind   = fatterOS.eventBind || {};
	fatterOS.eventBind = {
		windowBind		:	function(){
								$(window).resize(function(){
									
								});	
							},

		documentBind	:	function(){
								this.$document = $(document);
								this.$context = fatterOS.system.$context || $("#fatterOS_context");
								/*全局点击事件开始*/
								this.$document.bind("mousedown.globle",function(e){
									fatterOS.eventBind.$startMenu.hide();
									fatterOS.eventBind.$context.empty();
									if ( !$(e.target).is('input,textarea,select') ) {
										$('input,textarea').blur();
									}
								});
								/*全局点击事件结束*/

								/*全局右键事件开始*/
								this.$document.bind("contextmenu.globle",function(e){
									e.preventDefault();
									fatterOS.system.contextmenu("default",e);
								});
								/*全局右键事件结束*/

								/*全局鼠标移动事件开始*/
								this.$document.bind("mousemove.globle",function(e){
									e.preventDefault();
									e.stopPropagation();
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
		desktopBind		:	function(){
								this.$desktop = $("#desktop");
						
								/*桌面程序单击开始*/
								this.$desktop.bind("click.openApp",function(e){
									//TODO 事件代理
									var target;
									if(e.target.className === "app-button")
										target = e.target;
									else
										if(e.target.parentNode.className === "app-button")
											target = e.target.parentNode;
										else
											if(e.target.parentNode.parentNode.className === "app-button")
												target = e.target.parentNode.parentNode;

									if(target){
										fatterOS.desktop.openApp(target.dataset.name,target.dataset.type);
									}

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
		bottombarBind	:	function(){
				
							},
		startButtonBind	:	function(){
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
		startButtonUnbind:	function(){
								this.$startBtn.unbind("click.startmenu");
							},
		showDesktopBind	:	function(){
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
	//TODO	move those to system.prestart;
		preload		:	function(){
								var $startingContainer 	= 	$("#starting_container"),
									$startingBar		=	$("#starting_bar"),
									clientHeight  = fatterOS.clientInfo.clientHeight(),
									clientWidth   = fatterOS.clientInfo.clientWidth();

								$startingBar.progressBar(100,{speed:25,callback:function(data){
									if( data.running_value == data.value ){
										$startingContainer.fadeOut("slow");
									}
								}});
								return this;
							},
		init: function(){
								var $cloud = $(".scene-cloud"),
									cloud_x = -500,
									clientWidth  = fatterOS.clientInfo.clientWidth(),
									clientHeight = fatterOS.clientInfo.clientHeight();
								
								this.preload();
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
		creatTaskbarTime:	function(){
									var $timebar = $("#timebar");
									setInterval(function(){
											$timebar.html(fatterOS.tools.getDate(4));
											},1000);
									return this;
							},
		changeBackgroud	:	function(imgsrc){
								document.body.style.backgroundImage = "url(" + imgsrc + ")";
								return	this;
							},
		changeTheme		:	function(themeType){
								//TODO
								return this;
							},
		openApp			:	function(name,type){
							//var options = options ||;
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
							},
		/**
		 *	@param	{String} name app's name
		 *	@return	{Object} this fatterOS.window;
		 * */
		removeApp		:	function(name){
				  //	$().remove();
							},

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
/*
		fixURL: function(str){	
			var l = str.length;
			if(str.substring(0,1) == "/"  ||  str.substring(0,1) == "\\"){
				str = str.substring(1,str.length);
			}
			var ll = str.length;
			if(str.substring(ll-1,ll) == "/"  ||  str.substring(ll-1,ll) == "\\"){
				str = str.substring(0,ll-1);
			}
			var url = str.split("/");
			var s = "/";
			$.each(url,function(i){
				url[i] = encodeChinese(url[i]);
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
*/
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
		
		isValidName: function(name){
			return name.match(/^[^\\\/\<\>:]+$/);
		},

		isFileExist: function(){
					 
		}
	};

	fatterOS.desktop.init();
	fatterOS.tips("欢迎使用fatterOS!");

});

function logout(){
	if(confirm("确认退出？","温馨提示"))
		window.close();
}
