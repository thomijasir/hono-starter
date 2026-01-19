import { AccessToken } from "livekit-server-sdk";
import { ENVIRONMENT } from "~/constants";

export const generateLiveKitToken = async (
  roomId: string,
  participantId: string,
  participantName?: string
) => {
  // If no API key/secret, return mock token or error
  if (!ENVIRONMENT.LIVEKIT_API_KEY || !ENVIRONMENT.LIVEKIT_API_SECRET) {
    console.warn("LiveKit credentials not found. Returning mock token.");
    return "mock_token_" + Date.now().toString();
  }

  const at = new AccessToken(
    ENVIRONMENT.LIVEKIT_API_KEY,
    ENVIRONMENT.LIVEKIT_API_SECRET,
    {
      identity: participantId,
      name: participantName,
    }
  );

  at.addGrant({ roomJoin: true, room: roomId });

  return await at.toJwt();
};
