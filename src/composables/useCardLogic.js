// ═══════════════════════════════════════════════════════════════
// CARD LOGIC COMPOSABLE — Tiến Lên
// Shared between Room 1 (single-player) and Room 2 (multiplayer)
// ═══════════════════════════════════════════════════════════════

export const SUITS = ['♠', '♣', '♦', '♥']
export const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']
export const SUIT_VAL = { '♠': 0, '♣': 1, '♦': 2, '♥': 3 }
export const RANK_VAL = {}
RANKS.forEach((r, i) => RANK_VAL[r] = i)

export const RED_SUITS = new Set(['♦', '♥'])
export const TWO_CUT_PENALTY = { '♠': 10, '♣': 20, '♦': 30, '♥': 40 }

export function cardValue(c) { return RANK_VAL[c.rank] * 4 + SUIT_VAL[c.suit] }
export function cardRankIdx(c) { return RANK_VAL[c.rank] }
export function sortHand(h) { return [...h].sort((a, b) => cardValue(a) - cardValue(b)) }
export function isRed(c) { return RED_SUITS.has(c.suit) }

export function createDeck() {
  const d = []
  for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s })
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

// ── COMBO CLASSIFICATION ──────────────────────────────────────
export function classify(cards) {
  const n = cards.length
  if (n === 0) return null
  const sorted = cards.slice().sort((a, b) => cardValue(a) - cardValue(b))
  const ranks = sorted.map(c => c.rank)
  const rvals = sorted.map(c => RANK_VAL[c.rank])
  const uniqRanks = [...new Set(ranks)]
  const highVal = cardValue(sorted[n - 1])

  if (n === 1) return { type: 'single', highVal, label: 'single' }
  if (n === 2 && uniqRanks.length === 1) return { type: 'pair', highVal, label: 'pair of ' + ranks[0] }
  if (n === 3 && uniqRanks.length === 1) return { type: 'triple', highVal, label: 'triple ' + ranks[0] }
  if (n === 4 && uniqRanks.length === 1) return { type: 'quad', highVal, label: 'BOMB (four ' + ranks[0] + 's)' }

  // Double pair: 2 consecutive pairs (4 cards), no 2s
  if (n === 4 && !rvals.includes(12)) {
    const rankGroups = {}
    sorted.forEach(c => { rankGroups[c.rank] = (rankGroups[c.rank] || []).concat(c) })
    const groupRanks = Object.keys(rankGroups)
    if (groupRanks.length === 2 && groupRanks.every(r => rankGroups[r].length === 2)) {
      const gRvals = groupRanks.map(r => RANK_VAL[r]).sort((a, b) => a - b)
      if (gRvals[1] - gRvals[0] === 1)
        return { type: 'doublepair', highVal, label: 'double pair ' + groupRanks.sort((a, b) => RANK_VAL[a] - RANK_VAL[b]).join('-') }
    }
  }

  // Straight: 3+ consecutive ranks, no 2s
  if (n >= 3) {
    if (!rvals.includes(12)) {
      const uniqRV = [...new Set(rvals)].sort((a, b) => a - b)
      if (uniqRV.length === n) {
        const consecutive = uniqRV.every((v, i) => i === 0 || v === uniqRV[i - 1] + 1)
        if (consecutive) {
          const suited = sorted.every(c => c.suit === sorted[0].suit)
          return { type: 'straight', len: n, highVal, suited, label: (suited ? 'suited ' : '') + n + '-card straight' }
        }
      }
    }
  }

  // Pair sequence: even count >= 6, consecutive ranks, no 2s
  if (n >= 6 && n % 2 === 0) {
    const pairCount = n / 2
    if (!rvals.includes(12)) {
      const rankGroups = {}
      sorted.forEach(c => { rankGroups[c.rank] = (rankGroups[c.rank] || []).concat(c) })
      const groupRanks = Object.keys(rankGroups)
      if (groupRanks.length === pairCount && groupRanks.every(r => rankGroups[r].length === 2)) {
        const gRvals = groupRanks.map(r => RANK_VAL[r]).sort((a, b) => a - b)
        const consec = gRvals.every((v, i) => i === 0 || v === gRvals[i - 1] + 1)
        if (consec)
          return { type: 'pairseq', len: pairCount, highVal, label: pairCount + '-pair sequence' }
      }
    }
  }

  return null
}

