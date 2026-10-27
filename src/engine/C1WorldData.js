// Generated from finalfighter/BarcodeBattler2-Simulator @ 3211674. See vendor/reference.
import { asInt } from './runtime.js';
import { BarcodeData } from './BarcodeData.js';
export class C1WorldData {
  random = Math.random;
  //合計値
  unioncheckdigit = 0;

  //ステージ
  default_stage = new Array("E-1", "E-2", "E-3", "E-4", "E-5", "E-6");
  stage = new Array("E-1", "E-2", "E-3", "E-4", "E-5", "E-6");
  select_stage = 0;

  //ワールド。LHはキー取得後に追加される
  default_world = new Array("L-1", "L-2", "L-3", "L-4", "L-5");
  world = new Array("L-1", "L-2", "L-3", "L-4", "L-5");
  select_world = 0;
  default_passcode_number = new Array(10, 16, 24, 31, 38, 45);

  //敵
  default_enemy = new Array(
  //L1
  new Array("01", "02", "03", "04", "HH"),
  //L2
  new Array("01", "02", "03", "04", "HH"),
  //L3
  new Array("01", "02", "03", "04", "HH"),
  //L4
  new Array("01", "02", "03", "04", "HH"),
  //L5
  new Array("01", "02", "03", "04", "HH"),
  //LH
  new Array("01", "02", "03", "04", "HH"));
  enemy = new Array(
  //L1
  new Array("01", "02", "03", "04", "HH"),
  //L2
  new Array("01", "02", "03", "04", "HH"),
  //L3
  new Array("01", "02", "03", "04", "HH"),
  //L4
  new Array("01", "02", "03", "04", "HH"),
  //L5
  new Array("01", "02", "03", "04", "HH"),
  //LH
  new Array("01", "02", "03", "04", "HH"));
  select_enemy = 0;
  default_key = new Array(new Array("L1-1", "L3-2", "L5-3"), new Array("L2-2", "L4-3", "L5-1"), new Array("L1-1", "L3-2", "L5-3"), new Array("L2-1", "L3-3", "L5-4"), new Array("L1-4", "L2-2", "L4-3"));
  key = new Array("L1-1", "L3-2", "L5-3");
  default_race_list = new Array(0, 1, 2, 3, 4, 4);
  default_job_list = new Array(7, 2, 8, 4, 5);
  default_enemy_paramater = new Array(
  //E1
  new Array(
  //HP
  new Array(21, 27, 33, 40, 48, 56, 64, 72, 81, 91),
  //ST
  new Array(7, 8, 9, 11, 12, 15, 16, 18, 21, 23),
  //DF
  new Array(9, 10, 12, 14, 15, 18, 20, 21, 24, 27),
  //戦闘後回復
  new Array(
  //L1,L2,L3, L4, L5 ,LH
  1, 1, 1, 1, 1, 2),
  //ポインタ
  new Array(0, 0, 4, 4, 3, 3, 2, 2, 1, 1),
  //ボス撃破後回復HP
  new Array(15, 18, 21, 24, 27)),
  //E2
  new Array(
  //HP
  new Array(72, 81, 91, 101, 111, 121, 132, 144, 156, 168),
  //ST
  new Array(18, 21, 23, 26, 28, 30, 33, 35, 39, 41),
  //DF
  new Array(21, 24, 27, 30, 31, 34, 37, 39, 43, 46),
  //戦闘後回復
  new Array(
  //L1,L2,L3, L4, L5 ,LH
  2, 2, 2, 2, 2, 2),
  //ポインタ
  new Array(4, 4, 3, 3, 2, 2, 1, 1, 0, 0),
  //ボス撃破後回復HP
  new Array(36, 39, 42, 45, 48)),
  //E3
  new Array(
  //HP
  new Array(144, 156, 168, 180, 193, 207, 221, 235, 249, 264),
  //ST
  new Array(35, 39, 41, 44, 48, 51, 55, 58, 61, 65),
  //DF
  new Array(39, 43, 46, 48, 51, 55, 59, 61, 65, 69),
  //戦闘後回復
  new Array(
  //L1,L2,L3, L4, L5 ,LH
  3, 2, 3, 3, 3, 2),
  //ポインタ
  new Array(4, 4, 3, 3, 2, 2, 1, 1, 0, 0),
  //ボス撃破後回復HP
  new Array(57, 60, 63, 66, 69)),
  //E4
  new Array(
  //HP
  new Array(235, 249, 264, 280, 296, 312, 328, 345, 363, 381),
  //ST
  new Array(58, 61, 65, 68, 73, 76, 80, 85, 89, 94),
  //DF
  new Array(61, 65, 69, 72, 76, 80, 83, 87, 91, 96),
  //戦闘後回復
  new Array(
  //L1,L2,L3, L4, L5 ,LH
  3, 4, 3, 3, 3, 4),
  //ポインタ
  new Array(3, 3, 4, 4, 0, 0, 1, 1, 2, 2),
  //ボス撃破後回復HP
  new Array(78, 81, 84, 87, 90)),
  //E5
  new Array(
  //HP
  new Array(345, 363, 381, 399, 417, 436, 456, 476, 496, 516),
  //ST
  new Array(85, 89, 94, 98, 102, 107, 111, 117, 121, 126),
  //DF
  new Array(87, 91, 96, 99, 103, 108, 112, 117, 121, 125),
  //戦闘後回復
  new Array(
  //L1,L2,L3, L4, L5 ,LH
  4, 4, 4, 4, 4, 4),
  //ポインタ
  new Array(3, 3, 4, 4, 0, 0, 1, 1, 2, 2),
  //ボス撃破後回復HP
  new Array(99, 102, 105, 108, 110)),
  //E6
  new Array(
  //HP
  new Array(476, 496, 516, 537, 559, 581, 603, 625, 648, 672),
  //ST
  new Array(117, 121, 126, 132, 137, 143, 148, 153, 159, 164),
  //DF
  new Array(117, 121, 125, 130, 135, 141, 145, 150, 155, 160),
  //戦闘後回復
  new Array(
  //L1,L2,L3, L4, L5 ,LH
  4, 4, 4, 4, 4, 4),
  //ポインタ
  new Array(2, 2, 3, 3, 4, 4, 0, 0, 1, 1),
  //ボス撃破後回復HP
  new Array(120, 123, 126, 129, 132)));
  infomation_flag_a = false; //情報カード：５
  infomation_flag_b = false; //情報かーど：６

