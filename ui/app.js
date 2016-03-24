(function(){
  angular.module("app", []);

  angular.module("app").controller("RouteController", [ '$scope', '$socket', '$rally', function($scope, $socket, $rally){

    var speedArray = Array(10);

    function averageSpeed(){
      if(!speedArray[0] || !speedArray[0].time == undefined ){
        return false
      }
      var speed = 0
      // make sure we have enough samples
      //  lets take the last 20 messages and average their speed
      for (var i = speedArray.length ; i > 0; i =-4 ) {
        message = speedArray[i-1];
        if(!message.time || !message.mileage){
          return false;
        }
        prevMessage = speedArray[i-2];
        var et = (message.time - prevMessage.time)
        var ed = (message.mileage - prevMessage.mileage) * 1000
        speed += (ed)/(et)
        // if you go 60 miles an hour, you go 1000 1/1000s in 3600 seconds

      }
      return (speed/(speedArray.length / 2))
    }

    $socket.on("rally:tick", function(message){
      // update our data display
      $scope.currentTime = message.time;
      $scope.currentMileage = message.mileage;
      $scope.currentAverageSpeed = message.speed;


      for (var i = 0; i < $scope.stage.length; i++) {
        instruction = $scope.stage[i]
        if (instruction.mileage < message.mileage && !((instruction.mileage + instruction.distance ) > message.mileage)){
          instruction.status = "past"
        }
        else if((instruction.mileage + instruction.distance ) > message.mileage && instruction.mileage < message.mileage){
          instruction.status = "current"
          $scope.currentCAST = instruction.speed
          $scope.currentInstruction = i+1;
        }
        else if(instruction.mileage > message.mileage){
          instruction.status = "upcoming"
        }
      }
    })

    $socket.on('rally:stage', function(stage){
      $scope.stage = stage;
      // how many instructions
      $scope.totalInstructions = stage.length;
    })
    // last thing, compute the stage
  }])

  angular.module('app').controller('DriverController', [ '$socket', '$scope', function($socket, $scope){
    $socket.on("rally:tick", function(message){
      // update our data display
      $scope.currentTime = message.time;
      $scope.currentMileage = message.mileage;
      $scope.currentAverageSpeed = message.speed;
      $scope.currentDifference = message.diff;


      for (var i = 0; i < $scope.stage.length; i++) {
        instruction = $scope.stage[i]
        if (instruction.mileage < message.mileage && !((instruction.mileage + instruction.distance ) > message.mileage)){
          instruction.status = "past"
        }
        else if((instruction.mileage + instruction.distance ) > message.mileage && instruction.mileage < message.mileage){
          instruction.status = "current"
          $scope.currentCAST = instruction.speed
          $scope.currentInstruction = i+1;
          $scope.nextInstruction = $scope.stage[i+1];
        }
        else if(instruction.mileage > message.mileage){
          instruction.status = "upcoming"
        }
      }
    });
    $socket.on('rally:stage', function(stage){
      $scope.stage = stage

      // how many instructions
      $scope.totalInstructions = stage.length;
    });
  }]);

  angular.module('app').controller('SettingsController', [function(){

  }]);

  angular.module('app').factory('$socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });

  angular.module('app').service('$rally', [ function(){
    var thouRound;

    thouRound = function(float){
     return Math.round(float * 1000) / 1000;
    };

    return {
      util: {
        thouRound: thouRound
      }
    }
  }]);


})();
