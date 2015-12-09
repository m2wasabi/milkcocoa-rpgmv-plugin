(function(){
  // connect Milkcocoa
  var app_id = 'hoge';
  var dataPath = 'fuga';
  var clientId = '';
  var milkcocoa = new MilkCocoa(app_id + '.mlkcca.com');
  var ds = milkcocoa.dataStore(dataPath);

  // get event elements
  var sendInput = document.getElementById("send");
  var switchOnInput = document.getElementById("switchOn");
  var switchOffInput = document.getElementById("switchOff");
  var setVar = document.getElementById("setVar");
  var addVar = document.getElementById("addVar");
  var subVar = document.getElementById("subVar");
  var mulVar = document.getElementById("mulVar");
  var divVar = document.getElementById("divVar");
  var remVar = document.getElementById("remVar");

  // dosplay send data
  ds.on("send", function(data){
    console.log(data);
  });

  // events
  sendInput.addEventListener("keypress", function(e){
    if(e.keyCode == 13) {
      if(document.getElementById("faceName").value.length){
        var faceName = String(document.getElementById("faceName").value);
        var faceIndex = Number(document.getElementById("faceIndex").value);
        ds.send({message: {text:sendInput.value,faceName:faceName,faceIndex:faceIndex}});
      }else{
        ds.send({message: {text:sendInput.value}});
      }
    }
  });
  switchOnInput.addEventListener("click", function(e){
    ds.send({switch: {id: 10, value: 1}});
  });
  switchOffInput.addEventListener("click", function(e){
    ds.send({switch: {id: 10, value: 0}});
  });
  setVar.addEventListener("click", function(e){
    ds.send({var: {id: 11, value: 10}});
  });
  addVar.addEventListener("click", function(e){
    ds.send({var: {id: 11, action: 'add', value: 1}});
  });
  subVar.addEventListener("click", function(e){
    ds.send({var: {id: 11, action: 'sub', value: 1}});
  });
  mulVar.addEventListener("click", function(e){
    ds.send({var: {id: 11, action: 'mul', value: 2}});
  });
  divVar.addEventListener("click", function(e){
    ds.send({var: {id: 11, action: 'div', value: 2}});
  });
  remVar.addEventListener("click", function(e){
    ds.send({var: {id: 11, action: 'rem', value: 10}});
  });
}());
