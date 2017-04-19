## About

RPGツクールMVでMilkcocoaを使ってリアルタイム通信をするためのプラグインです。  
[■RPGツクールMV：https://tkool.jp/mv/](https://tkool.jp/mv/)  
[■Milkcocoa](https://mlkcca.com/)

## できること
+ ネットワーク越しにフラグ・変数を操作
+ 他のプレイヤーを表示
+ ネットワーク越しに台詞を送る

## 更新履歴
2017/04/20 (0.2.0)
+ 永続データの送信コマンドを追加

2016/01/19 (0.1.2)
+ 複数アバターを識別できない不具合を修正

2016/01/12 (0.1.1)
+ 大きく移動する場合、データロードする場合に、アバターが同期されない不具合の修正
+ アバター用のテンプレートを作成可能にした

2015/12/10 (0.1.0)
+ アバターの動きを同期
+ 変数のやりとりを可能にした
+ フキダシの時に表示する顔画像を選択可能にした

2015/12/03 (0.0.1)
+ とりあえず通信できるようにした


## 1. 準備
事前に以下の準備を整える必要があります。
それぞれの手順は公式サイトにありますので、そちらに従ってください。

- [RPGツクールMV(体験版)](https://tkool.jp/mv/)のダウンロード・インストール
- [Milkcocoa](https://mlkcca.com/)のユーザー登録、アプリ作成
- RPGツクールMVでプロジェクトを新規作成する

## 2. プラグインの導入
### 2.1. milkcocoa.js の入手
MilkcocoaのCDNから、JavaScriptをダウンロードしてきます。
以下のリンクから「リンク先を保存」またはCliからwgetなどでダウンロードします。  
https://cdn.mlkcca.com/v2.0.0/milkcocoa.js

設置先 [ProjectROOT]/js/plugins/  
プロジェクトのフォルダ内の`plugins`ディレクトリに`milkcocoa.js`を設置します。
> `js/plugins/milkcocoa.js`

### 2.2. OrangeCustomEvents プラグインのダウンロード
他のプレイヤーを表示・制御するために使用します。  
設置先 [ProjectROOT]/js/plugins/  
http://download.hudell.com/OrangeCustomEvents.js

配布元：
http://forums.rpgmakerweb.com/index.php?/topic/46527-orange-custom-events/  
参考：
http://qiita.com/kyubuns/items/4108221a8b8245e46d27


### 2.3. プラグインのダウンロード
今回作ったものです。これをダウンロードします。  
設置先 [ProjectROOT]/js/plugins/  
https://github.com/m2wasabi/milkcocoa-rpgmv-plugin/blob/master/src/js/plugins/MilkcocoaClient.js

## 3. 送信側htmlの作成
htmlで世界を操る場合、コントロールする側のhtmlを作成します。
処理の流れを説明すると、以下のようになっています。

Milkcocoaサーバに繋ぐ(app_idが必要)。
pathを指定してデータストレージを参照する。
データを受け取ったときのイベントを書く。
Milkcocoaのデータストレージに、JavaScriptのオブジェクトを投げる。

実際に投げているデータは、JavaScriptにベタで書いているので、ご参考ください。  
https://github.com/m2wasabi/milkcocoa-rpgmv-plugin/tree/0.1.1/public


## 4. ツクール側の設定
### 4.1. 使用するための最小限の設定
RPGツクール側で、Milkcocoaのプラグインを使用します。
まず、メニューバーから、「プラグインの設定」を開きます。
![メニュー](https://qiita-image-store.s3.amazonaws.com/0/35009/a5c5f96c-93aa-9da1-58dd-5bebe5878eef.png)

(必要があれば)`OrangeCustomEvents`と`milkcocoa`と`MilkcocoaClient`を読み込み、それぞれ有効にします。
![プラグイン設定](https://qiita-image-store.s3.amazonaws.com/0/35009/1d402d3b-ec32-0cf5-177b-84d241d162f2.png)

`MilkcocoaClient`の設定で、app_idと データストアのpathを設定します。
また、フィールドにキャラを同期させたい人は、`OrangeCustomEvents`の導入とともに
`MilkcocoaClient`の設定で、sendPositionを1に設定します。
![パラメータ設定](https://qiita-image-store.s3.amazonaws.com/0/35009/7610b768-2a8b-82c5-bea4-e94dbc129de3.png)


### 4.1. スイッチの操作
| Command | Description |
|----|-----|
|Milkcocoa switch 10 1 | Milkcocoaでスイッチ 0010 に 1を送信する|

送信側のhtmlで、`スイッチ0010`をONにするイベントを発生させているので、
それをトリガーにしたイベントを作成します。
![イベント設置](https://qiita-image-store.s3.amazonaws.com/0/35009/52a8025f-b29e-f263-5861-0bbb3970b06d.png)

これは、`スイッチ0010`がONになることにより、フィールドに出現するクリスタルで、主人公が調べたら、所持金を+1して消えます(スイッチがOFFになる)

### 4.2. 変数の操作

| Command | Description |
|----|-----|
|Milkcocoa var 11 assign 3 | Milkcocoaで変数 0011 に 3を代入させる|
|Milkcocoa var 11 add 3 | Milkcocoaで変数 0011 の現在値に 3を加算する|
|Milkcocoa var 11 sub 3 | Milkcocoaで変数 0011 の現在値に 3を減算する|
|Milkcocoa var 11 mul 3 | Milkcocoaで変数 0011 の現在値に 3をかける|
|Milkcocoa var 11 div 3 | Milkcocoaで変数 0011 の現在値に 3で割る|
|Milkcocoa var 11 rem 3 | Milkcocoaで変数 0011 の現在値に 3で割った余りを代入する|

![変数](https://qiita-image-store.s3.amazonaws.com/0/35009/60878149-5a9f-09ac-1e4f-dff48c17cfdb.png)

### 4.3. 永続スイッチ・変数の操作(New!)

| Command | Description |
|----|-----|
|Milkcocoa staticSwitch 10 1 | Milkcocoaで永続スイッチ 0010 に 1を送信する|
|Milkcocoa staticVar 11 3 | Milkcocoaで永続変数 0011 に 3を送信する|
|Milkcocoa staticReset | Milkcocoaで永続スイッチ・変数をリセットする|

データを永続化して送信します。
通信のデータ量が増えるので使いどころに注意しましょう。
1回のMilkcocoaの送信データが4kbまでなので、フラグが数千とかになると保存されないかもしれないです。
永続化データの取得タイミングは、ニューゲーム時、セーブデータ読み込み時です。  
リセットすると、サーバ側の永続化されたデータを手放します。各プレイヤーで保持されているフラグ情報はそのままです。

### 4.4. メッセージの送信

| Command | Description |
|----|-----|
|Milkcocoa message 'text' | Milkcocoaでメッセージを送信する|
|Milkcocoa message 'text' 'People4' 1 |  Milkcocoaで顔アイコンを表示してメッセージを送信する|

![screen005.PNG](https://qiita-image-store.s3.amazonaws.com/0/35009/7a3f1122-c1d7-311b-eebc-27430360a56c.png)

### 4.5. Avatar template
各マップのイベントで「MilkcocoaAvatarTemplate」と名前を付けたイベントを作ると、
Milkcocoaプラグインは、他のプレイヤーのアバターを、そのイベントの複製として生成します。
![screen006.PNG](https://qiita-image-store.s3.amazonaws.com/0/35009/95396229-ac66-997b-74c5-617fb6314830.png)
