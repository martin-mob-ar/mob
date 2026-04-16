export interface CertificadoInquilino {
  id: string;
  user_id: string;
  nombre_completo: string;
  monto_aprobado: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: 'ACTIVO' | 'REVOCADO';
  verificacion_hoggax_id: string | null;
  verificacion_truora_id: string | null;
  created_at: string;
}

export type CertificadoState = 'valid' | 'expired' | 'revoked' | 'not_found';

export function computeCertificadoState(
  cert: Pick<CertificadoInquilino, 'estado' | 'fecha_vencimiento'> | null
): CertificadoState {
  if (!cert) return 'not_found';
  if (cert.estado === 'REVOCADO') return 'revoked';
  if (new Date(cert.fecha_vencimiento).getTime() < Date.now()) return 'expired';
  return 'valid';
}
