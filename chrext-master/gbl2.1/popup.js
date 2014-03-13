
//alert(1)
// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  document.body.backgroundColor='red';
    console.log(123)
    setTimeout(function(){//这可以触发页面的点击事件
        // document.getElementById('btn_Login').click();
        //<audio src="someaudio.wav"></audio>
        var aud=document.createElement('audio');
        aud.src='dd.wav';
        aud.autoplay=true;
        document.body.appendChild(aud);

    },3000)

});
