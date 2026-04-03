# RecToForm-backend
一个AI Workflow项目, 基于 fastapi 和 llm 的发票信息提取与自动填表系统服务端，支持pdf、图片多种格式输入，批量识别提取发票信息并生成excel表格\
tips: 本项目为前后端分离架构, 本仓库仅为客户端; 后端服务请移步[RecToForm-backend](https://github.com/YunXi-Zhu0/RecToForm-backend)\
主仓库地址(包含前后端Docker一键启动): [RecToForm](https://github.com/YunXi-Zhu0/RecToForm)


# 一、产品功能演示
## 1. 全字段匹配填写
- 识别发票中所有信息并返回
- 支持在线表格编辑, 自编辑表头及其对应数据信息; 同时支持一键删除、移动、恢复数据列操作
- 支持编辑后表格下载, 导出为Excel表格文件
![002](./assets/2.gif)

## 2. 自定义模板填写
- 用户可通过编辑`template/`下的配置文件以自定义默认模板(可参考已有模板: `asset_import_v1`、`finance_invoice_v1`)
- 导出表格文件的表头由用户自定义配置文件决定
![001](./assets/1.gif)

# 二、快速启动
## 1. Docker 启动（推荐）
```
docker compose up --build
```
## 2. 本地环境启动
### 2.1 环境准备
```bash
# 下载并安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装最新版 Node（比如 20.x）
nvm install 20

# 使用这个版本
nvm use 20

# 设置为默认版本
nvm alias default 20
```
### 2.2 安装依赖并启动
```bash
npm install
npm run dev
```
