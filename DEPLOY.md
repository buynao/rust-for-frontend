# 部署说明

本项目用 **push-to-deploy** 部署在自有服务器(`ssh buynao`,Alibaba Cloud Linux + nginx),
推送到 `master` 即自动构建并上线。

## 工作方式

`origin` 配置了两个 push 地址:

- `git@github.com:buynao/rust-for-frontend.git` —— GitHub 源
- `buynao:/opt/rust-for-frontend/repo.git` —— 服务器裸库(部署触发)

一次 `git push origin master` 会同时推到两边;服务器裸库的 `post-receive` 钩子随即:

1. 检出代码到 `/opt/rust-for-frontend/build`
2. `pnpm install` →（容忍 esbuild ignored-builds 的非0退出)→ `pnpm rebuild esbuild`
3. `tsc -b && vite build`(直接调二进制,绕开 `pnpm build` 在本机 corepack 自检的崩溃)
4. 原子替换发布到 `/opt/rust-for-frontend/dist`(nginx 站点根)

日常开发只需:

```bash
git add -A && git commit -m "..."
git push origin master      # GitHub 更新 + 服务器自动构建上线
```

## 服务器结构

```
/opt/rust-for-frontend/
├── repo.git/        # 裸库,push 目标;hooks/post-receive 是部署脚本
├── build/           # 检出 + 构建工作区(含 node_modules,加速增量构建)
└── dist/            # nginx 站点根,由钩子原子更新
```

nginx 站点配置:`/etc/nginx/conf.d/rust.buynao.com.conf`(`server_name rust.buynao.com`)。

## 访问与 HTTPS

- 域名:`rust.buynao.com`,需一条 DNS A 记录指向服务器 `39.106.15.209`。
- HTTPS:服务器用手动证书(`/etc/nginx/ssl/buynao/<域名>.pem|.key`,非 certbot)。
  把 `rust.buynao.com` 的证书放进该目录后,取消站点配置里 HTTPS 段的注释并 `nginx -t && systemctl reload nginx` 即可。

## 排错

```bash
# 看某次部署的输出:推送时 remote: 开头的行即钩子日志
# 手动重跑一次部署:
ssh buynao 'echo "0 1 refs/heads/master" | bash /opt/rust-for-frontend/repo.git/hooks/post-receive'
# 直接在工作区构建排查:
ssh buynao 'cd /opt/rust-for-frontend/build && ./node_modules/.bin/vite build'
```
