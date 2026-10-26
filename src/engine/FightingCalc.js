// Generated from finalfighter/BarcodeBattler2-Simulator @ 3211674. See vendor/reference.
import { asInt } from './runtime.js';
import { NES } from './NES.js';
import { BarcodeWorld } from './BarcodeWorld.js';
export class FightingCalc {
  random = Math.random;
  //戦闘データ
  fighting_data = null;

  //種族相性
  race_compatibility = new Array(new Array(0x0A, 0x08, 0x0C, 0x0C, 0x08), new Array(0x0C, 0x0A, 0x08, 0x0C, 0x08), new Array(0x08, 0x0C, 0x0A, 0x0C, 0x08), new Array(0x08, 0x08, 0x08, 0x0A, 0x0C), new Array(0x0C, 0x0C, 0x0C, 0x08, 0x0A));
  protection_star = 0; //守護星

  //守護星相性
  star_compatibility = new Array(new Array(0x0C, 0x0A, 0x08), new Array(0x08, 0x0C, 0x0A), new Array(0x0A, 0x08, 0x0C), new Array(0x0C, 0x0A, 0x08), new Array(0x08, 0x0C, 0x0A));
  barcode_world = new BarcodeWorld();
  nes = new NES();

  //先攻（１か２）
  now_player = 0;

  //表示ダメージ
  display_damage = 0;

  //パワーのとき使う乱数
  power_rand_table = new Array(1, 2, 3, 5, 7);

  //表示パワー
  display_power = 0;

  //使用MPの配列
  magic_list = new Array(0,
  //F0トルマ
  2,
  //F1ガンツ
  5,
  //F2デガンツ
  2,
  //F3リーモ
  4,
  //F4デリーモ
  3,
  //F5ニャーヘ
  5,
  //F6カチコム
  4,
  //F7ヘヘンダ
  6,
  //F8タフニ
  3 //F9マミロージャ
  );

  //回復使用の配列
  cure_magic_list = new Array(100,
  //F0トルマ
  100,
  //F1ガンツ
  100,
  //F2デガンツ
  2,
  //F3リーモ
  4,
  //F4デリーモ
  100,
  //F5ニャーヘ
  100,
  //F6カチコム
  100,
  //F7ヘヘンダ
  100,
  //F8タフニ
  100 //F9マミロージャ
  );

  //f0で奪うMP
  display_f0_mp = 0;

  //守護星を決定する
  decide_star() {
    var rand;
    rand = asInt(Math.floor(this.random() * 500));
    if (rand < 110) {
      this.protection_star = 0;
    } else if (rand >= 110 && rand < 256) {
      this.protection_star = 1;
    } else {
      this.protection_star = 2;
    }
  }

  //先攻を決定する
  decide_first_player() {
    var first_speed1 = asInt(this.calc_first_speed(this.fighting_data[0], this.fighting_data[1]));
    var first_speed2 = asInt(this.calc_first_speed(this.fighting_data[1], this.fighting_data[0]));
    if (first_speed1 > first_speed2) {
      this.now_player = 1;
    } else if (first_speed1 < first_speed2) {
      this.now_player = 2;
    } else {
      this.now_player = Math.floor(this.random() * 2) + 1;
    }
  }

