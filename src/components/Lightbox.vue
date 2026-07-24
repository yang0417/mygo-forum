<template>
    <div class="lightbox" v-if="visible" @click="close">
        <span class="lightbox-close" @click="close">&times;</span>
        <img :src="images[currentIndex]" class="lightbox-img" @click.stop>
        <button class="lightbox-prev" @click.stop="prev" v-if="images.length > 1">&#8249;</button>
        <button class="lightbox-next" @click.stop="next" v-if="images.length > 1">&#8250;</button>
        <div class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue"

const props = defineProps({
    images: { type: Array, required: true },
    visible: { type: Boolean, default: false },
    startIndex: { type: Number, default: 0 }
})

const emit = defineEmits(["close"])

const currentIndex = ref(0)

watch(() => props.visible, (v) => {
    if (v) {
        currentIndex.value = props.startIndex
        document.body.style.overflow = "hidden"
    } else {
        document.body.style.overflow = ""
    }
}, { immediate: true })

const close = () => {
    emit("close")
    document.body.style.overflow = ""
}

const prev = () => {
    currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

const next = () => {
    currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const onKeydown = (e) => {
    if (!props.visible) return
    if (e.key === "Escape") close()
    if (e.key === "ArrowLeft") prev()
    if (e.key === "ArrowRight") next()
}

onMounted(() => window.addEventListener("keydown", onKeydown))
onUnmounted(() => window.removeEventListener("keydown", onKeydown))
</script>
