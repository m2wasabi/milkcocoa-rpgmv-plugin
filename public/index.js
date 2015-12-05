(function(){
  // connect Milkcocoa
  var app_id = 'hoge';
  var dataPath = 'fuga';
  var milkcocoa = new MilkCocoa(app_id + '.mlkcca.com');
  var ds = milkcocoa.dataStore(dataPath);

  // get event elements
  var sendInput = document.getElementById("send");
  var switchInput = document.getElementById("switch");

  // dosplay send data
  ds.on("send", function(data){
    console.log(data);
  });

  // events
  sendInput.addEventListener("keypress", function(e){
    if(e.keyCode == 13) {
      ds.send({message: sendInput.value});
    }
  });
  switchInput.addEventListener("click", function(e){
    ds.send({switch: {id: 10, value: 1}});
  });
}());