  //先攻値を計算する
  calc_first_speed(fd1, fd2) {
    var input = new Object();
    input.m0018 = fd1.speed;
    input.m0019 = 0x00;
    input.m001C = 0x05;

    //m0024=スピード初期値×5
    this.barcode_world.dadf(input);

    //0-8の乱数
    var rand = asInt(Math.floor(this.random() * 9));

    //スピード×5 + 乱数
    input.m0018 = input.m0024 + rand;
    input.m0019 = 0x00;
    input.m001C = this.star_compatibility[fd1.race1][this.protection_star];
    // × 守護星相性
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // / 10
    this.barcode_world.dbcd(input);
    input.m0018 = input.m0024;
    input.m0019 = 0x00;
    input.m001C = this.race_compatibility[fd1.race1][fd2.race1] + 1;
    input.m001D = 0x00;

    // ×種族相性
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    var first_speed = asInt(input.m0024);

    //特殊能力37 2枚目のほうは有効になるのか？
    if (fd1.special1 == 37) {
      first_speed = asInt(50 + first_speed);
    }
    return asInt(first_speed);
  }
  calc_special_down(fd1, fd2) {
    //同種の特殊能力だったら強いほうにあわせる
    if (fd1.special1 == 23 && fd1.special2 == 24) {
      fd1.special1 = 0;
    } else if (fd1.special1 == 24 && fd1.special2 == 23) {
      fd1.special2 = 0;
    } else if (fd1.special1 == 25 && fd1.special2 == 26) {
      fd1.special1 = 0;
    } else if (fd1.special1 == 26 && fd1.special2 == 25) {
      fd1.special2 = 0;
    } else if (fd1.special1 == 25 && fd1.special2 == 27) {
      fd1.special1 = 0;
    } else if (fd1.special1 == 27 && fd1.special2 == 25) {
      fd1.special2 = 0;
    } else if (fd1.special1 == 26 && fd1.special2 == 27) {
      fd1.special1 = 0;
    } else if (fd1.special1 == 27 && fd1.special2 == 26) {
      fd1.special2 = 0;
    } else if (fd1.special1 == 28 && fd1.special2 == 29) {
      fd1.special1 = 0;
    } else if (fd1.special1 == 29 && fd1.special2 == 28) {
      fd1.special2 = 0;
    }

    //特殊能力23 ST30%ダウン
    if (fd1.special1 == 23 || fd1.special2 == 23) {
      var input = new Object();
      input.m0018 = 0x07;
      input.m001C = fd2.st1;
      //ST×ダウン率(7)
      this.barcode_world.dadf(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      //　/10
      this.barcode_world.dbcd(input);
      fd2.st1 = input.m0024;
      fd2.down_st_flag = true;
      fd2.st = fd2.st2 + fd2.st1;

      //特殊能力24 ST50%ダウン
    } else if (fd1.special1 == 24 || fd1.special2 == 24) {
      input = new Object();
      input.m0018 = 0x05;
      input.m001C = fd2.st1;
      //ST×ダウン率(5)
      this.barcode_world.dadf(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      //　/10
      this.barcode_world.dbcd(input);
      fd2.st1 = input.m0024;
      fd2.down_st_flag = true;
      fd2.st = fd2.st2 + fd2.st1;

      //特殊能力25 DF30%ダウン
    } else if (fd1.special1 == 25 || fd1.special2 == 25) {
      input = new Object();
      input.m0018 = 0x07;
      input.m001C = fd2.df1;
      //DF×ダウン率(7)
      this.barcode_world.dadf(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      //　/10
      this.barcode_world.dbcd(input);
      fd2.df1 = input.m0024;
      fd2.down_df_flag = true;
      fd2.df = fd2.df2 + fd2.df1;

      //特殊能力26 DF50%ダウン
    } else if (fd1.special1 == 26 || fd1.special2 == 26) {
      input = new Object();
      input.m0018 = 0x05;
      input.m001C = fd2.df1;
      //DF×ダウン率(5)
      this.barcode_world.dadf(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      //　/10
      this.barcode_world.dbcd(input);
      fd2.df1 = input.m0024;
      fd2.down_df_flag = true;
      fd2.df = fd2.df2 + fd2.df1;

      //特殊能力27 DF80%ダウン
    } else if (fd1.special1 == 27 || fd1.special2 == 27) {
      input = new Object();
      input.m0018 = 0x02;
      input.m001C = fd2.df1;
      //DF×ダウン率(2)
      this.barcode_world.dadf(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      //　/10
      this.barcode_world.dbcd(input);
      fd2.df1 = input.m0024;
      fd2.down_df_flag = true;
      fd2.df = fd2.df2 + fd2.df1;

      //特殊能力28 HP30%ダウン
    } else if (fd1.special1 == 28 || fd1.special2 == 28) {
      input = new Object();
      input.m0018 = 0x07;
      input.m0019 = 0x00;
      var hex_hp = fd2.hp.toString(16);
      while (hex_hp.length < 4) {
        hex_hp = "0" + hex_hp;
      }
      input.m001C = parseInt("0x" + hex_hp.substr(2, 2), 16); //HP下位
      input.m001D = parseInt("0x" + hex_hp.substr(0, 2), 16); //HP上位

      //HP×ダウン率(7)
      this.barcode_world.db01(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      // /10
      this.barcode_world.dbcd(input);
      fd2.hp = input.m0024 + input.m0025 * 0x100;
      fd2.max_hp = fd2.hp;
      fd2.down_hp_flag = true;

      //特殊能力29 HP50%ダウン
    } else if (fd1.special1 == 29 || fd1.special2 == 29) {
      input = new Object();
      input.m0018 = 0x05;
      input.m0019 = 0x00;
      hex_hp = fd2.hp.toString(16);
      while (hex_hp.length < 4) {
        hex_hp = "0" + hex_hp;
      }
      input.m001C = parseInt("0x" + hex_hp.substr(2, 2), 16); //HP下位
      input.m001D = parseInt("0x" + hex_hp.substr(0, 2), 16); //HP上位

      //HP×ダウン率(5)
      this.barcode_world.db01(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      // /10
      this.barcode_world.dbcd(input);
      fd2.hp = input.m0024 + input.m0025 * 0x100;
      fd2.max_hp = fd2.hp;
      fd2.down_hp_flag = true;
    }
    return fd2;
  }
  calc_hit(fd1, fd2, magic_rate = 0) {
    var speed_add = asInt(0);
    var speed_init = asInt(0);

    //相手のスピードを上回ったとき
    //speed_add = 自分のスピード - (自分のHP / #$53(83))
    if (fd1.speed >= fd2.speed) {
      this.nes.sec();
      var hex_hp = fd1.hp.toString(16);
      while (hex_hp.length < 4) {
        hex_hp = "0" + hex_hp;
      }
      var input = new Object();
      input.m0018 = parseInt("0x" + hex_hp.substr(2, 2), 16); //HP下位
      input.m0019 = parseInt("0x" + hex_hp.substr(0, 2), 16); //HP上位
      input.m001C = 0x53;
      input.m001D = 0x00;
      this.barcode_world.dbcd(input);
      this.nes.sec();
      speed_add = asInt(this.nes.sbc(fd1.speed, input.m0024));
    }
    speed_init = asInt(0xCC);

    //自分の命中率アップ
    if (fd1.special1 == 38 || fd1.special2 == 38) {
      speed_init = asInt(0xE6);
      //自分の命中率ダウン
    } else if (fd1.special1 == 39 || fd1.special2 == 39) {
      speed_init = asInt(0x80);
      //相手の命中率アップ
    } else if (fd2.special1 == 40 || fd2.special2 == 40) {
      speed_init = asInt(0xE6);
      //相手の命中率ダウン
    } else if (fd2.special1 == 41 || fd2.special2 == 41) {
      speed_init = asInt(0x80);
    }
    if (magic_rate > 0) {
      speed_init = asInt(speed_init - magic_rate);
    }

    //speed_initに守護性相性を適用
    input = new Object();
    input.m0018 = speed_init;
    input.m0019 = 0x00;
    input.m001C = this.star_compatibility[fd1.race1][this.protection_star];
    // × 守護星相性
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // / 10
    this.barcode_world.dbcd(input);
    speed_init = asInt(input.m0024);
    this.nes.clc();
    var hit_value = asInt(this.nes.adc(speed_init, speed_add));
    // 255 < hit_value
    if (this.nes.bcs()) {
      return true;
    }

    //0-255の乱数
    var rand = asInt(Math.floor(this.random() * 256));
    this.nes.cmp(hit_value, rand);
    if (this.nes.bcc()) {
      return false;
    }
    return true;
  }
  basic_damage(fd1, fd2) {
    var input = new Object();
    input.m001C = fd1.st;

    //0-4の乱数*2(0,2,4,6,8)
    input.m0018 = Math.floor(this.random() * 5) * 2;

    //ST×(0-8)
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);

    //ST×2
    var ARegister = asInt(this.nes.asl(fd1.st));
    if (!this.nes.bcc()) {
      input.m0025 = this.nes.inc(input.m0025);
    }
    this.nes.clc();

    //ST×2 +(ST×(0-8)/10)
    input.m0018 = this.nes.adc(input.m0024, ARegister);
    input.m0019 = this.nes.adc(input.m0025, 0x00);
    var basic_damage = asInt(-1);
    if (input.m0019 <= 0) {
      this.nes.cmp(input.m0018, fd2.df);
      if (!this.nes.bcs()) {
        basic_damage = asInt(0);
      }
    }
    if (basic_damage == -1) {
      //ST基礎値-DF
      this.nes.sec();
      input.m0018 = this.nes.sbc(input.m0018, fd2.df);
      input.m0019 = this.nes.sbc(input.m0019, 0x00);

      //1Pかつ相手が合体
      if (this.now_player == 1 && fd2.union_flag) {
        //自分が非合体
        if (!fd1.union_flag) {
          var race = asInt(fd1.race1);
          //合体
        } else {
          race = asInt(fd2.race1);
        }

        // /4 (合体相性50%)
        if (race == 0 || race == 1) {
          input.m0019 = this.nes.lsr(input.m0019);
          input.m0018 = this.nes.ror(input.m0018);
          input.m0019 = this.nes.lsr(input.m0019);
          input.m0018 = this.nes.ror(input.m0018);
          // /3 (合体相性75%)
        } else if (race == 2) {
          input.m001C = 0x03;
          input.m001D = 0x00;
          //　/3
          this.barcode_world.dbcd(input);
          input.m0018 = input.m0024;
          input.m0019 = input.m0025;
          // /2 (合体相性100%)
        } else {
          input.m0019 = this.nes.lsr(input.m0019);
          input.m0018 = this.nes.ror(input.m0018);
        }

        //2P
      } else {
        //(合体相性100%)
        input.m0019 = this.nes.lsr(input.m0019);
        input.m0018 = this.nes.ror(input.m0018);
      }

      //×守護星(8～12)
      input.m001C = this.star_compatibility[fd1.race1][this.protection_star];
      input.m001D = 0x00;
      this.barcode_world.db01(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      // /10
      this.barcode_world.dbcd(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;

      //×種族相性差(8～12)
      input.m001C = this.race_compatibility[fd1.race1][fd2.race1];
      input.m001D = 0x00;
      this.barcode_world.db01(input);
      input.m0018 = input.m0024;
      input.m0019 = input.m0025;
      input.m001C = 0x0A;
      input.m001D = 0x00;
      // /10
      this.barcode_world.dbcd(input);
      input.m0024 = input.m0024 + 1;
      if (input.m0024 == 0) {
        input.m0025 = input.m0025 + 1;
      }
      basic_damage = asInt(input.m0025 * 0x100 + input.m0024);
    } else {
      basic_damage = asInt(basic_damage + 1);
    }

    //×タイミング打法(1～2)
    var timing = asInt(Math.floor(this.random() * 2) + 1);
    basic_damage = asInt(basic_damage * timing);
    return asInt(basic_damage);
  }
  special_multi(fd1, fd2, basic_damage, magic_rate = 1) {
    basic_damage = asInt(asInt(basic_damage));
    var input = new Object();
    var hex_damage = basic_damage.toString(16);
    while (hex_damage.length < 4) {
      hex_damage = "0" + hex_damage;
    }
    input.m0018 = parseInt("0x" + hex_damage.substr(2, 2), 16); //ダメージ下位
    input.m0019 = parseInt("0x" + hex_damage.substr(0, 2), 16); //ダメージ上位

    //自分の特殊能力（N倍剣,特殊能力１つ目）
    //職業への3倍剣
    var rate = asInt(0);
    if (fd1.special1 >= 1 && fd1.special1 <= 10) {
      if (fd1.special1 == 10) {
        var special = asInt(0);
      } else {
        special = asInt(fd1.special1);
      }
      if (special == fd2.job) {
        rate = asInt(0x1E);
      } else {
        rate = asInt(0);
      }

      //種族への3倍剣
    } else if (fd1.special1 >= 11 && fd1.special1 <= 15) {
      if (fd1.special1 == 15) {
        special = asInt(0);
      } else {
        special = asInt(fd1.special1 - 10);
      }
      if (special == fd2.race1) {
        rate = asInt(0x1E);
      } else {
        rate = asInt(0);
      }

      //固定倍剣
    } else if (fd1.special1 >= 16 && fd1.special1 <= 18) {
      //0.5倍剣
      if (fd1.special1 == 16) {
        input.m0019 = this.nes.lsr(input.m0019);
        input.m0018 = this.nes.ror(input.m0018);
        rate = asInt(0);
        //1.5倍剣
      } else if (fd1.special1 == 17) {
        rate = asInt(0x0F);
        //2倍剣
      } else {
        rate = asInt(0x14);
      }
    }
    if (rate != 0) {
      input.m001C = rate;
      this.barcode_world.f_8bdf(input);
    }

    //自分の特殊能力（N倍剣,特殊能力２つ目）
    //職業への3倍剣
    rate = asInt(0);
    if (fd1.special2 >= 1 && fd1.special2 <= 10) {
      if (fd1.special2 == 10) {
        special = asInt(0);
      } else {
        special = asInt(fd1.special2);
      }
      if (special == fd2.job) {
        rate = asInt(0x1E);
      } else {
        rate = asInt(0);
      }

      //種族への3倍剣
    } else if (fd1.special2 >= 11 && fd1.special2 <= 15) {
      if (fd1.special2 == 15) {
        special = asInt(0);
      } else {
        special = asInt(fd1.special2 - 10);
      }
      if (special == fd2.race1) {
        rate = asInt(0x1E);
      } else {
        rate = asInt(0);
      }

      //固定倍剣
    } else if (fd1.special2 >= 16 && fd1.special2 <= 18) {
      //0.5倍剣
      if (fd1.special2 == 16) {
        input.m0019 = this.nes.lsr(input.m0019);
        input.m0018 = this.nes.ror(input.m0018);
        rate = asInt(0);
        //1.5倍剣
      } else if (fd1.special2 == 17) {
        rate = asInt(0x0F);
        //2倍剣
      } else {
        rate = asInt(0x14);
      }
    }
    if (rate != 0) {
      input.m001C = rate;
      this.barcode_world.f_8bdf(input);
    }

    //魔法
    if (magic_rate > 1) {
      input.m001C = magic_rate;
      this.barcode_world.f_8bdf(input);
    }

    //相手の特殊能力（N倍盾,特殊能力1つ目）
    rate = asInt(0);
    if (fd2.special1 == 20) {
      rate = asInt(0x09);
    } else if (fd2.special1 == 21) {
      rate = asInt(0x07);
    } else if (fd2.special1 == 22) {
      rate = asInt(0x05);
    }
    if (rate != 0) {
      input.m001C = rate;
      this.barcode_world.f_8bdf(input);
    }

    //相手の特殊能力（N倍盾,特殊能力2つ目）
    if (fd2.special2 == 20) {
      rate = asInt(0x09);
    } else if (fd2.special2 == 21) {
      rate = asInt(0x07);
    } else if (fd2.special2 == 22) {
      rate = asInt(0x05);
    }
    if (rate != 0) {
      input.m001C = rate;
      this.barcode_world.f_8bdf(input);
    }
    var damage = asInt(input.m0019 * 0x100 + input.m0018);
    if (damage > 999) {
      damage = asInt(999);
    }
    return asInt(damage);
  }
  critical_hit(fd1) {
    //ST+ST/2
    var critical_st = asInt(this.nes.lsr(fd1.st));
    this.nes.clc();
    critical_st = asInt(fd1.st + critical_st);
    if (this.display_damage > critical_st) {
      return true;
    } else {
      return false;
    }
  }
  check_item_broken(fd1, fd2) {
    //ダメージがMISS
    if (this.display_damage <= 0) {
      return false;
    }
    //相手のHPが0
    if (fd2.hp <= 0) {
      return false;
    }
    //STアイテム
    if (fd1.race2 == 5 && !fd1.st_item_broke_flag) {
      return true;
    }
    //DFアイテム
    if (fd2.race2 == 7 && !fd2.df_item_broke_flag) {
      return true;
    }
    return false;
  }
  basic_power(fd1, fd2) {
    //乱数=1,2,3,5,7
    var rand = asInt(this.power_rand_table[Math.floor(this.random() * 5)]);

    //タイミング打法
    if (Math.floor(this.random() * 2) == 1) {
      var timing = asInt(0x0E);
    } else {
      timing = asInt(0x0A);
    }
    var input = new Object();
    input.m0018 = timing;
    input.m001C = rand;

    //rand(1～7) * timing(10～14)
    this.barcode_world.dadf(input);
    var stack = asInt(input.m0024);
    var hex_max_hp = fd1.max_hp.toString(16);
    while (hex_max_hp.length < 4) {
      hex_max_hp = "0" + hex_max_hp;
    }
    input.m0018 = parseInt("0x" + hex_max_hp.substr(2, 2), 16); //HP下位
    input.m0019 = parseInt("0x" + hex_max_hp.substr(0, 2), 16); //HP上位
    input.m001C = 0x0A;
    input.m001D = 0x00;

    //HP/10
    this.barcode_world.dbcd(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = stack;
    input.m001D = 0x00;

    // HP/10×(1-7×10～14)
    this.barcode_world.db01(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    input.m0024;
    input.m0025;

    //特殊能力43 相手の回復力ダウン(×0.5)
    if (fd2.special1 == 43 || fd2.special2 == 43) {
      this.nes.clc();
      this.nes.lsr(input.m0025);
      this.nes.ror(input.m0024);
    }

    //特殊能力44　自分の回復力アップ (×2)
    if (fd1.special1 == 44 || fd1.special2 == 44) {
      this.nes.clc();
      this.nes.asl(input.m0024);
      this.nes.rol(input.mm025);
    }
    var basic_power = asInt(input.m0025 * 0x100 + input.m0024);
    var hp_diff = asInt(fd1.max_hp - fd1.hp);
    if (basic_power > hp_diff) {
      basic_power = asInt(hp_diff);
    }
    return asInt(basic_power);
  }

  //現在選択中の魔法から次の魔法を返す
  select_next_mp_function(fd1, select_mp_function, select_battle_magic = true) {
    select_mp_function = asInt(asInt(select_mp_function));
    var next_mp_function = asInt(select_mp_function + 1);
    if (next_mp_function >= 10) {
      return asInt(-1);
    }
    var list;
    if (select_battle_magic) {
      list = this.magic_list;
    } else {
      list = this.cure_magic_list;
    }
    while (true) {
      //使用できる魔法が見つかった
      if (list[next_mp_function] <= fd1.mp) {
        break;
      }
      next_mp_function = asInt(next_mp_function + 1);
      if (next_mp_function >= 10) {
        return asInt(-1);
      }
    }
    return asInt(next_mp_function);
  }

  //現在選択中の薬草から次の薬草を返す
  select_next_pp_state(fd1, select_pp_state) {
    select_pp_state = asInt(asInt(select_pp_state));
    if (fd1.pp == 0 || fd1.pp_ignore_flag) {
      return asInt(-1);
    }
    var next_pp_state = asInt(select_pp_state + 1);
    if (next_pp_state >= 4) {
      return asInt(-1);
    }
    //0個はないので。
    if (next_pp_state == 0) {
      next_pp_state = asInt(1);
    }
    //薬草残個数オーバー
    if (next_pp_state > fd1.pp) {
      return asInt(-1);
    }
    return asInt(next_pp_state);
  }

  //薬草選択時の回復量算出
  use_pp_power(fd1, fd2, select_pp_state) {
    select_pp_state = asInt(asInt(select_pp_state));
    //薬草使用個数×2
    var basic_pp = asInt(this.nes.asl(select_pp_state));
    var hex_max_hp = fd1.max_hp.toString(16);
    while (hex_max_hp.length < 4) {
      hex_max_hp = "0" + hex_max_hp;
    }
    var input = new Object();
    input.m0018 = basic_pp;
    input.m0019 = 0x00;
    input.m001C = parseInt("0x" + hex_max_hp.substr(2, 2), 16); //HP下位
    input.m001D = parseInt("0x" + hex_max_hp.substr(0, 2), 16); //HP上位

    //HP×薬草使用個数
    this.barcode_world.db01(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);

    //特殊能力43 相手の回復力ダウン(×0.5)
    if (fd2.special1 == 43 || fd2.special2 == 43) {
      this.nes.clc();
      this.nes.lsr(input.m0025);
      this.nes.ror(input.m0024);
    }

    //特殊能力44　自分の回復力アップ (×2)
    if (fd1.special1 == 44 || fd1.special2 == 44) {
      this.nes.clc();
      this.nes.asl(input.m0024);
      this.nes.rol(input.mm025);
    }
    var pp_power = asInt(input.m0025 * 0x100 + input.m0024);
    var hp_diff = asInt(fd1.max_hp - fd1.hp);
    if (pp_power > hp_diff) {
      pp_power = asInt(hp_diff);
    }
    return asInt(pp_power);
  }

  //トルマによる奪うMP量を求める
  calc_f0(fd2) {
    var get_mp;

    //1-6の乱数
    get_mp = asInt(Math.floor(this.random() * 6) + 1);

    //相手MPを超えていた場合はMPに合わせる
    if (fd2.mp < get_mp) {
      get_mp = asInt(fd2.mp);
    }
    return asInt(get_mp);
  }
  calc_f3(fd1) {
    var basic_pp = asInt(3);
    var hex_max_hp = fd1.max_hp.toString(16);
    while (hex_max_hp.length < 4) {
      hex_max_hp = "0" + hex_max_hp;
    }
    var input = new Object();
    input.m0018 = basic_pp;
    input.m0019 = 0x00;
    input.m001C = parseInt("0x" + hex_max_hp.substr(2, 2), 16); //HP下位
    input.m001D = parseInt("0x" + hex_max_hp.substr(0, 2), 16); //HP上位

    //HP×薬草使用個数
    this.barcode_world.db01(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    var f3_power = asInt(input.m0025 * 0x100 + input.m0024);
    var hp_diff = asInt(fd1.max_hp - fd1.hp);
    if (f3_power > hp_diff) {
      f3_power = asInt(hp_diff);
    }
    return asInt(f3_power);
  }
  calc_f4(fd1) {
    var basic_pp = asInt(5);
    var hex_max_hp = fd1.max_hp.toString(16);
    while (hex_max_hp.length < 4) {
      hex_max_hp = "0" + hex_max_hp;
    }
    var input = new Object();
    input.m0018 = basic_pp;
    input.m0019 = 0x00;
    input.m001C = parseInt("0x" + hex_max_hp.substr(2, 2), 16); //HP下位
    input.m001D = parseInt("0x" + hex_max_hp.substr(0, 2), 16); //HP上位

    //HP×薬草使用個数
    this.barcode_world.db01(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    var f3_power = asInt(input.m0025 * 0x100 + input.m0024);
    var hp_diff = asInt(fd1.max_hp - fd1.hp);
    if (f3_power > hp_diff) {
      f3_power = asInt(hp_diff);
    }
    return asInt(f3_power);
  }
  calc_f5(fd2) {
    var input = new Object();
    input.m0018 = 3;
    input.m001C = fd2.df1;

    //3×DF
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    return asInt(input.m0024);
  }
  calc_f6(fd1) {
    var input = new Object();
    input.m0018 = 3;
    input.m001C = fd1.df1;

    //3×DF
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    return asInt(input.m0024);
  }
  calc_f7(fd2) {
    var input = new Object();
    input.m0018 = 3;
    input.m001C = fd2.st1;

    //3×ST
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    return asInt(input.m0024);
  }
  calc_f8(fd1) {
    var input = new Object();
    input.m0018 = 3;
    input.m001C = fd1.st1;

    //3×ST
    this.barcode_world.dadf(input);
    input.m0018 = input.m0024;
    input.m0019 = input.m0025;
    input.m001C = 0x0A;
    input.m001D = 0x00;

    // /10
    this.barcode_world.dbcd(input);
    return asInt(input.m0024);
  }

  //敵の行動算出
  //0～9:魔法 10:攻撃 11:回復
  calc_action() {
    //1～100
    var rand = asInt(Math.floor(this.random() * 100) + 1);
    var rand_magic = asInt(Math.floor(this.random() * 100) + 1);

    //敵 MAXHPが20%を切ったとき
    if (this.fighting_data[1].hp / this.fighting_data[1].max_hp < 0.2) {
      if (this.fighting_data[1].pp > 0) {
        //50%の確率で回復
        if (rand > 50) {
          return asInt(11);
        }
      }
    }

    //攻撃か魔法か
    if (this.fighting_data[1].mp > 0) {
      //70%は攻撃
      if (rand < 70) {
        return asInt(10);
      }

      //魔法(F5(20%),F7(20%))
      if (rand_magic >= 40 && rand_magic < 60 && this.fighting_data[1].mp >= 3) {
        //F5 DFdown
        if (this.fighting_data[0].df <= 5) {
          return asInt(5);
        }
      } else if (rand_magic >= 70 && rand_magic < 90 && this.fighting_data[1].mp >= 7) {
        //F7 STdown
        if (this.fighting_data[0].st <= 5) {
          return asInt(7);
        }
      }
    }
    return asInt(10);
  }
}
