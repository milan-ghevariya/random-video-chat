<script setup lang="ts">
    import { Head, router } from '@inertiajs/vue3';
    import { ref } from 'vue';
    import { Play, Shield, Users, Zap } from 'lucide-vue-next';
    import FrontLayout from "../layouts/FrontLayout.vue";

    defineOptions({ layout: FrontLayout });

    const isLoading = ref(false);
    function handleStart() {
        isLoading.value = true;

        setTimeout(() => {
            router.visit(route('video.chat'))
        }, 500)
    }
</script>

<template>
    <Head title="Welcome">
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>

    <div class="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
        <div class="flex-1 flex items-center justify-center p-8">
            <div class="max-w-2xl mx-auto text-center">
                <div class="mb-8">
                    <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Users class="w-12 h-12 text-white" />
                    </div>
                    <h1 class="text-5xl font-bold text-white mb-4">
                        Connect with New People
                    </h1>
                    <p class="text-xl text-white/80 mb-8">
                        Start video chatting with strangers from around the world instantly
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap class="w-6 h-6 text-white" />
                        </div>
                        <h3 class="text-white font-semibold mb-2">Instant Connection</h3>
                        <p class="text-white/70 text-sm">Connect with people worldwide in seconds</p>
                    </div>

                    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield class="w-6 h-6 text-white" />
                        </div>
                        <h3 class="text-white font-semibold mb-2">Safe & Secure</h3>
                        <p class="text-white/70 text-sm">Your privacy and safety are our top priority</p>
                    </div>

                    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users class="w-6 h-6 text-white" />
                        </div>
                        <h3 class="text-white font-semibold mb-2">Global Community</h3>
                        <p class="text-white/70 text-sm">Meet people from different cultures and backgrounds</p>
                    </div>
                </div>

                <button @click="handleStart" :disabled="isLoading"
                    class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl
                    shadow-2xl transition-all duration-200 hover:scale-105 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-3"
                >
                    <template v-if="isLoading">
                        <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                    </template>
                    <template v-else>
                        <Play class="w-6 h-6" />
                        <span>Start Video Chat</span>
                    </template>
                </button>

                <p class="text-white/60 text-sm mt-6">
                    By clicking "Start Video Chat", you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    </div>
    <div class="hidden h-14.5 lg:block"></div>

</template>
