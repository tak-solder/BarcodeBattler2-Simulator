import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
]);
hints.set(DecodeHintType.TRY_HARDER, true);
export async function openScanner(onCode: (code: string) => void) {
  const dialog = document.createElement("dialog");
  dialog.className = "scanner-dialog";
  dialog.innerHTML = `<div class="dialog-head"><div><span class="eyebrow">BARCODE READER</span><h2>バーコードを読み取る</h2></div><button class="icon-btn close" aria-label="閉じる">×</button></div><div class="camera-view"><video muted autoplay playsinline></video><div class="scan-target"></div></div><p class="camera-message" role="status">カメラを起動しています…</p><p class="muted">バーコード全体を枠内に入れ、少し離してピントを合わせてください。</p><label class="button secondary photo">写真から読み取る<input type="file" accept="image/*" capture="environment" hidden></label>`;
  document.body.append(dialog);
  dialog.showModal();
  let controls: { stop: () => void } | undefined,
    stopped = false;
  const reader = new BrowserMultiFormatReader(hints);
  const video = dialog.querySelector("video")!;
  const msg = dialog.querySelector(".camera-message")!;
  const close = () => {
    stopped = true;
    controls?.stop();
    (video.srcObject as MediaStream | null)
      ?.getTracks()
      .forEach((t) => t.stop());
    dialog.close();
    dialog.remove();
  };
  const accept = (code: string) => {
    if (stopped) return;
    close();
    onCode(code.length === 12 ? "0" + code : code);
  };
  dialog.querySelector(".close")!.addEventListener("click", close);
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  dialog.querySelector("input")!.addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      accept((await reader.decodeFromImageUrl(url)).getText());
    } catch {
      msg.textContent =
        "読み取れませんでした。明るい場所で鮮明な写真をお試しください。";
    } finally {
      URL.revokeObjectURL(url);
    }
  });
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
    const c = await reader.decodeFromConstraints(
      {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      video,
      (result) => {
        if (result) accept(result.getText());
      },
    );
    controls = c;
    if (stopped) c.stop();
    else msg.textContent = "読み取り中 — EAN-13 / EAN-8 / UPC-A";
  } catch {
    if (!stopped)
      msg.textContent =
        "カメラを利用できません。HTTPSで開き、カメラの許可をご確認ください。写真・手入力も利用できます。";
  }
}
