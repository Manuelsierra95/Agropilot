export type InvitationEmailParams = {
  inviteUrl: string
  organizationName: string
  inviterName: string
  roleLabel: string
}

export function buildInvitationEmailHtml({
  inviteUrl,
  organizationName,
  inviterName,
  roleLabel,
}: InvitationEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="es">
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p>Hola,</p>
    <p>
      <strong>${escapeHtml(inviterName)}</strong> te ha invitado a unirte a
      <strong>${escapeHtml(organizationName)}</strong> en Agropilot con el rol de
      <strong>${escapeHtml(roleLabel)}</strong>.
    </p>
    <p>
      <a href="${escapeHtml(inviteUrl)}" style="display: inline-block; padding: 10px 16px; background: #166534; color: #fff; text-decoration: none; border-radius: 6px;">
        Aceptar invitación
      </a>
    </p>
    <p style="font-size: 14px; color: #555;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
      <a href="${escapeHtml(inviteUrl)}">${escapeHtml(inviteUrl)}</a>
    </p>
    <p style="font-size: 14px; color: #555;">
      Debes iniciar sesión con el mismo correo al que se envió esta invitación.
    </p>
  </body>
</html>
`.trim()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
