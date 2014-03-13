'use strict';

angular.module('chromechatApp.Models')
  .factory('chatWorldModel', function() {
    return function(){
      return {
        rooms: [],
        timestamps: {},
        updateRooms: function(newRooms){
          this.timestamps.rooms = new Date();
          this.rooms = newRooms;
        }
      };
    };
  });