  init(checkdigit1, checkdigit2) {
    checkdigit1 = asInt(asInt(checkdigit1));
    checkdigit2 = asInt(asInt(checkdigit2));
    this.unioncheckdigit = checkdigit1 + checkdigit2;
    if (this.unioncheckdigit >= 10) {
      this.unioncheckdigit = this.unioncheckdigit - 10;
    }
  }

  //該当ワールドのクリアパスコード番号を返す
  get_passcode_number(stage_number = null) {
    if (stage_number === null) {
      return asInt(this.default_passcode_number[this.select_stage]);
    } else {
      return asInt(this.default_passcode_number[stage_number]);
    }
  }

  //ワールドを初期化
  reset_world() {
    this.world = this.clone(this.default_world);
    this.enemy = this.clone(this.default_enemy);
    this.select_enemy = 0;
    this.reset_key();
  }

  //キーを初期化
  reset_key() {
    switch (asInt(String(this.world[this.select_world]).substr(-1, 1))) {
      //ステージ１
      case 0:
        switch (this.unioncheckdigit) {
          case 0:
          case 1:
            this.key = this.clone(this.default_key[0]);
            break;
          case 8:
          case 9:
            this.key = this.clone(this.default_key[1]);
            break;
          case 6:
          case 7:
            this.key = this.clone(this.default_key[2]);
            break;
          case 4:
          case 5:
            this.key = this.clone(this.default_key[3]);
            break;
          case 2:
          case 3:
            this.key = this.clone(this.default_key[4]);
            break;
        }
        break;

      //ステージ２
      case 1:
      //ステージ３
      case 2:
        switch (this.unioncheckdigit) {
          case 0:
          case 1:
            this.key = this.clone(this.default_key[4]);
            break;
          case 8:
          case 9:
            this.key = this.clone(this.default_key[0]);
            break;
          case 6:
          case 7:
            this.key = this.clone(this.default_key[1]);
            break;
          case 4:
          case 5:
            this.key = this.clone(this.default_key[2]);
            break;
          case 2:
          case 3:
            this.key = this.clone(this.default_key[3]);
            break;
        }
        break;

      //ステージ４
      case 3:
      //ステージ５
      case 4:
        switch (this.unioncheckdigit) {
          case 0:
          case 1:
            this.key = this.clone(this.default_key[3]);
            break;
          case 8:
          case 9:
            this.key = this.clone(this.default_key[4]);
            break;
          case 6:
          case 7:
            this.key = this.clone(this.default_key[0]);
            break;
          case 4:
          case 5:
            this.key = this.clone(this.default_key[1]);
            break;
          case 2:
          case 3:
            this.key = this.clone(this.default_key[2]);
            break;
        }
        break;

      //ステージ6
      case 5:
        switch (this.unioncheckdigit) {
          case 0:
          case 1:
            this.key = this.clone(this.default_key[2]);
            break;
          case 8:
          case 9:
            this.key = this.clone(this.default_key[3]);
            break;
          case 6:
          case 7:
            this.key = this.clone(this.default_key[4]);
            break;
          case 4:
          case 5:
            this.key = this.clone(this.default_key[0]);
            break;
          case 2:
          case 3:
            this.key = this.clone(this.default_key[1]);
            break;
        }
        break;
    }
  }

