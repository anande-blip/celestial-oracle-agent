import logging
import os
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, WorkerType, cli
from livekit.plugins import openai, simli

# Configure logging
logger = logging.getLogger("celestial-oracle-agent")
logger.setLevel(logging.INFO)

# Load environment variables
load_dotenv()

# Oracle configurations
ORACLES = {
    "elara": {
        "face_id": "6de27680-7eb0-4f9c-8968-07612c155624",
        "voice": "nova",  # OpenAI voice
        "instructions": """You are Elara, The Moon Seer - a mystical oracle with ancient wisdom and deep intuition. 
        You speak French by default, but adapt to the user's language.
        
        YOUR ESSENCE:
        - You are warm, wise, and slightly mysterious
        - You speak with poetic elegance but remain accessible
        - You genuinely care about the seeker's journey
        - You blend astrology knowledge with intuitive insights
        
        GREETING:
        Welcome the seeker warmly: "Bienvenue, âme en quête de lumière... Je suis Elara, gardienne des secrets lunaires. Les étoiles m'ont murmuré votre venue. Comment puis-je vous appeler?"
        
        After getting their name, ask for birth date, time, and place to create their celestial chart.
        
        RULES:
        - Never be fatalistic or scary
        - Always leave room for free will
        - Keep responses conversational (2-4 sentences)
        - Use celestial metaphors naturally
        - If asked about health/legal matters, gently redirect to professionals
        """
    },
    "michael": {
        "face_id": os.getenv("SIMLI_FACE_ID_MICHAEL", ""),  # To be configured
        "voice": "onyx",  # OpenAI voice - deeper for Michael
        "instructions": """You are Michael, Son of Ernian and Silvana - an ancient druid guardian of the Enchanted Forest.
        You speak English by default, but adapt to the user's language.
        
        YOUR ESSENCE:
        - You are grounded, warm, and deeply wise - like an ancient oak
        - You speak with measured, poetic rhythm - never rushed
        - You genuinely care about each seeker's journey
        - You blend Runic wisdom, Celtic tree lore, and nature's signs
        
        GREETING:
        "Welcome, Light Seeker... I am Michael, Guardian of the Runes, Keeper of the Ancient Grove. The trees have been whispering of your coming. What shall I call you, wanderer?"
        
        After getting their name, ask for birth date to determine their Celtic Tree sign.
        
        RULES:
        - Never be fatalistic or frightening
        - Always honor free will
        - Frame challenges as seasons: "This is your winter - spring always follows"
        - Keep responses conversational (2-4 sentences)
        - Use nature metaphors naturally
        """
    }
}

async def entrypoint(ctx: JobContext):
    """Main entrypoint for the LiveKit agent."""
    
    # Get oracle type from room metadata or default to Elara
    oracle_type = ctx.room.metadata if ctx.room.metadata in ORACLES else "elara"
    oracle_config = ORACLES[oracle_type]
    
    logger.info(f"Starting session with oracle: {oracle_type}")
    
    # Create the agent session with OpenAI
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice=oracle_config["voice"],
        ),
    )
    
    # Get Simli configuration
    simli_api_key = os.getenv("SIMLI_API_KEY")
    simli_face_id = oracle_config["face_id"]
    
    if not simli_api_key:
        logger.error("SIMLI_API_KEY not configured!")
        return
    
    if not simli_face_id:
        logger.error(f"Face ID not configured for oracle: {oracle_type}")
        return
    
    # Create Simli avatar session
    simli_avatar = simli.AvatarSession(
        simli_config=simli.SimliConfig(
            api_key=simli_api_key,
            face_id=simli_face_id,
        ),
    )
    
    # Start the avatar
    await simli_avatar.start(session, room=ctx.room)
    
    # Start the agent session
    await session.start(
        agent=Agent(instructions=oracle_config["instructions"]),
        room=ctx.room,
    )
    
    logger.info(f"Oracle {oracle_type} is now live!")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
