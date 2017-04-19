//=============================================================================
// MilkcocoaClient.js
//=============================================================================

/*:ja
 * @plugindesc Milkcocoaで接続します。
 * @author m2wasabi
 *
 * @param appId
 * @desc Milkcocoaのapp_id
 * @default hoge
 *
 * @param dataPath
 * @desc Milkcocoaのdata_path
 * @default fuga
 *
 * @param sendPosition
 * @desc Milkcocoaに主人公の座標を送信する
 * @default 0
 *
 * @help
 *
 * プラグインコマンド:
 *   Milkcocoa switch 10 1      # Milkcocoaでスイッチ 0010 に 1を送信する
 *   Milkcocoa var 11 assign 3  # Milkcocoaで変数 0011 に 3を代入させる
 *   Milkcocoa var 11 add 3     # Milkcocoaで変数 0011 の現在値に 3を加算する
 *   Milkcocoa var 11 sub 3     # Milkcocoaで変数 0011 の現在値に 3を減算する
 *   Milkcocoa var 11 mul 3     # Milkcocoaで変数 0011 の現在値に 3をかける
 *   Milkcocoa var 11 div 3     # Milkcocoaで変数 0011 の現在値に 3で割る
 *   Milkcocoa var 11 rem 3     # Milkcocoaで変数 0011 の現在値に 3で割った余りを代入する
 *   Milkcocoa message 'text'   # Milkcocoaでメッセージを送信する
 *   Milkcocoa message 'text' 'People4' 1 # Milkcocoaで顔アイコンを表示してメッセージを送信する
 *   Milkcocoa staticSwitch 10 1 # Milkcocoaで永続スイッチ 0010 に 1を送信する
 *   Milkcocoa staticVar 11 3   # Milkcocoaで永続変数 0011 に 3を送信する
 *   Milkcocoa staticReset      # Milkcocoaで永続スイッチ・変数をリセットする
 *
 * sendPosition = 1 の時に、OrangeCustomEvents プラグインが有効の場合、
 * 同時接続中のキャラが見えます。
 *   http://download.hudell.com/OrangeCustomEvents.js
 *
 * staticVarについて:
 * 非同期通信のため、四則演算は行いません。
 * 永続スイッチ、永続変数は変化があるたびに全ての永続スイッチ、永続変数を上書きします。
 *
 * staticResetについて:
 * リセットされると、永続スイッチのロックが解除されます。
 * 現在のスイッチ・変数の状態は変化しません。
 * 間違って永続化した、永続化したくなくなった時にこれで外します。
 *
 */

