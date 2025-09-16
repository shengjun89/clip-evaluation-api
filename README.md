## 🤖 CLIP 评估 API
**部署状态**: 🚀 已部署到 Vercel，支持全球访问

- 基于智能模拟的 CLIP 评估算法
- 文本-图像相似度评估
- 单个和批量评估支持
- RESTful API 接口
- 无服务器架构，自动扩缩容

### 🎨 Figma 插件
- 图像生成和编辑
- 与 Figma 设计工具深度集成
- 实时预览和调整

### 📊 数据管理
- 飞书多维表格集成
- 批量数据导入导出
- 评估结果存储和分析

## 🚀 API 使用指南

### 基础信息

**API 基础 URL**: `https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate`

**支持的功能**:
- ✅ 健康检查
- ✅ 单个图像-文本相似度评估
- ✅ 批量评估
- ✅ 跨域支持 (CORS)

### 1. 健康检查

检查 API 服务状态：

```bash
curl -X GET https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate
```

**响应示例**:
```json
{
  "status": "healthy",
  "service": "Real CLIP Evaluation API (Vercel)",
  "version": "1.0.0",
  "model": "openai/clip-vit-base-patch32",
  "timestamp": "2025-09-16T15:02:19.313Z"
}
```

### 2. 单个评估

评估单张图片与文本的相似度：

```bash
curl -X POST https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300",
    "text": "a cute dog"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "similarity_score": 0.4479,
  "text": "a cute dog",
  "image_url": "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300",
  "model": "openai/clip-vit-base-patch32",
  "processing_time": 95,
  "timestamp": "2025-09-16T15:02:27.032Z"
}
```

### 3. 批量评估

同时评估多张图片：

```bash
curl -X POST https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "image_url": "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300",
        "text": "a cute dog"
      },
      {
        "image_url": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300",
        "text": "a beautiful cat"
      }
    ]
  }'
```

**响应示例**:
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "similarity_score": 0.6057,
      "text": "a cute dog",
      "image_url": "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300"
    },
    {
      "success": true,
      "similarity_score": 0.5578,
      "text": "a beautiful cat",
      "image_url": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "processing_time": 423
  },
  "model": "openai/clip-vit-base-patch32",
  "timestamp": "2025-09-16T15:02:34.393Z"
}
```

## 💻 编程语言集成

### Python 示例

```python
import requests
import json

class CLIPEvaluator:
    def __init__(self):
        self.base_url = "https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate"
    
    def evaluate_single(self, image_url, text):
        """单个图像-文本相似度评估"""
        response = requests.post(
            self.base_url,
            json={"image_url": image_url, "text": text},
            headers={"Content-Type": "application/json"}
        )
        return response.json()
    
    def evaluate_batch(self, items):
        """批量评估"""
        response = requests.post(
            self.base_url,
            json={"items": items},
            headers={"Content-Type": "application/json"}
        )
        return response.json()

# 使用示例
evaluator = CLIPEvaluator()

# 单个评估
result = evaluator.evaluate_single(
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300",
    "a cute dog"
)
print(f"相似度分数: {result['similarity_score']}")

# 批量评估
batch_items = [
    {"image_url": "https://example.com/dog.jpg", "text": "a dog"},
    {"image_url": "https://example.com/cat.jpg", "text": "a cat"}
]
batch_result = evaluator.evaluate_batch(batch_items)
print(f"批量评估完成，成功: {batch_result['summary']['successful']}")
```

### JavaScript/Node.js 示例

```javascript
class CLIPEvaluator {
    constructor() {
        this.baseUrl = 'https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate';
    }

    async evaluateSingle(imageUrl, text) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, text })
        });
        return await response.json();
    }

    async evaluateBatch(items) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        return await response.json();
    }

    async checkHealth() {
        const response = await fetch(this.baseUrl);
        return await response.json();
    }
}

// 使用示例
const evaluator = new CLIPEvaluator();

// 检查服务状态
evaluator.checkHealth()
    .then(status => console.log('服务状态:', status.status));

// 单个评估
evaluator.evaluateSingle(
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300',
    'a cute dog'
).then(result => {
    console.log('相似度分数:', result.similarity_score);
});

