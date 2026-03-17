#!/usr/bin/env node

/**
 * 获取真实知乎热榜数据（备用方案）
 * 使用网页抓取或其他API获取
 */

const https = require('https');
const cheerio = require('cheerio');

console.log('🔥 获取知乎热榜数据...');
console.log('='.repeat(50));

// 方法1：尝试通过API获取
async function getZhihuHotAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.zhihu.com',
      port: 443,
      path: '/api/v3/feed/topstory/hot-lists/total?limit=10',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// 方法2：通过热门话题页面获取
async function getZhihuHotTopics() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.zhihu.com',
      port: 443,
      path: '/hot',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const $ = cheerio.load(data);
          const hotItems = [];
          
          // 尝试解析热榜
          $('.HotList-list .HotItem').slice(0, 10).each((i, el) => {
            const title = $(el).find('.HotItem-title').text().trim();
            const excerpt = $(el).find('.HotItem-excerpt').text().trim();
            const metrics = $(el).find('.HotItem-metrics').text().trim();
            
            if (title) {
              hotItems.push({
                rank: i + 1,
                title,
                excerpt,
                metrics,
                url: $(el).find('a').attr('href') || '#'
              });
            }
          });
          
          if (hotItems.length > 0) {
            resolve({
              success: true,
              source: 'zhihu-hot-page',
              count: hotItems.length,
              items: hotItems,
              timestamp: new Date().toISOString()
            });
          } else {
            // 备选解析方法
            $('.HotList .HotList-list .HotItem-content').slice(0, 10).each((i, el) => {
              const title = $(el).find('a').text().trim();
              const metrics = $(el).find('.HotItem-metrics').text().trim();
              
              if (title) {
                hotItems.push({
                  rank: i + 1,
                  title,
                  metrics,
                  timestamp: new Date().toISOString()
                });
              }
            });
            
            resolve({
              success: hotItems.length > 0,
              source: 'zhihu-alt-parsing',
              count: hotItems.length,
              items: hotItems,
              timestamp: new Date().toISOString()
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// 方法3：模拟数据（如果API失败）
function getMockZhihuHot() {
  const mockTopics = [
    { rank: 1, title: "AI时代如何保持竞争力？", metrics: "125万热度" },
    { rank: 2, title: "2026年最具潜力的科技趋势", metrics: "98万热度" },
    { rank: 3, title: "个人如何抓住Web3.0机遇", metrics: "87万热度" },
    { rank: 4, title: "大语言模型对工作的影响", metrics: "76万热度" },
    { rank: 5, title: "AI绘画工具推荐与测评", metrics: "65万热度" },
    { rank: 6, title: "加密货币投资策略分享", metrics: "54万热度" },
    { rank: 7, title: "远程工作如何提高效率", metrics: "43万热度" },
    { rank: 8, title: "智能家居设备选购指南", metrics: "32万热度" },
    { rank: 9, title: "新能源汽车技术发展", metrics: "21万热度" },
    { rank: 10, title: "元宇宙应用场景探讨", metrics: "10万热度" }
  ];
  
  return {
    success: true,
    source: 'mock-data',
    count: mockTopics.length,
    items: mockTopics,
    timestamp: new Date().toISOString(),
    note: '由于网络限制，使用模拟数据展示功能。实际部署时可连接真实API。'
  };
}

// 主函数
async function main() {
  console.log('📡 尝试获取知乎热榜...\n');
  
  let result;
  
  try {
    // 先尝试API
    console.log('🔗 尝试方法1: 知乎API...');
    result = await getZhihuHotAPI().catch(() => null);
    
    if (result && result.data && result.data.length > 0) {
      console.log('✅ API获取成功');
      result = {
        success: true,
        source: 'zhihu-api',
        count: result.data.length,
        items: result.data.slice(0, 10).map((item, i) => ({
          rank: i + 1,
          title: item.target.title || item.target.question.title,
          excerpt: item.target.excerpt || '',
          metrics: `${(item.detail_text || '').replace('热度', '')}热度`,
          url: `https://www.zhihu.com/question/${item.target.id}`
        })),
        timestamp: new Date().toISOString()
      };
    } else {
      // 尝试方法2
      console.log('🌐 尝试方法2: 网页解析...');
      result = await getZhihuHotTopics().catch(() => null);
      
      if (!result || !result.success) {
        console.log('⚠️  使用模拟数据...');
        result = getMockZhihuHot();
      }
    }
  } catch (error) {
    console.log('❌ 获取失败，使用模拟数据...');
    result = getMockZhihuHot();
  }
  
  // 输出结果
  console.log('\n' + '='.repeat(50));
  console.log('🔥 知乎热榜 TOP 10');
  console.log('='.repeat(50));
  console.log(`📅 时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`📊 来源: ${result.source}`);
  console.log('');
  
  result.items.forEach(item => {
    console.log(`🏆 ${item.rank}. ${item.title}`);
    if (item.excerpt) console.log(`   💬 ${item.excerpt}`);
    if (item.metrics) console.log(`   📈 ${item.metrics}`);
    console.log('');
  });
  
  if (result.note) {
    console.log(`💡 ${result.note}`);
  }
  
  console.log('\n🚀 通过OpenClaw Flow自动化获取：');
  console.log('   openclaw-flow process "知乎热榜"');
  console.log('   openclaw-flow process "每天早上9点获取知乎热榜"');
  
  // 保存到文件
  const fs = require('fs');
  const path = require('path');
  
  const outputDir = path.join(__dirname, 'zhihu-hot-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filename = `zhihu_hot_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
  
  console.log(`\n💾 数据已保存: ${filepath}`);
  
  return result;
}

// 运行
main().catch(console.error);