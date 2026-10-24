# 鍵上樂理

以 MIDI 鍵盤學習樂理、指法與和弦的成人互動課程（原型）。純前端靜態網頁，進度存在瀏覽器 localStorage。

## 使用

- 建議使用桌機的 Chrome 或 Edge（Safari 不支援 Web MIDI，只能用電腦鍵盤／滑鼠）。
- 第一次連上 MIDI 鍵盤時會要求校準：依序按最左、最右的鍵。
- 沒有 MIDI 鍵盤時：電腦鍵盤 Z 列為 C3–B3，Q 列為 C4–C5；也可用滑鼠點琴鍵。

## 原型範圍

- 入門第 1 課〈鍵盤地理與中央 C〉完整五段：暖身複習 → 新概念 → 引導練習 → 實際曲目 → 總結評分。
- 即時回饋、各段星等、間隔複習（Leitner）、練習日曆與連續天數、中途離開續上、進度匯出／匯入。
- 其餘課程列為「製作中」。

## 本機執行

任何靜態伺服器皆可，例如：

```bash
npx serve .
```

Web MIDI 需要 https 或 localhost。

## 素材

鋼琴音色：Salamander Grand Piano（Alexander Holm，CC-BY 3.0），經 Tone.js 音訊 CDN 載入。