// 批量评估
const batchItems = [
    { image_url: 'https://example.com/dog.jpg', text: 'a dog' },
    { image_url: 'https://example.com/cat.jpg', text: 'a cat' }
];

evaluator.evaluateBatch(batchItems)
    .then(result => {
        console.log('批量评估结果:', result.summary);
    });
```

## 📋 API 参考

### 端点总览

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/clip-evaluate` | 健康检查和服务信息 |
| POST | `/api/clip-evaluate` | 单个或批量评估 |

### 请求格式

#### 单个评估请求
```json
{
  "image_url": "string (required)",
  "text": "string (required)"
}
```

#### 批量评估请求
```json
{
  "items": [
    {
      "image_url": "string (required)",
      "text": "string (required)"
    }
  ]
}
```

### 响应格式

#### 成功响应 (单个)
```json
{
  "success": true,
  "similarity_score": "number (0-1)",
  "text": "string",
  "image_url": "string",
  "model": "string",
  "processing_time": "number (ms)",
  "timestamp": "string (ISO 8601)"
}
```

#### 成功响应 (批量)
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "similarity_score": "number",
      "text": "string",
      "image_url": "string"
    }
  ],
  "summary": {
    "total": "number",
    "successful": "number",
    "failed": "number",
    "processing_time": "number (ms)"
  },
  "model": "string",
  "timestamp": "string"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "string",
  "timestamp": "string"
}
```

## 🛠️ 本地开发

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装和运行

```bash
# 克隆仓库
git clone https://github.com/your-username/nano_banana_Figma_plugin.git
cd nano_banana_Figma_plugin

# 安装依赖
npm install

# 本地开发
npm run dev

# 部署到 Vercel
npm run deploy
```

### 项目结构

```
nano_banana_Figma_plugin/
├── api/
│   ├── clip-evaluate.js      # CLIP 评估 API 主文件
│   └── index.js              # API 入口文件
├── clip-api-minimal/         # 轻量级 CLIP API 服务
├── public/                   # 静态资源
├── dist/                     # 构建输出
├── code.ts                   # Figma 插件主代码
├── ui.html                   # 插件 UI 界面
├── manifest.json             # Figma 插件配置
├── vercel.json               # Vercel 部署配置
└── package.json              # 项目依赖
```

## 🚀 部署

### Vercel 部署 (推荐)

1. **Fork 本仓库**到你的 GitHub 账户

2. **连接到 Vercel**:
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

3. **配置环境变量** (可选):
   ```bash
   HUGGINGFACE_API_TOKEN=your_token_here
   ```

4. **部署**:
   - Vercel 会自动检测配置并部署
   - 部署完成后获得生产环境 URL

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

## 🔧 配置选项

### 环境变量

| 变量名 | 描述 | 必需 | 默认值 |
|--------|------|------|--------|
| `HUGGINGFACE_API_TOKEN` | Hugging Face API 令牌 | 否 | - |
| `NODE_ENV` | 运行环境 | 否 | `production` |

### Vercel 配置

项目包含 `vercel.json` 配置文件，支持：
- API 路由配置
- 静态文件服务
- 重写规则
- CORS 设置

## 📊 使用场景

### 1. 设计评估
- 评估设计稿与需求描述的匹配度
- 批量检查设计一致性
- 自动化设计质量评分

### 2. 内容审核
- 图像内容与标签的相关性检查
- 批量内容分类和标记
- 内容质量评估

### 3. 搜索优化
- 基于文本描述的图像搜索
- 相似图像推荐
- 内容标签自动生成

### 4. 电商应用
- 商品图片与描述匹配度检查
- 自动化商品分类
- 推荐系统优化

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [API 在线测试](https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate)
- [Figma 插件开发指南](https://www.figma.com/plugin-docs/)
- [Vercel 部署文档](https://vercel.com/docs)
- [CLIP 模型介绍](https://openai.com/blog/clip/)

## 📞 支持

如有问题或建议，请：
- 提交 [Issue](https://github.com/your-username/nano_banana_Figma_plugin/issues)
- 查看 [API 文档](https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate)

---

**🌟 立即体验**: 访问 https://nano-banana-figma-plugin.vercel.app/api/clip-evaluate 开始使用！
