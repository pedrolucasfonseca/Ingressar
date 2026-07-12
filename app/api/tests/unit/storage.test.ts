process.env['OBJECT_STORAGE_ENDPOINT'] = 'http://localhost:9000'
process.env['OBJECT_STORAGE_ACCESS_KEY'] = 'minioadmin'
process.env['OBJECT_STORAGE_SECRET_KEY'] = 'minioadmin'
process.env['OBJECT_STORAGE_BUCKET'] = 'event-banners'

jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn() }))

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createBannerUploadUrl, BannerUploadError } from '../../src/lib/storage'

const getSignedUrlMock = getSignedUrl as jest.Mock

beforeEach(() => {
    getSignedUrlMock.mockReset()
    getSignedUrlMock.mockResolvedValue('https://minio.local/signed-put-url')
})

describe('createBannerUploadUrl', () => {
    it('lança BannerUploadError 400 para content-type fora da whitelist', async () => {
        await expect(createBannerUploadUrl('ev-1', 'application/pdf')).rejects.toBeInstanceOf(BannerUploadError)
        await expect(createBannerUploadUrl('ev-1', 'application/pdf')).rejects.toMatchObject(
            { status: 400, message: 'Tipo de arquivo não permitido — use JPEG, PNG ou WebP' },
        )
        expect(getSignedUrlMock).not.toHaveBeenCalled()
    })

    it('assina com expiresIn 300s, sem ContentLength (travaria PUTs de tamanho real diferente do assinado)', async () => {
        await createBannerUploadUrl('ev-1', 'image/png')

        expect(getSignedUrlMock).toHaveBeenCalledTimes(1)
        const [, command, options] = getSignedUrlMock.mock.calls[0]
        expect(options).toEqual({ expiresIn: 300 })
        expect(command.input).toMatchObject({
            Bucket: 'event-banners',
            ContentType: 'image/png',
        })
        expect(command.input.ContentLength).toBeUndefined()
        expect(command.input.Key).toMatch(/^banners\/ev-1\/[0-9a-f-]+\.png$/)
    })

    it('retorna uploadUrl (assinada) e publicUrl derivada da key', async () => {
        const result = await createBannerUploadUrl('ev-1', 'image/webp')

        expect(result.uploadUrl).toBe('https://minio.local/signed-put-url')
        expect(result.publicUrl).toMatch(/^http:\/\/localhost:9000\/event-banners\/banners\/ev-1\/[0-9a-f-]+\.webp$/)
    })
})
