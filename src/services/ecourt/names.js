// Loose Latin-name comparison for EPIC identity corroboration (pure).

const TITLES = ['mr', 'mrs', 'ms', 'dr', 'shri', 'sri', 'smt', 'kumari', 'km'];

function nameTokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !TITLES.includes(t));
}

/** 0–100: share of the given name's tokens found on the roll name (initials match prefixes). */
function nameMatchScore(given, onRoll) {
  const a = nameTokens(given);
  const b = nameTokens(onRoll);
  if (!a.length || !b.length) return 0;
  let hit = 0;
  for (const t of a) {
    if (b.some((x) => x === t || (t.length === 1 && x.startsWith(t)) || (x.length === 1 && t.startsWith(x)))) hit++;
  }
  return Math.round((hit / a.length) * 100);
}

module.exports = { nameTokens, nameMatchScore };
