
var Uri={
	
	ticker:'http://data.mtgox.com/api/2/BTCUSD/money/ticker',
	trade:''
};
function toget(api,cb){
	$.getJSON(api,function(res){
		if(res.result=="success"){
			cb(res.data);
		}
	});
}
function ticker(cb){console.log('ticker start')
	toget(Uri.ticker,function(data){
		//console.log(data);
       cb&& cb(data)
		//var hight
	});
}
function soki(){
    console.log('soki start')
    var conn = io.connect('http://socketio.mtgox.com/mtgox');
    conn.on('connect',function(){
    	console.log('connect')

    });
    conn.on('message', function(data) {
        // Handle incoming data object.
       // console.log(data)
    });
    conn.on('error',function(data){
    	console.log('error');


    })
    conn.on('disconnect',function(data){
    	console.log('disconnect')


    });
    return conn;
}
//soki();

