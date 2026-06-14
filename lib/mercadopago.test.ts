import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { verifyWebhookSignature } from './mercadopago'

const secret = 'test_secret_123'
const sign = (manifest: string) =>
  crypto.createHmac('sha256', secret).update(manifest).digest('hex')

describe('verifyWebhookSignature', () => {
  it('valida una firma correcta', () => {
    const dataId = '123456'
    const xRequestId = 'req-abc'
    const ts = '1704908010'
    const v1 = sign(`id:${dataId};request-id:${xRequestId};ts:${ts};`)
    expect(
      verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId, dataId, secret }),
    ).toBe(true)
  })

  it('lleva data.id alfanumérico a minúsculas', () => {
    const ts = '1700000000'
    const v1 = sign(`id:abc123;request-id:r1;ts:${ts};`)
    expect(
      verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: 'r1', dataId: 'ABC123', secret }),
    ).toBe(true)
  })

  it('omite segmentos faltantes (sin request-id)', () => {
    const ts = '1700000000'
    const v1 = sign(`id:99;ts:${ts};`)
    expect(
      verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: null, dataId: '99', secret }),
    ).toBe(true)
  })

  it('rechaza una firma alterada', () => {
    const ts = '1704908010'
    const v1 = sign(`id:123456;request-id:req-abc;ts:${ts};`)
    expect(
      verifyWebhookSignature({
        xSignature: `ts=${ts},v1=${v1.replace(/.$/, '0')}`,
        xRequestId: 'req-abc',
        dataId: '123456',
        secret,
      }),
    ).toBe(false)
  })

  it('rechaza si el manifest no coincide (otro dataId)', () => {
    const ts = '1704908010'
    const v1 = sign(`id:123456;request-id:req-abc;ts:${ts};`)
    expect(
      verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: 'req-abc', dataId: '999', secret }),
    ).toBe(false)
  })

  it('rechaza si falta v1', () => {
    expect(
      verifyWebhookSignature({ xSignature: 'ts=123', xRequestId: 'r', dataId: '1', secret }),
    ).toBe(false)
  })

  it('rechaza con secret vacío', () => {
    const v1 = sign('id:1;request-id:r;ts:1;')
    expect(
      verifyWebhookSignature({ xSignature: `ts=1,v1=${v1}`, xRequestId: 'r', dataId: '1', secret: '' }),
    ).toBe(false)
  })

  it('rechaza x-signature nulo', () => {
    expect(
      verifyWebhookSignature({ xSignature: null, xRequestId: 'r', dataId: '1', secret }),
    ).toBe(false)
  })
})
