import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { AuthorizationRecord } from './mockData';

export interface SignedAuthorizationAgreement {
  id: string;
  recordId: string;
  projectId: string;
  project: string;
  version: string;
  user: string;
  userId: string;
  signedAt: string;
  expiresAt: string;
  authorizationMethod: string;
  fileName: string;
  pdfUrl: string;
  signatureDataUrl: string;
}

export function resolveAgreementUrl(url: string) {
  if (url.startsWith('blob:') || url.startsWith('data:') || /^https?:\/\//.test(url)) return url;
  return `${import.meta.env.BASE_URL}${url.replace(/^\/+/, '')}`;
}

function formatDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export async function createSignedAuthorizationAgreement(
  record: AuthorizationRecord,
  signatureDataUrl: string,
): Promise<SignedAuthorizationAgreement> {
  const sourceUrl = resolveAgreementUrl(record.agreementUrl ?? '/agreements/authorization-agreement.pdf');
  const sourceBytes = await fetch(sourceUrl).then((response) => response.arrayBuffer());
  const pdf = await PDFDocument.load(sourceBytes);
  const signature = await pdf.embedPng(signatureDataUrl);
  const page = pdf.getPages().at(-1);
  if (!page) throw new Error('授权协议没有可签署页面');

  const maxWidth = 160;
  const maxHeight = 64;
  const ratio = Math.min(maxWidth / signature.width, maxHeight / signature.height);
  const width = signature.width * ratio;
  const height = signature.height * ratio;
  const signedAt = new Date();
  const expiresAt = new Date(signedAt);
  expiresAt.setDate(expiresAt.getDate() + 365);

  page.drawImage(signature, {
    x: 340 + (maxWidth - width) / 2,
    y: 325 + (maxHeight - height) / 2,
    width,
    height,
  });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(`Signed at: ${formatDateTime(signedAt)}`, {
    x: 340,
    y: 282,
    size: 8,
    font,
    color: rgb(0.12, 0.32, 0.5),
  });
  pdf.setTitle(`${record.project} - Signed Authorization Agreement`);
  pdf.setSubject('Signed data authorization agreement');

  const bytes = await pdf.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(blob);

  return {
    id: `AUT-SIGN-${Date.now()}`,
    recordId: record.id,
    projectId: record.projectId ?? 'prj-001',
    project: record.project,
    version: record.version ?? 'v1.0',
    user: '采集达人',
    userId: 'me',
    signedAt: formatDateTime(signedAt),
    expiresAt: formatDate(expiresAt),
    authorizationMethod: record.authorizationMethod,
    fileName: record.agreementFileName?.replace('.pdf', '_已签署.pdf') ?? '数据使用授权协议_已签署.pdf',
    pdfUrl,
    signatureDataUrl,
  };
}
