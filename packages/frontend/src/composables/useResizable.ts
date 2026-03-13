import { ref, onMounted, onUnmounted } from 'vue'

export function useResizable(initialWidth: number = 256, min: number = 150, max: number = 600) {
  const width = ref(initialWidth)
  const isDragging = ref(false)

  function startDrag(e: MouseEvent) {
    isDragging.value = true
    e.preventDefault()

    function onMouseMove(e: MouseEvent) {
      if (!isDragging.value) return
      const newWidth = Math.min(Math.max(e.clientX, min), max)
      width.value = newWidth
    }

    function onMouseUp() {
      isDragging.value = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return { width, isDragging, startDrag }
}