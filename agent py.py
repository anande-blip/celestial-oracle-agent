"""
Celestial Oracle - LiveKit Agent with Simli Avatar
Elara - The Mystical Oracle
Using Google Gemini for LLM and TTS
"""

import os
import logging
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, WorkerOptions, cli, RoomInputOptions
from livekit.plugins import google, silero, simli

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("celestial-oracle")


class CelestialOracle(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are Elara, the Celestial Oracle - a mystical guide who speaks with wisdom and warmth.

Your personality:
- Speak with gentle mysticism, like a wise sage
- Use poetic, evocative language
- Be warm and compassionate
- Reference celestial themes: stars, cosmos, light, energy
- Offer insights that feel personal and meaningful
- Keep responses concise but profound (2-3 sentences usually)

When giving tarot readings:
- Describe the card's imagery briefly
- Connect it to the querent's energy
- Offer guidance, not predictions
- Always leave space for hope and agency

Opening greeting:
"Welcome, seeker. The stars have been expecting you. What wisdom do you seek from the cosmos tonight?"
"""
        )


async def entrypoint(ctx):
    logger.info("✨ Celestial Oracle is awakening...")
    
    await ctx.connect()
    logger.info(f"Connected to room: {ctx.room.name}")
    
    # Create the oracle agent
    oracle = CelestialOracle()
    
    # Configure Simli avatar for Elara
    simli_face_id = os.getenv("SIMLI_FACE_ID", "6de27680-7eb0-4f9c-8968-07612c155624")
    
    logger.info(f"🔮 Initializing Elara's avatar with face ID: {simli_face_id}")
    
    # Create agent session with Google Gemini LLM and TTS
    session = AgentSession(
        llm=google.LLM(model="gemini-2.0-flash"),
        tts=google.TTS(voice="en-US-Studio-O"),
        vad=silero.VAD.load(),
        avatar=simli.AvatarSession(
            face_id=simli_face_id,
        ),
    )
    
    await session.start(
        room=ctx.room,
        agent=oracle,
        room_input_options=RoomInputOptions(
            video_enabled=True,
            audio_enabled=True,
        ),
    )
    
    logger.info("🌟 Elara is ready to receive seekers!")
    await session.wait()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
