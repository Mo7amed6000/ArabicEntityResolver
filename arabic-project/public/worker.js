import { gsap } from 'gsap';

self.addEventListener('message', (event) => {
  const { action } = event.data;
  if (action === 'startAnimation') {
    // Perform GSAP animation on a specific DOM element
    const element = document.getElementById('item1');
    if (element) {
      gsap.to(element, { x: 100, y: 100, duration: 1 });
    } else {
      console.error("Element with id 'animatedElement' not found.");
    }
  }
});