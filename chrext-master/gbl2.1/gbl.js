var b=$('body');
var sellEl=$('#footersell_ds');
var buyEl=$('#footerbuy_ds');
var tradeType=(function(){
    var type;
    $('li.tab_item').each(function(i,n){
        if($(n).hasClass('active')){
            type=i;
        }

    });
    return type-0+1;
})();


function log(){
    console.log.apply(console,arguments);
}
function buttonTip(b,reverse){
    if(reverse){
        b.className='';
        b.value='开始';
    }else{
        b.value='监控中..';
        b.className='doing';
    }
}

function buy(m,b){
    if(!$('#txtBTC').val()){
        tip('比特币数量未填写');
    }
    buttonTip(b);
    MessagingCallQueue.buy= function(data){

        if(data.sell.value-0<=m){log('buy')
            document.querySelector('#btn_Send').click();
            delete MessagingCallQueue.buy;
            playSound(1);
            tip('已下买单');
            buttonTip(b,1);

        }
    };
}

function sell(m,b){
    if(!$('#txtBTC').val()){
        tip('比特币数量未填写');
    }
    buttonTip(b);
    MessagingCallQueue.sell=function(data){
        if(data.buy.value-0>=m){log('sell')
            document.querySelector('#btn_Send').click();
            delete MessagingCallQueue.sell;
            playSound(2);
            tip('已下卖单');
            buttonTip(b,1);
        }
    };

}


function ping(m,b){
    if(!checkedOrders.length){
        tip('没有选中任何要平仓的单子');
        return;
    }
    buttonTip(b)
    MessagingCallQueue.ping=function(data){//console.log(data);
      //  console.log('888 ping')
        if(!checkedOrders.length){

            delete MessagingCallQueue.ping;
            buttonTip(b,1)
        }
        checkedOrders.forEach(function(n,i){
            var td1= n.parentNode.nextSibling;
            if(td1.innerHTML=='卖出'){//console.log(data.sell.value);
                if(data.sell.value-0<=m){//log('ping sell')
                    doPing('sell',m);
                }
            }else{
                if(data.buy.value-0>=m){//log('ping buy')
                   doPing('buy',m);
                   // buttonTip(b,1)
                }
            }
        })

    };

}

function doPing(type,price){
    price-=0;
    ticker(function(r){//请求确认一下，防止瞬间价
        var canDo=false;
        switch (type){
            case 'sell':
                canDo=(r.sell.value-0<=price);
                break;
            case 'buy':
                canDo=(r.buy.value-0>=price);
                break;

        }
        if(canDo){
            document.querySelector('#btn_pc').click();
            playSound(0);
            delete MessagingCallQueue.ping;
        }
    });

}

var orderTable=document.querySelector('div.order>table');//监听复选框
var checkedOrders=[];
document.body.addEventListener('click',function(e){

    var t= e.target;
    if(t.tagName.toUpperCase()=='INPUT'&& t.type=='checkbox'&& /TD|TH/.test(t.parentNode.tagName.toUpperCase())){
       // log('hah..l')
        var cks=orderTable.querySelectorAll('input[type=checkbox]');
        checkedOrders.length=0;
        for(var i=1;i<cks.length;i++){
            var n=cks[i];
            if(n.checked) checkedOrders.push(n);
        }
    }
},false);




function tip(s){
    if(document.querySelector('#p-tip')){
        document.querySelector('#p-tip').innerHTML=s;
    }else{
        console.log(s)
    }
}

