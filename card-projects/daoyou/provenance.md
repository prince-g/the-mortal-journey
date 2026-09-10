# 道友闪卡素材来源

生成日期：2026-09-09

## 源图

- `assets/source.jpg`
- 角色：身份、姿态与构图基准，也是 WebGL 失败时的静态降级卡面。
- 原始文件：用户在当前任务中提供的韩立竖版图片。
- 原图与项目副本的 SHA-256 一致；项目副本没有覆盖或修改原文件。

## 生成方式

使用 Codex 内置 ImageGen 编辑模式。没有使用外部 API key，也没有向卡面添加姓名、招式、版本号、品牌或水印。

### 背景层

```text
Use case: precise-object-edit
Asset type: layered holographic 3D card background
Input images: Image 1 is the edit target and composition reference
Primary request: Remove only the foreground male character, including all hair and robe, and naturally reconstruct the scenery hidden behind him.
Scene/backdrop: preserve the exact misty blue-gray Chinese immortal mountain landscape, cloud layers, distant peaks, lighting, perspective, camera framing, and the stone path at the bottom.
Composition/framing: keep the exact original portrait framing and registration; do not crop or shift the scene.
Constraints: change only the character area; preserve all visible background pixels wherever possible; fill removed areas seamlessly with plausible matching mountains, clouds, mist, and path; no people, no text, no border, no watermark, no checkerboard.
```

### 人物层

```text
Use case: background-extraction
Asset type: transparent foreground layer for a layered holographic 3D card
Input images: Image 1 is the edit target and strict identity/composition reference
Primary request: Extract only the complete foreground male character as a genuinely transparent RGBA cutout.
Subject: preserve the exact face, expression, body proportions, head angle, hairstyle, individual flowing hair strands, dark blue robe, folds, pose, lighting, and placement from the original.
Composition/framing: keep the exact original portrait canvas, character scale, registration, and position; do not crop, recenter, enlarge, redraw, or restyle him.
Constraints: transparent background with real alpha; preserve fine semi-transparent hair and cloth edges; no mountain, clouds, path, border, glow, shadow backdrop, text, watermark, or checkerboard; do not change identity or anatomy.
```

ImageGen 返回了绘制在 RGB 图层里的棋盘格；随后由 RuiC Card 的 `checkerboard_to_alpha.py` 确定性转换为真实 alpha，没有进行第二次 AI 抠图。

### 线稿层

```text
Use case: identity-preserve
Asset type: registered sparse line-art effects layer for a layered holographic 3D card
Input images: Image 1 is the exact cutout placement and pose target; Image 2 is the original identity reference
Primary request: Convert the character into clean, single black contour lines on a pure white background while preserving the exact canvas registration, silhouette, pose, face placement, hair strands, and robe boundaries.
Style/medium: simplified technical ink contour drawing for selective holographic highlights.
Constraints: pure white opaque background; thin black contour strokes only; no gray shading, no hatching, no filled black shapes, no mountains, no clouds, no border, no text, no watermark, no checkerboard.
```

### 文字层

用户没有要求卡面文字，因此 `text.png` 不绘制文字。文件只在最右侧安全裁切边缘保留一条 1 像素、半透明的技术哨兵线，以满足 RuiC 四层材质的“同时包含透明与可见 alpha”校验；该线位于卡片圆角裁切区，不作为可见设计内容。

## 展示字体

- 网页标题与动态卡背使用 Ma Shan Zheng 的“道友”字形子集 `web/assets/daoyou-display.ttf`。
- 原字体项目：The Ma Shan Zheng Project Authors（https://github.com/googlefonts/mashanzheng）。
- 许可：SIL Open Font License 1.1，完整文本随项目保存在 `web/assets/OFL-MaShanZheng.txt`。
- 字体子集 SHA-256：`407A3722A21E21C7895A3F46B02305971795E0169B67D69E68F906BA51BE7355`。
