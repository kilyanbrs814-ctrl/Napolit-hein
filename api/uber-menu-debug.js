export default async function handler(req, res) {
  try {
    const endpoint = 'https://www.ubereats.com/_p/api/getStoreV1?localeCode=fr-FR';
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': 'x',
        'x-uber-target-location-latitude': '43.9298',
        'x-uber-target-location-longitude': '2.1480',
        'origin': 'https://www.ubereats.com',
        'referer': 'https://www.ubereats.com/fr/store/napolithein-crousty-albi/TFP4kIGzR1OTwbF96Rrdvw',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36',
        'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8'
      },
      body: JSON.stringify({ storeUuid: '4c53f890-81b3-4753-93c1-b17de91addbf', diningMode: 'DELIVERY' })
    });
    const data = await r.json();
    const root = data?.data || {};

    const hits = [];
    const seen = new Set();
    const walk = (value, path = 'data') => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) {
        value.forEach((v, i) => walk(v, `${path}[${i}]`));
        return;
      }

      const title = value.title || value.name || value.itemTitle || '';
      const imageUrl = value.imageUrl || value.imageURL || value.image?.url || value.image?.imageUrl || value.image?.imageURL || null;
      const uuid = value.uuid || value.itemUuid || value.itemUUID || value.id || null;
      const price = value.price ?? value.priceTagline ?? value.displayPrice ?? value.itemPrice ?? null;
      const desc = value.itemDescription || value.description || value.subtitle || '';
      if (title && (imageUrl || price != null || desc)) {
        const key = `${title}|${uuid || ''}|${imageUrl || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push({ path, title, uuid, price, description: desc, imageUrl });
        }
      }
      Object.entries(value).forEach(([k, v]) => walk(v, `${path}.${k}`));
    };
    walk(root);

    const compactSections = (root.sections || []).map((s) => ({
      title: s.title || '',
      uuid: s.uuid || null,
      subsectionUuids: s.subsectionUuids || s.subsectionUUIDs || s.subsections || null
    }));

    const subsectionSummary = Object.entries(root.subsectionsMap || {}).map(([k, s]) => ({
      key: k,
      title: s?.title || '',
      uuid: s?.uuid || k,
      itemUuids: s?.itemUuids || s?.itemUUIDs || s?.items || s?.itemEntities || null
    }));

    res.setHeader('cache-control', 'no-store');
    res.status(200).json({
      status: r.status,
      apiStatus: data.status,
      store: { title: root.title, uuid: root.uuid },
      sections: compactSections,
      subsections: subsectionSummary,
      hits
    });
  } catch (e) {
    res.status(500).json({ error: String(e?.stack || e) });
  }
}
