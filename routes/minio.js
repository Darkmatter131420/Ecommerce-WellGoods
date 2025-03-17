const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { minioClient } = require('../config/minioClient');
require('dotenv').config();

// 配置Multer（建议单独创建配置文件）
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1024 * 1024 * 5 // 限制5MB
  }
});


// 存储桶初始化检查
const initBucket = async () => {
    try {
      const exists = await minioClient.bucketExists(process.env.MINIO_BUCKET_NAME);
      console.log('存储桶检查结果:', exists);
      if (!exists) {
        await minioClient.makeBucket(process.env.MINIO_BUCKET_NAME, 'us-east-1');
        console.log('存储桶创建成功');
      }
    } catch (err) {
      console.error('存储桶初始化失败:', err);
      process.exit(1);
    }
  };

// 文件上传路由
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    initBucket();

    if (!req.is('multipart/form-data')) {
      return res.status(400).json({ error: '无效的内容类型' });
    }

    console.log('文件上传请求:', req.file);
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '未选择文件' });
    }

    // 生成唯一文件名
    const objectName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(file.destination, file.filename);

    // 上传到MinIO
    await minioClient.fPutObject(
      process.env.MINIO_BUCKET_NAME,
      objectName,
      filePath,
      { 'Content-Type': file.mimetype }
    );

    // 删除临时文件
    fs.unlink(filePath, (err) => {
      if (err) console.error('临时文件删除失败:', err);
    });

    // 生成可直接访问的URL
    minioClient.presignedGetObject(
      process.env.MINIO_BUCKET_NAME,
      objectName,
      (err, presignedUrl) => {
        if (err) {
          console.error('生成图片链接失败:', err);
          return res.status(500).json({ error: '无法生成图片链接' });
        }
        res.status(201).json({ 
          message: '文件上传成功',
          url: presignedUrl
        });
      }
    )
  } catch (err) {
    console.error('上传错误:', err);
    res.status(500).json({ error: '文件上传失败' });
  }
});


// 文件下载路由（带预签名URL）
router.get('/download/:objectName', (req, res) => {
  const { objectName } = req.params;
  const expiry = 24 * 60 * 60; // 链接有效期24小时

  minioClient.presignedGetObject(
    process.env.MINIO_BUCKET_NAME,
    objectName,
    expiry,
    (err, presignedUrl) => {
      if (err) {
        console.error('生成下载链接失败:', err);
        return res.status(500).json({ error: '无法生成下载链接' });
      }
      res.json({ 
        url: presignedUrl,
        expires: new Date(Date.now() + expiry * 1000).toISOString()
      });
    }
  );
});

// 删除文件路由
router.delete('/:objectName', async (req, res) => {
  try {
    await minioClient.removeObject(
      process.env.MINIO_BUCKET_NAME,
      req.params.objectName
    );
    res.json({ message: '文件删除成功' });
  } catch (err) {
    console.error('删除失败:', err);
    res.status(500).json({ error: '文件删除失败' });
  }
});

module.exports = router;
