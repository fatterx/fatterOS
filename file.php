<?php
if(urldecode($_GET["path"])=="/我的文档"){
echo "[{\"name\":\"system\",\"type\":\"folder\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2010.2.1\",\"key\":\"1111111111111111\"},{\"name\":\"tt.doc\",\"type\":\"doc\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2010.2.1\",\"key\":\"2222222222222222\"},{\"name\":\"win.rar\",\"type\":\"rar\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2010.2.1\",\"key\":\"33333333333333333\"},{\"name\":\"myppt.ppt\",\"type\":\"ppt\",\"size\":\"10MB\",\"usr\":\"fatter\",\"date\":\"2110.9.1\",\"key\":\"4444444444444444\"}]";
}
else if(urldecode($_GET["path"])=="/我的文档/system"){
echo "[{\"name\":\"system.bak\",\"type\":\"doc\",\"key\":\"6666666666666666\"}]";
}
//else if($_GET["path"]=="pub_document/公用文件"){
else if(urldecode($_GET["path"])=="/公共文档/公用文件"){
echo "[{\"name\":\"测试.bak\",\"type\":\"doc\",\"key\":\"777777777777777\"}]";
}
else if(urldecode($_GET["path"])=="/公共文档"){
echo "[{\"name\":\"公用文件\",\"type\":\"folder\",\"size\":\"10MB\",\"key\":\"88888888888888\"},{\"name\":\"test.xls\",\"type\":\"xls\",\"size\":\"10MB\",\"key\":\"9999999999999\"},{\"name\":\"text.txt\",\"type\":\"txt\",\"size\":\"10MB\",\"key\":\"101010101010101010\"},{\"name\":\"myppt.ppt\",\"type\":\"ppt\",\"size\":\"10MB\",\"key\":\"1212121212121212\"}]";
}
if($_GET["get"]=="filetree"){
echo "[{\"name\":\"我的文档\"},{\"name\":\"公共文档\"}]";
}
?>
