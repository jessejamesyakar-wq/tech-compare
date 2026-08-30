const fs = require('fs');
const path = require('path');

/**
 * Appends a structured audit entry to CHANGELOG_DATA.md
 * @param {Object} entry
 * @param {string} entry.title
 * @param {string[]} entry.files
 * @param {string} entry.description
 * @param {string} entry.rationale
 */
function logDataChange({ title, files = [], description, rationale }) {
  const changelogPath = path.join(__dirname, '../CHANGELOG_DATA.md');
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

  const entryText = `
### ${title}
- **Tarih:** ${dateStr} ${timeStr}
- **Etkilenen Dosyalar:** ${files.map(f => `\`${f}\``).join(', ')}
- **Yapılan Değişiklik:** ${description}
- **Gerekçe:** ${rationale}

---
`;

  if (fs.existsSync(changelogPath)) {
    fs.appendFileSync(changelogPath, entryText, 'utf8');
  } else {
    fs.writeFileSync(changelogPath, `# 📋 Ürün Veri Değişiklik Günlüğü (Data Audit Log)\n\n${entryText}`, 'utf8');
  }

  console.log(`📝 Logged data change to CHANGELOG_DATA.md: "${title}"`);
}

module.exports = { logDataChange };
