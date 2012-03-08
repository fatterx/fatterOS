function getDate(t){
	var d = new Date(); 
	var n = { Y: d.getFullYear(), M: d.getMonth() + 1, D: d.getDate(), h: d.getHours(), m: d.getMinutes(), s: d.getSeconds(), w: d.getDay() }
	switch (t) {
		case 0: return n.Y + '年' + n.M + '月' + n.D + '日';
		case 1: return n.h + ':' + n.m + ':' + n.s;
		case 2: return n.h + '点' + n.m + '分' + n.s + '秒';
		case 3: return n.Y + '年' + n.M + '月' + n.D + '日' + '　星期' + ('日一二三四五六').charAt(n.w);
		case 4: return "<div class='time_left'><div class='time_y'>"+n.Y + '年' + n.M + '月' + n.D + '日'+"</div>"+"<div class='time_w'>"+'星期' + ('日一二三四五六').charAt(n.w)+"</div></div>"+"<div class='time_m'>"+n.h + ':' + fixNum(n.m) + ':' + fixNum(n.s)+"</div>";
		case 5: return n.Y+"."+n.M+"."+n.D;
		default: return n.Y + '-' + n.M + '-' + n.D;
		}
}
function fixNum(t){
if (t < 10)
return "0"+ t;
else
return t;
}

function getFileType(name){
			var l=name.split(".");
			return l[l.length-1];
		} 
	
		//检测是否有汉字
		function hasChinese(str){
			if(escape(str).indexOf("%u")<0)
			{
				return false;
			}
			else{
				return true;
			}
		}

		function encodeChinese(str){
			if(hasChinese(str)){
				str=encodeURI(encodeURI(str));
			}
			return str;
		}

		function decodeChinese(str){
			if(!hasChinese(str)){
				str=decodeURI(decodeURI(str));
				}
				return str;
			}
		function fixURL(str){	
			var l=str.length;
			if(str.substring(0,1)=="/"||str.substring(0,1)=="\\")
			{
				str=str.substring(1,str.length);
			}
			var ll=str.length;
			if(str.substring(ll-1,ll)=="/"||str.substring(ll-1,ll)=="\\"){
				str=str.substring(0,ll-1);
			}
			var url=str.split("/");
			var s="/";
			$.each(url,function(i){
				url[i]=encodeChinese(url[i]);
				s+=url[i]+"/";
			});
			s=s.substring(0,s.length-1);
			return s;	
		}
		function fixPageURL(str){
			if(str.substring(0,7)!="http://"){
				var str="http://"+str;
			}
			return str;
		
		}

