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

/**
 * Legal disclaimer shown on the /certificado/[id] page AND appended below the
 * card in the downloaded PDF. Single source of truth.
 */
export const CERTIFICADO_DISCLAIMER =
  'Este certificado es meramente informativo sobre el estado crediticio actual, carece de efectos vinculantes y no constituye obligación alguna de Mob u Hoggax de actuar como fiador ni genera derecho alguno a favor de terceros. La concesión de fianza queda sujeta a aprobación, pago y firma del contrato de fianza correspondiente. Cualquier modificación o variación en las condiciones que constituyen el valor de la garantía será causa de nulidad del presente certificado.';

export function computeCertificadoState(
  cert: Pick<CertificadoInquilino, 'estado' | 'fecha_vencimiento'> | null
): CertificadoState {
  if (!cert) return 'not_found';
  if (cert.estado === 'REVOCADO') return 'revoked';
  if (new Date(cert.fecha_vencimiento).getTime() < Date.now()) return 'expired';
  return 'valid';
}
