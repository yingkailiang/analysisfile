kango.ui.Notification=function(){this.superclass.apply(this,arguments);var a=this._impl,b=this;a.addEventListener("click",function(){b.fireEvent(b.event.Click)},!0);a.addEventListener("close",function(){b.fireEvent(b.event.Close)},!0);a.addEventListener("show",function(){b.fireEvent(b.event.Show)},!0)};kango.ui.Notification.prototype=kango.oop.extend(kango.ui.NotificationBase,{show:function(){this._impl.show()},close:function(){this._impl.close()}});
kango.ui.Notifications=function(){this.superclass.apply(this,arguments)};kango.ui.Notifications.prototype=kango.oop.extend(kango.ui.NotificationsBase,{createNotification:function(a,b,c){a=webkitNotifications.createNotification(c||"",a,b);return new kango.ui.Notification(0,a)}});kango.registerModule(function(a){a.ui.notifications=new kango.ui.Notifications});
