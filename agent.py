"""
Celestial Oracle - LiveKit Agent with Simli Avatar
"""

import os
import logging
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, WorkerOptions, cli
from livekit.agents.llm import ChatContext, ChatMessage
from livekit.plugins import openai, silero

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

Opening greeting:
"Welcome, seeker. The stars have been expecting you. What wisdom do you seek from the cosmos tonight?"
"""
        )


async def entrypoint(ctx):
    logger.info("Celestial Oracle is awakening...")
    
    await ctx.connect()
    logger.info(f"Connected to room: {ctx.room.name}")
    
    oracle = CelestialOracle()
    
    session = AgentSession(
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(voice="nova"),
        vad=silero.VAD.load(),
    )
    
    await session.start(room=ctx.room, agent=oracle)
    logger.info("Celestial Oracle is ready ✨")
    await session.wait()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
