<?php
if(urldecode($_GET["path"])=="/我的文档"){
echo "[{\"name\":\"system\",\"type\":\"folder\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2010.2.1\"},{\"name\":\"tt.doc\",\"type\":\"doc\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2010.2.1\"},{\"name\":\"win.rar\",\"type\":\"rar\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2010.2.1\"},{\"name\":\"myppt.ppt\",\"type\":\"ppt\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2110.9.1\"}]";
}
else if(urldecode($_GET["path"])=="/我的文档/system"){
echo "[{\"name\":\"system.bak\",\"type\":\"doc\"}]";
}
//else if($_GET["path"]=="pub_document/公用文件"){
else if(urldecode($_GET["path"])=="/公共文档/公用文件"){
echo "[{\"name\":\"测试.bak\",\"type\":\"doc\"}]";
}
else if(urldecode($_GET["path"])=="/公共文档"){
echo "[{\"name\":\"公用文件\",\"type\":\"folder\",\"size\":\"10MB\"},{\"name\":\"test.xls\",\"type\":\"xls\",\"size\":\"10MB\"},{\"name\":\"text.txt\",\"type\":\"txt\",\"size\":\"10MB\"},{\"name\":\"myppt.ppt\",\"type\":\"ppt\",\"size\":\"10MB\"}]";
}
if($_GET["get"]=="filetree"){
echo "[{\"name\":\"我的文档\"},{\"name\":\"公共文档\"}]";
}
?>