function createPopup(){
    var div=document.createElement('div');
    div.addEventListener('click',onPopClick,false);
    div.className='c';
   // log(tradeType)
    div.innerHTML=( tradeType==1?'<p>期望做多价：<input type="text" /><input name="buy" type="button" value="开始" /></p>':'<p>期望做空价：<input type="text" /><input type="button" name="sell" value="开始" /></p>')
    +'<p>期望平仓价：<input type="text" /><input type="button" name="ping" value="开始" /></p><font id="p-tip" color="red"></font><br/>'
    +'buy: <b style="color:#6f0;" id="price_buy"></b><br/>sell:  <b style="color:#f60" id="price_sell"></b>';
    document.body.appendChild(div);
    return div;
}
function onPopClick(e){
    var t= e.target,
        name= t.name;
    if(t.tagName.toLowerCase()!='input'|| t.type!='button'){
        return;
    }
    var v= t.previousSibling.value-0;
    if($(t).hasClass('doing')){

        MessagingCallQueue={};
        t.value= '开始';
        $(t).removeClass('doing');
     return;
    }
    switch(name){
        case 'buy':
            if(v-sellEl.text()>0.5){
                tip('做多价过高')
            }else{
                buy(v,t);
            }
            break;
        case 'sell':
            if(buyEl.text()-v>0.5){
                tip('做空价过低')
            }else{
                sell(v,t);
            }
            break;
        case 'ping':
            ping(v,t);
            break;
    }



}

/*type 0     平仓

        1   买入，做多
        2       卖出,做空
        */
function createAudio(file){
    var aud=document.createElement('audio');
    aud.src=chrome.extension.getURL(file+'.wav');
   // aud.autoplay=true;
    document.body.appendChild(aud);
    return aud;
}

function playSound(type,delay){//log(type);
    if(!delay){//延迟执行
        return setTimeout(function(){playSound(type,1)},1000);
    };
    if(!playSound.buy){

        playSound.buy=createAudio('dd');
    }
    if(!playSound.sell){
        playSound.sell=createAudio('jiajiang');
    }
    if(!playSound.ping){
        playSound.ping=createAudio('jiuzheyangba');
    }
    if(!playSound.msg){
        playSound.msg=createAudio('msg');
    }
    switch(type){
        case 1:
            playSound.buy.play();
            break;
        case 2:
            playSound.sell.play();
            break;
        case 0:
            playSound.ping.play();
            break;
        default:
            playSound.msg.play();
            break;
    }
}
var MessagingCallQueue={},
    messagingCall=function(data){//console.log(data)
//
        if(data.private=='ticker'){console.log(data)
            var ticker=data.ticker;
            for(var k in MessagingCallQueue){//console.log(k);
                MessagingCallQueue[k](ticker);
            }
            $('#price_sell').html(ticker.sell.value);
            $('#price_buy').html(ticker.buy.value);
        }

    };


   // log('ssss')

   // log('sss')


function createSocketBak(){
    console.log('bak ready!');
    var ws = io.connect('http://socketio.mtgox.com/mtgox');
    ws.onopen = function () {
        tip('socket back opened!');
    };
    ws.onmessage = function (evt) {
        // console.log('mms ')
        // var received_msg = evt.data;
        messagingCall(JSON.parse(evt.data));

    };
    ws.onclose = function () {
        tip('socket bak closed!');
        createSocket();

    }; // websocket is closed.
    ws.onerror=function(){
        createSocket();
        tip('socket error!正尝试重新连接，如不行刷新页面再试.. ');
    };
}
function createSocket(){

    var ws = new WebSocket("ws://websocket.mtgox.com/mtgox?Currency=USD");
    ws.onopen = function () {
        tip('the fucking socket opened!');
    };
    ws.onmessage = function (evt) {
       // console.log('mms ')
       // var received_msg = evt.data;
        messagingCall(JSON.parse(evt.data));

    };
    ws.onclose = function () {
        tip('socket closed! recreating');
        createSocket();
    }; // websocket is closed.
    ws.onerror=function(){
        createSocket();
        tip('socket error!正尝试重新连接，如不行刷新页面再试.. ');
    };

}

if(location.hash=='#keeplogin'){//不断刷新页面，保持登录状态
    var rndMin=Math.rnd(1,10);
    console.log('reloading'+rndMin)
    setTimeout(function(){

        location.reload();
    },1000*60*rndMin)
}else{
    window.pop=createPopup();
    createSocket();
   // listenMsg();
}
function listenMsg(){
    tip('listening msg');
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            messagingCall(JSON.parse(request));
        });



}