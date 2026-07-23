import React from 'react';
import { FileText } from 'lucide-react';
import { resolveAgreementUrl } from '../../data/authorizationAgreement';
import './AgreementPdfPreview.css';

interface AgreementPdfPreviewProps {
  signed?: boolean;
  signatureDataUrl?: string;
  signedAt?: string;
  compact?: boolean;
}

export function AgreementPdfPreview({ signed = false, signatureDataUrl, signedAt, compact = false }: AgreementPdfPreviewProps) {
  const useStaticSignedPreview = signed && !signatureDataUrl;
  const prefix = useStaticSignedPreview ? 'signed-authorization-agreement-page' : 'authorization-agreement-page';

  return (
    <div className={`agreement-pdf-preview ${compact ? 'is-compact' : ''}`}>
      <div className="agreement-pdf-preview__bar"><span><FileText size={13} />PDF 协议预览</span><b>2 页</b></div>
      <div className="agreement-pdf-preview__pages">
        {[1, 2].map((page) => <figure key={page} className="agreement-pdf-preview__page">
          <img src={resolveAgreementUrl(`/agreements/${prefix}-${page}.png`)} alt={`授权协议第 ${page} 页`} />
          {page === 2 && signatureDataUrl && <div className="agreement-pdf-preview__signature"><img src={signatureDataUrl} alt="作业员电子签名" />{signedAt && <span>{signedAt}</span>}</div>}
          <figcaption>{page} / 2</figcaption>
        </figure>)}
      </div>
    </div>
  );
}
