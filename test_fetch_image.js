import fs from 'fs';

async function testFetch() {
  const urls = [
    'https://bebodywise.com/product/advanced-hair-growth-serum',
    'https://manmatters.com/dp/1-ketoconazole-shampoo-100-ml/1144207'
  ];

  for (const url of urls) {
    console.log('\n--- Testing URL:', url);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      
      // Match all images or cdn urls in html
      const imgUrls = [...html.matchAll(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi)].map(m => m[0]);
      console.log('Found total image URLs:', imgUrls.length);
      console.log('First 5 image URLs:', imgUrls.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  }
}

testFetch();
