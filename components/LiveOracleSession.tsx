
import React, { useEffect, useState, useRef } from 'react';
import LoadingOracle from './LoadingOracle';

interface LiveOracleSessionProps {
  oracleName: string;
  onClose: () => void;
}

const SIMLI_API_KEY = 'guinlx7mymkflendoasbtg';
const SIMLI_REST_API = 'https://api.simli.ai/startAudioToVideoSession';
const SIMLI_WS_API = 'wss://api.simli.ai/startWebRTCSession';

const FACE_IDS: Record<string, string> = {
  'Michael': 'ae5658d5-cadd-4f9f-97a7-534e06f8c701',
  'Elara': '6de27680-7eb0-4f9c-8968-07612c155624',
  'Josephine': 'a4952804-da9c-4dc0-89c0-881da0525a6f'
};

const LiveOracleSession: React.FC<LiveOracleSessionProps> = ({ oracleName, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startSimliSession = async () => {
      try {
        const faceId = FACE_IDS[oracleName];
        if (!faceId) {
          setError(`The Oracle ${oracleName} is currently beyond the veil.`);
          return;
        }

        // 1. Get User Media
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;

        // 2. Start Session on Simli REST API
        const sessionResponse = await fetch(SIMLI_REST_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: SIMLI_API_KEY,
            faceId: faceId,
            isInteractive: true,
            syncAudio: true
          })
        });

        if (!sessionResponse.ok) {
          throw new Error(`Failed to initialize ritual with Simli (${sessionResponse.status})`);
        }

        const sessionData = await sessionResponse.json();
        const sessionToken = sessionData.session_token;

        // 3. Establish WebRTC connection
        // Note: Simli's specific implementation might require their SDK, 
        // but typically follow a standard WebRTC flow with a signaling socket.
        // For this prototype, we'll implement the conceptual WebRTC connection steps.
        
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        pcRef.current = pc;

        pc.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 4. Connect to Simli WebSocket for signaling
        const ws = new WebSocket(`${SIMLI_WS_API}?token=${sessionToken}`);
        
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'sdp-offer', sdp: offer.sdp }));
        };

        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === 'sdp-answer') {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }));
            setIsConnecting(false);
          } else if (msg.type === 'ice-candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          }
        };

        ws.onerror = (e) => {
          console.error("Ethereal socket error", e);
          setError("The spiritual connection was interrupted.");
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
          }
        };

      } catch (e: any) {
        console.error("Simli connection error:", e);
        setError(`The spirits are silent: ${e.message}`);
      }
    };

    startSimliSession();

    return () => {
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [oracleName]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-midnight/98 backdrop-blur-3xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 ritual-table opacity-20 pointer-events-none"></div>
      
      {error ? (
        <div className="text-center p-8 animate-fade-in relative z-20">
          <p className="text-red-400 font-serif italic text-xl mb-8">{error}</p>
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-[#d4af37] text-midnight rounded-full text-xs font-black uppercase tracking-[0.4em] hover:scale-110 transition-transform"
          >
            Return to Temple
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-between h-full w-full p-8 md:p-12 text-center animate-fade-in relative z-20">
          <div className="w-full flex justify-between items-center mb-8">
            <div className="flex flex-col items-start">
              <h2 className="text-3xl font-serif gold-text italic tracking-widest">{oracleName}</h2>
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Divine Simli Avatar</span>
            </div>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-red-900/30 border border-red-500 text-red-100 rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-700/50 transition-all shadow-glow"
            >
              End Session
            </button>
          </div>

          <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center">
            {isConnecting && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                 <LoadingOracle message={`Invoking ${oracleName}'s manifestation...`} />
              </div>
            )}
            
            <div className="relative w-full aspect-video md:aspect-[16/9] rounded-[3rem] overflow-hidden border-4 border-[#d4af37]/40 shadow-[0_0_120px_rgba(212,175,55,0.25)] bg-black/60 backdrop-blur-md oracle-video-container">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none z-10"></div>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transition-opacity duration-1000"
                style={{ opacity: isConnecting ? 0 : 1 }}
              />
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <p className="text-slate-200 font-serif italic text-sm md:text-lg tracking-widest max-w-xl opacity-80">
              "Whisper your questions to the stars. The Oracle shall answer in time."
            </p>
            <div className="flex gap-8 items-center">
               <button 
                onClick={toggleMic}
                className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-500 hover:scale-110 ${isMicEnabled ? 'bg-[#d4af37] border-transparent text-midnight shadow-[0_0_40px_rgba(212,175,55,0.5)]' : 'bg-red-950/80 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}
               >
                 <span className="text-2xl">{isMicEnabled ? '🎙️' : '🔇'}</span>
               </button>
               <div className="flex flex-col items-start gap-1">
                 <span className="text-[10px] gold-text uppercase tracking-widest font-black opacity-60">Status</span>
                 <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${isConnecting ? 'bg-amber-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                   <span className="text-[11px] text-white/80 uppercase tracking-widest">{isConnecting ? 'Aligning' : 'Connected'}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOracleSession;
