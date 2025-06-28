<script setup>
import { Video, Play, Shield, Users, Settings, Zap } from 'lucide-vue-next';
</script>

<template>
    <!-- <header class="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
            <nav class="flex items-center justify-end gap-4">
                <Link
                    v-if="$page.props.auth.user"
                    :href="route('dashboard')"
                    class="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                    Dashboard
                </Link>
                <template v-else>
                    <Link
                        :href="route('login')"
                        class="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                    >
                        Log in
                    </Link>
                    <Link
                        :href="route('register')"
                        class="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Register
                    </Link>
                </template>
            </nav>
        </header> -->

    <header class="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Video class="w-5 h-5 text-white" />
                    </div>
                    <span class="text-2xl font-bold text-white">Camloo</span>
                </div>

                <nav class="hidden md:flex space-x-8">
                    <a href="#" class="text-white/80 hover:text-white transition-colors">
                        Home
                    </a>
                    <a href="#" class="text-white/80 hover:text-white transition-colors">
                        About
                    </a>
                    <a href="#" class="text-white/80 hover:text-white transition-colors">
                        Privacy
                    </a>
                    <a href="#" class="text-white/80 hover:text-white transition-colors">
                        Support
                    </a>
                </nav>

                <div class="flex items-center space-x-4">
                    <button class="p-2 text-white/80 hover:text-white transition-colors">
                        <Users class="w-5 h-5" />
                    </button>
                    <button class="p-2 text-white/80 hover:text-white transition-colors">
                        <Settings class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>
