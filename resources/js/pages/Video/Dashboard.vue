<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FrontLayout from "@/layouts/FrontLayout.vue";
import { Video, VideoOff, Mic, MicOff, SkipForward, MessageCircle, Phone, Send } from 'lucide-vue-next';
import { io } from "socket.io-client"

defineOptions({ layout: FrontLayout });

interface ChatMessage {
    id: number;
    text: string;
    sender: 'you' | 'partner';
    timestamp: Date;
}

const isConnected = ref(false)
const isVideoOn = ref(true)
const isAudioOn = ref(true)
const isChatOpen = ref(false)
const chatMessage = ref('')

function toggleVideo() {
    isVideoOn.value = !isVideoOn.value
}

function toggleAudio() {
    isAudioOn.value = !isAudioOn.value
}

function toggleChat() {
    isChatOpen.value = !isChatOpen.value
}

const messages = ref<ChatMessage[]>([
    {
        id: 1,
        text: "Hey there! Nice to meet you 👋",
        sender: 'partner',
        timestamp: new Date(Date.now() - 120000)
    },
    {
        id: 2,
        text: "Hello! How are you doing today?",
        sender: 'you',
        timestamp: new Date(Date.now() - 90000)
    },
    {
        id: 3,
        text: "I'm doing great, thanks for asking! Where are you from?",
        sender: 'partner',
        timestamp: new Date(Date.now() - 60000)
    },
    {
        id: 4,
        text: "I'm from New York. What about you?",
        sender: 'you',
        timestamp: new Date(Date.now() - 30000)
    }
]);

const skipPartner = () => {
    isConnected.value = false;
    messages.value = [];

    setupPeerConnection();
    setTimeout(() => {
        isConnected.value = true;
        messages.value = [
            {
                id: Date.now(),
                text: "Hi! New person here 😊",
                sender: 'partner',
                timestamp: new Date()
            }
        ];
    }, 1500);
};

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

const sendMessage = () => {
    if (chatMessage.value.trim() && isConnected.value) {
        const newMessage: ChatMessage = {
            id: Date.now(),
            text: chatMessage.value.trim(),
            sender: 'you',
            timestamp: new Date()
        };

        messages.value.push(newMessage);
        chatMessage.value = '';

        // Simulate partner response after a delay
        setTimeout(() => {
            const responses = [
                "That's interesting!",
                "I see, tell me more",
                "Really? That's cool!",
                "Nice! 😄",
                "Awesome!",
                "I agree with you",
                "That sounds fun!",
                "Wow, that's amazing!"
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const partnerMessage: ChatMessage = {
                id: Date.now() + 1,
                text: randomResponse,
                sender: 'partner',
                timestamp: new Date()
            };

            messages.value.push(partnerMessage);
        }, 1000 + Math.random() * 2000);
    }
};

function formatTime(date: Date) {
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// start coding for video call
const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)

let localStream: MediaStream
let peerConnection: RTCPeerConnection
const socket = io("http://localhost:6001") // Replace with your signaling server
const roomId = "room-123" // For now hardcoded

const iceServers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
}

async function setupLocalMedia() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('data from setup local media ==> ');
        console.log(devices);

        const hasVideo = devices.some(device => device.kind === 'videoinput');
        const hasAudio = devices.some(device => device.kind === 'audioinput');
        console.log("has Video ==> "+ hasVideo);
        console.log("has Audio ==> "+ hasAudio);

        if (!hasVideo || !hasAudio) {
            /*alert("No camera or microphone found on this device.");
            return;*/

            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    localStream = stream;
                    if (localVideoRef.value) {
                        localVideoRef.value.srcObject = stream;
                    }
                })
                .catch((err) => {
                    console.error(err);
                    alert("Permission denied. Please enable camera and microphone.");
                });
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: hasVideo,
            audio: hasAudio
        });

        localStream = stream;

        if (localVideoRef.value) {
            localVideoRef.value.srcObject = stream;
        }

        if (isConnected.value) {
            setupPeerConnection();
        }

    } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Failed to access camera/mic. Check permissions and device availability.");
    }
}

function setupPeerConnection() {
    setupLocalMedia();

    peerConnection = new RTCPeerConnection(iceServers)
    console.log("localStream ==> ");
    console.log(localStream);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        if (remoteVideoRef.value) {
            remoteVideoRef.value.srcObject = event.streams[0]
        }
    }

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("candidate", { roomId, candidate: event.candidate })
        }
    }
}

socket.on("connect", () => {
    socket.emit("join", roomId)
    console.log("connected User soclet ID ==>"+ socket.id);
})

socket.on("joined", () => {
    if (localStream) {
        setupPeerConnection()
        peerConnection.createOffer().then(offer => {
            peerConnection.setLocalDescription(offer)
            socket.emit("offer", { roomId, offer })
        })
    }
})

socket.on("offer", async ({ offer }) => {
    console.log("Offer to User ==> "+ offer);

    if (!peerConnection) setupPeerConnection()
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    socket.emit("answer", { roomId, answer })
})

socket.on("answer", async ({ answer }) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    console.log("Answer from User ==> "+ answer);
})

socket.on("candidate", async ({ candidate }) => {
    if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }
})

// Start local camera and mic when connected
watch(isConnected, (val) => {
    if (val) setupLocalMedia()
})

</script>

