<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%
String path = request.getContextPath();
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
if(user==null){
	RequestDispatcher rd = this.getServletContext().getRequestDispatcher("/login");
    rd.forward(request,response);
}else{
	userId = user.getUser().getId();
}
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/pcasunzip.js"></script>
        <title>搜狐企业网盘 - 企业信息</title>
    </head>
    <body class="account">
<!--        <s:if test="!''.equals(errorMessage)">-->
<!--        <span class="message-area">-->
<!--            <span class="<s:property value="isSuccess" />"><i class="icon"></i> <s:property value="errorMessage" /></span>-->
<!--        </span>-->
<!--        </s:if>-->
    	<jsp:include page="head.jsp" flush="true">
		  <jsp:param name="pageStatus" value="5" />
		</jsp:include>
        <div id="content" class="manage-content clearfix">
            <s:include value="menu/rightMenu.jsp" >
				<s:param name="pageStatus" value="5"></s:param>
			</s:include>
            <div id="main" class="main">
                <div class="qiye-edit">
                    <div class="legend manage-tabs">
                        <a href="/individset1.jsp" >个性设置</a>
                        <a href="/adminset/">管理设置</a>
                    </div>
                    <div class="detail">
                        <form action="AccountManage!modifycompany.action" method="post">
                            <div class="account-content">
                                <div class="account-info">
                                    <div class="field">
                                        <div class="label">企业名称：</div>
                                        <div class="ipt">
                                            <input name="companyname" id="companyname" type="text" class="ipt-text" value="<s:property value="userPro.company" />"/>
                                        </div>
                                        <div class="tips"></div>
                                    </div>
                                    <div class="field trade">
                                        <div class="label">所属行业：</div>
                                        <div class="ipt">
                                            <select name="category" id="category" class="values common-select" style="width:308px;" >
                                                <option value="计算机硬件及网络设备">计算机硬件及网络设备</option>
                                                    <option value="计算机软件">计算机软件</option>
                                                    <option value="IT服务（系统/数据/维护）/多领域经营">IT服务（系统/数据/维护）/多领域经营</option>
                                                    <option value="互联网/电子商务">互联网/电子商务</option>
                                                    <option value="网络游戏">网络游戏</option>
                                                    <option value="通讯（设备/运营/增值服务）">通讯（设备/运营/增值服务）</option>
                                                    <option value="电子技术/半导体/集成电路">电子技术/半导体/集成电路</option>
                                                    <option value="仪器仪表及工业自动化">仪器仪表及工业自动化</option>
                                                    <option value="金融/银行/投资/基金/证券">金融/银行/投资/基金/证券</option>
                                                    <option value="保险">保险</option>
                                                    <option value="房地产/建筑/建材/工程">房地产/建筑/建材/工程</option>
                                                    <option value="家居/室内设计/装饰装潢">家居/室内设计/装饰装潢</option>
                                                    <option value="物业管理/商业中心">物业管理/商业中心</option>
                                                    <option value="广告/会展/公关/市场推广">广告/会展/公关/市场推广</option>
                                                    <option value="媒体/出版/影视/文化/艺术">媒体/出版/影视/文化/艺术</option>
                                                    <option value="印刷/包装/造纸">印刷/包装/造纸</option>
                                                    <option value="咨询/管理产业/法律/财会">咨询/管理产业/法律/财会</option>
                                                    <option value="教育/培训">教育/培训</option>
                                                    <option value="检验/检测/认证">检验/检测/认证</option>
                                                    <option value="中介服务">中介服务</option>
                                                    <option value="贸易/进出口">贸易/进出口</option>
                                                    <option value="零售/批发">零售/批发</option>
                                                    <option value="快速消费品（食品/饮料/烟酒/化妆品）">快速消费品（食品/饮料/烟酒/化妆品）</option>
                                                    <option value="耐用消费品（服装服饰/纺织/皮革/家具/家电）">耐用消费品（服装服饰/纺织/皮革/家具/家电）</option>
                                                    <option value="办公用品及设备">办公用品及设备</option>
                                                    <option value="礼品/玩具/工艺美术/收藏品">礼品/玩具/工艺美术/收藏品</option>
                                                    <option value="大型设备/机电设备/重工业">大型设备/机电设备/重工业</option>
                                                    <option value="加工制造（原料加工/模具）">加工制造（原料加工/模具）</option>
                                                    <option value="汽车/摩托车（制造/维护/配件/销售/服务）">汽车/摩托车（制造/维护/配件/销售/服务）</option>
                                                    <option value="交通/运输/物流">交通/运输/物流</option>
                                                    <option value="医药/生物工程">医药/生物工程</option>
                                                    <option value="医疗/护理/美容/保健">医疗/护理/美容/保健</option>
                                                    <option value="医疗设备/器械">医疗设备/器械</option>
                                                    <option value="酒店/餐饮">酒店/餐饮</option>
                                                    <option value="娱乐/体育/休闲">娱乐/体育/休闲</option>
                                                    <option value="旅游/度假">旅游/度假</option>
                                                    <option value="石油/石化/化工">石油/石化/化工</option>
                                                    <option value="能源/矿产/采掘/冶炼">能源/矿产/采掘/冶炼</option>
                                                    <option value="电气/电力/水利">电气/电力/水利</option>
                                                    <option value="航空/航天">航空/航天</option>
                                                    <option value="学术/科研">学术/科研</option>
                                                    <option value="政府/公共事业/非盈利机构">政府/公共事业/非盈利机构</option>
                                                    <option value="环保">环保</option>
                                                    <option value="农/林/牧/渔">农/林/牧/渔</option>
                                                    <option value="跨领域经营">跨领域经营</option>
                                                    <option value="其它">其它</option>
                                              </select>
                                        </div>
                                        <div class="tips"></div>
                                    </div>
                                    <div class="field area">
                                        <div class="label">所在区域：</div>
                                        <div class="ipt">
                                            <select name="province" id="province" class="values common-select" style="width:152px;">
                                            </select>
                                            <select name="city" id="city" class="values common-select" style="width:152px;">
                                            </select>
                                        </div>
                                        <div class="tips"></div>
                                    </div>
                                    <div class="field">
                                        <div class="label">联系人：</div>
                                        <div class="ipt">
                                            <input name="contactperson" id="contactperson" type="text" class="ipt-text" value="<s:property value="userPro.realName" />"/>
                                        </div>
                                        <div class="tips"></div>
                                    </div>
                                    <div class="field">
                                        <div class="label">联系电话：</div>
                                        <div class="ipt">
                                            <input name="contactphone" id="contactphone" type="text" class="ipt-text" value="<s:property value="userPro.phoneNum" />"/>
                                        </div>
                                        <div class="tips"></div>
                                    </div>
                                    <div class="field">
                                        <div class="label"></div>
                                        <div class="ipt">
                                            <input type="submit" class="btn btn24 btn24-blue" value="保存" />
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <script type="text/javascript">
                            jQuery(function(){ //行业选择
                                <s:if test="!''.equals(userPro.category)">
                                $('#category option:[value="<s:property value="userPro.category" />"]').attr('selected',true);
                                </s:if>

                                Sbox.makeSelector('category');
                            })

                            jQuery(function(){ //省市选择
                                new PCAS("province","city","<s:property value="userPro.province" />","<s:property value="userPro.city"/>");
                                var province = Sbox.makeSelector('province'),
                                    city = Sbox.makeSelector('city');
                                $('#province').on('change',function(){
                                    setTimeout(function(){
                                        city.remove();
                                        city = Sbox.makeSelector('city');
                                    },50);
                                })
                            })

                            jQuery(function(){ //验证
                                var fm = $('form'),
                                    companyname = $('#companyname'),
                                    category = $('#category'),
                                    province = $('#province'),
                                    city = $('#city'),
                                    contactperson = $('#contactperson'),
                                    contactphone = $('#contactphone');
                                var flag = true;

                                companyname.on('blur',function(){
                                    companyname.val($.trim(companyname.val()));
                                    var val = companyname.val(),
                                        tip =  companyname.parent().next();
                                    var nameReg = /^[\u4E00-\u9FA5a-z0-9]+$/i;
                                    if(val === ''){
                                        flag = false;
                                        tip.html('<span class="error">企业名称不能为空</span>');
                                    }else if(val.length > 20){
                                        flag = false;
                                        tip.html('<span class="error">长度不能超过20个字符</span>');
                                    }else if(!nameReg.test(val)){
                                        flag = false;
                                        tip.html('<span class="error">1-20个字符，支持中英文、数字</span>');
                                    }else{
                                        tip.empty();
                                    }
                                }).on('focus',function(){
                                    $(this).parent().next().html('请填写真实的企业名称');
                                })
                                category.on('change',function(){
                                    var val = $(this).val(),
                                        tip = $(this).parent().next();
                                    if(val === ''){
                                        flag = false;
                                        tip.html('<span class="error">请选择所属行业</span>');
                                    }else{
                                        tip.empty();
                                    }
                                })

                                province.on('change',function(){
                                    var val = $(this).val(),
                                        tip = $(this).parent().next();
                                    if(val === ''){
                                        flag = false;
                                        tip.html('<span class="error">请选择所在区域</span>');
                                    }else{
                                        tip.empty();
                                    }
                                })

                                contactperson.on('blur',function(){
                                    contactperson.val($.trim(contactperson.val()));
                                    var val = $(this).val(),
                                        tip = $(this).parent().next();
                                    var nameReg = /^[\u4E00-\u9FA5a-z]+$/i;
                                    if(val === ''){
                                        flag = false;
                                        tip.html('<span class="error">联系人不能为空</span>');
                                    }else if(val.length > 10){
                                        flag = false;
                                        tip.html('<span class="error">长度不能超过10个字符</span>');
                                    }else if(!nameReg.test(val)){
                                        flag = false;
                                        tip.html('<span class="error">1-10个字符，支持中英文</span>');
                                    }else{
                                        tip.empty();
                                    }
                                }).on('focus',function(){
                                    $(this).parent().next().html('请填写真实姓名 ');
                                })
                                contactphone.on('blur',function(){
                                    contactphone.val($.trim(contactphone.val()));
                                    var val = $(this).val(),
                                        tip = $(this).parent().next();
                                    if(val === ''){
                                        flag = false;
                                        tip.html('<span class="error">联系电话不能为空</span>');
                                    }
                                    else if(!/(^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$)|(^((\(\d{3}\))|(\d{3}\-))?(1[358]\d{9})$)/.test(val)){
                                        flag = false;
                                        tip.html('<span class="error">电话号码格式不正确</span>');
                                    }else{
                                        tip.empty();
                                    }
                                }).on('focus',function(){
                                    $(this).parent().next().html('请填写有效的联系电话 ');
                                })

                                fm.on('submit',function(){
                                    flag = true;
                                    $(this).find('input').trigger('blur');
                                    $(this).find('select').trigger('change');
                                    return flag;
                                })

                                setTimeout(function(){
                                    $('.message-area').fadeOut();
                                },3000)
                            })
                        </script>
                    </div>
                </div>
            </div>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
	</body>
</html>