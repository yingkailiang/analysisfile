
invite = {
    inviteUrl: 'http://socialba.com/ext/sharefromgplusinvite',
    appendDiv: function (containerId, html) {
        var div = document.createElement("div");
        div.innerHTML = html;
        document.getElementById(containerId).appendChild(div);
    },
    render: function (url) {
        if (url.leng <= 0)
            return;
        var html = '<div id="xj_share_invite" style="height:25px;"><span style="float:right;font:normal '
                 + '13px arial,sans-serif;color:#36C;outline: none;line-height: 1.4; text-decoration: '
                 + 'none;padding-top:2px;margin-right:3px;cursor: pointer;" onclick="window.open(\''
                 + url + '\', \'\', \'height=560,width=596,top=150,left=420\');">Invite friends</span></div>';
        if (!document.getElementById('xj_share_invite'))
            invite.appendDiv('xj_shares_list', html);
    }
}