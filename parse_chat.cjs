const fs = require('fs');

const rawChat = fs.readFileSync('chat.txt', 'utf-8');
const lines = rawChat.split('\n');

const services = new Map(); // key: "Name - Date", value: object

let currentService = null;

for (let line of lines) {
  line = line.trim();
  
  // Remove WhatsApp prefix if it exists: e.g. "[23/08/2026, 11:49:15] Fábio: "
  const prefixMatch = line.match(/^\[\d{2}\/\d{2}\/\d{4}[^\]]+\][^:]+:\s*(.*)/);
  if (prefixMatch) {
    line = prefixMatch[1];
  }
  
  // Also sometimes there is no "IGREJA:", just the start of a service
  const dateMatch = line.match(/^(.*?)\s*(?:-)?\s*(\d{2}\.\d{2}\.\d{4})/);
  if (dateMatch && !line.startsWith('~') && !line.toLowerCase().includes('não houve')) {
    let name = dateMatch[1].trim();
    // clean up name
    name = name.replace(/^[~*]+|[~*]+$/g, '').trim(); // remove leading/trailing ~ or *
    if (name.toUpperCase().startsWith('CULTO QUARTA')) name = 'CULTO QUARTA';
    if (name.toUpperCase().startsWith('CULTO DOMINGO')) name = 'CULTO DOMINGO';
    if (name.toUpperCase().startsWith('PRESS POWER')) name = 'PRESS POWER';
    
    let date = dateMatch[2].trim();
    currentService = {
      name,
      date,
      minister: '',
      theme: '',
      adults: 0,
      visitors: 0,
      kids: 0
    };
    services.set(`${name} - ${date}`, currentService);
    continue;
  }
  
  if (currentService) {
    let lowerLine = line.toLowerCase().replace(/^[~*\-•\s]+/, ''); // remove bullets
    if (lowerLine.startsWith('membros:')) lowerLine = lowerLine.replace('membros:', 'adultos:');
    if (lowerLine.startsWith('ministro:')) {
      let m = line.substring(line.toLowerCase().indexOf('ministro:') + 9).trim();
      m = m.replace(/^[~*]+|[~*]+$/g, '').trim();
      if (m) currentService.minister = m;
    } else if (lowerLine.startsWith('tema:')) {
      let t = line.substring(line.toLowerCase().indexOf('tema:') + 5).trim();
      t = t.replace(/^[~*]+|[~*]+$/g, '').trim();
      if (t) currentService.theme = t;
    } else if (lowerLine.startsWith('adultos:')) {
      let numStr = line.substring(line.toLowerCase().indexOf('adultos:') + 8).replace(/\D/g, '');
      if (numStr) currentService.adults = parseInt(numStr, 10);
    } else if (lowerLine.startsWith('visitantes:')) {
      let numStr = line.substring(line.toLowerCase().indexOf('visitantes:') + 11).replace(/\D/g, '');
      if (numStr) currentService.visitors = parseInt(numStr, 10);
    } else if (lowerLine.startsWith('crianças:')) {
      let numStr = line.substring(line.toLowerCase().indexOf('crianças:') + 9).replace(/\D/g, '');
      if (numStr) currentService.kids = parseInt(numStr, 10);
    }
  }
}

// Now sort them by date?
// The date is DD.MM.YYYY
function parseDate(dStr) {
  const [day, month, year] = dStr.split('.');
  return new Date(`${year}-${month}-${day}`);
}

const sortedServices = Array.from(services.values()).filter(s => s.adults > 0 || s.kids > 0).sort((a, b) => parseDate(a.date) - parseDate(b.date));

let output = 'IGREJA: Vargem Pequena\n\n';
for (const s of sortedServices) {
  output += `${s.name} - ${s.date}\n`;
  if (s.minister) output += `Ministro: ${s.minister}\n`;
  if (s.theme) output += `Tema: ${s.theme}\n`;
  output += `- Adultos: ${s.adults}\n`;
  output += `- Visitantes: ${s.visitors}\n`;
  output += `- Crianças: ${s.kids}\n\n`;
}

fs.writeFileSync('parsed_reports.txt', output);
console.log(`Wrote ${sortedServices.length} services`);

