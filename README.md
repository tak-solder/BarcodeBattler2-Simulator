# Barcode Battler II — Web Simulator

finalfighter氏の [BarcodeBattler2-Simulator](https://github.com/finalfighter/BarcodeBattler2-Simulator) を基にした、日本語のブラウザ用シミュレータです。Cloudflare Workers + Workers Static Assetsで配信し、D1とR2を永続化に使います。依頼文の「D2」はCloudflare D1として実装しています。

## 実装内容

- 本体を意識した青緑の筐体・LCD表示。タッチ操作、キーボード操作、スマートフォンの画面幅に対応。
- カメラ、写真、手入力。EAN-13 / EAN-8 / UPC-AをZXingで読み取り、チェックデジットを検証。UPC-Aは先頭0を補完。
- C0：同じ端末での2人対戦。2枚合体、装備、通常／シフト読み、通常攻撃、回復、薬草1〜3個、F0〜F9魔法。
- C1：戦士と魔法使い、6ステージの内蔵敵データ、ワールド選択、鍵、L-H解放、報酬、クリアパスコード、E-1パワーアップ／ステージジャンプパスコード、交代、逃走、セーブ／ロード。
- C2：2人の主人公、敵カード読取、戦闘前アイテム、報酬、パスコードでの開始、交代、逃走、セーブ／ロード。
- オンライン：49コード限定と無差別のシステム2部屋。非同期の王者防衛戦。新しい挑戦者は王者の登録コードと対戦し、勝者が残ります。両者のHPは毎回初期値に戻ります。
- 商品名・サムネイルの解決を試行。Open Food Factsと任意のYahoo!ショッピングAPI。未解決でも戦闘可能。挑戦者・防衛者の両方を表示。
- D1：匿名プレイヤー、部屋レギュレーション、王者、連勝、対戦概要、商品キャッシュ、冒険セーブ。
- R2：サーバーで計算した全ターンのリプレイJSONと、取得できた商品サムネイル。
- サーバー側計算、暗号学的乱数からのシード生成、セッションCookie、同一オリジン検証、レート制限、競合を防ぐD1の条件付き更新。

## 再現性の範囲

参照コミットは **`3211674dede14b5ecc334fd5934e5de7728cf19d`**。能力値変換、合体計算、戦闘計算、6502風演算、C1敵データ、C2パスコードの9クラスをAS3から移植しています。移植元を `vendor/reference/`、生成物を `src/engine/`、再生成処理を `scripts/port-engine.mjs` に収録しています。

**実機ROMを実行するエミュレータではありません。実機との全ケース一致は未検証です。** 参照元の算術上の癖も互換性のため保持しています。例えば `NES.adc(255, 1)` は通常の6502とは異なり1を返します。これを独自に「修正」して別の計算にしない方針です。乱数は再現可能なシード方式に差し替え、タイミング打法は参照元同様の確率処理です。

モードの進行処理はWeb向けに再実装しています。フレーム単位の演出、実機と同じ乱数列、戦闘中のカード追加、情報カード専用演出、死亡した味方を蘇生する操作は未実装です。C1の鍵の手がかりは画面に常時表示します。交代時は残ったHP・MP・PPを使って戦闘計算を再開します。これらを含む実機全機能の完全再現を保証する版ではありません。

オンラインは独自の非同期勝ち抜きルールで、双方が通常攻撃を交互に実行します。C0の手動コマンドとは異なります。上限1000ターンは引き分けとし、王者は残り連勝を加算しません。初代エントリーは1勝として表示します。

## ローカル起動

Node.js 24 LTS以降を推奨します。

```sh
npm ci
npm run db:local
npm run build
npm run dev
```

Wranglerの表示するURL（通常 `http://localhost:8787`）を開きます。D1/R2のローカルデータは `.wrangler/` に保存されます。フロントエンドを変更したら `npm run build` で静的アセットを再生成してください。

カメラはHTTPSまたはlocalhostで動作します。スマートフォンから平文HTTPのLAN IPで開いた場合はカメラを使えません。写真読取・手入力を使うかCloudflareへデプロイしてください。

サーバー接続がない場合もC0/C1/C2の計算とブラウザ内のセーブは動作します。オンライン対戦とD1のセーブはWorker経由です。匿名セッションを使うため、Cookie削除・別ブラウザでは同じクラウドセーブにアクセスできません。

## Cloudflareへのデプロイ

このソースはまだCloudflare本番環境へ公開していません。実行環境にCloudflareのアカウント認証がないため、ローカルD1/R2とWorkerのdry-runで検証しています。

1. CloudflareアカウントでWranglerにログインします。

   ```sh
   npx wrangler login
   ```

   CIではCloudflare側で管理した `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を使用できます。値はソースに保存しないでください。

2. D1とR2を作成します。

   ```sh
   npx wrangler d1 create barcode-battler-ii
   npx wrangler r2 bucket create barcode-battler-ii
   ```

3. `wrangler.jsonc` の `d1_databases[0].database_id` を、作成結果の実際のIDに置き換えます。名前を変更した場合は `database_name` と `bucket_name` も合わせます。現在のIDはローカル検証用の仮IDです。

4. 必要なら国内商品解決用のYahoo!ショッピングのアプリケーションIDを登録します。

   ```sh
   npx wrangler secret put YAHOO_APP_ID
   ```

   未設定でもOpen Food Factsで検索します。国内の一般商品を広く解決するにはYahoo!側のAPI利用登録が必要です。ローカルでは `.dev.vars` に `YAHOO_APP_ID=...` を設定できます。このファイルはGit対象外です。

5. 本番DBを初期化して公開します。

   ```sh
   npm run db:remote
   npm run deploy
   ```

   `predeploy` が仮のdatabase_idのままの公開を止めます。Wranglerが返す `https://barcode-battler-ii.<subdomain>.workers.dev` が公開URLです。独自ドメインはCloudflare側から追加できます。

Workers Assets、D1、R2の名前は各アカウント内のリソースです。`dist/` はクライアントのみで、Worker・D1の認証情報やYahooのIDは含みません。

## 検証

```sh
npm run check
```

型検査（ブラウザとWorkerを別設定）、25件の回帰テスト、本番ビルド、Workerのdry-runを実行します。D1/R2の本番リソースは変更しません。

```sh
npx playwright install chromium
npm run test:e2e
```

ブラウザテストはローカルWorkerを自動起動し、D1マイグレーションを適用します。C0の攻撃、C1のセーブとロード、C2の敵読取と交代、49レギュレーション、同時挑戦の競合、R2リプレイ、カメラ拒否後の写真読取、モバイルの横幅を検証します。ローカルにテスト用プレイヤーと対戦履歴を作成します。既存ローカルサーバーがあれば再利用します。

システムのChromiumを使う場合：

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

`npm run port` でAS3から計算層を再生成できます。型検査と回帰テストも再実行してください。

## レギュレーションと将来の部屋拡張

初期マイグレーションは2部屋だけを作ります。49限定は「49で始まる有効な8桁・13桁コード」を意味し、2枚目にも適用します。45コードは含みません。製造国の証明をする意味の「国内」判定ではありません。

`rooms.rules_json` の形式：

```json
{"version":1,"prefixes":["49"],"lengths":[8,13],"support":true,"shift":false}
```

無差別は `prefixes: []`。部屋定義はDB駆動で、`owner_id` と `system` を既に分離しています。新しいルールを追加する場合は `src/server/rules.ts` でサーバー側検証を追加します。現版にはユーザーによる部屋作成・編集APIを公開していません。将来はアカウント認証、所有権チェック、作成上限と管理UIを加えて拡張できます。

同時挑戦は部屋の `version` を条件に、対戦履歴の追加と王者更新をD1の同一バッチで確定します。競合した挑戦は409を返し、その候補リプレイを削除します。通信障害でR2に孤立ファイルが残る可能性はありますが、D1に履歴のないファイルは公開APIから取得できません。

## 商品情報

- 優先：Yahoo!ショッピング（`YAHOO_APP_ID` 設定時）、フォールバック：Open Food Facts。
- 取得成功は7日、未解決は1日D1でキャッシュします。名前と画像が両方取得できる保証はありません。
- 固定APIエンドポイントのみを呼び、画像は許可したHTTPSホストから最大2MiB、JPEG/PNG/WebPのみを保存します。任意URLを指定するAPIはありません。
- 商品情報取得が失敗しても、数値能力の計算や対戦を継続します。
- 外部サービスへの実接続と国内商品の網羅性は、この環境では検証できていません。Yahoo!の認証情報は未提供です。読取・対戦・保存経路はローカルで検証済みです。
- Open Food Facts由来の情報には画面で出典を表示します。データの利用条件は [Open Food Facts](https://world.openfoodfacts.org/terms-of-use) を参照してください。Yahoo!側も利用規約に従って運用してください。

## 構成

```text
src/engine/       共有の計算層・対戦進行・冒険状態
src/client/       日本語UI・カメラ・参照カード番号
src/server/       Worker API・レギュレーション・商品解決
migrations/      D1初期テーブルとシステム2部屋
vendor/reference/ 移植元のAS3ソースとREADME
scripts/         移植の再生成・公開設定チェック
tests/           計算とルールの回帰テスト
e2e/             Playwrightでの操作・API検証
```

## 依存関係

作成日の2026-10-26にnpmの `latest` で取得し、`npm outdated` で更新なしを確認しました。`package.json` は正確な版、`package-lock.json` はその依存ツリーを固定しています。将来の最新版を永続的に保証する意味ではありません。

主な版：TypeScript 7.0.2 / Vite 8.3.5 / Wrangler 4.152.0 / @zxing/browser 0.2.1 / @zxing/library 0.23.0。バーコードデコーダは必要になった時に遅延ロードします。

## 出典

参照元READMEはMITライセンスと宣言しています。元ソース・元READMEと著者帰属を同梱しています。詳細は `THIRD_PARTY_NOTICES.md`。本体の画像・音声・カードのスキャン画像は使用せず、UIとピクセル図形は新規作成しました。このプロジェクトは非公式・非提携です。
