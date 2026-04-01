# Docker 部署说明

## 1. 目的

当前仓库提供了一套面向前端开发联调的 Docker 运行方式，用于在容器内启动 Vite 开发服务，并通过宿主机端口访问页面。

当前方案的定位是开发运行环境，不是生产静态资源部署镜像。容器启动后执行的是 `npm run dev`，适合本地联调后端接口和验证页面行为。

## 2. 文件说明

### `Dockerfile`

- 基础镜像固定为 `node:20.20.1-slim`
- 工作目录为 `/app`
- 默认 npm registry 使用 `https://registry.npmmirror.com/`
- 依赖安装使用 `npm ci`
- 增加 npm 拉包重试与超时参数，降低网络抖动导致的构建失败概率
- 暴露端口 `5173`
- 默认启动命令为 `npm run dev -- --host 0.0.0.0`

### `docker-compose.yml`

- 服务名为 `fronted`
- 容器名为 `rec2form-frontend`
- 默认映射端口 `5173:5173`
- 通过构建参数向镜像传入 `NPM_REGISTRY`
- 默认使用 `https://registry.npmmirror.com/`
- 启动命令显式指定 `--host 0.0.0.0`，保证宿主机可以访问容器内的 Vite 服务

### `.dockerignore`

当前忽略以下目录，减少构建上下文体积：

- `.idea`
- `node_modules`
- `docs`
- `contexts`

## 3. 默认构建行为

镜像构建时会执行以下关键步骤：

1. 复制 `package.json` 与 `package-lock.json`
2. 将 npm registry 设置为镜像站
3. 执行 `npm ci --no-audit --no-fund`
4. 使用重试参数降低 `ECONNRESET` 一类网络问题的影响
5. 清理 npm cache
6. 复制项目源码

相比 `npm install`，`npm ci` 更适合当前仓库，因为仓库已经提交了 `package-lock.json`，构建结果更稳定，也更符合容器化场景的可重复性要求。

## 4. 使用方式

### 构建镜像

```bash
docker compose build --no-cache
```

### 启动服务

```bash
docker compose up
```

### 后台启动

```bash
docker compose up -d
```

启动成功后，可通过以下地址访问前端：

```text
http://127.0.0.1:5173
```

## 5. 镜像站配置

当前默认 registry 为：

```text
https://registry.npmmirror.com/
```

如果需要临时切换到其他源，可以在构建时覆盖：

```bash
NPM_REGISTRY=https://registry.npmjs.org/ docker compose build --no-cache
```

`docker-compose.yml` 中已经保留了该覆盖入口，因此无需修改文件内容。

## 6. 注意事项

- 当前容器运行的是 Vite 开发服务，不是 Nginx 静态文件服务
- 如果目标是生产部署，建议后续改为多阶段构建，在构建阶段执行 `npm run build`，在运行阶段提供静态资源服务
- 当前配置更适合本地开发、接口联调和容器化运行验证
- 若构建阶段仍出现网络异常，优先检查宿主机 Docker 网络连通性，而不是直接升级 npm 版本

## 7. 本次调整摘要

本次 Docker 相关调整包括：

- 将占位 `Dockerfile` 改为可用于前端项目的 Node 20 镜像构建方案
- 将依赖安装从 `npm install` 调整为 `npm ci`
- 默认接入 npm 镜像站 `npmmirror`
- 为 npm 安装增加重试和超时参数
- 修复 compose 启动命令，补充 `--host 0.0.0.0`
- 增加 `.dockerignore`，减少无关目录进入构建上下文