<template>
    <Head title="Video Chat" />

    <div class="flex-1 flex">
        <!-- Main Video Area -->
        <div class="flex-1 relative">
            <div class="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 h-full p-4">
                <!-- Remote Video -->
                <div class="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                    <div class="aspect-video w-full h-full flex items-center justify-center">
                        <template v-if="isConnected">
                            <div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <div class="text-white text-center">
                                    <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
<!--                                        <Video class="w-12 h-12" />-->
                                        <Video ref="remoteVideoRef" autoplay playsinline class="rounded-xl w-full h-full object-cover" />
                                    </div>
                                    <p class="text-lg font-medium">Connected Partner</p>
                                    <p class="text-sm text-white/80">Online</p>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="text-white text-center">
                                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                                    <Video class="w-8 h-8" />
                                </div>
                                <p class="text-lg">Looking for someone...</p>
                                <div class="flex justify-center mt-2">
                                    <div class="flex space-x-1">
                                        <div class="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                        <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                                        <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div class="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        Partner
                    </div>

                    <div v-if="isConnected" class="absolute top-4 right-4 flex items-center space-x-2">
                        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span class="text-white text-xs bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">Live</span>
                    </div>
                </div>

                <!-- Local Video -->
                <div class="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                    <div class="aspect-video w-full h-full flex items-center justify-center">
                        <template v-if="isVideoOn">
                            <div class="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <div class="text-white text-center">
                                    <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
<!--                                        <Video class="w-12 h-12" />-->
                                        <Video ref="localVideoRef" autoplay muted playsinline class="rounded-xl w-full h-full object-cover" />
                                    </div>
                                    <p class="text-lg font-medium">You</p>
                                    <p class="text-sm text-white/80">Camera On</p>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="text-white text-center">
                                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <VideoOff class="w-8 h-8" />
                                </div>
                                <p class="text-lg">Camera Off</p>
                            </div>
                        </template>
                    </div>
                    <div class="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        You
                    </div>
                </div>
            </div>

            <!-- Control Panel -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
                    <div class="flex items-center space-x-4">
                        <button
                            @click="toggleVideo"
                            :class="[ 'p-3 rounded-full transition-all duration-200 hover:scale-105',
                                isVideoOn ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg' ]"
                            :title="isVideoOn ? 'Turn off camera' : 'Turn on camera'"
                        >
                            <component :is="isVideoOn ? Video : VideoOff" class="w-6 h-6" />
                        </button>

                        <button
                            @click="toggleAudio"
                            :class="[ 'p-3 rounded-full transition-all duration-200 hover:scale-105',
                                isAudioOn ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg' ]"
                            :title="isAudioOn ? 'Mute microphone' : 'Unmute microphone'"
                        >
                            <component :is="isAudioOn ? Mic : MicOff" class="w-6 h-6" />
                        </button>

                        <button
                            @click="skipPartner"
                            class="p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                            title="Skip to next person"
                        >
                            <SkipForward class="w-6 h-6" />
                        </button>

                        <button
                            @click="toggleChat"
                            :class="[ 'p-3 rounded-full transition-all duration-200 hover:scale-105 relative',
                                isChatOpen ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg' : 'bg-gray-500 hover:bg-gray-600 text-white shadow-lg' ]"
                            title="Toggle chat"
                        >
                            <MessageCircle class="w-6 h-6" />
                            <div v-if="messages.length > 0 && !isChatOpen" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span class="text-xs text-white font-bold">{{ messages.length }}</span>
                            </div>
                        </button>

                        <button
                            class="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                            title="End call"
                        >
                            <Phone class="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat Sidebar -->
        <div :class="['transition-all duration-300', isChatOpen ? 'w-80' : 'w-0', 'overflow-hidden']">
            <div class="h-full bg-white/10 backdrop-blur-md border-l border-white/20 flex flex-col">
                <div class="p-4 border-b border-white/20">
                    <div class="flex items-center justify-between">
                        <h3 class="text-white font-semibold">Chat</h3>
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-white/80 text-sm">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 p-4 overflow-y-auto space-y-3">
                    <div v-if="messages.length === 0" class="text-center text-white/60 py-8">
                        <MessageCircle class="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet</p>
                        <p class="text-sm">Start a conversation!</p>
                    </div>
                    <div v-else v-for="message in messages" :key="message.id" :class="['flex', message.sender === 'you' ? 'justify-end' : 'justify-start']">
                        <div :class="[ 'max-w-xs px-4 py-2 rounded-2xl',
                            message.sender === 'you' ? 'bg-blue-500 text-white rounded-br-md' : 'bg-white/20 text-white rounded-bl-md' ]">
                            <p class="text-sm">{{ message.text }}</p>
                            <p :class="['text-xs mt-1', message.sender === 'you' ? 'text-blue-100' : 'text-white/60']">
                                {{ formatTime(message.timestamp) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="p-4 border-t border-white/20">
                    <div class="flex space-x-2">
                        <input
                            type="text"
                            v-model="chatMessage"
                            @keypress="handleKeyPress"
                            :placeholder="isConnected ? 'Type a message...' : 'Connect to chat'"
                            :disabled="!isConnected"
                            class="flex-1 bg-white/10 text-white placeholder-white/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            @click="sendMessage"
                            :disabled="!chatMessage.trim() || !isConnected"
                            class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <Send class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
