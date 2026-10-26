// Generated from finalfighter/BarcodeBattler2-Simulator @ 3211674. See vendor/reference.
import { asInt } from './runtime.js';
import { BarcodeData } from './BarcodeData.js';
export class BarcodeRead {
  random = Math.random;
  barcode_data = null;
  debug = null;
  //barcode:バーコード文字列  count:入力カウント(1枚目か2枚目か) barcode1:1枚目のバーコード番号 shift:バーコードシフト hero:主人公フラグが必要か job:職業固定が必要か(null,warrior,magician) item:アイテム固定が必要か c1_flag
  init(barcode, count = 1, barcode1_data = null, shift = 0, hero = false, job = null, item = false, c1_flag = false) {
    if (!this.check_barcode(barcode)) {
      return false;
    }
    if (!this.check_degit(barcode)) {
      return false;
    }
    this.barcode_data = new BarcodeData();
    this.barcode_data.barcode = barcode;
    var post_read_flag = false;
    if (this.prepost_check()) {
      this.pre_reading();
    } else {
      post_read_flag = true;
      this.post_reading(shift);
    }
    if (count == 1) {
      //1枚目はアイテム不可
      if (this.barcode_data.race > 4) {
        return false;
      }

      //主人公フラグ
      if (hero && this.barcode_data.special != 18 && this.barcode_data.special != 50 && !post_read_flag) {
        return false;
      }

      //主人公でHP6000、ST2000、DF2000以上ははじく
      if (this.barcode_data.special == 50 && (this.barcode_data.hp >= 60 || this.barcode_data.st >= 20 || this.barcode_data.df >= 20)) {
        return false;
      }

      //heroフラグたっている（＝C1、C2モードのときはHP、ST、DFを再計算）
      if (hero && post_read_flag && this.barcode_data.race <= 4) {
        this.calc_c1_reading();
      }

      //jobチェック
      if (job == "warrior") {
        //戦士のみ受け付けで魔法使いだった場合
        if (this.barcode_data.job > 6) {
          return false;
        }
      } else if (job == "magician") {
        //魔法使いのみ受け付けで戦士だった場合
        if (this.barcode_data.job <= 6) {
          return false;
        }
      }
    }

    //C2アイテム固定チェック
    if (barcode1_data && item) {
      if (this.barcode_data.race <= 4) {
        //合体できないバーコードであることを確認
        if (this.barcode_data.race != barcode1_data.race || this.barcode_data.job != barcode1_data.job) {
          return false;
        }
      }
    }
    if (barcode1_data) {
      //同じバーコードは合体不可
      var barcode_check;
      var barcode_check1;
      if (barcode.length >= 13) {
        barcode_check = barcode.charAt(6) + barcode.charAt(7) + barcode.charAt(8) + barcode.charAt(9) + barcode.charAt(10) + barcode.charAt(11) + barcode.charAt(12);
      } else {
        barcode_check = barcode.charAt(1) + barcode.charAt(2) + barcode.charAt(3) + barcode.charAt(4) + barcode.charAt(5) + barcode.charAt(6) + barcode.charAt(7);
      }
      var barcode1 = barcode1_data.barcode;
      if (barcode1_data.barcode.length >= 13) {
        barcode_check1 = barcode1.charAt(6) + barcode1.charAt(7) + barcode1.charAt(8) + barcode1.charAt(9) + barcode1.charAt(10) + barcode1.charAt(11) + barcode1.charAt(12);
      } else {
        barcode_check1 = barcode1.charAt(1) + barcode1.charAt(2) + barcode1.charAt(3) + barcode1.charAt(4) + barcode1.charAt(5) + barcode1.charAt(6) + barcode1.charAt(7);
      }
      if (barcode_check == barcode_check1) {
        return false;
      }

      //HPアイテム系チェック
      if (this.barcode_data.race == 9) {
        //情報カードは入力不可
        if (this.barcode_data.job == 5 || this.barcode_data.job == 6) {
          if (!c1_flag) {
            return false;
          }
        }

        //戦士はMPアップ不可
        if (barcode1_data.job <= 6) {
          if (this.barcode_data.job >= 8) {
            return false;
          }
        }
      }

      //魔法使いは武器・防具は不可
      if (this.barcode_data.job >= 7) {
        if (this.barcode_data.race >= 5 && this.barcode_data.race <= 8) {
          return false;
        }
      }
    }
    return true;
  }
  calc_c1_reading() {
    //HP,ST,DFを元に再計算
    this.barcode_data.hp = Math.floor(this.barcode_data.hp / 10);
    this.barcode_data.st = Math.floor(this.barcode_data.st / 10) + 1;
    this.barcode_data.df = Math.floor(this.barcode_data.df / 10) + 3;
  }

