<script setup>
import FrontHeaderLayout from "./app/FrontHeaderLayout.vue";
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col">
        <FrontHeaderLayout />

        <slot />
        <!-- Optional: add footer here if needed -->
    </div>
</template>