(function() {

  var parameters = PluginManager.parameters('MilkcocoaClient');
  var appId = parameters['appId'];
  var dataPath = parameters['dataPath'];
  var sendPosition = Number(parameters['sendPosition']);
  var useSync = Number(parameters['useSync']);
  var clientId = '';
  var onlinePlayers = {};
  var templateEventData = {"id":0,"name":"Default","note":"","pages":[{"conditions":{"actorId":1,"actorValid":false,"itemId":1,"itemValid":false,"selfSwitchCh":"A","selfSwitchValid":false,"switch1Id":1,"switch1Valid":false,"switch2Id":1,"switch2Valid":false,"variableId":1,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"tileId":0,"characterName":"Actor1","direction":2,"pattern":0,"characterIndex":0},"list":[{"code":0,"indent":0,"parameters":[]}],"moveFrequency":3,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":false,"wait":false},"moveSpeed":5,"moveType":0,"priorityType":1,"stepAnime":true,"through":true,"trigger":4,"walkAnime":true}],"x":0,"y":0};
  var staticData = {"sw":[], "val":[]};

  var milkcocoa = new MilkCocoa(appId + '.mlkcca.com');
  clientId = milkcocoa.option.clientId;

  var ds = milkcocoa.dataStore(dataPath);

  // インスタントデータ受信時
  ds.on('send', function(data){
    if(data.value.message){
      if(data.value.message.faceName){
        $gameMessage.setFaceImage(data.value.message.faceName,data.value.message.faceIndex);
      }
      $gameMessage.add(data.value.message.text);
    }
    if(data.value.switch){
      $gameSwitches.setValue(data.value.switch.id,data.value.switch.value);
    }
    if(data.value.var){
      var _v = $gameVariables.value(data.value.var.id);
      if(typeof(data.value.var.action) !== 'undefined'){
        switch (data.value.var.action){
          case 'add':
          case 'addition':
            _v += data.value.var.value;
            break;
          case 'sub':
          case 'subtraction':
            _v -= data.value.var.value;
            break;
          case 'mul':
          case 'multiplication':
            _v = _v * data.value.var.value;
            break;
          case 'div':
          case 'division':
            _v = _v / data.value.var.value;
            break;
          case 'rem':
          case 'remainder':
            _v = _v % data.value.var.value;
            break;
          case 'assign':
          default :
            _v = data.value.var.value;
        }
      }else{
        _v = data.value.var.value;
      }
      $gameVariables.setValue(data.value.var.id,_v);
    }
    // 移動(同一マップ内の自分以外のデータを処理)
    if(data.value.move && data.value.sender !== clientId){
      // プラグイン [OrangeCustomEvents] が有効の場合のみ実行
      if(typeof($gameMap.addEvent) !== 'undefined'){
        if(data.value.move.mapId !== Number($gameMap.mapId())){
          // 既に登録したキャラが別のマップに移動した場合にキャラを消す
          if(typeof(onlinePlayers[data.value.sender]) !== 'undefined'){
            onlinePlayers[data.value.sender]._characterName = '';
            onlinePlayers[data.value.sender]._characterIndex = 0;
            var _eventId = onlinePlayers[data.value.sender]._eventId;
            delete onlinePlayers[data.value.sender];
            $gameSystem.removeCustomEvent(Number($gameMap.mapId()),_eventId) ;
          }
        }else{
          var _actor = $dataActors[data.value.move.actorId];
          if(typeof(onlinePlayers[data.value.sender]) === 'undefined'){
            // Add event
            var _event_length = $dataMap.events.length;
            var _tempEvendData = templateEventData;
            _tempEvendData.id = _event_length;
            _tempEvendData.name = data.value.sender;
            _tempEvendData.pages[0].image.characterName = _actor.characterName;
            _tempEvendData.pages[0].image.characterIndex = _actor.characterIndex;
            _tempEvendData.x = Number(data.value.move.x);
            _tempEvendData.y = Number(data.value.move.y);

            var gameEvent = $gameMap.addEvent(_tempEvendData,true);
            gameEvent.clientId = data.value.sender;
            onlinePlayers[data.value.sender] = gameEvent;

          }else{
            // Avatar Change
            onlinePlayers[data.value.sender]._characterName = _actor.characterName;
            onlinePlayers[data.value.sender]._characterIndex = _actor.characterIndex;
            // Move event
            var _moveRoute = {"list":[],"repeat":false,"skippable":true,"wait":false};
            var moveX = data.value.move.x - onlinePlayers[data.value.sender].x;
            var moveY = data.value.move.y - onlinePlayers[data.value.sender].y;
            if(moveX != 0){
              var _directionX = (moveX < 0)?Game_Character.ROUTE_MOVE_LEFT:Game_Character.ROUTE_MOVE_RIGHT;
              var _loop = Math.abs(moveX);
              for(var _i =0; _i<_loop;_i++){
                _moveRoute.list.push({"code":_directionX,"parameters":[]});
              }
            }
            if(moveY != 0){
              var _directionY = (moveY < 0)?Game_Character.ROUTE_MOVE_UP:Game_Character.ROUTE_MOVE_DOWN;
              var _loop = Math.abs(moveY);
              for(var _i =0; _i<_loop;_i++){
                _moveRoute.list.push({"code":_directionY,"parameters":[]});
              }
            }
            var route_turn_codes = {2:Game_Character.ROUTE_TURN_DOWN,4:Game_Character.ROUTE_TURN_LEFT,6:Game_Character.ROUTE_TURN_RIGHT,8:Game_Character.ROUTE_TURN_UP};
            var _turn = route_turn_codes[data.value.move.direction];
            _moveRoute.list.push({"code":_turn,"parameters":[]});
            _moveRoute.list.push({"code":0,"parameters":[]});
            onlinePlayers[data.value.sender].forceMoveRoute(_moveRoute);
          }
        }
      }
    }
  });

  // 永続データのマージ処理
  var mergeStaticData = function (data) {
    if (!data) {
        data = {"sw":[],"val":[]};
    }
    if(data.sw) {
      for(var _sk in data.sw) {
        if(typeof(data.sw[_sk]) !== 'undefined' && data.sw[_sk] !== null) {
          staticData.sw[_sk] = data.sw[_sk];
        }
      }
    }
    if(data.val) {
      for(var _vk in data.val) {
        if(typeof(data.val[_vk]) !== 'undefined' && data.val[_vk] !== null) {
          staticData.val[_vk] = data.val[_vk];
        }
      }
    }
  };

  // 永続データの反映処理
  var syncStaticData = function () {
    for(var _sk in staticData.sw) {
      var _s = staticData.sw[_sk];
      if(_sk !== null && _s !== null){
        $gameSwitches.setValue(_sk,_s);
      }
    }
    for(var _vk in staticData.val) {
      var _v = staticData.val[_vk];
      if(_vk !== null && _v !== null){
        $gameVariables.setValue(_vk,_v);
      }
    }
  };

  // 永続データ受信時
  ds.on('push', function(data){
    if(data.value.command === 'reset'){
      staticData = {"sw":[], "val":[]};
    }
    if(typeof(data.value.staticData) !== 'undefined'){
      mergeStaticData(data.value.staticData);
      syncStaticData();
    }
  });

  // 永続データ取得からの同期
  var staticDataSync = function () {
    ds.stream().size(1).next(function (err, data) {
      if(err === null) {
        for(var _i in data) {
          if(typeof(data[_i]) !== 'undefined' && typeof(data[_i].value) !== 'undefined' && typeof(data[_i].value.staticData) !== 'undefined'){
            mergeStaticData(data[_i].value.staticData);
          }
        }
        syncStaticData();
      }
    });
  };

  var milkcocoaConsole = {};
  // スイッチの変更
  milkcocoaConsole.sendSwitch = function(args){
    ds.send({'sender':clientId,'switch':{'id':Number(args[1]),'value':Number(args[2])}});
  };

  // 変数の変更
  milkcocoaConsole.sendVar = function(args){
    ds.send({'sender':clientId,'var':{'id':Number(args[1]),'action':String(args[2]),'value':Number(args[3])}});
  };

  // メッセージの送信
  milkcocoaConsole.sendMessage = function(args){
    if(args[2]){
      ds.send({'sender':clientId,'message':{'text':String(args[1]),'faceName':String(args[2]),'faceIndex':Number(args[3])}});

    } else {
      ds.send({'sender':clientId,'message':{'text':String(args[1])}});
    }
  };

  // 位置の送信
  milkcocoaConsole.sendPlayerPos = function(direction){
    ds.send({'sender':clientId,'move':{'mapId':Number($gameMap.mapId()),'x':Number($gamePlayer.x),'y':Number($gamePlayer.y),'direction':direction,'actorId':$gameParty._actors[0]}});
  };

  // 永続スイッチの変更
  milkcocoaConsole.pushSwitch = function(args){
    staticData.sw[Number(args[1])] = Number(args[2]);
    ds.push({'sender':clientId,'staticData':staticData});
  };

  // 永続変数の変更
  milkcocoaConsole.pushVar = function(args){
    staticData.val[Number(args[1])] = Number(args[2]);
    ds.push({'sender':clientId,'staticData':staticData});
  };

  // 永続パラメータ・変数のリセット
  milkcocoaConsole.pushReset = function(){
    staticData = {"sw":[], "val":[]};
    ds.push({'sender':clientId,'staticData':staticData, command: 'reset'});
  };

    // Commands
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    // 追加する処理内容をここに記述
    if (command === 'Milkcocoa') {
      switch (args[0]) {
        case 'switch':
          milkcocoaConsole.sendSwitch(args);
          break;
        case 'var':
          milkcocoaConsole.sendVar(args);
          break;
        case 'message':
          milkcocoaConsole.sendMessage(args);
          break;
        case 'staticSwitch':
          milkcocoaConsole.pushSwitch(args);
          break;
        case 'staticVar':
          milkcocoaConsole.pushVar(args);
          break;
        case 'staticReset':
          milkcocoaConsole.pushReset(args);
          break;
      }
    }
  };

  // 移動時に座標を送る(歩行)
  var _Game_Player_prototype_executeMove  = Game_Player.prototype.executeMove;
  Game_Player.prototype.executeMove = function(direction){
    _Game_Player_prototype_executeMove.call(this, direction);
    if(sendPosition){
      milkcocoaConsole.sendPlayerPos(direction);
    }
  };

  // 移動時に座標を送る(Map切り替え)
  var _Game_Player_prototype_performTransfer = Game_Player.prototype.performTransfer;
  Game_Player.prototype.performTransfer = function(){
    _Game_Player_prototype_performTransfer.call(this);
    if(sendPosition){
      milkcocoaConsole.sendPlayerPos(2);
      onlinePlayers = {};
      for(var i in $dataMap.events ){
        if($dataMap.events[i] !== null && $dataMap.events[i].name == 'MilkcocoaAvatarTemplate'){
          templateEventData = $dataMap.events[i];
        }
      }
    }
  };

  // Load実行時に座標を送る Scene_Load.prototype.onLoadSuccess
  var _Scene_Load_prototype_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
  Scene_Load.prototype.onLoadSuccess = function(){
    _Scene_Load_prototype_onLoadSuccess.call(this);
    if(sendPosition){
      milkcocoaConsole.sendPlayerPos(2);
      onlinePlayers = {};
    }
    // 保存された他プレイヤーアバターを削除
    for(var i in $gameMap._events ) {
      if($gameMap._events[i] !== null &&  $gameMap._events[i].hasOwnProperty('clientId')){
        $gameMap._events[i]._characterName = '';
        $gameMap._events[i]._characterIndex = 0;
        $gameSystem.removeCustomEvent(Number($gameMap.mapId()),i) ;
      }
    }
    // 永続データの同期
    staticDataSync();
  };

  // ニューゲーム時に永続データを同期する
  var _DataManager_selectSavefileForNewGame = DataManager.selectSavefileForNewGame;
  DataManager.selectSavefileForNewGame = function(){
    _DataManager_selectSavefileForNewGame.call(this);
    // 永続データの同期
    staticDataSync();
  };
})();
