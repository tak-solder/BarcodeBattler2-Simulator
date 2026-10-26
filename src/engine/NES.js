// Generated from finalfighter/BarcodeBattler2-Simulator @ 3211674. See vendor/reference.
import { asInt } from './runtime.js';

export class NES {
  CarryFlag = 0;
  ZeroFlag = 0;
  clc() {
    this.CarryFlag = 0;
  }
  sec() {
    this.CarryFlag = 1;
  }
  inc(num) {
    num = asInt(asInt(num));
    num = asInt(num + 1);
    if (num > 255) {
      num = asInt(num - 255);
      this.CarryFlag = 1;
    } else {
      this.CarryFlag = 0;
    }
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    return asInt(num);
  }
  cmp(num, num2) {
    num = asInt(asInt(num));
    num2 = asInt(asInt(num2));
    num = asInt(num - num2);
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    if (num < 0) {
      this.CarryFlag = 0;
    } else {
      this.CarryFlag = 1;
    }
  }
  bcc() {
    if (this.CarryFlag == 0) {
      return true;
    }
    return false;
  }
  bcs() {
    if (this.CarryFlag == 1) {
      return true;
    } else {
      return false;
    }
  }
  bne() {
    if (this.ZeroFlag == 0) {
      return true;
    }
    return false;
  }
  adc(num, num2) {
    num = asInt(asInt(num));
    num2 = asInt(asInt(num2));
    num = asInt(num + num2 + this.CarryFlag);
    if (num > 255) {
      num = asInt(num - 255);
      this.CarryFlag = 1;
    } else {
      this.CarryFlag = 0;
    }
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    return asInt(num);
  }
  sbc(num, num2) {
    num = asInt(asInt(num));
    num2 = asInt(asInt(num2));
    var UnCarryFlag = asInt(this.CarryFlag ? 0 : 1);
    num = asInt(num - num2 - UnCarryFlag);
    if (num >= 0) {
      this.CarryFlag = 1;
    } else {
      num = asInt(num + 255);
      this.CarryFlag = 0;
    }
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    return asInt(num);
  }

  //8桁の2進数算出
  decbin8(num) {
    num = asInt(asInt(num));
    var bin8 = num.toString(2);
    while (bin8.length < 8) {
      bin8 = "0" + bin8;
    }
    return bin8;
  }

  //算術右シフト
  lsr(num) {
    num = asInt(asInt(num));
    var bin8 = this.decbin8(num);
    if (asInt(bin8.charAt(7)) == 1) {
      this.CarryFlag = 1;
    } else {
      this.CarryFlag = 0;
    }
    bin8 = "0" + bin8.substr(0, 7);
    num = asInt(parseInt(bin8, 2));
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    return asInt(num);
  }

  //算術左シフト
  asl(num) {
    num = asInt(asInt(num));
    var bin8 = this.decbin8(num);
    if (asInt(bin8.charAt(0)) == 1) {
      this.CarryFlag = 1;
    } else {
      this.CarryFlag = 0;
    }
    bin8 = bin8.substr(1, 7) + "0";
    num = asInt(parseInt(bin8, 2));
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    return asInt(num);
  }

  //左ローテート
  rol(num) {
    num = asInt(asInt(num));
    var bin8 = this.decbin8(num);
    bin8 = bin8.substr(1, 7) + this.CarryFlag.toString();
    if (asInt(this.decbin8(num).charAt(0)) == 1) {
      this.CarryFlag = 1;
    } else {
      this.CarryFlag = 0;
    }
    num = asInt(parseInt(bin8, 2));
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    return asInt(num);
  }
  ror(num) {
    num = asInt(asInt(num));
    var bin8 = this.decbin8(num);
    bin8 = this.CarryFlag.toString() + bin8.substr(0, 7);
    if (asInt(this.decbin8(num).substr(7, 1)) == 1) {
      this.CarryFlag = 1;
    } else {
      this.CarryFlag = 0;
    }
    num = asInt(parseInt(bin8, 2));
    if (num == 0) {
      this.ZeroFlag = 1;
    } else {
      this.ZeroFlag = 0;
    }
    return asInt(num);
  }
  ora(num, num2) {
    num = asInt(asInt(num));
    num2 = asInt(asInt(num2));
    return asInt(asInt(num | num2));
  }
}