  //キーの個数を取得
  key_number() {
    return asInt(3 - this.key.length);
  }

  //キーを敵に渡す
  add_key() {
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    var enemy_string = this.enemy[world_int][this.select_enemy];
    if (enemy_string == "HH") {
      var enemy_int = asInt(4);
      //L1形式に変換
      var world_enemy = "L" + world_string + "-H";
    } else {
      var enemy_int = asInt(asInt(enemy_string) - 1);
      //L1-1形式に変換
      var world_enemy = "L" + world_string + "-" + (enemy_int + 1).toString();
    }
    this.key.unshift(world_enemy);
  }
  infomation_key() {
    //L1-1
    return String(this.key[0]);
  }

  //キーがあるかどうか
  is_key() {
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    var enemy_string = this.enemy[world_int][this.select_enemy];
    if (enemy_string == "HH") {
      var enemy_int = asInt(4);
      //L1形式に変換
      var world_enemy = "L" + world_string;
    } else {
      var enemy_int = asInt(asInt(enemy_string) - 1);
      //L1-1形式に変換
      var world_enemy = "L" + world_string + "-" + (enemy_int + 1).toString();
    }
    for (var key_string of this.key) {
      if (key_string.indexOf(world_enemy) >= 0) {
        return true;
      }
    }
    return false;
  }

  //キーを削除
  delete_key() {
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    var enemy_string = this.enemy[world_int][this.select_enemy];
    if (enemy_string == "HH") {
      var enemy_int = asInt(4);
      //L1形式に変換
      var world_enemy = "L" + world_string;
    } else {
      var enemy_int = asInt(asInt(enemy_string) - 1);
      //L1-1形式に変換
      var world_enemy = "L" + world_string + "-" + (enemy_int + 1).toString();
    }
    var i = asInt(0);
    for (var key_string of this.key) {
      var key_index = asInt(key_string.indexOf(world_enemy));
      if (key_index >= 0) {
        this.key.splice(i, 1);
      }
      i = asInt(i + 1);
    }
  }

