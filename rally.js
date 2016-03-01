var computeStage, thouRound, measureDuration, currentMileage, miles, pulses,
forward, parked, currentSpeed, currentDifference, distance, difference, speed,
rallyDifference, rallySpeed, stage, cast, currentInstructionId;

mileage = 550739; //in thousandths
distance = 0; //distance since we started
cast = 0;
pulses = 0;
pulsesPerMile = 811.1; // just a filler, kind of close
milesPerPulse = 0.0005710578; // not accurate, recalc
forward = true; //are we moving forward?
parked = false; //stop counting mileage if parked
rallySpeed = "4" + (Math.floor(Math.random()* 10));
rallyDifference = -2;
time = Date.now() + 10000



currentMileage = function currentMileage(){
  return Math.round(mileage + distance)
};

incrementMileage = function(){
  //increment our distance
  distance += (milesPerPulse*1000)
};

decrementMileage = function(){
  //decrement our distance
  distance -= (milesPerPulse*1000)
};

thouRound = function(float){
 return Math.round(float * 1000) / 1000;
};

pulse = function(){
  // increment our pulse count
  pulses++
  if(parked){
    return false
  }
  if(forward){
    incrementMileage();
    return true;
  }
  else {
    decrementMileage();
    return true;
  }
}

measureDuration = function(speed, distance){
  //number of seconds per mile at speed
  var multi = (60 / speed);
  var count = 60 * multi;
  //1 unit per minute at 60 units/hr
  return (count * distance) / 1000;
};

computeStage = function(startTime){
  var startTime = startTime || time;
  if(!(stage.length > 1)){
    return false;
  }
  stage[0].time = (startTime);

  var totalStageSeconds = 0;
  // calculate the specifics for each instruction
  for (var i = 0; i < stage.length - 1; i++) {
    var instruction = stage[i],
        nextInstrct = stage[i+1];
    instruction.distance = nextInstrct.mileage - instruction.mileage;
    instruction.duration = thouRound(measureDuration(instruction.speed, instruction.distance));
    nextInstrct.time = (instruction.duration * 1000) + instruction.time;
    totalStageSeconds += instruction.duration;
    if(!nextInstrct.speed){
      nextInstrct.speed = instruction.speed;
    }
  }
  return stage
};

currentAverageSpeed = function(){
  return rallySpeed;
};

currentDifference = function(){
  return rallyDifference;
};

runCalcs = function(){
  rallySpeed = "4" + (Math.floor(Math.random()* 10));
  var miles = Math.round(mileage + distance);
  for (var i = 0; i < stage.length; i++) {
    instruction = stage[i]
    //are we on the right stage?
    if((instruction.mileage + instruction.distance ) > miles && instruction.mileage < miles){
      instruction.status = "current"
      cast = instruction.speed

      //how far through the stage are we?
      var progress = miles - instruction.mileage;
      var targetTime = (measureDuration(instruction.speed, progress) + instruction.time);
      rallyDifference = Math.round( ((targetTime - Date.now())/1000) * 10) /10;
    }
  }
}

setStage = function(newStage){
  stage = newStage;
}

formatTime = function(timestamp){
  var date, hours, minutes, seconds;
  date = new Date(timestamp)
  hours = date.getHours() >= 10? date.getHours(): "0"+ date.getHours();
  minutes = date.getMinutes() >= 10? date.getMinutes(): "0"+ date.getMinutes();
  seconds = date.getSeconds() >= 10? date.getSeconds(): "0"+ date.getSeconds();
  return "" + hours + ":" + minutes + ":" + seconds;
}

module.exports = {
  computeStage: computeStage,
  measureDuration: measureDuration,
  thouRound: thouRound,
  currentMileage: currentMileage,
  currentDifference: currentDifference,
  currentAverageSpeed: currentAverageSpeed,
  pulse: pulse,
  runCalcs: runCalcs,
  setStage: setStage,
  formatTime: formatTime
}
