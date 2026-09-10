export default async function handler(req, res) {
  try {
    const url = 'https://www.ubereats.com/fr/store/napolithein-crousty-albi/TFP4kIGzR1OTwbF96Rrdvw';
    const r = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36',
        'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8'
      }
    });
    const html = await r.text();
    const normalized = html
      .replaceAll('\\u002F', '/')
      .replaceAll('\\/', '/')
      .replaceAll('&amp;', '&')
      .replaceAll('\\u0026', '&');
    const matches = normalized.match(/https?:\/\/tb-static\.uber\.com[^\"'<>\\\s]+/g) || [];
    const imageUrls = [...new Set(matches)].map((x) => x.replace(/[),.;]+$/, ''));
    const names = ['CURRY CROUSTY','DOLCE CROUSTY','THAÏ CRUNCH CROUSTY','NAPO CROUSTY','CHAMPY CROUSTY','CREAMY CHICKEN','CREAMY CHEESE','CREAMY CARBO','CARBONARA','POULET CREME','BOLOGNAISE','AMERICA','PESTO VERDE','FORESTIÈRE','PÂTES GRATINEES','GNOCCHI','NEMS','JALAPENOS','OIGNONS RINGS','BOUCHÉES CAMEMBERT','CROC','TOAST','TIRAMISU','TARTE AU DAIM','MILK'];
    const snippets = {};
    for (const name of names) {
      const i = normalized.toUpperCase().indexOf(name.toUpperCase());
      if (i >= 0) snippets[name] = normalized.slice(Math.max(0, i - 1000), i + 2500);
    }
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({ status: r.status, htmlLength: html.length, imageCount: imageUrls.length, imageUrls, snippets });
  } catch (e) {
    res.status(500).json({ error: String(e?.stack || e) });
  }
}
