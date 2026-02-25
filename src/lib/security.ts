import CryptoJS from "crypto-js";
import { SignJWT, jwtVerify } from "jose";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "swiss-fintrack-dev-key-change-in-prod";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "swiss-fintrack-jwt-dev");

/**
 * Encrypt sensitive data (tokens, passwords)
 */
export function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt sensitive data
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt token");
  }
}

/**
 * Create a JWT token with expiration
 */
export async function createAccessToken(
  userId: string,
  broker: string,
  expiresIn: string = "1h"
): Promise<string> {
  return new SignJWT({
    userId,
    broker,
    type: "broker_access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<Record<string, unknown>> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid or expired token");
  }
}

/**
 * Generate OAuth state for CSRF protection
 */
export function generateOAuthState(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Verify OAuth state
 */
export function verifyOAuthState(state: string, expectedState: string): boolean {
  return state === expectedState;
}

/**
 * Hash sensitive data for logging
 */
export function hashForLogging(data: string): string {
  return CryptoJS.SHA256(data).toString().substring(0, 8);
}
