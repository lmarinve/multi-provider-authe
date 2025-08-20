import { config } from "@/lib/config";
import { TokenData, BackendPayload } from "@/lib/types";
import { decodeJWT } from "@/lib/token-storage";

export async function sendTokenToBackend(
  token: TokenData
): Promise<Response> {
  const baseUrl = config.backend.baseUrl;
  const url = `${baseUrl}${config.tokenHandoffPath}`;

  const claims = decodeJWT(token.id_token);

  const payload: BackendPayload = {
    provider: token.provider,
    id_token: token.id_token,
    refresh_token: token.refresh_token,
    expires_in: token.expires_in,
    issued_at: token.issued_at,
    token_format: "jwt",
    claims_hint: {
      sub: claims?.sub,
      iss: claims?.iss,
      exp: claims?.exp,
      email: claims?.email,
      name: claims?.name,
    },
  };

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Provider": token.provider,
      "Authorization": `Bearer ${token.id_token}`,
    },
    body: JSON.stringify(payload),
  });
}