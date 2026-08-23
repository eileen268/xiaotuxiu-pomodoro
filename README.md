# 小兔咻番茄钟

一个清新、可爱但不幼稚的中文番茄钟 Web App。桌面端以真实模拟钟表为视觉核心，手机端将计时器和任务清单拆分成两个独立页面。

## 功能

- 可靠的专注、短休息和长休息计时
- 开始、暂停、继续、重置和跳过
- 使用目标结束时间校准，切换标签页或短暂休眠后不会明显漂移
- SVG 模拟钟表，指针与剩余时间使用同一状态源
- Todo 新增、编辑、删除撤销、完成、收藏和筛选
- 将任务设为当前专注目标，完整专注后自动累计番茄数
- 今日计划、专注统计和最近完成记录
- 自定义时长、自动开始、长休息、声音与动画设置
- 桌面端双栏布局，手机端计时器 / 任务底部导航
- 键盘焦点、触控尺寸、Reduced Motion 和安全区域适配
- 浏览器本机保存，不需要注册或后端

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

打开终端显示的本地地址即可使用。

常用命令：

```bash
npm run validate
npm run build
npm run build:github
```

## GitHub Pages 部署

项目已经包含 `.github/workflows/deploy-pages.yml`：

1. 在 GitHub 新建仓库并上传本项目全部文件。
2. 确保默认分支名为 `main`。
3. 打开仓库 `Settings > Pages`。
4. 将 `Build and deployment` 的来源设为 `GitHub Actions`。
5. 推送到 `main`，工作流会自动构建并发布。

构建会自动读取 GitHub 仓库名并为静态资源添加正确前缀，因此仓库名可以自由设置。

## 数据保存

所有数据保存在当前浏览器的 `localStorage` 中：

- `xiaotuxiu.todos`：任务清单与番茄数量
- `xiaotuxiu.settings`：计时和偏好设置
- `xiaotuxiu.currentTask`：当前专注任务
- `xiaotuxiu.sessions`：已完成的专注记录

清除该网站的浏览器数据会同时清除这些记录，不同浏览器和设备之间不会自动同步。

## 关键目录

```text
app/                 页面、元数据和全局设计样式
components/          时钟、任务、设置、计划与统计界面
hooks/               可靠计时器与本机保存逻辑
types/               Pomodoro 和 Todo 数据类型
utils/               时间计算与模式切换纯函数
tests/               时间状态与部署配置测试
.github/workflows/   GitHub Pages 自动部署
```

## 计时器同步方式

开始或继续时，应用使用 `Date.now()` 加剩余时长生成目标结束时间。每次刷新界面时都根据当前时间重新计算剩余秒数，指针和数字倒计时读取同一份结果。暂停时保存真实剩余时长，恢复时重新生成结束时间；页面重新可见时会立即校准。跳过或重置不会增加任务的番茄数量。

## 配色调整

主要设计变量位于 `app/globals.css` 顶部，包括奶油白、柔粉、暖炭灰、专注鼠尾草绿、休息蜜桃粉和长休息薰衣草紫。
