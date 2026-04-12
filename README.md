# apod-app

NASA の [Astronomy Picture of the Day (APOD)](https://api.nasa.gov/) を表示し、説明文を日本語に翻訳して読めるシンプルな Web アプリです。単一の `index.html` で動作します。

## できること

- **当日の APOD 画像**（利用可能なら HD）を表示
- **説明文の日本語表示**（Google Gemini API による翻訳）
- **画像の保存**（端末のダウンロード／共有の挙動は OS・ブラウザ依存）
- **毎日指定時刻のリマインド通知**（ブラウザの通知許可が必要）
- **PWA 向け**の Web App Manifest（data URL）を同梱

静止画以外（動画など）の日は、画像の代わりにメッセージを表示します。

## 必要なもの

| 用途 | 内容 |
|------|------|
| NASA APOD | [api.nasa.gov](https://api.nasa.gov/) の API キー。**未入力時は `DEMO_KEY`**（利用制限あり） |
| 日本語訳 | [Google AI Studio](https://aistudio.google.com/) 等で取得した **Gemini API キー**（必須） |

翻訳にはコード内で `Gemini 3.1 Flash-Lite` モデルを指定しています。モデル名や API の仕様が変わった場合は `index.html` 内の `translateText` を編集してください。

## 使い方

1. `index.html` をブラウザで開く。  
   - ローカルファイル（`file://`）でも動く場合がありますが、**通知や一部 API の挙動は `http(s)://` での提供が安定**しがちです。簡易サーバ例: `python3 -m http.server 8080`
2. 初回は設定パネルが開きます。**Gemini API キー**を入力し、必要なら NASA キーも入力します。
3. **設定を保存**すると、APOD の取得と翻訳が走ります。
4. 歯車アイコンから設定をいつでも開けます。  
   - **通知時刻**と**通知許可**は任意。  
   - キーを再入力せず**通知時刻だけ変える**場合も、空欄のまま保存すると **前回保存したキーがそのまま使われます**。

### 通知について

- 設定した**ローカル時刻の時・分**に、**1 日 1 回**ブラウザ通知を出します。
- 通知のスケジュールは **ページ内の JavaScript** で行っています。**タブやアプリを完全に終了していると、その時刻に通知されない**ことがあります。バックグラウンドにタブや PWA を残しておくと届きやすくなります。
- 対応はブラウザ・OS により異なります（特に iOS Safari 周り）。

### 「壁紙に設定」ボタン

OS の壁紙 API は呼び出していません。**保存**と同様に画像をダウンロードし、トーストで端末側の壁紙設定を案内するだけです。

## データの保存場所

API キー・通知時刻・最後に通知した日付などは、ブラウザの **`localStorage`** に保存されます。サーバーには送られません（NASA / Gemini へのリクエスト以外）。

## 技術スタック

- HTML / 素の JavaScript
- [Tailwind CSS](https://tailwindcss.com/)（CDN）
- [Inter](https://fonts.google.com/specimen/Inter)（Google Fonts）

## ライセンス

リポジトリや配布元の方針に合わせて記載してください。NASA メディアの利用条件は [NASA Image and Media Library](https://www.nasa.gov/nasa-brand-center/images-and-media/) 等を参照してください。
