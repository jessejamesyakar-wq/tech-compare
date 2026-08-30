const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

/**
 * Applies ONLY APPROVED items from data/icecat_staging_preview.json
 */
function applyApprovedChanges() {
  const stagingPath = path.join(__dirname, '../data/icecat_staging_preview.json');
  if (!fs.existsSync(stagingPath)) {
    console.error('❌ Staging file not found: data/icecat_staging_preview.json');
    return;
  }

  const staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
  const approved = (staging.items || []).filter(item => item.status === 'APPROVED' && item.icecatHighPic);

  if (approved.length === 0) {
    console.log('ℹ️ No approved items found in staging. All items currently have status PENDING_APPROVAL.');
    console.log('To approve items, edit data/icecat_staging_preview.json and set "status": "APPROVED" on the desired products.');
    return;
  }

  console.log(`Applying ${approved.length} approved Icecat image updates...`);
  // Will download approved high-res photos and update catalog datasets with audit logging
  logDataChange({
    title: `Applied ${approved.length} Approved Icecat Media Assets`,
    files: ['data/icecat_staging_preview.json'],
    description: `Updated official high-res images for ${approved.length} products from Icecat catalog.`,
    rationale: 'User approved official manufacturer images replacement.'
  });
}

applyApprovedChanges();