  //デジットチェック
  check_degit(barcode) {
    if (barcode.length == 8) {
      barcode = "00000" + barcode;
    }

    //奇数
    var odd_digit = asInt(0);
    for (var i = asInt(0); i <= barcode.length - 2; i = asInt(i + 2)) {
      odd_digit = asInt(odd_digit + asInt(barcode.charAt(i)));
    }

    //偶数
    var even_digit = asInt(0);
    for (i = asInt(1); i <= barcode.length - 1; i = asInt(i + 2)) {
      even_digit = asInt(even_digit + asInt(barcode.charAt(i)));
    }

    //1桁目から引く
    var calc_check_digit = asInt(10 - (odd_digit + even_digit * 3) % 10);
    if (calc_check_digit == 10) {
      calc_check_digit = asInt(0);
    }

    //最終桁目取り出し
    var check_digit = asInt(asInt(barcode.charAt(barcode.length - 1)));
    if (calc_check_digit != check_digit) {
      return false;
    }
    return true;
  }

  //8桁13桁簡易チェック
  check_barcode(barcode) {
    if (barcode.length != 13 && barcode.length != 8) {
      return false;
    }
    return true;
  }

  //前読みか後読みか判別 true:前読み　false:後読み
  prepost_check() {
    var barcode = this.barcode_data.barcode;
    if (barcode.length == 8) {
      return false;
    }
    var head_digit = asInt(asInt(barcode.charAt(0)));
    if (head_digit == 0 || head_digit == 1) {
      if (asInt(barcode.charAt(7)) >= 0 && asInt(barcode.charAt(7)) <= 4) {
        return true;
      } else {
        //前読みとして読んだ場合HP5000、ST1900、DF1900以下の場合は5-9でも前読みに
        var hp = asInt(asInt(barcode.charAt(0) + barcode.charAt(1) + barcode.charAt(2)));
        var st = asInt(asInt(barcode.charAt(3) + barcode.charAt(4)));
        var df = asInt(asInt(barcode.charAt(5) + barcode.charAt(6)));
        if (hp <= 50 && st <= 19 && df <= 19) {
          return true;
        }
        return false;
      }
    } else {
      if (asInt(barcode.charAt(2)) == 9 && asInt(barcode.charAt(9)) == 5) {
        return true;
      } else {
        return false;
      }
    }
  }

