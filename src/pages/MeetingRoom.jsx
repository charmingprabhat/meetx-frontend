import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  MonitorStop,
  PhoneOff,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function MeetingRoom() {

  // ROOM ID
  const { roomId } = useParams();

  // NAVIGATION
  const navigate = useNavigate();

  // VIDEO REF
  const videoRef = useRef(null);

  // CHAT AUTO SCROLL
  const messagesEndRef =
    useRef(null);

  // STREAMS
  const streamRef = useRef(null);

  const screenStreamRef =
    useRef(null);

  // PEER CONNECTIONS
  const peerConnectionsRef =
    useRef({});

  // SOCKET
  const stompClientRef =
    useRef(null);

  // USER ID
  const userIdRef = useRef(
    "USER-" +
    Math.floor(
      Math.random() * 100000
    )
  );

  // STATES
  const [isMuted, setIsMuted] =
    useState(false);

  const [
    isCameraOff,
    setIsCameraOff,
  ] = useState(false);

  const [
    isScreenSharing,
    setIsScreenSharing,
  ] = useState(false);

  // PRESENTATION MODE
  const [
    presenterId,
    setPresenterId,
  ] = useState(null);

  const [
    isConnected,
    setIsConnected,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [
    participants,
    setParticipants,
  ] = useState([]);

  // ACTIVE SPEAKER
  const [
    activeSpeaker,
    setActiveSpeaker,
  ] = useState(null);

  // MEETING TIMER
  const [
    meetingTime,
    setMeetingTime,
  ] = useState(0);

  // LOADING CAMERA
  const [
    isLoadingCamera,
    setIsLoadingCamera,
  ] = useState(true);

  // DYNAMIC GRID
  const getGridClass = () => {

    const totalParticipants =
      participants.length + 1;

    if (totalParticipants <= 1) {

      return "grid-cols-1";
    }

    if (totalParticipants === 2) {

      return "grid-cols-1 md:grid-cols-2";
    }

    if (totalParticipants <= 4) {

      return "grid-cols-1 md:grid-cols-2";
    }

    if (totalParticipants <= 6) {

      return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
    }

    return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
  };

  // FORMAT TIMER
  const formatMeetingTime = (

    totalSeconds
  ) => {

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    return [

      hours,
      minutes,
      seconds,

    ]
      .map((value) =>

        String(value)
          .padStart(2, "0")
      )
      .join(":");
  };

  // ACTIVE SPEAKER DETECTION
  const detectActiveSpeaker = (
    stream,
    participantId
  ) => {

    const audioContext =
      new AudioContext();

    const analyser =
      audioContext.createAnalyser();

    analyser.fftSize = 512;

    const microphone =
      audioContext.createMediaStreamSource(
        stream
      );

    microphone.connect(analyser);

    const dataArray =
      new Uint8Array(
        analyser.frequencyBinCount
      );

    let speakingTimeout;

    const checkAudio = () => {

      analyser.getByteFrequencyData(
        dataArray
      );

      const volume =
        dataArray.reduce(
          (a, b) => a + b,
          0
        ) / dataArray.length;

      // SPEAKING
      if (volume > 25) {

        setActiveSpeaker(
          (current) => {

            if (
              current !== participantId
            ) {

              return participantId;
            }

            return current;
          }
        );

        clearTimeout(
          speakingTimeout
        );

        speakingTimeout =
          setTimeout(() => {

            setActiveSpeaker(
              (current) =>

                current === participantId
                  ? null
                  : current
            );

          }, 800);
      }

      setTimeout(
        checkAudio,
        200
      );
    };

    checkAudio();
  };

  // INITIAL LOAD
  useEffect(() => {

    initializeMeeting();

    return () => {

      disconnectWebSocket();
    };

  }, []);

  // AUTO SCROLL
  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({

        behavior: "smooth",
      });

  }, [messages]);

  // MEETING TIMER
  useEffect(() => {

    const interval =
      setInterval(() => {

        setMeetingTime(
          (prev) => prev + 1
        );

      }, 1000);

    return () => {

      clearInterval(interval);
    };

  }, []);

  // INITIALIZE
  const initializeMeeting =
    async () => {

      await startVideo();

      connectWebSocket();
    };

  // START CAMERA
  const startVideo = async () => {

    try {

      setIsLoadingCamera(true);

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,
          audio: true,
        });

      streamRef.current =
        stream;
      detectActiveSpeaker(
        stream,
        "local-user"
      );

      if (videoRef.current) {

        videoRef.current.srcObject =
          stream;
      }

      setIsLoadingCamera(false);

    } catch (error) {

      console.log(
        "Camera Error",
        error
      );
      setIsLoadingCamera(false);
    }
  };

  // CREATE PEER CONNECTION
  const createPeerConnection =
    (remoteUserId) => {

      if (

        peerConnectionsRef.current[
          remoteUserId
        ]

      ) {

        return peerConnectionsRef.current[
          remoteUserId
        ];
      }

      const peerConnection =
        new RTCPeerConnection({

          iceServers: [

            {
              urls:
                "stun:stun.relay.metered.ca:80",
            },

            {
              urls:
                "turn:standard.relay.metered.ca:80",
              username:
                "00d32fffbb6eb4c14f401ae6",
              credential:
                "xfCY/OowiSYgHnjo",
            },

            {
              urls:
                "turn:standard.relay.metered.ca:80?transport=tcp",
              username:
                "00d32fffbb6eb4c14f401ae6",
              credential:
                "xfCY/OowiSYgHnjo",
            },

            {
              urls:
                "turn:standard.relay.metered.ca:443",
              username:
                "00d32fffbb6eb4c14f401ae6",
              credential:
                "xfCY/OowiSYgHnjo",
            },

            {
              urls:
                "turns:standard.relay.metered.ca:443?transport=tcp",
              username:
                "00d32fffbb6eb4c14f401ae6",
              credential:
                "xfCY/OowiSYgHnjo",
            },
          ],
        });

      peerConnectionsRef.current[
        remoteUserId
      ] = peerConnection;

      // ADD LOCAL TRACKS
      if (streamRef.current) {

        streamRef.current
          .getTracks()
          .forEach((track) => {

            peerConnection.addTrack(
              track,
              streamRef.current
            );
          });
      }

      // ICE
      peerConnection.onicecandidate =
        (event) => {

          if (event.candidate) {

            sendSignalMessage(
              "ICE",
              {
                target:
                  remoteUserId,

                candidate:
                  event.candidate,
              }
            );
          }
        };

      // REMOTE STREAM
      peerConnection.ontrack =
        (event) => {

          const remoteStream =
            event.streams[0];
          detectActiveSpeaker(
            remoteStream,
            remoteUserId
          );

          setParticipants((prev) => {

            const filtered =
              prev.filter(

                (participant) =>

                  participant.id !==
                  remoteUserId
              );

            return [

              ...filtered,

              {
                id:
                  remoteUserId,

                name:
                  remoteUserId,

                stream:
                  remoteStream,

                muted: false,

                videoOff: false,
              },
            ];
          });
        };

      return peerConnection;
    };

  // SEND SIGNAL
  const sendSignalMessage = (
    type,
    data
  ) => {

    if (!stompClientRef.current)
      return;

    stompClientRef.current.publish({

      destination:
        "/app/message",

      body: JSON.stringify({

        sender:
          userIdRef.current,

        roomId:
          roomId,

        type:
          type,

        data:
          data,
      }),
    });
  };

  // CONNECT SOCKET
  const connectWebSocket = () => {

    const socket =
      new SockJS(
        "http://localhost:8080/ws"
      );

    const stompClient =
      new Client({

        webSocketFactory:
          () => socket,

        reconnectDelay: 5000,

        onConnect: async () => {

          setIsConnected(true);

          stompClient.subscribe(

            `/topic/room/${roomId}`,

            async (response) => {

              const receivedMessage =
                JSON.parse(
                  response.body
                );

              if (

                receivedMessage.sender ===
                userIdRef.current

              ) {

                return;
              }

              const remoteUserId =
                receivedMessage.sender;

              const peerConnection =
                createPeerConnection(
                  remoteUserId
                );

              // JOIN
              if (

                receivedMessage.type ===
                "JOIN"

              ) {

                const offer =
                  await peerConnection.createOffer();

                await peerConnection.setLocalDescription(
                  offer
                );

                sendSignalMessage(
                  "OFFER",
                  {
                    target:
                      remoteUserId,

                    offer:
                      offer,
                  }
                );

                return;
              }

              // OFFER
              if (

                receivedMessage.type ===
                "OFFER"

              ) {

                await peerConnection.setRemoteDescription(

                  new RTCSessionDescription(

                    receivedMessage.data.offer
                  )
                );

                const answer =
                  await peerConnection.createAnswer();

                await peerConnection.setLocalDescription(
                  answer
                );

                sendSignalMessage(
                  "ANSWER",
                  {
                    target:
                      remoteUserId,

                    answer:
                      answer,
                  }
                );

                return;
              }

              // ANSWER
              if (

                receivedMessage.type ===
                "ANSWER"

              ) {

                await peerConnection.setRemoteDescription(

                  new RTCSessionDescription(

                    receivedMessage.data.answer
                  )
                );

                return;
              }

              // ICE
              if (

                receivedMessage.type ===
                "ICE"

              ) {

                try {

                  await peerConnection.addIceCandidate(

                    new RTCIceCandidate(

                      receivedMessage.data.candidate
                    )
                  );

                } catch (error) {

                  console.log(error);
                }

                return;
              }

              // CHAT
              if (

                receivedMessage.type ===
                "CHAT"

              ) {

                setMessages((prev) => [

                  ...prev,

                  {
                    sender:
                      receivedMessage.sender,

                    text:
                      receivedMessage.data.text,
                  },
                ]);

                return;
              }

              // MEDIA
              if (

                receivedMessage.type ===
                "MEDIA_STATE"

              ) {

                setParticipants((prev) =>

                  prev.map((participant) =>

                    participant.id ===
                    remoteUserId

                      ? {
                          ...participant,

                          muted:
                            receivedMessage.data.muted,

                          videoOff:
                            receivedMessage.data.videoOff,
                        }

                      : participant
                  )
                );

                return;
              }

              // LEAVE
              if (

                receivedMessage.type ===
                "LEAVE"

              ) {

                setParticipants((prev) =>

                  prev.filter(

                    (participant) =>

                      participant.id !==
                      remoteUserId
                  )
                );

                if (

                  peerConnectionsRef.current[
                    remoteUserId
                  ]

                ) {

                  peerConnectionsRef.current[
                    remoteUserId
                  ].close();

                  delete peerConnectionsRef.current[
                    remoteUserId
                  ];
                }

                return;
              }
            }
          );

          sendSignalMessage(
            "JOIN",
            {}
          );
        },

        onDisconnect: () => {

          setIsConnected(false);
        },
      });

    stompClientRef.current =
      stompClient;

    stompClient.activate();
  };

  // DISCONNECT
  const disconnectWebSocket = () => {

    if (stompClientRef.current) {

      stompClientRef.current.deactivate();
    }
  };

  // LEAVE
  const leaveMeeting = () => {

    sendSignalMessage(
      "LEAVE",
      {}
    );

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) => {

          track.stop();
        });
    }

    if (screenStreamRef.current) {

      screenStreamRef.current
        .getTracks()
        .forEach((track) => {

          track.stop();
        });
    }

    Object.values(

      peerConnectionsRef.current

    ).forEach((peerConnection) => {

      peerConnection.close();
    });

    peerConnectionsRef.current =
      {};

    disconnectWebSocket();

    navigate("/");
  };

  // SEND CHAT
  const sendChatMessage = () => {

    if (!message.trim())
      return;

    sendSignalMessage(
      "CHAT",
      {
        text:
          message,
      }
    );

    setMessages((prev) => [

      ...prev,

      {
        sender:
          userIdRef.current,

        text:
          message,
      },
    ]);

    setMessage("");
  };

  // MIC
  const toggleMic = () => {

    const audioTrack =
      streamRef.current
        ?.getAudioTracks()[0];

    if (audioTrack) {

      audioTrack.enabled =
        !audioTrack.enabled;

      const mutedState =
        !audioTrack.enabled;

      setIsMuted(
        mutedState
      );

      sendSignalMessage(
        "MEDIA_STATE",
        {
          muted:
            mutedState,

          videoOff:
            isCameraOff,
        }
      );
    }
  };

  // CAMERA
  const toggleCamera = () => {

    const videoTrack =
      streamRef.current
        ?.getVideoTracks()[0];

    if (videoTrack) {

      videoTrack.enabled =
        !videoTrack.enabled;

      const offState =
        !videoTrack.enabled;

      setIsCameraOff(
        offState
      );

      sendSignalMessage(
        "MEDIA_STATE",
        {
          muted:
            isMuted,

          videoOff:
            offState,
        }
      );
    }
  };

  // SCREEN SHARE
  const toggleScreenShare =
    async () => {

      if (!isScreenSharing) {

        try {

          const screenStream =
            await navigator.mediaDevices.getDisplayMedia({

              video: true,
            });

          screenStreamRef.current =
            screenStream;

          const screenTrack =
            screenStream.getVideoTracks()[0];

          Object.values(

            peerConnectionsRef.current

          ).forEach((peerConnection) => {

            const sender =
              peerConnection
                .getSenders()
                .find(

                  (sender) =>

                    sender.track &&
                    sender.track.kind ===
                    "video"
                );

            if (sender) {

              sender.replaceTrack(
                screenTrack
              );
            }
          });

          if (videoRef.current) {

            videoRef.current.srcObject =
              screenStream;
          }

          setIsScreenSharing(true);

          setPresenterId(
            "local-user"
          );

          screenTrack.onended =
            () => {

              stopScreenShare();
            };

        } catch (error) {

          console.log(error);
        }

      } else {

        stopScreenShare();
      }
    };

  // STOP SHARE
  const stopScreenShare = () => {

    const cameraTrack =
      streamRef.current
        ?.getVideoTracks()[0];

    Object.values(

      peerConnectionsRef.current

    ).forEach((peerConnection) => {

      const sender =
        peerConnection
          .getSenders()
          .find(

            (sender) =>

              sender.track &&
              sender.track.kind ===
              "video"
          );

      if (sender) {

        sender.replaceTrack(
          cameraTrack
        );
      }
    });

    if (videoRef.current) {

      videoRef.current.srcObject =
        streamRef.current;
    }

    setIsScreenSharing(false);

    setPresenterId(null);
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1a3e] to-[#0f0f23] flex text-white">

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* HEADER */}
        <div className="h-20 border-b border-gray-800/50 bg-gradient-to-r from-[#1a1a3e] to-[#0f0f23] flex items-center justify-between px-8 shrink-0 shadow-2xl">

          <div className="flex-1">

            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">

              MeetX

            </h1>

            <div className="flex items-center gap-6 mt-2">

              <p className="text-sm text-gray-400">

                Room: <span className="text-blue-300 font-semibold">{roomId}</span>

              </p>

              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 px-4 py-1 rounded-full text-sm font-mono border border-blue-500/30">

                {formatMeetingTime(
                  meetingTime
                )}

              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
              isConnected
                ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/50"
                : "bg-gradient-to-r from-red-600 to-rose-600 shadow-lg shadow-red-500/50"
            }`}>

              <span className={`w-2 h-2 rounded-full ${
                isConnected
                  ? "bg-green-200 animate-pulse"
                  : "bg-red-200"
              }`}></span>

              {isConnected
                ? "Connected"
                : "Disconnected"}

            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={() => {

                localStorage.removeItem(
                  "isLoggedIn"
                );

                window.location.href =
                  "/login";
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-red-500/40 transition-all duration-300 hover:scale-105"
            >
              Logout
            </button>

          </div>

        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden gap-0">

          {/* VIDEO SECTION */}
          <div className="flex-1 overflow-auto p-6 flex flex-col bg-[#0a0e27]">

            <div
              className={`transition-all duration-500 ease-in-out flex-1 ${
                presenterId
                  ? "flex flex-col gap-4"
                  : `grid ${getGridClass()} gap-4`
              }`}
            >

              {/* LOCAL VIDEO */}
              <div
                className={`relative bg-black/60 backdrop-blur-xl rounded-2xl overflow-hidden border-2 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl ${
                  presenterId === "local-user"

                    ? "h-[480px]"

                    : "h-[280px]"
                } ${
                  activeSpeaker === "local-user"
                    ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    : "border-gray-700/50"
                }`}
              >

                {isLoadingCamera && (

                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 rounded-2xl">

                    <div className="flex flex-col items-center gap-4">

                      <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                      <p className="text-sm text-gray-300">

                        Starting Camera...

                      </p>
                    </div>

                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full ${
                    isCameraOff
                      ? "hidden"
                      : "object-cover"
                  }`}
                />

                {isCameraOff && (

                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold bg-gradient-to-br from-gray-800 to-black">

                    Camera Off

                  </div>
                )}

                {presenterId === "local-user" && (

                  <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 rounded-lg font-semibold text-xs z-10 shadow-lg">

                    Presenting Screen

                  </div>
                )}

                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-lg flex items-center gap-2 text-xs">

                  <span>

                    {isScreenSharing
                      ? "You (Screen)"
                      : "You"}

                  </span>

                  {isMuted && (

                    <MicOff
                      size={14}
                      className="text-red-400"
                    />
                  )}
                </div>

              </div>

              {/* REMOTE VIDEOS */}
              {participants.map(
                (participant) => (

                  <div
                    key={participant.id}
                    className={`relative bg-black/60 backdrop-blur-xl rounded-2xl overflow-hidden border-2 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl ${
                      presenterId === participant.id

                        ? "h-[480px]"

                        : "h-[200px]"
                    } ${
                      activeSpeaker === participant.id
                        ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                        : "border-gray-700/50"
                    }`}
                  >

                    <video
                      autoPlay
                      playsInline
                      ref={(videoElement) => {

                        if (
                          videoElement &&
                          participant.stream
                        ) {

                          videoElement.srcObject =
                            participant.stream;
                        }
                      }}
                      className={`w-full h-full ${
                        participant.videoOff
                          ? "hidden"
                          : "object-cover"
                      }`}
                    />

                    {participant.videoOff && (

                      <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold bg-gradient-to-br from-gray-800 to-black">

                        Camera Off

                      </div>
                    )}

                    {presenterId === participant.id && (

                      <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 rounded-lg font-semibold text-xs z-10 shadow-lg">

                        Presenting Screen

                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-lg flex items-center gap-2 text-xs">

                      <span>
                        {participant.name}
                      </span>

                      {participant.muted && (

                        <MicOff
                          size={14}
                          className="text-red-400"
                        />
                      )}
                    </div>

                  </div>
                )
              )}
            </div>

            {/* CONTROLS */}
            <div className="flex justify-center gap-4 mt-8 mb-4">

              {/* MIC */}
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 shadow-lg ${
                  isMuted
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/50"
                    : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                }`}
              >

                {isMuted
                  ? <MicOff size={24} />
                  : <Mic size={24} />}

              </button>

              {/* CAMERA */}
              <button
                onClick={toggleCamera}
                className={`p-4 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 shadow-lg ${
                  isCameraOff
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/50"
                    : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                }`}
              >

                {isCameraOff
                  ? <VideoOff size={24} />
                  : <Video size={24} />}

              </button>

              {/* SCREEN SHARE */}
              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 shadow-lg ${
                  isScreenSharing
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/50"
                    : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                }`}
              >

                {isScreenSharing
                  ? <MonitorStop size={24} />
                  : <MonitorUp size={24} />}

              </button>

              {/* LEAVE */}
              <button
                onClick={leaveMeeting}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 p-4 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 shadow-lg shadow-red-500/50"
              >

                <PhoneOff size={24} />

              </button>
            </div>
          </div>

          {/* PARTICIPANT SIDEBAR */}
          <div className="w-72 bg-gradient-to-b from-[#1a1a3e] to-[#0f0f23] border-l border-gray-800/50 flex flex-col shadow-2xl">

            {/* HEADER */}
            <div className="p-4 border-b border-gray-800/50">

              <h2 className="text-lg font-bold text-gray-100">

                Participants

              </h2>

              <p className="text-xs text-gray-500 mt-1">

                {participants.length + 1} in meeting

              </p>
            </div>

            {/* PARTICIPANT LIST */}
            <div className="flex-1 overflow-auto p-3 space-y-3">

              {/* LOCAL USER */}
              <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                activeSpeaker === "local-user"
                  ? "bg-gradient-to-r from-green-600/30 to-emerald-600/20 border border-green-500/50"
                  : "bg-gray-800/40 border border-gray-700/50"
              }`}>

                <div className="flex-1">

                  <p className="font-medium text-sm text-gray-100">

                    You

                  </p>

                  <p className="text-xs text-gray-500">

                    Host

                  </p>
                </div>

                <div className="flex items-center gap-1">

                  {isMuted && (

                    <MicOff
                      size={14}
                      className="text-red-400"
                    />
                  )}

                  {isCameraOff && (

                    <VideoOff
                      size={14}
                      className="text-red-400"
                    />
                  )}
                </div>
              </div>

              {/* REMOTE USERS */}
              {participants.map(
                (participant) => (

                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      activeSpeaker === participant.id
                        ? "bg-gradient-to-r from-green-600/30 to-emerald-600/20 border border-green-500/50"
                        : "bg-gray-800/40 border border-gray-700/50"
                    }`}
                  >

                    <div className="flex-1">

                      <p className="font-medium text-sm text-gray-100">

                        {participant.name}

                      </p>

                      <p className="text-xs text-gray-500">

                        Participant

                      </p>
                    </div>

                    <div className="flex items-center gap-1">

                      {participant.muted && (

                        <MicOff
                          size={14}
                          className="text-red-400"
                        />
                      )}

                      {participant.videoOff && (

                        <VideoOff
                          size={14}
                          className="text-red-400"
                        />
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* CHAT SECTION */}
          <div className="w-80 bg-gradient-to-b from-[#1a1a3e] to-[#0f0f23] border-l border-gray-800/50 flex flex-col shadow-2xl">
            {/* CHAT HEADER */}
            <div className="p-4 border-b border-gray-800/50">

              <h2 className="text-lg font-bold text-gray-100">

                Meeting Chat

              </h2>
            </div>

            {/* CHAT MESSAGES */}
            <div className="flex-1 overflow-auto p-4 space-y-3">

              {messages.map(
                (msg, index) => (

                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.sender ===
                      userIdRef.current

                        ? "items-end"
                        : "items-start"
                    }`}
                  >

                    <div className="text-xs text-gray-500 mb-1">

                      {msg.sender}

                    </div>

                    <div className={`px-4 py-2 rounded-xl max-w-xs break-words text-sm transition-all duration-300 hover:scale-[1.02] ${
                      msg.sender ===
                      userIdRef.current

                        ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30"
                        : "bg-gray-800/60 border border-gray-700/50"
                    }`}>

                      {msg.text}

                    </div>
                  </div>
                )
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT */}
            <div className="p-4 border-t border-gray-800/50 flex gap-2">

              <input
                type="text"
                placeholder="Type message..."
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    sendChatMessage();
                  }
                }}
                className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 outline-none text-sm focus:border-blue-500/50 transition-all"
              />

              <button
                onClick={sendChatMessage}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30 whitespace-nowrap"
              >

                Send

              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;