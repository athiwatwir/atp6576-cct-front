const address = '555/191 โครงการฟิฟธ์อเวนิว รวมโชค ตำบลหนองจ็อม อำเภอสันทราย จ.เชียงใหม่ 50210'
const phone = '086-352-6458'
const lineId = '@119nownk'

export const contactInfo = {
  company: 'บริษัท เอทีพีกรุ๊ปหกห้าเจ็ดหก จำกัด',
  brand: 'ClickClass Tutor',
  address,
  phone,
  phoneHref: `tel:${phone.replace(/-/g, '')}`,
  lineId,
  lineUrl: `https://line.me/R/ti/p/${encodeURIComponent(lineId)}`,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`,
}
