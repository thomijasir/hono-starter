import type { AppState } from "~/models";
import { log } from "~/utils";

export class PushService {
  constructor(private config: AppState["config"]) {}

  /**
   * Send a push notification to a specific device.
   * This is a mock implementation that logs to console.
   * In production, you would use firebase-admin or apn.
   */
  send(
    deviceToken: string,
    deviceType: string | null,
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!deviceToken) {
        log.warn("PushService: No device token provided");
        return;
    }

    log.info(`[PushService] Sending to ${deviceType ?? 'unknown'} (${deviceToken}): ${title} - ${body}`, data as unknown as Record<string, unknown>);
  }

  sendToUsers(
      userIds: string[], 
      message: { title: string; body: string; data?: Record<string, string> }
  ) {
      log.info(`[PushService] Sending to users ${userIds.join(', ')}: ${message.title}`);
  }
}

export const pushService = new PushService({} as AppState["config"]);