  //前読み
  pre_reading() {
    var barcode = this.barcode_data.barcode;

    //種族取得
    this.barcode_data.race = asInt(barcode.charAt(7));

    //特殊能力
    this.barcode_data.special = asInt(barcode.charAt(10) + barcode.charAt(11));

    //キャラクター
    if (this.barcode_data.race >= 0 && this.barcode_data.race <= 4) {
      //HP
      this.barcode_data.hp = asInt(barcode.charAt(0) + barcode.charAt(1) + barcode.charAt(2));

      //ST
      this.barcode_data.st = asInt(barcode.charAt(3) + barcode.charAt(4));

      //DF
      this.barcode_data.df = asInt(barcode.charAt(5) + barcode.charAt(6));

      //ST/DF追加処理
      if (this.barcode_data.race == 0 && this.barcode_data.hp >= 200) {
        var check_stdf = asInt(asInt(barcode.charAt(3) + barcode.charAt(4)));
        if (check_stdf == 13 || check_stdf == 29 || check_stdf == 45 || check_stdf == 61 || check_stdf == 77 || check_stdf == 93) {
          this.barcode_data.st = this.barcode_data.st + 100;
          this.barcode_data.df = this.barcode_data.df + 100;
        }
        this.barcode_data.st = this.barcode_data.st + 100;
        if (this.barcode_data.st > 256) {
          this.barcode_data.st = this.barcode_data.st - 255;
        }
      } else if (this.barcode_data.race == 1 && this.barcode_data.hp >= 200) {
        var check_stdf = asInt(asInt(barcode.charAt(5) + barcode.charAt(6)));
        if (check_stdf == 13 || check_stdf == 29 || check_stdf == 45 || check_stdf == 61 || check_stdf == 77 || check_stdf == 93) {
          this.barcode_data.st = this.barcode_data.st + 100;
          this.barcode_data.df = this.barcode_data.df + 100;
        }
        this.barcode_data.df = this.barcode_data.df + 100;
        if (this.barcode_data.df > 256) {
          this.barcode_data.df = this.barcode_data.st - 255;
        }
      } else if (this.barcode_data.race == 2 && this.barcode_data.hp >= 200) {
        this.barcode_data.st = this.barcode_data.st + 100;
        this.barcode_data.df = this.barcode_data.df + 100;
      }

      //Speed
      this.barcode_data.speed = asInt(barcode.charAt(11));

      //job
      this.barcode_data.job = asInt(barcode.charAt(8));

      //PP
      this.barcode_data.pp = 5;

      //MP
      if (this.barcode_data.job >= 6) {
        this.barcode_data.mp = 10;
      } else {
        this.barcode_data.mp = 0;
      }

      //STアイテム
    } else if (this.barcode_data.race >= 5 && this.barcode_data.race <= 6) {
      this.barcode_data.st = asInt(barcode.charAt(3) + barcode.charAt(4));
      if (this.barcode_data.special == 31 && Math.floor(this.random() * 2) == 0) {
        this.barcode_data.st = 0 - this.barcode_data.st;
      }
      //DFアイテム
    } else if (this.barcode_data.race >= 7 && this.barcode_data.race <= 8) {
      this.barcode_data.df = asInt(barcode.charAt(5) + barcode.charAt(6));
      if (this.barcode_data.special == 32 && Math.floor(this.random() * 2) == 0) {
        this.barcode_data.df = 0 - this.barcode_data.df;
      }
      //HPアイテム/情報カード/薬草アップ/MPアップ
    } else {
      //HPアイテムの種類判別用に職業保存
      this.barcode_data.job = asInt(barcode.charAt(8));

      //HPアイテム
      if (this.barcode_data.job >= 0 && 4 >= this.barcode_data.job) {
        this.barcode_data.hp = asInt(barcode.charAt(0) + barcode.charAt(1) + barcode.charAt(2));
        if (this.barcode_data.special == 30 && Math.floor(this.random() * 2) == 0) {
          this.barcode_data.hp = 0 - this.barcode_data.hp;
        }
        //情報カード
      } else if (this.barcode_data.job == 5 || this.barcode_data.job == 6) {
        //薬草アップ
      } else if (this.barcode_data.job == 7) {
        this.barcode_data.pp = asInt(barcode.charAt(3) + barcode.charAt(4));
        //MPアップ
      } else {
        this.barcode_data.mp = asInt(barcode.charAt(5) + barcode.charAt(6));
      }
    }
  }

