import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from "./errors";

export class BannerUploadError extends AppError {}

const ALLOWED_CONTENT_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const
const UPLOAD_EXPIRES_SECONDS = 300

function env(name: string): string {
    const value = process.env[name]
    if (!value) throw new Error(`${name} não definido`)
    return value
}

const s3Client = new S3Client({
    endpoint: env('OBJECT_STORAGE_ENDPOINT'),
    region: 'us-east-1',
    forcePathStyle: true,
    credentials: {
        accessKeyId: env('OBJECT_STORAGE_ACCESS_KEY'),
        secretAccessKey: env('OBJECT_STORAGE_SECRET_KEY'),
    },
})

export async function createBannerUploadUrl(eventId: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
    const extension = ALLOWED_CONTENT_TYPES[contentType as keyof typeof ALLOWED_CONTENT_TYPES]
    if (!extension) {
        throw new BannerUploadError(400, 'Tipo de arquivo não permitido — use JPEG, PNG ou WebP')
    }

    const bucket = env('OBJECT_STORAGE_BUCKET')
    const key = `banners/${eventId}/${crypto.randomUUID()}.${extension}`

    // ContentLength não entra na assinatura: o S3Client o serializa como header
    // Content-Length, e uma URL pré-assinada exige que o PUT real envie
    // exatamente o valor assinado. Isso travaria qualquer arquivo que não
    // pese precisamente MAX_SIZE_BYTES. O limite de tamanho é aplicado no
    // client (useBannerUpload.ts) antes de pedir a URL. Aqui só Content-Type
    // entra na assinatura.
    const uploadUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
        { expiresIn: UPLOAD_EXPIRES_SECONDS },
    )

    const publicUrl = `${env('OBJECT_STORAGE_ENDPOINT')}/${bucket}/${key}`
    return { uploadUrl, publicUrl }
}
