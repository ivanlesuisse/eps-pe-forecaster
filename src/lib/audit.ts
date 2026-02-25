import { prisma } from "./prisma";
import { hashForLogging } from "./security";

interface AuditLogData {
  userId: string;
  action: string;
  broker?: string;
  status: "success" | "failure";
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log audit events for security tracking
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        broker: data.broker,
        status: data.status,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[AUDIT]", {
        timestamp: new Date().toISOString(),
        action: data.action,
        broker: data.broker,
        status: data.status,
        userHash: hashForLogging(data.userId),
      });
    }
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Don't throw - audit logging shouldn't break the app
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
) {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}

/**
 * Extract request metadata for audit logging
 */
export function extractRequestMetadata(request: Request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  };
}
