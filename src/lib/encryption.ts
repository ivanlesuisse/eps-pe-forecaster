import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

type TokenPayload = {
  encryptedData: string;
  iv: string;
  authTag: string;
};

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY_BASE64;

  if (!key) {
    throw new Error("Missing ENCRYPTION_KEY_BASE64");
  }

  const decoded = Buffer.from(key, "base64");
  if (decoded.length !== 32) {
    throw new Error("ENCRYPTION_KEY_BASE64 must decode to 32 bytes for AES-256-GCM");
  }

  return decoded;
}

export function encryptToken(plaintext: string): TokenPayload {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("encryptToken requires a non-empty string");
  }

  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptToken(encryptedData: string, iv: string, authTag: string): string {
  if (!encryptedData || !iv || !authTag) {
    throw new Error("decryptToken requires encryptedData, iv, and authTag");
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function serializeEncryptedToken(payload: TokenPayload): string {
  return JSON.stringify(payload);
}

export function deserializeEncryptedToken(payload: string): TokenPayload {
  const parsed = JSON.parse(payload);

  if (
    !parsed ||
    typeof parsed.encryptedData !== "string" ||
    typeof parsed.iv !== "string" ||
    typeof parsed.authTag !== "string"
  ) {
    throw new Error("Invalid encrypted token payload format");
  }

  return parsed;
}
