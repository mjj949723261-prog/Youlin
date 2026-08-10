#!/bin/bash

# ==============================================================================
# 🚀 友邻 Youlin (悦邻里) - 前后端一键并发启动脚本
# ==============================================================================

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在根目录路径
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER_DIR="$ROOT_DIR/server"
MINIAPP_DIR="$ROOT_DIR/miniapp"

echo -e "${BLUE}==============================================================${NC}"
echo -e "${GREEN}      🚀 欢迎使用 友邻 Youlin 前后端一键启动工具           ${NC}"
echo -e "${BLUE}==============================================================${NC}"

# 1. 检查必要命令
if ! command -v java &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Java 环境，请先安装 JDK 17+${NC}"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Maven 环境，请先安装 Apache Maven${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Node.js/npm 环境，请先安装 Node.js${NC}"
    exit 1
fi

# 2. 清理旧进程函数 (Graceful Shutdown)
cleanup() {
    echo -e "\n${YELLOW}[提示] 正在停止 友邻 Youlin 前后端服务...${NC}"
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    # 清理占用 8080 端口的遗留Java进程
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}[OK] 服务已安全退出。${NC}"
    exit 0
}

# 捕获 Ctrl+C (SIGINT) 和 SIGTERM 信号
trap cleanup SIGINT SIGTERM

# 3. 检查后端 JAR 包，如果不存在则自动构建
JAR_FILE="$SERVER_DIR/target/youlin-server-1.0.0-SNAPSHOT.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo -e "${YELLOW}[1/2] 首次启动，正在打包 Java (Spring Boot) 服务端...${NC}"
    cd "$SERVER_DIR" && mvn clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo -e "${RED}[错误] 后端打包失败，请检查 Java/Maven 代码！${NC}"
        exit 1
    fi
fi

# 4. 启动 Spring Boot 后端服务
echo -e "${GREEN}[1/2] 正在启动 Java (Spring Boot) 后端服务 (Port 8080)...${NC}"
cd "$SERVER_DIR"
java -jar target/youlin-server-1.0.0-SNAPSHOT.jar > "$ROOT_DIR/server.log" 2>&1 &
SERVER_PID=$!

# 等待后端端口挂载
sleep 2

# 5. 启动 Uni-app 小程序前端监听服务
echo -e "${GREEN}[2/2] 正在启动 Uni-app 小程序前端编译服务 (mp-weixin)...${NC}"
cd "$MINIAPP_DIR"
npm run dev:mp-weixin > "$ROOT_DIR/miniapp.log" 2>&1 &
FRONTEND_PID=$!

echo -e "\n${BLUE}--------------------------------------------------------------${NC}"
echo -e "${GREEN}🎉 友邻 Youlin 前后端服务已成功并发启动！${NC}"
echo -e "${BLUE}--------------------------------------------------------------${NC}"
echo -e "  📡 【Java 后端服务】: ${YELLOW}http://localhost:8080/api/v1${NC}"
echo -e "  🗄️ 【H2 数据库控制台】: ${YELLOW}http://localhost:8080/h2-console${NC}"
echo -e "  📱 【微信小程序产物】: ${YELLOW}$MINIAPP_DIR/dist/dev/mp-weixin${NC}"
echo -e "  📄 【日志跟踪】: 后端日志 -> server.log | 前端日志 -> miniapp.log"
echo -e "${BLUE}--------------------------------------------------------------${NC}"
echo -e "${YELLOW}提示: 请在 微信开发者工具 中导入产物目录进行预览演示！${NC}"
echo -e "${YELLOW}按 [Ctrl + C] 可随时一键停止前后端所有服务。${NC}\n"

# 保持脚本持续运行并实时打印后端核心日志
tail -f "$ROOT_DIR/server.log"
