# Alfred 练手小项目集

本项目是一个 Alfred 工具集，包含多个实用的练手小项目，旨在提高日常工作效率。

## 项目列表

| 项目 | 描述 | 详情 |
|------|------|------|
| [utools-timer](utools-timer/README.md) | uTools 定时器插件 | 功能强大的 uTools 定时器插件(参考 alfred 的 timer)，支持自定义时间、任务管理、主题切换等 |
| [alfred-complete-space](alfred-complete-space/README.md) | 路径空格处理 | 自动将目录路径上的空格转换成转义字符，方便在终端中使用 |
| [tik-alfred-wolai](alfred-tik-wolai/README.md) | 任务计数器 | 记录事项的执行次数，数据同步到 Wolai 表格，方便进行多维度分析统计 |
| [alfred-time-task](alfred-time-task/README.md) | 任务计时器 | 动态记录每个任务的耗时情况，支持开始、暂停、结束等操作，数据记录在 Wolai 文档中 |

## 构建与部署

项目通过 Makefile 实现 Alfred 工作流的自动化更新与清理：

- `make update-completespace`：更新 alfred-complete-space 工作流
- `make update-tasktime`：更新 alfred-time-task 工作流
- `make update-tasktime-home`：针对家庭环境的 alfred-time-task 更新路径
- `make clean`：清除桌面上的所有 .alfredworkflow 文件

## 使用说明

每个子项目都有详细的使用说明，请点击上方表格中的链接查看具体项目的 README 文件。