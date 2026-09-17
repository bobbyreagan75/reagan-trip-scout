import type { BalanceRow } from '../types'

export type ParsedCsv = {
  rows: { program: string; amount: number; traveler: string }[]
  warnings: string[]
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (ch === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map((h) => h.toLowerCase())
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h.includes(candidate))
    if (idx >= 0) return idx
  }
  return -1
}

export function parseAwardWalletCsv(text: string): ParsedCsv {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const warnings: string[] = []
  if (lines.length === 0) return { rows: [], warnings: ['The file was empty.'] }

  const headers = splitCsvLine(lines[0])
  const programIdx = findColumn(headers, ['program', 'account name', 'loyalty'])
  const amountIdx = findColumn(headers, ['balance', 'points', 'miles', 'amount'])
  const travelerIdx = findColumn(headers, ['traveler', 'account', 'owner', 'name'])

  const start = programIdx >= 0 && amountIdx >= 0 ? 1 : 0
  if (start === 0) {
    warnings.push('No header row detected — treating the first two columns as program and balance.')
  }

  const rows: ParsedCsv['rows'] = []
  const dataLines = start === 1 ? lines.slice(1) : lines
  const pIdx = start === 1 ? programIdx : 0
  const aIdx = start === 1 ? amountIdx : 1
  const tIdx = start === 1 ? travelerIdx : 2

  for (const line of dataLines) {
    const cells = splitCsvLine(line)
    const program = cells[pIdx] ?? ''
    const amountRaw = (cells[aIdx] ?? '').replace(/[^0-9.-]/g, '')
    const amount = Number(amountRaw)
    const traveler = (tIdx >= 0 ? cells[tIdx] : '') || 'Household'
    if (!program || Number.isNaN(amount)) {
      warnings.push(`Skipped a row that did not look like a balance: ${line}`)
      continue
    }
    rows.push({ program, amount, traveler })
  }

  return { rows, warnings }
}

export function matchCsvProgramToKey(program: string, balances: BalanceRow[]): BalanceRow | undefined {
  const q = program.toLowerCase()
  const scored = balances.map((row) => {
    const name = row.program.toLowerCase()
    let score = 0
    if (name === q) score = 3
    else if (name.includes(q) || q.includes(name)) score = 2
    else {
      const tokens = q.split(/\s+/).filter((t) => t.length > 2)
      if (tokens.some((token) => name.includes(token))) score = 1
    }
    return { row, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.score ? scored[0].row : undefined
}
