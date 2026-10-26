// Generated from finalfighter/BarcodeBattler2-Simulator @ 3211674. See vendor/reference.
import { asInt } from './runtime.js';

export class C2PassCode {
  //戦士
  barcode_data1 = null;

  //魔法使い
  barcode_data2 = null;

  //チェックデジット
  unioncheckdigit = 0;

  //入力したパスコード
  passcode = null;
  init(bd1, bd2, pc = null) {
    this.barcode_data1 = bd1;
    this.barcode_data2 = bd2;
    this.passcode = pc;
    this.unioncheckdigit = asInt(this.barcode_data1.barcode.charAt(12)) + asInt(this.barcode_data2.barcode.charAt(12));
    if (this.unioncheckdigit >= 10) {
      this.unioncheckdigit = this.unioncheckdigit - 10;
    }
  }
  generate_passcode_from_passcode_number(passcode_number) {
    passcode_number = asInt(asInt(passcode_number));
    //10の位
    var numten = asInt(asInt(passcode_number / 10));
    //1の位
    var numone = asInt(passcode_number - numten * 10);

    //チェックデジット
    //0011223344
    var passcode_checkdigit = new Array(0, 0, 1, 1, 2, 2, 3, 3, 4, 4);
    var checkdigit_key = asInt(asInt(numten) + asInt(numone));
    if (checkdigit_key >= 10) {
      checkdigit_key = asInt(checkdigit_key - 10);
    }
    var checkdigit = asInt(this.unioncheckdigit + passcode_checkdigit[checkdigit_key]);
    if (checkdigit >= 10) {
      checkdigit = asInt(checkdigit - 10);
    }
    return numten.toString() + numten.toString() + numone.toString() + numone.toString() + checkdigit.toString();
  }

  //パスコードを生成して返す
  generate_passcode(special) {
    special = asInt(asInt(special));
    var array = new Array(5, 10, 15, 20, 25, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49);
    var passcode_number = asInt(array[special - 80]);
    return this.generate_passcode_from_passcode_number(passcode_number);
  }

  //パスコード番号を返す。パスコードが間違っていた場合は-1を返す
  generate_passcode_number() {
    if (this.passcode.charAt(0) != this.passcode.charAt(1)) {
      return asInt(-1);
    }
    if (this.passcode.charAt(2) != this.passcode.charAt(3)) {
      return asInt(-1);
    }
    var passcode_number = asInt(asInt(this.passcode.charAt(0)) * 10 + asInt(this.passcode.charAt(2)));

    //0011223344
    var passcode_checkdigit = new Array(0, 0, 1, 1, 2, 2, 3, 3, 4, 4);
    var checkdigit_key = asInt(asInt(this.passcode.charAt(0)) + asInt(this.passcode.charAt(2)));
    if (checkdigit_key >= 10) {
      checkdigit_key = asInt(checkdigit_key - 10);
    }
    var checkdigit = asInt(this.unioncheckdigit + passcode_checkdigit[checkdigit_key]);
    if (checkdigit >= 10) {
      checkdigit = asInt(checkdigit - 10);
    }
    if (asInt(this.passcode.charAt(4)) != checkdigit) {
      return asInt(-1);
    }
    return asInt(passcode_number);
  }
  generate_passcode_barcode_data(bd, passcode_number) {
    passcode_number = asInt(asInt(passcode_number));
    bd.hp = this.calchp(bd.hp, passcode_number - 1);
    bd.st = this.calcst(bd.st, passcode_number - 1);
    ;
    bd.df = this.calcdf(bd.df, passcode_number - 1);
    return bd;
  }
  calchp(hp, passcode_number) {
    hp = asInt(asInt(hp));
    passcode_number = asInt(asInt(passcode_number));
    if (passcode_number == -1) {
      return asInt(hp);
    }
    var floorhp = asInt(Math.floor(hp * passcode_number / 10));
    var count = asInt(0);
    while (floorhp > 655) {
      count = asInt(1);
      floorhp = asInt(floorhp - 655);
    }
    var floorceilhp = asInt(Math.floor(passcode_number / 2) * Math.ceil(passcode_number / 2));
    while (floorceilhp > 655) {
      count = asInt(1);
      floorceilhp = asInt(floorceilhp - 655);
    }
    var calchp = asInt(hp + floorhp + floorceilhp);
    if (calchp > 999) {
      calchp = asInt(999);
    } else {
      calchp = asInt(calchp - count);
    }
    if (passcode_number >= 90 && passcode_number % 2 == 0) {
      calchp = asInt(calchp - 1);
    }
    return asInt(calchp);
  }
  calcst(st, passcode_number) {
    st = asInt(asInt(st));
    passcode_number = asInt(asInt(passcode_number));
    if (passcode_number == -1) {
      return asInt(st);
    }
    var array = new Array(0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 4, 4, 5, 6, 7, 9, 10, 11, 12, 14, 16, 17, 19, 21, 23, 25, 27, 29, 31, 33, 36, 38, 40, 43, 46, 49, 51, 54, 57, 60, 64, 67, 70, 73, 77, 81, 84, 88, 92, 96, 100, 104, 108, 112, 116, 121, 125, 129, 134, 139, 144, 148, 153, 158, 163, 169, 174, 179, 184, 190, 196);
    if (array[passcode_number] === null) {
      return asInt(199);
    }
    var calcst = asInt(asInt(st) + Math.floor(st * passcode_number / 9) + array[passcode_number]);
    if (calcst > 199) {
      return asInt(199);
    }
    return asInt(calcst);
  }
  calcdf(df, passcode_number) {
    df = asInt(asInt(df));
    passcode_number = asInt(asInt(passcode_number));
    if (passcode_number == -1) {
      return asInt(df);
    }
    var array = new Array(0, 0, 0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 31, 33, 36, 39, 42, 45, 48, 51, 54, 57, 61, 64, 68, 72, 76, 80, 84, 88, 92, 96, 101, 105, 110, 115, 120, 125, 130, 135, 140, 145, 151, 156, 162, 168, 174, 180, 186, 192, 198);
    if (!array[passcode_number] === null) {
      return asInt(199);
    }
    var calcdf = asInt(asInt(df) + Math.floor(df * passcode_number / 12) + array[passcode_number]);
    if (calcdf > 199) {
      return asInt(199);
    }
    return asInt(calcdf);
  }
}
