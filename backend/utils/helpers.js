const supabase = require("../config/supabase");

// Helper to map DB snake_case schemas to camelCase for the API
function mapGroup(dbGroup) {
  if (!dbGroup) return null;
  return {
    id: dbGroup.id,
    name: dbGroup.name,
    slug: dbGroup.slug,
    booth_number: dbGroup.booth_number,
    category: dbGroup.category,
    description: dbGroup.description,
    fullDescription: dbGroup.full_description,
    members: dbGroup.members || [],
    photoColor: dbGroup.photo_color,
    votes: dbGroup.votes || 0
  };
}

function mapVisitor(dbVisitor) {
  if (!dbVisitor) return null;
  return {
    identifier: dbVisitor.identifier,
    name: dbVisitor.name,
    category: dbVisitor.category,
    verifiedAt: dbVisitor.verified_at,
    deviceFingerprint: dbVisitor.device_fingerprint,
    ip: dbVisitor.ip
  };
}

function mapVote(dbVote) {
  if (!dbVote) return null;
  return {
    visitorIdentifier: dbVote.visitor_identifier,
    groupId: dbVote.group_id,
    voteCode: dbVote.vote_code,
    votedAt: dbVote.voted_at,
    ip: dbVote.ip
  };
}

// Helper to push audit logs to Supabase
async function addAuditLog(action, detail, status = "success") {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  try {
    const { error } = await supabase.from('audit_logs').insert([
      { id, time: timeStr, action, detail, status }
    ]);
    if (error) throw error;
  } catch (err) {
    console.error(`Error saving audit log to Supabase:`, err.message);
  }
  console.log(`[AUDIT LOG] [${status.toUpperCase()}] ${action}: ${detail}`);
}

// Helper to format client IP
function getClientIp(req) {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }
  return ip;
}

module.exports = {
  mapGroup,
  mapVisitor,
  mapVote,
  addAuditLog,
  getClientIp
};
