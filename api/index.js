// Vercel 无服务器函数 - 主入口
const { spawn } = require('child_process');
const url = require('url');

// CORS 头部设置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// 响应工具函数
function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...corsHeaders
  });
  res.end(JSON.stringify(data));
}

// 真实 CLIP 评估函数
async function evaluateWithPython(imageUrl, text) {
  return new Promise((resolve, reject) => {
    const pythonCode = `
import sys
import json
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
from io import BytesIO

try:
    # 加载模型和处理器
    model_name = "openai/clip-vit-base-patch32"
    model = CLIPModel.from_pretrained(model_name)
    processor = CLIPProcessor.from_pretrained(model_name)
    
    # 加载图像
    response = requests.get("${imageUrl}")
    image = Image.open(BytesIO(response.content))
    
    # 处理输入
    inputs = processor(text=["${text}"], images=image, return_tensors="pt", padding=True)
    
    # 计算相似度
    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image
        similarity = float(logits_per_image[0][0])
    
    result = {
        "success": True,
        "similarity_score": similarity,
        "model": model_name,
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
    }
    
    print(json.dumps(result))
    
except Exception as e:
    error_result = {
        "success": False,
        "error": str(e),
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
    }
    print(json.dumps(error_result))
    sys.exit(1)
`;

    const pythonProcess = spawn('python3', ['-c', pythonCode]);
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Python process failed: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

// 主处理函数
module.exports = async (req, res) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    // 健康检查
    if (pathname === '/api/health' || pathname === '/health') {
      sendResponse(res, 200, {
        status: 'healthy',
        service: 'Real CLIP Evaluation API',
        version: '2.0.0',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // API 信息
    if (pathname === '/api/info' || pathname === '/info') {
      sendResponse(res, 200, {
        name: 'Real CLIP Evaluation API',
        version: '2.0.0',
        description: 'Real CLIP model evaluation using Hugging Face transformers',
        endpoints: {
          'GET /api/health': 'Health check',
          'GET /api/info': 'API information',
          'POST /api/evaluate/text-image': 'Text-image similarity evaluation',
          'POST /api/batch-evaluate': 'Batch evaluation'
        },
        model: 'openai/clip-vit-base-patch32',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 文本-图像相似度评估
    if (pathname === '/api/evaluate/text-image' || pathname === '/evaluate/text-image') {
      if (req.method !== 'POST') {
        sendResponse(res, 405, { error: 'Method not allowed' });
        return;
      }

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const { text, image_url } = JSON.parse(body);

          if (!text || !image_url) {
            sendResponse(res, 400, {
              error: 'Missing required fields: text and image_url'
            });
            return;
          }

          const result = await evaluateWithPython(image_url, text);
          
          sendResponse(res, 200, {
            success: true,
            text: text,
            image_url: image_url,
            similarity_score: result.similarity_score,
            model: result.model,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Evaluation error:', error);
          sendResponse(res, 500, {
            error: 'Internal server error',
            message: error.message
          });
        }
      });
      return;
    }

    // 批量评估
    if (pathname === '/api/batch-evaluate' || pathname === '/batch-evaluate') {
      if (req.method !== 'POST') {
        sendResponse(res, 405, { error: 'Method not allowed' });
        return;
      }

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const { evaluations } = JSON.parse(body);

          if (!Array.isArray(evaluations)) {
            sendResponse(res, 400, {
              error: 'evaluations must be an array'
            });
            return;
          }

          const results = [];
          for (const evaluation of evaluations) {
            try {
              const result = await evaluateWithPython(evaluation.image_url, evaluation.text);
              results.push({
                success: true,
                text: evaluation.text,
                image_url: evaluation.image_url,
                similarity_score: result.similarity_score,
                model: result.model
              });
            } catch (error) {
              results.push({
                success: false,
                text: evaluation.text,
                image_url: evaluation.image_url,
                error: error.message
              });
            }
          }

          sendResponse(res, 200, {
            success: true,
            results: results,
            total: results.length,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Batch evaluation error:', error);
          sendResponse(res, 500, {
            error: 'Internal server error',
            message: error.message
          });
        }
      });
      return;
    }

    // 404 - 未找到路由
    sendResponse(res, 404, {
      error: 'Not found',
      available_endpoints: [
        'GET /api/health',
        'GET /api/info', 
        'POST /api/evaluate/text-image',
        'POST /api/batch-evaluate'
      ]
    });

  } catch (error) {
    console.error('Server error:', error);
    sendResponse(res, 500, {
      error: 'Internal server error',
      message: error.message
    });
  }
};