export function beats(combo, prevCards) {
  const prev = classify(prevCards)
  if (!prev) return true

  // Quad (bomb) beats everything except a higher quad, but DOES NOT beat a 5+ suited straight
  if (combo.type === 'quad') {
    if (prev.type === 'quad') return combo.highVal > prev.highVal
    if (prev.type === 'straight' && prev.len >= 5 && prev.suited) return false
    return true
  }

  // 5+ card suited straight is a SUPER BOMB. It chops: single 2, 3-pair seq, 4-pair seq, and Quad!
  if (combo.type === 'straight' && combo.len >= 5 && combo.suited) {
    if (prev.type === 'single' && prevCards[0].rank === '2') return true
    if (prev.type === 'pairseq' && prev.len >= 3) return true
    if (prev.type === 'quad') return true
  }

  // Pair sequence of 3+ pairs can chop a single 2
  if (combo.type === 'pairseq' && combo.len >= 3 && prev.type === 'single' && prevCards[0].rank === '2')
    return true

  if (combo.type !== prev.type) return false
  if (combo.type === 'straight' && combo.len !== prev.len) return false
  if (combo.type === 'pairseq' && combo.len !== prev.len) return false

  // Same-length straight: suited beats mixed; suited vs suited / mixed vs mixed use highVal
  if (combo.type === 'straight' && combo.len === prev.len) {
    if (combo.suited && !prev.suited) return true   // suited always beats mixed
    if (!combo.suited && prev.suited) return false  // mixed never beats suited
    return combo.highVal > prev.highVal              // same type → higher card wins
  }

  return combo.highVal > prev.highVal
}

// ── COMBO GENERATION ──────────────────────────────────────────

function getCombos(arr, k) {
  const result = []
  function bt(start, cur) {
    if (cur.length === k) { result.push([...cur]); return }
    for (let i = start; i <= arr.length - (k - cur.length); i++) {
      cur.push(arr[i]); bt(i + 1, cur); cur.pop()
    }
  }
  bt(0, [])
  return result
}

export function getAllValidCombos(hand) {
  const results = []
  hand.forEach(c => results.push([c]))
  for (let sz = 2; sz <= 4; sz++) {
    getCombos(hand, sz).forEach(combo => { if (classify(combo)) results.push(combo) })
  }
  for (let len = 3; len <= hand.length; len++) {
    getCombos(hand, len).forEach(combo => {
      const c = classify(combo)
      if (c && (c.type === 'straight' || c.type === 'pairseq')) results.push(combo)
    })
  }
  return results
}

// ── AI LOGIC ──────────────────────────────────────────────────

export function aiLead(p, hands) {
  const hand = hands[p]
  const all = getAllValidCombos(hand)
  if (hand.length <= 3) return all.sort((a, b) => b.length - a.length)[0] || [hand[0]]

  function scoreCombo(cards) {
    const c = classify(cards)
    if (!c) return -999
    let s = cards.length * 10
    if (cards.some(x => x.rank === '2')) s -= 25
    s -= c.highVal * 0.4
    if (c.type === 'pair') s += 5
    if (c.type === 'triple') s += 8
    if (c.type === 'pairseq') s += c.len * 6
    if (c.type === 'straight') {
      s += c.len * 4
      if (c.len >= 5 && c.suited) s -= 60 // Save super bombs!
    }
    if (c.type === 'quad') s -= 40
    if (c.type === 'pairseq' && c.len >= 3) s -= 30 // Save standard bombs
    return s
  }
  all.sort((a, b) => scoreCombo(b) - scoreCombo(a))
  return all[0] || [hand[0]]
}

export function aiRespond(p, lp, hands, lastPlayer) {
  const hand = hands[p]
  const all = getAllValidCombos(hand)
  const beaters = all.filter(cards => { const c = classify(cards); return c && beats(c, lp) })
  if (beaters.length === 0) return null

  const lastHandSize = lastPlayer >= 0 ? (hands[lastPlayer]?.length || 0) : 99
  const urgent = lastHandSize <= 3

  const isBomb = (cCombo) => {
    if (!cCombo) return false;
    if (cCombo.type === 'quad') return true;
    if (cCombo.type === 'pairseq' && cCombo.len >= 3) return true;
    if (cCombo.type === 'straight' && cCombo.len >= 5 && cCombo.suited) return true;
    return false;
  }

  const bombs = beaters.filter(c => isBomb(classify(c)))
  const normal = beaters.filter(c => !isBomb(classify(c)))

  function scoreBeater(cards) {
    const c = classify(cards)
    let s = 0
    s -= c.highVal
    s += cards.length * 2
    if (cards.some(x => x.rank === '2')) s -= 15
    if (urgent) s += c.highVal * 0.4
    if (c.type === 'straight' && c.suited && c.len >= 5) s -= 30 // prioritize using cheaper bombs first if multiple
    return s
  }

  if (normal.length > 0) {
    normal.sort((a, b) => scoreBeater(b) - scoreBeater(a))
    return normal[0]
  }
  if (bombs.length > 0) return bombs[0]
  return null
}

// ── INSTANT WIN CHECK ─────────────────────────────────────────

export function countPairs(hand) {
  const groups = {}
  hand.forEach(c => { groups[c.rank] = (groups[c.rank] || 0) + 1 })
  let pairs = 0
  Object.values(groups).forEach(cnt => { pairs += Math.floor(cnt / 2) })
  return pairs
}

export function checkInstantWin(hand) {
  const twos = hand.filter(c => c.rank === '2')
  if (twos.length === 4) return 'FOUR 2s'
  const threes = hand.filter(c => c.rank === '3')
  if (threes.length === 4) return 'FOUR 3s'
  if (countPairs(hand) >= 6) return 'SIX PAIRS'
  return null
}
