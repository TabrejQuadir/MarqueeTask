gsap.registerPlugin(ScrollTrigger);
        
// Initialize elements
const marquee = document.querySelector('.marquee');
const originalContent = document.querySelector('.marquee-content.original');
const scrollIndicator = document.querySelector('.scroll-indicator');

// Duplicate content for seamless looping
const clone = originalContent.cloneNode(true);
clone.classList.remove('original');
clone.classList.add('clone');
marquee.appendChild(clone);

// Get measurements
const contentWidth = originalContent.offsetWidth;
const containerWidth = document.querySelector('.marquee-container').offsetWidth;

// Animation state
let direction = 1; // 1 = right, -1 = left
let targetSpeed = 1;
let currentSpeed = 1;
let scrollTimeout;
let animationId;
let lastScrollTime = 0;

// Initial position
gsap.set(marquee, { x: 0 });

// Show scroll indicator on load
function showInitialIndicator() {
    scrollIndicator.classList.add('visible');
    setTimeout(() => {
        scrollIndicator.classList.remove('visible');
    }, 3000);
}
setTimeout(showInitialIndicator, 1000);

// Handle scroll end
function handleScrollEnd() {
    scrollIndicator.classList.add('visible');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        scrollIndicator.classList.remove('visible');
    }, 2000);
}

// ScrollTrigger controller
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime;
        lastScrollTime = now;
        
        const velocity = self.getVelocity();
        
        if (velocity > 10) { // Scrolling down
            direction = 1;
            targetSpeed = Math.min(5, 1 + (velocity / 600));
        } else if (velocity < -10) { // Scrolling up
            direction = -1;
            targetSpeed = Math.min(5, 1 + (Math.abs(velocity) / 600));
        } else if (timeSinceLastScroll > 100) { // Scrolling very slowly or stopped
            targetSpeed = 1;
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            targetSpeed = 1;
            handleScrollEnd();
        }, 300);
    }
});

// Perfect infinite animation loop
function animateMarquee() {
    // Smooth speed transition
    currentSpeed += (targetSpeed - currentSpeed) * 0.1;
    
    // Get current position
    const currentX = parseFloat(gsap.getProperty(marquee, "x"));
    let newX = currentX - (currentSpeed * direction);
    
    // Seamless loop logic
    if (direction === 1 && newX <= -contentWidth) {
        newX += contentWidth;
    } 
    else if (direction === -1 && newX >= 0) {
        newX -= contentWidth;
    }
    
    // Apply the new position
    gsap.set(marquee, { x: newX });
    
    // Continue animation
    animationId = requestAnimationFrame(animateMarquee);
}

// Start animation
animateMarquee();

// Handle window resize
function handleResize() {
    const newContentWidth = originalContent.offsetWidth;
    const currentX = parseFloat(gsap.getProperty(marquee, "x"));
    const ratio = newContentWidth / contentWidth;
    gsap.set(marquee, { x: currentX * ratio });
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
});

// Clean up on page hide
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        animateMarquee();
    }
});