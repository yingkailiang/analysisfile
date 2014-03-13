$(document).ready(function(){

    

    var first_run = false;
    if (!localStorage['ran_before']) {
        first_run = true;
        localStorage['ran_before'] = '1';
    }

    if (first_run) {
        var BGPage = chrome.extension.getBackgroundPage();
        BGPage.setIsOnOff('true');
    }


    $('#checkbox').prop('checked',localStorage['state'] == 'true');

    $('#checkbox').change(function(){
        $('.switch-handle, .switch-label').css({
            '-webkit-transition' : 'left 0.15s ease-out',
            '-moz-transition' : 'left 0.15s ease-out',
            '-o-transition' : 'left 0.15s ease-out',
            'transition' : 'left 0.15s ease-out'
        });
        var BGPage = chrome.extension.getBackgroundPage();
        BGPage.setIsOnOff($(this).prop('checked'));
    });

});