  //後読み
  post_reading(shift = +2) {
    var barcode = this.barcode_data.barcode;

    //13桁
    if (barcode.length == 13) {
      //先頭へのズレの場合
      if (shift == +2) {
        shift = asInt(-8);
      }

      //種族取得
      this.barcode_data.race = asInt(barcode.charAt(12));

      //キャラクター
      if (this.barcode_data.race >= 0 && this.barcode_data.race <= 4) {
        //HP
        this.barcode_data.hp = asInt(Math.floor(asInt(barcode.charAt(11 + shift)) / 2).toString() + barcode.charAt(10 + shift) + barcode.charAt(9 + shift));

        //ST
        var tmpst = asInt(asInt(barcode.charAt(10 + shift)) + 7);
        if (tmpst > 11) {
          tmpst = asInt(tmpst - 10);
        }
        var tmpst2 = asInt(asInt(barcode.charAt(9 + shift)) + 5 % 10);
        if (tmpst2 >= 10) {
          tmpst2 = asInt(tmpst2 - 10);
        }
        this.barcode_data.st = asInt(tmpst.toString() + tmpst2.toString());

        //DF
        var tmpdf = asInt(asInt(barcode.charAt(9 + shift)) + 7);
        if (tmpdf >= 10) {
          tmpdf = asInt(tmpdf - 10);
        }
        var tmpdf2 = asInt(asInt(barcode.charAt(8 + shift)) + 7);
        if (tmpdf2 >= 10) {
          tmpdf2 = asInt(tmpdf2 - 10);
        }
        this.barcode_data.df = asInt(tmpdf.toString() + tmpdf2.toString());

        //Speed
        this.barcode_data.speed = asInt(barcode.charAt(10));

        //job
        this.barcode_data.job = asInt(barcode.charAt(5));

        //PP
        this.barcode_data.pp = 5;

        //MP
        if (this.barcode_data.job >= 6) {
          this.barcode_data.mp = 10;
        } else {
          this.barcode_data.mp = 0;
        }

        //STアイテム
      } else if (this.barcode_data.race >= 5 && this.barcode_data.race <= 6) {
        if (asInt(barcode.charAt(10)) >= 5 && asInt(barcode.charAt(10)) <= 8) {
          this.barcode_data.st = asInt("1" + ((asInt(barcode.charAt(9)) + 5) % 10).toString());
        } else if (asInt(barcode.charAt(10)) == 3 || asInt(barcode.charAt(10)) == 4) {
          this.barcode_data.st = asInt("3" + ((asInt(barcode.charAt(9)) + 5) % 10).toString());
        } else {
          this.barcode_data.st = asInt("2" + ((asInt(barcode.charAt(9)) + 5) % 10).toString());
        }

        //DFアイテム
      } else if (this.barcode_data.race >= 7 && this.barcode_data.race <= 8) {
        if (asInt(barcode.charAt(9)) >= 3 && asInt(barcode.charAt(9)) <= 6) {
          this.barcode_data.df = (asInt(barcode.charAt(8)) + 7) % 10;
        } else if (asInt(barcode.charAt(9)) == 1 || asInt(barcode.charAt(9)) == 2) {
          this.barcode_data.df = asInt("2" + ((asInt(barcode.charAt(8)) + 7) % 10).toString());
        } else {
          this.barcode_data.df = asInt("1" + ((asInt(barcode.charAt(8)) + 7) % 10).toString());
        }
        //HPアイテム
      } else {
        //HPアイテムの種類判別用
        this.barcode_data.job = 0;
        this.barcode_data.hp = asInt(Math.floor(asInt(barcode.charAt(11)) / 8).toString() + barcode.charAt(10) + barcode.charAt(9));
      }

      //特殊能力
      var tmpspecial = asInt(asInt(barcode.charAt(8)));
      if (tmpspecial >= 0 && tmpspecial <= 3) {
        this.barcode_data.special = asInt(barcode.charAt(10));
      } else if (tmpspecial >= 8 && tmpspecial <= 9) {
        this.barcode_data.special = asInt("2" + barcode.charAt(10));
      } else {
        this.barcode_data.special = asInt("1" + barcode.charAt(10));
      }

      //8桁
    } else {
      //先頭へのズレの場合
      if (shift == +2) {
        shift = asInt(-3);
      }

      //種族取得
      this.barcode_data.race = asInt(barcode.charAt(7));

      //キャラクター
      if (asInt(this.barcode_data.race) >= 0 && asInt(this.barcode_data.race) <= 4) {
        //HP
        this.barcode_data.hp = asInt(Math.floor(asInt(barcode.charAt(6 + shift)) / 2).toString() + barcode.charAt(5 + shift) + barcode.charAt(4 + shift));

        //ST
        tmpst = asInt(asInt(barcode.charAt(5 + shift)) + 7);
        if (tmpst > 11) {
          tmpst = asInt(tmpst - 10);
        }
        tmpst2 = asInt(asInt(barcode.charAt(4 + shift)) + 5 % 10);
        if (tmpst2 >= 10) {
          tmpst2 = asInt(tmpst2 - 10);
        }
        this.barcode_data.st = asInt(tmpst.toString() + tmpst2.toString());

        //DF
        tmpdf = asInt(asInt(barcode.charAt(4 + shift)) + 7);
        if (tmpdf >= 10) {
          tmpdf = asInt(tmpdf - 10);
        }
        tmpdf2 = asInt(asInt(barcode.charAt(3 + shift)) + 7);
        if (tmpdf2 >= 10) {
          tmpdf2 = asInt(tmpdf2 - 10);
        }
        this.barcode_data.df = asInt(tmpdf.toString() + tmpdf2.toString());

        //Speed
        this.barcode_data.speed = asInt(barcode.charAt(5));

        //job
        this.barcode_data.job = 4;

        //PP
        this.barcode_data.pp = 5;

        //MP
        this.barcode_data.mp = 0;

        //STアイテム
      } else if (this.barcode_data.race >= 5 && this.barcode_data.race <= 6) {
        if (asInt(barcode.charAt(5)) >= 5 && asInt(barcode.charAt(5)) <= 8) {
          this.barcode_data.st = asInt("1" + ((asInt(barcode.charAt(4)) + 5) % 10).toString());
        } else if (asInt(barcode.charAt(5)) == 3 || asInt(barcode.charAt(5)) == 4) {
          this.barcode_data.st = asInt("3" + ((asInt(barcode.charAt(4)) + 5) % 10).toString());
        } else {
          this.barcode_data.st = asInt("2" + ((asInt(barcode.charAt(4)) + 5) % 10).toString());
        }

        //DFアイテム
      } else if (this.barcode_data.race >= 7 && this.barcode_data.race <= 8) {
        if (asInt(barcode.charAt(4)) >= 3 && asInt(barcode.charAt(4)) <= 6) {
          this.barcode_data.df = asInt((asInt(barcode.charAt(3)) + 7) % 10);
        } else if (asInt(barcode.charAt(4)) == 1 || asInt(barcode.charAt(4)) == 2) {
          this.barcode_data.df = asInt("2" + ((asInt(barcode.charAt(3)) + 7) % 10).toString());
        } else {
          this.barcode_data.df = asInt("1" + ((asInt(barcode.charAt(3)) + 7) % 10).toString());
        }
        //HPアイテム
      } else {
        //HPアイテムの種類判別用
        this.barcode_data.job = 0;
        this.barcode_data.hp = asInt(Math.floor(asInt(barcode.charAt(6)) / 8) + barcode.charAt(5) + barcode.charAt(4));
      }

      //特殊能力
      tmpspecial = asInt(asInt(barcode.charAt(3)));
      if (tmpspecial >= 0 && tmpspecial <= 3) {
        this.barcode_data.special = asInt(barcode.charAt(5));
      } else if (tmpspecial >= 8 && tmpspecial <= 9) {
        this.barcode_data.special = asInt("2" + barcode.charAt(5));
      } else {
        this.barcode_data.special = asInt("1" + barcode.charAt(5));
      }
    }
  }
}
