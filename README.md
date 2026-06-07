# THE SILVER FACTORY — 安迪·沃霍尔互动致敬站

> “In the future everyone will be world-famous for 15 minutes.” —— Andy Warhol

一个把安迪·沃霍尔的「银色工厂」做成**可操作机器**的互动网站：你不是浏览作品，而是**亲手拉刮板印一张丝网版画**、把它复制成重复墙、调出自己的荧光油墨、坐进试镜机、剥香蕉开音乐、撕开时间胶囊，最后打卡下班把整张接触印样带走。

纯静态站点，**所有图像都在你浏览器里本地生成，数据不上传**。

## 玩什么（展区）

| # | 展区 | 互动 |
|---|------|------|
| 01 | **The Press 丝网印刷台** | 选油墨，用刮板从上往下拖动印刷；拖得慢而稳=实色，快而散=飞白；每层带真实「对位偏移」，最后按错位程度配一句沃霍尔语录 |
| 02 | **The Wall 重复墙** | 把版画复制成 N×N 网格，每格不同配色（Marilyn 双联画逻辑），悬停错位 |
| 03 | **Ink Lab 油墨实验室** | 把两团荧光油墨拖到一起混色，工厂给它起个假潘通名，加进油墨架 |
| 04 | **Screen Test 试镜** | 黑白高反差+胶片颗粒；鼠标静止 4 秒画面绽放成彩色（奖励「什么都不做」）；支持摄像头/上传 |
| 05 | **E.P.I.** | 剥开香蕉启动合成器 drone，房间随声律动（含闪光安全限制） |
| 06 | **Time Capsule 时间胶囊** | 撕开封箱胶带，杂物散落，点开看每件物品的旁注 |
| 07 | **Drying Rack 晾画架** | 你做的一切本地留存，打卡下班导出整张接触印样 PNG |
| 08 | **About** | 真实工厂史（已事实核查） |

## 技术

- 纯 **vanilla HTML / CSS / JS**，无构建步骤
- **Canvas 2D**：色调分色 + 45° 网点半调 key 层 + 多层错位合成
- **Web Audio API**：全部音效与 drone 实时合成，零音频文件；默认静音、需手势解锁、切后台自动降音
- **GSAP + ScrollTrigger**（CDN，仅作增强；缺失也能用）
- 所有拖拽用原生 **Pointer Events**（不依赖任何插件）
- 适配 `prefers-reduced-motion`、触屏、键盘；闪光 <3 次/秒 + 「减少闪烁」开关

## 本地运行

```bash
# 任意静态服务器即可（ES module 需要 http(s)，不能用 file://）
python -m http.server 8123
# 打开 http://127.0.0.1:8123
```

## 重新部署

推到 `main` 分支即可，GitHub Pages 自动更新：

```bash
git add -A && git commit -m "update" && git push
```

## 说明

非官方粉丝致敬作品，与 The Andy Warhol Foundation / Museum 无任何关联。文案中的沃霍尔语录与史实经事实核查代理审校。

🤖 An autonomous overnight build with [Claude Code](https://claude.com/claude-code).
