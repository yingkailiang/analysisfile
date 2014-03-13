chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            var S = KISSY, DOM = S.DOM, Event = S.Event, Ben = {};
            if (DOM.get('#J_IframeRunExc')) {
                DOM.css('#J_IframeRunExc', 'display', 'block');
                start().ben.toggleFloatDiv(true);
                return;
            }



            var start = function(){
                var RuleCount = {idx:0,clsx:0,tagx:0},
                    AttrWhiteList = ['type'],
                    set = {floatdiv: false},
                    currentTg ;

                var Ben = {
                    /**
                     * 把当前文本框内的selector字符串，进行高亮。作为高亮的统一函数
                     * @param keyup if keyup is true, then hightlight the element once
                     */
                    submit: function( keyup ) {
                        if(DOM.get('#J_IframeInputValue').value == "") return;  //如果没有值，则不提交
                        DOM.css('#J_IframeBottomLogo', 'display', 'none'); //y隐藏当前的autowoman logo
                        DOM.css('#J_IframeBottomTips', 'display', 'block'); //把当前的结果显示出来
                        var qs = DOM.get('#J_IframeInputValue').value + ":not(#J_IframeRunExc *)";
                        Ben.borderAll(qs.replace(/\\\\ /g,'.'), keyup);
                    },

                    floatdivs:{

                    },

                    /**
                     * 创建插件在页面中的dom结构
                     */
                    createExtensionDom: function () {
                        //todo  结构的样式和html要分开写
                        var div = DOM.create('<div id="J_IframeRunExc" style="position: fixed; top: 0px; left: 0px;  z-index: 9999999; "></div>');
                        div.innerHTML = '<div class="ui-draggable" id="J_IframeTriggerDrag" style="width: auto; height: auto; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; position: fixed; -webkit-box-shadow: black 0px 1px 10px; border-top-left-radius: 10px 10px; border-top-right-radius: 10px 10px; border-bottom-right-radius: 10px 10px; border-bottom-left-radius: 10px 10px; border-top-width: 2px; border-right-width: 2px; border-bottom-width: 2px; border-left-width: 2px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: solid; background-image: url(http://img04.taobaocdn.com/tps/i4/T17TWgXm0uXXXXXXXX-1-213.png);  min-height: 150px; min-width: 200px !important; background-color: rgb(182, 86, 9); border-top-color: rgb(182, 86, 9); border-right-color: rgb(182, 86, 9); border-bottom-color: rgb(182, 86, 9); border-left-color: rgb(182, 86, 9); right: 10px; top: 15px; opacity: 1; background-position: 0% 0%; "><div style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 15px; margin-right: 0px; margin-bottom: 0px; margin-left: -240px; position: absolute; -webkit-box-shadow: black 0px 1px 10px; border-top-left-radius: 10px 10px; border-top-right-radius: 10px 10px; border-bottom-right-radius: 10px 10px; border-bottom-left-radius: 10px 10px; border-top-width: 1px; border-right-width: 1px; border-bottom-width: 1px; border-left-width: 1px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: solid; border-top-color: rgb(153, 153, 153); border-right-color: rgb(153, 153, 153); border-bottom-color: rgb(153, 153, 153); border-left-color: rgb(153, 153, 153);background-color: rgb(255, 255, 255); width: 220px; display: none; " class="ui-draggable"></div><div id="J_IframeDragNode" style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 5px; padding-bottom: 0px; padding-left: 5px; height: 35px; cursor: move; "><div style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; height: 35px; width: 70px;background-repeat: no-repeat; background-image: url(http://img02.taobaocdn.com/tps/i2/T1GZWhXb4aXXXXXXXX-56-26.png); float: left; background-position: 0% 50%;"></div><a id="J_IframeRunCommond"  style="display: block; position: relative; top: 4px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; background-image: url(http://img04.taobaocdn.com/tps/i4/T1rZehXghgXXXXXXXX-50-25.png);  height: 25px; width: 50px; float: left; cursor: pointer; background-position: 100% 50%; " title="CTRL+Enter 快捷键运行"></a><a id ="J_IframeCloseIcon" style="display: block; position: relative; top: 4px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; background-image: url(http://img01.taobaocdn.com/tps/i1/T15oigXkptXXXXXXXX-25-25.png);  height: 25px; width: 25px; float: right; cursor: pointer; background-position: 100% 50%; " title="关闭俺"></a><a style="display: block; position: relative; top: 4px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; background-image: url(http://img03.taobaocdn.com/tps/i3/T1osKhXoVbXXXXXXXX-25-25.png);    height: 25px; width: 25px; float: right; cursor: pointer; background-position: 100% 50%;" title="我的blog" href="http://weibo.com/foruslh" target="_blank"></a><a style="display: inline-block;margin-left: 52px;padding: 0;background-color: transparent;width: auto;height: auto;" target=blank href=tencent://message/?uin=107694254&Site=大宝&Menu=yes><img border="0" SRC=http://wpa.qq.com/pa?p=1:107694254:13 alt="用力点击我"></a></div><div style="padding-top: 0px; padding-right: 7px; padding-bottom: 7px; padding-left: 7px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; "><label id="J_IframeRSInspect" style="color: white;cursor: pointer;">启用抓取</label><div id="J_IframeBottomTips" style="display:none;color: white;" color:white=""><p>一共有 <strong style="font-weight: 700; color: red; font-size: 14px;"> 3 </strong> 个元素符合选择器</p><p style="padding-top:10px;">也可以通过 按ctrl+shift+I 查看控制台输出结果</p></div><div style="font-size: 50px;color: yellow;margin-top: 10px;text-align: center;" id="J_IframeBottomLogo">智能选择器</div></div></div>';
                        document.body.appendChild(div);


                        var input = DOM.create('<input>');
                        input.type = "text";
                        input.id = "J_IframeInputValue";
                        DOM.attr(input, 'style', 'padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; width: 300px; height: 20px; border-top-width: 2px; border-right-width: 2px; border-bottom-width: 2px; border-left-width: 2px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: solid; border-color: initial; font-family: monospace; font-size: 12px; font-weight: normal; outline-style: none; outline-width: initial; outline-color: initial; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: rgb(50, 49, 48); color: rgb(206, 194, 187); border-top-color: rgb(182, 86, 9); border-right-color: rgb(182, 86, 9); border-bottom-color: rgb(182, 86, 9); border-left-color: rgb(182, 86, 9); background-position: initial initial; background-repeat: initial initial; ');

                        DOM.insertBefore(input, '#J_IframeRSInspect');
                        input.value = "请在此输入选择器，并点击run运行";


                    },

                    /**
                     * 隐藏悬浮层
                     */
                    toggleFloatDiv: function(show){
                        if(!show){
                            DOM.css('#J_IframefloatD1', 'display', 'none');
                            DOM.css('#J_IframefloatD2', 'display', 'none');
                            DOM.css('#J_IframefloatD3', 'display', 'none');
                            DOM.css('#J_IframefloatD4', 'display', 'none');
                            return
                        }
                        DOM.css('#J_IframefloatD1', 'display', 'block');
                        DOM.css('#J_IframefloatD2', 'display', 'block');
                        DOM.css('#J_IframefloatD3', 'display', 'block');
                        DOM.css('#J_IframefloatD4', 'display', 'block');

                    },


                    /**
                     * 创建悬浮层并且定义鼠标滑过
                     * @param selector
                     */
                    createFloatDiv: function(){
                        var divleft = DOM.create("<div id='J_IframefloatD1' style='background-color: #AE5208;position:absolute;width:3px;z-index: 99999;'></div>"),
                            divright = DOM.create("<div id='J_IframefloatD2' style='background-color: #AE5208;position:absolute;;width:3px;z-index: 99999;'></div>"),
                            divtop = DOM.create("<div id='J_IframefloatD3' style='background-color: #AE5208;position:absolute;height:3px;z-index: 99999;'></div>"),
                            divbottom = DOM.create("<div id='J_IframefloatD4' style='background-color: #AE5208;position:absolute;height:3px;z-index: 99999;'></div>");

                        document.body.appendChild(divleft);
                        document.body.appendChild(divright);
                        document.body.appendChild(divtop);
                        document.body.appendChild(divbottom);

                        Ben.floatdivs.divleft = divleft;
                        Ben.floatdivs.divright = divright;
                        Ben.floatdivs.divtop = divtop;
                        Ben.floatdivs.divbottom = divbottom;
                        Event.on(document.body, 'mousemove', function(e){
                            if(!set.floatdiv) return;//检查开关
                            var tg = e.target;

                            if(tg==Ben.floatdivs.divleft || tg==Ben.floatdivs.divbottom || tg==Ben.floatdivs.divtop || tg==Ben.floatdivs.divright) return;

                            currentTg = tg;
                            var l= DOM.offset(tg).left + "px";
                            var t =DOM.offset(tg).top + "px";
                            var h = DOM.height(tg) + "px",
                                w = DOM.width(tg) + "px";
                            DOM.css(Ben.floatdivs.divleft, 'left', l);
                            DOM.css(Ben.floatdivs.divleft, 'top', t);
                            DOM.css(Ben.floatdivs.divleft, 'height', h);

                            DOM.css(Ben.floatdivs.divtop, 'top', t);
                            DOM.css(Ben.floatdivs.divtop,'left', l);
                            DOM.css(Ben.floatdivs.divtop, 'width', w);


                            DOM.css(Ben.floatdivs.divright, 'left',parseInt(l.replace('px',''))+parseInt(w) );
                            DOM.css(Ben.floatdivs.divright, 'top', t);
                            DOM.css(Ben.floatdivs.divright, 'height', h);
                            DOM.css(Ben.floatdivs.divright, 'display', 'block');

                            DOM.css(Ben.floatdivs.divbottom, 'top', parseInt(t.replace('px',''))+parseInt(h));
                            DOM.css(Ben.floatdivs.divbottom, 'left', l);
                            DOM.css(Ben.floatdivs.divbottom, 'width', w);

                        })
                    },


                    /**
                     *  初始化inspect element，类似于firefox那种鼠标滑过有蒙层的效果
                     *  目前采用比较简单的方案，鼠标滑过的时候，设置element的ouline attribute
                     *  @param selector 需要高亮元素的selector，默认是除了插件以外的所有元素
                     */
                    initMouseHighlightEle : function(selector) {
                        var qs = selector || "*:not(#J_IframeRunExc *)",
                        cur;
                        set.floatdiv = true;
                        Ben.createFloatDiv();
                        DOM.css('body','cursor', 'pointer');
                        $(qs).click(function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    var tg = $(this)[0];
                                    if (tg.id == 'J_IframeRunExc' ||tg.id =="J_IframefloatD4"||tg.id =="J_IframefloatD1" ||tg.id =="J_IframefloatD3" || tg.id =="J_IframefloatD2")
                                        return false;
                                    var selector = Ben.getJQS(tg);

                                    var selectorJQ = selector.replace(/\\\\ /g, '.');
                                    var co = $(selectorJQ); //替换回来在查询


                                    if(co.length==0){ // 这种情况一般都是hover的时候加了class
                                        selector = Ben.telorant(selector);
                                        selectorJQ = selector.replace(/\\\\ /g, '.');
                                    }
                                    if (co.length != 1) {
                                        jQuery.each($(selectorJQ), function(index, value) {
                                            if (value == tg) {
                                                selector = selector + ":eq(" + index + ")";
                                            }
                                        });
                                    }

                                    document.getElementById("J_IframeInputValue").value = Ben.optSelector(selector);

                                });
                    },


                    /**
                     * 移除指定selector的mouseenter和click event
                     * @param selector
                     */
                    removeMouseHightlightEle: function(selector){
                        var qs = selector || "*:not(#J_IframeRunExc *)";
                        $(qs).unbind('click');
                        DOM.css('body','cursor', 'default');
                        set.floatdiv = false;
                    },

                    /**
                     *  初始化插件拖拽，点击关闭，运行
                     *  点击获得focus，鼠标移入获得focus，键盘ctrl+enter提交校验
                     *  初始化tips提示
                     *  鼠标移入移除半透明
                     */
                    initExtensionSelfEvent: function () {
                        new S.Draggable({node :"#J_IframeTriggerDrag",handlers :[DOM.get("#J_IframeDragNode")]}).on("drag", function(ev) {
                            DOM.css('#J_IframeTriggerDrag', 'right', '');
                            this.get("node").offset({left:ev.left,top:ev.top});
                        });

                        Event.on('#J_IframeCloseIcon', 'click', function() {
                            DOM.css('#J_IframeRunExc', 'display', 'none');
                            DOM.get('#J_IframeRSInspect').innerHTML = '启用抓取';
                            Ben.removeMouseHightlightEle();
                            Ben.toggleFloatDiv(false);
                        })

                        Event.on('#J_IframeRunCommond', 'click', function(e) {
                            Ben.submit(false);
                        });
                        Event.on('#J_IframeRunExc', 'click', function() {
                            DOM.get('#J_IframeInputValue').focus();
                        })
                        Event.on('#J_IframeInputValue', 'keydown', function(e) {
                            if (e.ctrlKey && e.keyCode == 13) {
                                Ben.submit(false);
                            }
                        });

                        Event.on('#J_IframeInputValue', 'mousedown', function(e) {
                            if (S.trim(DOM.get('#J_IframeInputValue').value) == "请在此输入选择器，并点击run运行") {
                                DOM.get('#J_IframeInputValue').value = "";
                            }
                        });
                        Event.on('#J_IframeInputValue', 'blur', function(e) {
                            if (S.trim(DOM.get('#J_IframeInputValue').value) == "") {
                                DOM.get('#J_IframeInputValue').value = "请在此输入选择器，并点击run运行";
                            }
                        })

                        Event.on('#J_IframeRunExc', 'mouseleave', function() {
                            DOM.css(DOM.query('#J_IframeRunExc div.ui-draggable'), 'opacity', '0.7');
                        });
                        Event.on('#J_IframeRunExc', 'mouseenter', function(e) {
                            DOM.get('#J_IframeInputValue').focus();
                            DOM.css(DOM.query('#J_IframeRunExc div.ui-draggable'), 'opacity', '1');
                        })


                        Event.on('#J_IframeRSInspect', 'click', function(e){
                            var tg = e.target;
                            if(/[启用]/.test(tg.innerHTML)){
                                tg.innerHTML = "关闭抓取";
                                Ben.initMouseHighlightEle();
                            }else{
                                tg.innerHTML = '启用抓取';
                                Ben.removeMouseHightlightEle();
                            }
                        })
                    },


                    /**
                     * 同步键盘事件，键盘keyup的时候，高亮元素
                     * @param selector
                     */
                    initKeyupHightlight: function(){
                        Event.on('#J_IframeInputValue', 'keyup', function(e){
                            var value = e.target.value;
                            if(!/[ >]$/.test(value))
                            Ben.submit(true);
                        });
                    },

                    /**
                     *给定一个选择器，一闪一闪高亮当前选择器的元素集合，
                     * 高亮使用outline属性，因为outline不会影响元素的布局
                     * @param selector  需要高亮的selector
                     * @param keyup 是否是keyup调用的高亮
                     *
                     */
                    borderAll: function(selector, keyup) {
                        $(selector).css('border', '#AE5208 solid 1px');
						console.log('元素: ', $(selector));
                        $('#J_IframeBottomTips strong').html($(selector).length);
                        window.setTimeout(function() {
                            $(selector).css('border', '0px #AE5208 solid');
                        }, 500);
                        if(!keyup){
                            window.setTimeout(function() {
                                $(selector).css('border', '1px #AE5208 solid');
                            }, 1000)

                            window.setTimeout(function() {
                                $(selector).css('border', '0px #AE5208 solid');
                            }, 1500)

                        }

                    },


                    /**
                     * 容错selector，抓取元素的时候，鼠标要hover上去，这样，很可能就会把hover的class去掉。
                     * @param selector
                     */
                    telorant: function(selector){
                        return selector;; //暂时不做任何分析，因为可能hover正是用户想得到的。
                    },


                    /**
                     * 优化获得的selector的简洁行
                     * @description 用一种比较笨的方法，一个一个精简selector
                     * @param selector
                     * @return selector 优化后的选择器
                     */
                    optSelector: function(selector){
                        var curTg = $(selector.replace(/\\\\ /g, '.'));
                        var scopy = selector.replace(/\\\\ /g, '+$+');
                        var sels = scopy.split(' ');
                        if(sels.length<3){
                            return selector;
                        }else if(sels.length == 3){//这种情况可以肯定，外层有一个id的。
                            var s3 = (sels[0] + " "+sels[2]).replace(/[+][$][+]/g, '.'),
                                s4 = sels[1].replace(/[+][$][+]/g, '.') +" "+ sels[2].replace(/[+][$][+]/g, '.');
                            if($(s3).length == 1 && curTg[0] == $(s3)[0]) return (sels[0] +" "+ sels[2]).replace(/[+][$][+]/g, '\\\\ ');
                            else if($(s4).length == 1&& curTg[0] == $(s4)[0]) return sels[1].replace(/[+][$][+]/g, '\\\\ ') + " "+ sels[2].replace(/[+][$][+]/g, '\\\\ ');
                        }else{//这个时候是4个选择器，最外面的这一层可能是id，可能是class
                            var onea = (sels[1] +" "+ sels[2] + " "+sels[3]).replace(/[+][$][+]/g, '.'),
                                oneb = (sels[0] +" "+ sels[2] + " "+sels[3]).replace(/[+][$][+]/g, '.'),
                                onec = (sels[0] + " "+sels[1] +" "+ sels[3]).replace(/[+][$][+]/g, '.');
                            if($(oneb).length == 1 && curTg[0] == $(oneb)[0]){
                                var onebc = (sels[0]+" "+sels[3]).replace(/[+][$][+]/g, '.'),
                                    oneba = (sels[2]+" "+sels[3]).replace(/[+][$][+]/g, '.');
                                if($(onebc).length == 1 && curTg[0] == $(onebc)[0]){
                                    return (sels[0]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }else if($(oneba).length ==1 && curTg[0] == $(oneba)[0]){
                                     return (sels[2]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }else{
                                     return (sels[0]+" "+sels[2]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }
                            }
                            else if($(onec).length == 1 && curTg[0] == $(onec)[0]){
                                var onebc = (sels[0]+" "+sels[3]).replace(/[+][$][+]/g, '.'),
                                    oneba = (sels[1]+" "+sels[3]).replace(/[+][$][+]/g, '.');
                                if($(onebc).length == 1  && curTg[0] == $(onebc)[0]){ //remove b
                                    return (sels[0]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }else if($(oneba).length ==1 &&  curTg[0] == $(oneba)[0]){
                                     return (sels[1]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }else{
                                     return (sels[0]+" "+sels[1]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }
                            }
                            else if($(onea).length == 1 && curTg[0] == $(onea)[0] ){
                                var onebc = (sels[2]+" "+sels[3]).replace(/[+][$][+]/g, '.'),
                                    oneba = (sels[1]+" "+sels[3]).replace(/[+][$][+]/g, '.');
                                if($(onebc).length == 1 && curTg[0] == $(onebc)[0]){ //remove b
                                    return (sels[2]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }else if($(oneba).length == 1 && curTg[0] == $(oneba)[0]){
                                     return (sels[1]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }else{
                                     return (sels[1]+" "+sels[2]+" "+sels[3]).replace(/[+][$][+]/g, '\\\\ ');
                                }
                            }
                        }

                        return selector;
                    },



                    /**
                     *  获得选择器的入口函数
                     * @param node
                     */
                    getJQS: function(node) {
                        /**
                         *  能否在三级内找到元素
                         */
                        var index = 0, s = [],classNode, parentId, parentClass;
                        for (index = 0; index < 3; index++) {
                            if (node.parentNode) {
                                if (node.id) {
                                    s[s.length] = node.tagName.toLowerCase()+"#" + node.id;
                                    RuleCount.idx++;
                                    return s.reverse().join(' ');
                                } else if (node.className) {
                                    RuleCount.clsx++;

                                    s[s.length] = node.tagName.toLowerCase()+"." + S.trim(node.className).replace(/[ ]{1,}/g, " ").replace(/ /g, "\\\\ ");
                                } else {
                                    RuleCount.tagx++;
                                    if(index != 0){
                                        index--;
                                        node = node.parentNode;
                                        continue;
                                    }else if(node.tagName.toLowerCase()=='input'){
                                        s[s.length] = node.tagName.toLowerCase()+'[name="'+node.name+'"]'
                                    }else{
                                        s[s.length] = node.tagName.toLowerCase();
                                    }
                                }
                                node = node.parentNode;
                            }
                        }

                        classNode = node;//保存当前节点的位置，用于在循环完id，如果没有找到，仍然可以从当前位置再次寻找class
                        //循环里面没有返回id，在这里再找一次
                        parentId = Ben.getParentsId(node);
                        if (parentId) {
                            return parentId + " " + s.reverse().join(' ');
                        } else {
                            parentClass = Ben.getParentsClass(classNode);
                            if (parentClass) {
                                return parentClass + " " + s.reverse().join(' ');
                            }
                        }

                        return s.reverse().join(' ');
                    },


                    /**
                     * 根据给定的节点，一直向上级找，直到找到一个id为止
                     * 找到了，就返回id，没找到，返回false
                     */
                    getParentsId: function(node) {
                        while (node.parentNode && node.tagName.toLowerCase() != 'body' && node.tagName.toLowerCase() != 'html') {
                            if (node.parentNode.id) {
                                return node.parentNode.tagName.toLowerCase()+"#"+node.parentNode.id;
                            }
                            node = node.parentNode;

                        }
                        return false;
                    },

                    /**
                     * 根据给定的节点，一直向上级找，直到找到一个class为止
                     * 找到了，就返回class，没找到，返回false
                     */
                    getParentsClass: function(node) {
                        var p;
                        while (node.parentNode && node.tagName.toLowerCase() != 'body' && node.tagName.toLowerCase() != 'html') {
                            if (node.parentNode.className) {
                                return node.parentNode.tagName.toLowerCase()+"."+S.trim(node.parentNode.className).replace(/[ ]/g, '\\\\ ');
                            }
                            node = node.parentNode;
                        }
                        return false;
                    }

                };


                return{
                    init: function(){
                        Ben.createExtensionDom();
                        Ben.initExtensionSelfEvent();
                        Ben.initKeyupHightlight();
                        Ben.removeMouseHightlightEle();
                    },
                    ben: Ben
                }
            }();

            start.init();
        });
