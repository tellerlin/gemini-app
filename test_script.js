// Test JavaScript file for upload
class TestClass {
    constructor(name) {
        this.name = name;
        this.message = "测试JavaScript文件上传功能";
    }
    
    greet() {
        console.log(`Hello, ${this.name}!`);
        console.log(this.message);
    }
    
    calculate(a, b) {
        return a + b;
    }
}

// Export for testing
export default TestClass;