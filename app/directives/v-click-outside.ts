import type { Directive } from 'vue'

const vClickOutside: Directive = {
  created(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }, binding) {
    el.clickOutsideEvent = (event: Event) => {
      const target = event.target
      if (!(target instanceof Node) || !(el === target || el.contains(target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  },
}

export default vClickOutside
