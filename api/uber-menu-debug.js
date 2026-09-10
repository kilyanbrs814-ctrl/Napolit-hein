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
    const sectionUuid = root.sections?.[0]?.uuid;
    const groupsRaw = sectionUuid ? (root.catalogSectionsMap?.[sectionUuid] || []) : [];

    const groups = groupsRaw.map((entry, index) => {
      const payload = entry?.payload?.standardItemsPayload || {};
      const items = (payload.catalogItems || []).map((item) => ({
        uuid: item.uuid || null,
        title: item.title || '',
        description: item.itemDescription || item.description || '',
        price: item.price ?? null,
        imageUrl: item.imageUrl || item.imageURL || item.image?.url || null,
        badge: item.badge?.text || item.badge || null,
        rating: item.rating || null
      }));
      return {
        index,
        title: payload.title || entry.title || entry?.payload?.title || '',
        subtitle: payload.subtitle || '',
        items
      };
    });

    res.setHeader('cache-control', 'no-store');
    res.status(200).json({ status: r.status, apiStatus: data.status, store: root.title, groups });
  } catch (e) {
    res.status(500).json({ error: String(e?.stack || e) });
  }
}
