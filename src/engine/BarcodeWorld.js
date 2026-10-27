// Generated from finalfighter/BarcodeBattler2-Simulator @ 3211674. See vendor/reference.
import { asInt } from './runtime.js';
import { NES } from './NES.js';
export class BarcodeWorld {
  nes = null;
  constructor() {
    if (!this.nes) {
      this.nes = new NES();
    }
  }

  //$18*$1C={$25$24}
  dadf(object) {
    //参照渡し用にObject使用
    var m0018 = asInt(object.m0018);
    var m001C = asInt(object.m001C);
    var m0000 = asInt(0);
    var m0024 = asInt(0);
    var m0025 = asInt(0);
    this.nes.ZeroFlag = 0;
    this.nes.CarryFlag = 0;
    while (true) {
      //dae7:
      m0018 = asInt(this.nes.lsr(m0018));
      try {
        if (this.nes.CarryFlag == 0) {
          //goto daf8;
          throw new Error("daf8");
        }
        this.nes.clc();
        m0024 = asInt(this.nes.adc(m001C, m0024));
        m0025 = asInt(this.nes.adc(m0000, m0025));
      } catch (e) {}

      //daf8:
      m001C = asInt(this.nes.asl(m001C));
      m0000 = asInt(this.nes.rol(m0000));
      if (m0018 != 0) {
        //goto dae7;
      } else {
        break;
      }
    }
    object.m0024 = m0024;
    object.m0025 = m0025;
  }

  //{$19$18}/{$1D$1C}={$25$24}
  dbcd(object) {
    var m0018 = asInt(object.m0018);
    var m0019 = asInt(object.m0019);
    var m001C = asInt(object.m001C);
    var m001D = asInt(object.m001D);
    var m0024 = asInt(0);
    var m0025 = asInt(0);
    var m002C = asInt(0);
    var m002D = asInt(0);
    var RegisterX = asInt(0x10);
    while (true) {
      //dbd9:
      m0024 = asInt(this.nes.asl(m0024));
      m0025 = asInt(this.nes.rol(m0025));
      m0018 = asInt(this.nes.asl(m0018));
      m0019 = asInt(this.nes.rol(m0019));
      m002C = asInt(this.nes.rol(m002C));
      m002D = asInt(this.nes.rol(m002D));
      try {
        this.nes.cmp(m002D, m001D);
        if (this.nes.bcc()) {
          //goto dc05;
          throw new Error("dc05");
        }
        try {
          if (this.nes.bne()) {
            throw new Error("dbf3");
          }
          this.nes.cmp(m002C, m001C);
          if (this.nes.bcc()) {
            throw new Error("dc05");
          }
        } catch (e) {
          if (e.message != "dbf3") {
            throw e;
          }
        }

        //daf3:
        m002C = asInt(this.nes.sbc(m002C, m001C));
        m002D = asInt(this.nes.sbc(m002D, m001D));
        m0024 = asInt(this.nes.inc(m0024));
        if (this.nes.bne()) {
          throw new Error("dc05");
        }
        m0025 = asInt(this.nes.inc(m0025));
      } catch (e) {}

      //dc05:
      RegisterX = asInt(RegisterX - 1);
      if (RegisterX != 0) {
        //goto dbd9;
      } else {
        break;
      }
    }
    object.m0024 = m0024;
    object.m0025 = m0025;
  }

  //{$19$18}*{$1D$1C}={$27$26$25$24}
  db01(object) {
    var m0018 = asInt(object.m0018);
    var m0019 = asInt(object.m0019);
    var m001C = asInt(object.m001C);
    var m001D = asInt(object.m001D);
    var m0000 = asInt(0);
    var m0001 = asInt(0);
    var m0024 = asInt(0);
    var m0025 = asInt(0);
    var m0026 = asInt(0);
    var m0027 = asInt(0);
    this.nes.ZeroFlag = 0;
    this.nes.CarryFlag = 0;

    //db0f:
    while (true) {
      m0019 = asInt(this.nes.lsr(m0019));
      m0018 = asInt(this.nes.ror(m0018));
      try {
        if (this.nes.bcc()) {
          throw new Error("db2e");
        }
        this.nes.clc();
        m0024 = asInt(this.nes.adc(m001C, m0024));
        m0025 = asInt(this.nes.adc(m001D, m0025));
        m0026 = asInt(this.nes.adc(m0000, m0026));
        m0027 = asInt(this.nes.adc(m0001, m0027));
      } catch (e) {}

      //db2e:
      m001C = asInt(this.nes.asl(m001C));
      m001D = asInt(this.nes.rol(m001D));
      m0000 = asInt(this.nes.rol(m0000));
      m0001 = asInt(this.nes.rol(m0001));
      m0018 = asInt(this.nes.ora(m0018, m0019));
      if (m0018 != 0) {
        //goto db0f;
      } else {
        break;
      }
    }
    object.m0024 = m0024;
    object.m0025 = m0025;
    object.m0026 = m0026;
    object.m0027 = m0027;
  }