  //倒した敵を削除
  delete_enemy() {
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    var enemy_string = this.enemy[world_int][this.select_enemy];
    if (enemy_string == "HH") {
      //敵を全削除
      this.enemy[world_int].splice(0, 5);
    } else {
      //敵を単一削除
      this.enemy[world_int].splice(this.select_enemy, 1);
    }
  }

  //敵のいる最初のワールドをセットする
  set_start_world() {
    for (var i = 0; i <= 5; i++) {
      var enemy_length = asInt(this.enemy[i].length);
      if (enemy_length > 0) {
        this.select_world = i;
        break;
      }
    }
  }

  //そのワールドに敵がいるかどうか
  is_world() {
    var enemy_length = asInt(this.enemy[this.get_world_number()].length);
    if (enemy_length == 0) {
      return false;
    }
    return true;
  }
  get_world_number() {
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    return asInt(world_int);
  }
  get_enemy_number() {
    var world_int = asInt(this.get_world_number());
    var enemy_string = this.enemy[world_int][this.select_enemy];
    if (enemy_string == "HH") {
      var enemy_int = asInt(4);
    } else {
      var enemy_int = asInt(asInt(enemy_string) - 1);
    }
    return asInt(enemy_int);
  }

  //敵番号選択
  select_enemy_number() {
    var enemy_length = asInt(this.enemy[this.get_world_number()].length);
    if (enemy_length == 0) {
      return asInt(-1);
    }
    var enemy_number = asInt(Math.floor(this.random() * enemy_length));
    return asInt(enemy_number);
  }
  generate_enemy_paramater() {
    var barcode_data = new BarcodeData();
    var stage_int = asInt(asInt(String(this.stage[this.select_stage]).substr(-1, 1)) - 1);
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    var enemy_string = this.enemy[world_int][this.select_enemy];
    if (enemy_string == "HH") {
      var enemy_int = asInt(4);
    } else {
      var enemy_int = asInt(asInt(enemy_string) - 1);
    }
    var pointer = asInt(this.default_enemy_paramater[stage_int][4][this.unioncheckdigit] + world_int);
    while (pointer >= 5) {
      pointer = asInt(pointer - 5);
    }
    if (world_string == "H") {
      pointer = asInt(enemy_int);
      var hp_array = this.default_enemy_paramater[stage_int][0].slice(5, 10);
      var st_array = this.default_enemy_paramater[stage_int][1].slice(5, 10);
      var df_array = this.default_enemy_paramater[stage_int][2].slice(5, 10);
    } else {
      var hp_array = this.default_enemy_paramater[stage_int][0].slice(enemy_int, enemy_int + 5);
      var st_array = this.default_enemy_paramater[stage_int][1].slice(enemy_int, enemy_int + 5);
      var df_array = this.default_enemy_paramater[stage_int][2].slice(enemy_int, enemy_int + 5);
    }
    barcode_data.barcode = "0000000000000";
    barcode_data.hp = hp_array[pointer];
    barcode_data.st = st_array[pointer];
    barcode_data.df = df_array[pointer];
    if (enemy_string == "HH") {
      barcode_data.speed = 6;
    } else {
      barcode_data.speed = 5;
    }
    barcode_data.race = this.default_race_list[world_int];
    barcode_data.job = this.default_job_list[enemy_int];
    barcode_data.pp = 5;
    if (barcode_data.job > 6) {
      barcode_data.mp = 10;
    } else {
      barcode_data.mp = 0;
    }
    barcode_data.special = 0;
    barcode_data.live = true;
    return barcode_data;
  }

