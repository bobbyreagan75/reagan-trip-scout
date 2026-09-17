import { DEMO_PASSPHRASE } from '../data/household'

const SALT = 'rts:v1:household'

export async function hashPassphrase(passphrase: string): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${passphrase.trim()}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function demoPassHash(): Promise<string> {
  return hashPassphrase(DEMO_PASSPHRASE)
}

export async function verifyPassphrase(passphrase: string, expectedHash: string): Promise<boolean> {
  const actual = await hashPassphrase(passphrase)
  if (actual.length !== expectedHash.length) return false
  let mismatch = 0
  for (let i = 0; i < actual.length; i += 1) {
    mismatch |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  }
  return mismatch === 0
}