  //{$19$18}*$1C/0A={$19$18}
  f_8bdf(object) {
    var m0018 = asInt(object.m0018);
    var m0019 = asInt(object.m0019);
    var m001A = asInt(0);
    var m001B = asInt(0);
    var m001C = asInt(object.m001C);
    var m001D = asInt(0);
    var m001E = asInt(0);
    var m001F = asInt(0);
    var input = new Object();
    input.m0018 = m0018;
    input.m0019 = m0019;
    input.m001C = m001C;
    input.m001D = m001D;
    input.m0024 = 0;
    input.m0025 = 0;
    input.m0026 = 0;
    input.m0027 = 0;
    this.db01(input);
    m0018 = asInt(input.m0024);
    m0019 = asInt(input.m0025);
    m001A = asInt(input.m0026);
    m001B = asInt(input.m0027);
    m001C = asInt(0x0A);
    m001D = asInt(0);
    m001E = asInt(0);
    m001F = asInt(0);
    input = new Object();
    input.m0018 = m0018;
    input.m0019 = m0019;
    input.m001A = m001A;
    input.m001B = m001B;
    input.m001C = m001C;
    input.m001D = m001D;
    input.m001E = m001E;
    input.m001F = m001F;
    input.m0024 = 0;
    input.m0025 = 0;
    input.m0026 = 0;
    input.m0027 = 0;
    this.dc09(input);

    //8C13(999より大きかった判定)
    this.nes.cmp(input.m0025, 0x03);
    if (!this.nes.bcc()) {
      if (this.nes.bne()) {
        input.m0025 = 0x03;
        input.m0024 = 0xE7;
      } else {
        this.nes.cmp(input.m0024, 0xE7);
        if (!this.nes.bcc()) {
          input.m0025 = 0x03;
          input.m0024 = 0xE7;
        }
      }
    }
    object.m0018 = input.m0024;
    object.m0019 = input.m0025;
  }

  //{$1B$1A$19$18}/{$1F$1E$1D1C}={$27$26$25$24}
  dc09(object) {
    var m0018 = asInt(object.m0018);
    var m0019 = asInt(object.m0019);
    var m001A = asInt(object.m001A);
    var m001B = asInt(object.m001B);
    var m001C = asInt(object.m001C);
    var m001D = asInt(object.m001D);
    var m001E = asInt(object.m001E);
    var m001F = asInt(object.m001F);
    var m0024 = asInt(0);
    var m0025 = asInt(0);
    var m0026 = asInt(0);
    var m0027 = asInt(0);
    var m002C = asInt(0);
    var m002D = asInt(0);
    var m002E = asInt(0);
    var m002F = asInt(0);
    var RegisterX = asInt(0x20);

    //dc1d:
    while (true) {
      m0024 = asInt(this.nes.asl(m0024));
      m0025 = asInt(this.nes.rol(m0025));
      m0026 = asInt(this.nes.rol(m0026));
      m0027 = asInt(this.nes.rol(m0027));
      m0018 = asInt(this.nes.asl(m0018));
      m0019 = asInt(this.nes.rol(m0019));
      m001A = asInt(this.nes.rol(m001A));
      m001B = asInt(this.nes.rol(m001B));
      m002C = asInt(this.nes.rol(m002C));
      m002D = asInt(this.nes.rol(m002D));
      m002E = asInt(this.nes.rol(m002E));
      m002F = asInt(this.nes.rol(m002F));
      try {
        try {
          this.nes.cmp(m002F, m001F);
          if (this.nes.bcc()) {
            throw new Error("dc79");
          }
          if (this.nes.bne()) {
            throw new Error("dc53");
          }
          this.nes.cmp(m002E, m001E);
          if (this.nes.bcc()) {
            throw new Error("dc79");
          }
          if (this.nes.bne()) {
            throw new Error("dc53");
          }
          this.nes.cmp(m002D, m001D);
          if (this.nes.bcc()) {
            throw new Error("dc79");
          }
          if (this.nes.bne()) {
            throw new Error("dc53");
          }
          this.nes.cmp(m002C, m001C);
          if (this.nes.bcc()) {
            throw new Error("dc79");
          }
        } catch (e) {
          if (e.message != "dc53") {
            throw e;
          }
        }

        //dc53:
        m002C = asInt(this.nes.sbc(m002C, m001C));
        m002D = asInt(this.nes.sbc(m002D, m001D));
        m002E = asInt(this.nes.sbc(m002E, m001E));
        m002F = asInt(this.nes.sbc(m002F, m001F));
        m0024 = asInt(this.nes.inc(m0024));
        if (this.nes.bne()) {
          throw new Error("dc79");
        }
        m0025 = asInt(this.nes.inc(m0025));
        if (this.nes.bne()) {
          throw new Error("dc79");
        }
        m0026 = asInt(this.nes.inc(m0026));
        if (this.nes.bne()) {
          throw new Error("dc79");
        }
        m0027 = asInt(this.nes.inc(m0027));
      } catch (e) {}

      //dc79:
      RegisterX = asInt(RegisterX - 1);
      if (RegisterX <= 0) {
        break;
      }
      //goto dc1d:
    }
    object.m0024 = m0024;
    object.m0025 = m0025;
    object.m0026 = m0026;
    object.m0027 = m0027;
  }
}
