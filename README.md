# 津企通（JinQiTong）· 高保真交互原型

面向津巴布韦的**岗位中文学习 + 中资企业服务**平台原型。
中国人民大学国际文化交流学院 2026「三创」项目《津彩中文·职达非洲》的网站改进版重设计。

## 技术栈

纯静态 **HTML + CSS + JS**，零框架、零构建、零依赖。双击 `index.html` 即可本地运行。

## 目录结构

```
jinqitong/
├── index.html                    # 首页（三入口 + 样课 + 学习闭环 + 认证大考入口）
├── quick-check.html              # 免费小测（听力/句意，3 题）
├── quick-check-result.html       # 小测结果（可分享图）
├── learning-path.html            # 岗位与学习路径（8 课）
├── lesson.html                   # 样课（5 步 + 3 题型 + 跟读）
├── assessment.html               # 阶段测评（自测，6 题 3 题型）
├── report.html                   # 学习报告（达标 + 补练定向 + 报名入口）
├── my-certification.html         # 我的认证（阶段测评 + 大考流程）
├── exam-register.html            # 认证大考 · 报名
├── exam-schedule.html            # 认证大考 · 预约
├── jobs.html                     # 推荐岗位（求职出口）
├── job-detail.html               # 岗位详情（?id= 区分）
├── profile.html                  # 我的档案（简历 + 进人才池 + 知情清单）
├── signup.html                   # 登录/注册（WhatsApp 手机号，占位）
├── enterprise.html               # 企业工作台
├── enterprise-training.html      # 员工培训
├── enterprise-training-report.html  # 班组能力矩阵（可打印）
├── enterprise-recruitment.html   # 招聘与人才池（付费/免费视角）
├── style.css                     # 设计系统
├── app.js                        # 交互 + TTS + 状态 + 判定逻辑
├── manifest.json                 # PWA
└── sw.js                         # Service Worker（离线缓存）
```

## 本地运行

直接双击 `index.html`，或在终端：

```bash
# 任意静态服务器，例如 Python
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

> 注：**录音（MediaRecorder）和 PWA 需要 HTTPS**。`file://` 或 `http://localhost` 下 TTS 可用，但录音需在部署后的 HTTPS 环境（如 Vercel）才能触发。

## 部署到 Vercel

1. 将本文件夹推送到一个 GitHub 仓库（例如 `jinqitong`）；
2. 登录 [vercel.com](https://vercel.com) → **Add New → Project** → 导入该仓库；
3. Framework Preset 选 **Other**（纯静态），Build 留空，Deploy；
4. 得到 `https://<项目名>.vercel.app` 在线链接。

无需任何构建命令，Vercel 会自动按静态站点托管。

## 说明

- 本原型为**演示数据**，未连接真实后端（登录/缴费/提交/申请均为演示态）；
- 音频为**机器朗读（Web Speech API / TTS）**，真人录音待接入；
- 认证大考当前完成「报名 + 预约」，考试页与出分页待线上/线下形式确定后接入；
- 品牌名「津企通 JinQiTong」与申报材料「津彩中文·职达非洲」尚未统一，待定。