  //戦闘後ST、DFを算出する
  generate_st_df() {
    var stage_int = asInt(asInt(String(this.stage[this.select_stage]).substr(-1, 1)) - 1);
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    var pointer = asInt(this.default_enemy_paramater[stage_int][4][this.unioncheckdigit] + world_int);
    while (pointer >= 5) {
      pointer = asInt(pointer - 5);
    }

    //Hのとき、ポインタは特別に5とする
    if (world_int == 5) {
      pointer = asInt(5);
    }
    var energy_stdf = this.default_enemy_paramater[stage_int][3];
    return asInt(energy_stdf[pointer]);
  }

  //ボスの戦闘後HPを算出する
  generate_boss_energy() {
    var stage_int = asInt(asInt(String(this.stage[this.select_stage]).substr(-1, 1)) - 1);
    var world_string = String(this.world[this.select_world]).substr(-1, 1);
    if (world_string == "H") {
      var world_int = asInt(5);
    } else {
      var world_int = asInt(asInt(world_string) - 1);
    }
    var enemy_string = this.enemy[world_int][this.select_enemy];
    if (enemy_string != "HH") {
      return asInt(-1);
    }
    var pointer = asInt(this.default_enemy_paramater[stage_int][4][this.unioncheckdigit] + world_int);
    while (pointer >= 5) {
      pointer = asInt(pointer - 5);
    }
    var energy_array = this.default_enemy_paramater[stage_int][5];
    return asInt(energy_array[pointer]);
  }

  //パワーアップするパスコードのチェック
  c1_powerup_passcode(passcode) {
    switch (passcode) {
      case "815":
      case "031":
      case "009":
      case "099":
      case "077":
        return true;
        break;
      default:
        return false;
    }
  }
  generate_passcode_barcode_data(barcode_data, passcode) {
    switch (passcode) {
      case "815":
        barcode_data.hp = Math.floor(barcode_data.hp * 1.4) + 4;
        barcode_data.st = Math.floor(barcode_data.st * 13 / 9);
        barcode_data.df = Math.floor(barcode_data.df * 16 / 12);
        break;
      case "031":
        barcode_data.hp = Math.floor(barcode_data.hp * 1.6) + 9;
        barcode_data.st = Math.floor(barcode_data.st * 15 / 9) + 1;
        barcode_data.df = Math.floor(barcode_data.df * 18 / 12) + 1;
        break;
      case "009":
        barcode_data.hp = Math.floor(barcode_data.hp * 1.7) + 12;
        barcode_data.st = Math.floor(barcode_data.st * 16 / 9) + 1;
        barcode_data.df = Math.floor(barcode_data.df * 19 / 12) + 2;
        break;
      case "099":
        barcode_data.hp = Math.floor(barcode_data.hp * 1.8) + 16;
        barcode_data.st = Math.floor(barcode_data.st * 17 / 9) + 2;
        barcode_data.df = Math.floor(barcode_data.df * 20 / 12) + 3;
        break;
      case "077":
        barcode_data.hp = Math.floor(barcode_data.hp * 1.9) + 20;
        barcode_data.st = Math.floor(barcode_data.st * 18 / 9) + 3;
        barcode_data.df = Math.floor(barcode_data.df * 21 / 12) + 4;
        break;
    }
    return barcode_data;
  }

  //ジャンプパスコードチェック
  jump_stage_passcode(passcode) {
    if (passcode.charAt(0) + passcode.charAt(1) == "31") {
      var passcode_checkdigit = asInt(1 + this.unioncheckdigit);
    } else if (passcode.charAt(0) + passcode.charAt(1) == "38") {
      passcode_checkdigit = asInt(0 + this.unioncheckdigit);
    } else {
      return false;
    }
    if (passcode_checkdigit > 9) {
      passcode_checkdigit = asInt(passcode_checkdigit - 10);
    }

    //チェックデジットが一致
    if (passcode.charAt(2) == passcode_checkdigit.toString()) {
      return true;
    }
    return false;
  }
  clone(source) {
    return structuredClone(source);
  }
}
