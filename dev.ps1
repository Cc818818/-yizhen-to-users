# ============================================================
#  启动开发服务器（自动走本地代理）
#
#  为什么需要这个文件：
#  你的电脑走的是代理软件（127.0.0.1:7897），但 Node.js 的 fetch
#  默认【不走】系统代理，所以直接 npm run dev 会报 "fetch failed"。
#  Node 24 支持 NODE_USE_ENV_PROXY，设上就能让 fetch 也走代理。
#
#  用法：在这个目录下右键「在终端中打开」，然后执行
#        .\dev.ps1
#
#  注意：如果你换了网络环境（比如关了代理），把下面两行的代理地址
#        改成新的，或者临时改用 npm run dev 试试。
# ============================================================

$env:NODE_USE_ENV_PROXY = "1"
$env:HTTPS_PROXY = "http://127.0.0.1:7897"
$env:HTTP_PROXY  = "http://127.0.0.1:7897"

Write-Host "代理已设置: $env:HTTPS_PROXY" -ForegroundColor Cyan
Write-Host "启动 Next.js 开发服务器..." -ForegroundColor Cyan

npm run dev
