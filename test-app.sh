#!/bin/bash

# Gemini 应用功能测试脚本
# 使用 curl 和浏览器自动化进行功能验证

BASE_URL="http://localhost:5173"
TEST_LOG="test-results.log"

echo "🧪 开始 Gemini 应用功能测试..." > $TEST_LOG
echo "测试时间: $(date)" >> $TEST_LOG
echo "服务地址: $BASE_URL" >> $TEST_LOG
echo "================================" >> $TEST_LOG

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "\n${YELLOW}🔍 测试: $test_name${NC}"
    echo "测试: $test_name" >> $TEST_LOG
    
    if eval "$test_command" >> $TEST_LOG 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        echo "结果: ✅ 通过" >> $TEST_LOG
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 失败${NC}"
        echo "结果: ❌ 失败" >> $TEST_LOG
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 1. 基础连接测试
echo -e "\n${YELLOW}📡 基础连接测试${NC}"
run_test "应用页面可访问性" "curl -s -f $BASE_URL > /dev/null"
run_test "HTML 页面正确返回" "curl -s $BASE_URL | grep -q 'Gemini'"
run_test "静态资源加载" "curl -s -f $BASE_URL/vite.svg > /dev/null"

# 2. API 端点测试（如果有的话）
echo -e "\n${YELLOW}🔌 API 端点测试${NC}"
# 注意：这里需要根据实际 API 端点调整
if curl -s $BASE_URL/api/health > /dev/null 2>&1; then
    run_test "健康检查端点" "curl -s -f $BASE_URL/api/health > /dev/null"
else
    echo -e "${YELLOW}⚠️  没有发现 API 端点，跳过 API 测试${NC}"
fi

# 3. 前端构建验证
echo -e "\n${YELLOW}🏗️  前端构建验证${NC}"
run_test "CSS 文件加载" "curl -s $BASE_URL | grep -q 'text/css\\|stylesheet\\|<style'"
run_test "JavaScript 文件加载" "curl -s $BASE_URL | grep -q 'script'"
run_test "React 应用挂载点" "curl -s $BASE_URL | grep -q 'id=\"root\"'"

# 4. 错误页面测试
echo -e "\n${YELLOW}🚫 错误处理测试${NC}"
run_test "404 页面处理" "curl -s -w '%{http_code}' -o /dev/null $BASE_URL/nonexistent | grep -q '404'"

# 5. 性能基础测试
echo -e "\n${YELLOW}⚡ 性能基础测试${NC}"
response_time=$(curl -s -w "%{time_total}" -o /dev/null $BASE_URL)
if (( $(echo "$response_time < 2.0" | bc -l) )); then
    run_test "页面响应时间 (<2s)" "true"
else
    run_test "页面响应时间 (<2s)" "false"
fi

# 6. 内容验证
echo -e "\n${YELLOW}📄 内容验证测试${NC}"
page_content=$(curl -s $BASE_URL)
if echo "$page_content" | grep -q "Gemini"; then
    run_test "页面包含 Gemini 关键词" "true"
else
    run_test "页面包含 Gemini 关键词" "false"
fi

# 7. 移动端响应式检查（通过 User-Agent）
echo -e "\n${YELLOW}📱 响应式设计测试${NC}"
mobile_content=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15" $BASE_URL)
if echo "$mobile_content" | grep -q "viewport"; then
    run_test "移动端视口配置" "true"
else
    run_test "移动端视口配置" "false"
fi

# 显示测试结果汇总
echo -e "\n${YELLOW}📊 测试结果汇总${NC}"
echo "================================" >> $TEST_LOG
echo "测试结果汇总:" >> $TEST_LOG
echo "总测试数: $TOTAL_TESTS" >> $TEST_LOG
echo "通过: $PASSED_TESTS" >> $TEST_LOG
echo "失败: $FAILED_TESTS" >> $TEST_LOG

success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "成功率: ${success_rate}%" >> $TEST_LOG

echo -e "总测试数: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "通过: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败: ${RED}$FAILED_TESTS${NC}"
echo -e "成功率: ${YELLOW}${success_rate}%${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有基础测试通过！${NC}"
else
    echo -e "\n${RED}⚠️  有 $FAILED_TESTS 个测试失败，请检查日志${NC}"
fi

echo -e "\n详细日志已保存到: ${YELLOW}$TEST_LOG${NC}"

# 手动测试提醒
echo -e "\n${YELLOW}📝 后续手动测试项目:${NC}"
echo "1. 🗣️  访问 $BASE_URL 进行聊天功能测试"
echo "2. 🖼️  测试图片上传和分析功能"
echo "3. 📊 测试 Mermaid 图表渲染（重点测试中文支持）"
echo "4. ⚙️  测试高级设置和配置选项"
echo "5. 📈 检查性能监控界面"
echo "6. 🔧 测试各种错误情况处理"

# 如果安装了 playwright 或 puppeteer，可以运行自动化浏览器测试
if command -v npx > /dev/null 2>&1; then
    echo -e "\n${YELLOW}🤖 可选: 运行自动化浏览器测试${NC}"
    echo "运行: npx playwright test (如果已配置)"
fi