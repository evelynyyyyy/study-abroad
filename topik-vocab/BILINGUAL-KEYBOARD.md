# v3.2.0 双语网页键盘

智能学习 Typing 的默认输入方式为 `bilingual`。旧的 `smart` / `web` 偏好自动迁移到 `bilingual`；仅明确选择 `system` 的用户继续使用高级兼容模式。不会清空 `topik_lab_v2` 学习记录。

- 先由 `TOPIK_SMART.select` 根据记忆状态选择 `meaning`（韩→中）或 `spell`（中→韩），再由 `smartScreen` 派生 `chineseKeyboard` / `koreanKeyboard`。调度器不接收键盘类型。
- 智能 Typing 双语模式下 `#spell-input` 为 `readonly` 且 `inputmode=none`；无自动 `focus()`。网页按键直接更新 `typed` 和显示内容。
- 韩语两套式：独立的 `hangul-keyboard.js` 实现 Unicode 音节 L/V/T 合成、复合元音、双收音、拆分删除和光标编辑。
- 中文拼音：`pinyin-keyboard.js` 为本项目原创的轻量静态词典 + 按当前中文释义出现频率排序候选；支持连续拼音词语、单字、候选翻页、删除、空格、清空。**不是全量中文拼音 IME**，未收录的拼音无法产生候选；后续需逐步补充词典或使用许可证兼容的开放拼音数据。
- 词典来自手工整理的常见中文释义与通用汉字，不包含复制的第三方开源词库；无需第三方许可证。
- 不改变 `smart-scheduler.js` 的评分、队列、due、学习记录或遗忘重学逻辑。旧的常规练习 / 首次学习页面未统一迁移至这套虚拟输入组件。
- 自动化测试覆盖拼音候选、词语选择、删除、韩语组合、50 题双向调度和 100 个预选方向的键盘投影不变性。
- 没有真实 iPhone Safari 设备，不能声明实机 20 题键盘不弹出或视口布局已验收。
