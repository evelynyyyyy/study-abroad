# 韩语词汇实验室

静态网页，部署于 GitHub Pages：<https://evelynyyyyy.github.io/study-abroad/topik-vocab/>

**网站名称保留为「韩语词汇实验室」。** 无需服务器、数据库或 npm 构建；入口为 `index.html`，界面样式在 `styles.css`，学习逻辑在 `app.js`，扩充词库在 `vocabulary.js`。

## 学习功能

- TOPIK 1—6 学习难度切换。原有 104 个示例词 + 603 条补充词条（去重后数量以网站显示为准），不是 TOPIK 官方分级词表，也不是完整的 TOPIK 1—6 词库。
- 今日学习：每日 5 / 10 / 20 个新词；已接触、待复习数据。
- 认词：韩语 → 中文，先回忆再翻面，自评“记住了 / 还没记住”。
- 韩文拼写：中文 → 韩语，必须自己输入韩文并提交答案。
- 中文释义输入：韩语 → 中文，必须自己输入中文释义并提交答案；支持词条中用顿号、逗号或斜线分隔的多个简短义项。语义相近但措辞不同的答案可能被判错，请以显示的参考释义为准。
- 间隔复习：按单词及练习方向分别记录复习时间；初次复习间隔 10 分钟，然后 1 / 3 / 7 / 14 / 30 / 60 / 90 天。属于简单阶梯排程，**不是 FSRS 或经过个性化校准的记忆模型**。
- 错词强化、词汇收藏、韩语浏览器语音、精选短句及发音注释。
- 搜索、CSV 导入/导出、JSON 学习进度备份/恢复；所有数据保存在当前浏览器 localStorage，不能自动跨设备同步。

## 词库导入

CSV 的列名：`level,ko,zh,example,translation,reading`，后面三列可省略。支持符合 CSV 标准的带引号字段和逗号。导入时忽略已经存在的韩语词形。

## 设计原则与学习技能参考

并没有复制第三方项目的源码或词库，而是借鉴公开描述的学习机制：

- [HanCards](https://github.com/TeamBaconn/HanCards)：自定节奏的卡片、测验与间隔复习。
- [kor-srs](https://github.com/CorbinFoucart/kor-srs)：以词汇识别为先的记忆训练、结合语境。
- [korean-flashcards](https://github.com/niksavis/korean-flashcards)：浏览器韩语发音与分阶段练习。

详见 [SKILL.md](./SKILL.md) 的韩语词汇学习流程。

## 兼容性

使用浏览器 Web Speech API 朗读，语音质量和是否支持韩语受浏览器、设备安装的语音包影响。建议使用现代 Chromium / Safari / Firefox；拼写需启用韩语输入法。深浅色模式、键盘焦点、移动端导航以及降低动态效果均已实现。未进行独立的跨浏览器视觉人工验收。
