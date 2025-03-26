gsap.registerPlugin(ScrollTrigger);

// Initialize elements
const marquee1 = document.querySelector('#marquee1 .marquee');
const marquee2 = document.querySelector('#marquee2 .marquee');
const originalContent1 = document.querySelector('#marquee1 .marquee-content.original');
const originalContent2 = document.querySelector('#marquee2 .marquee-content.original');
const scrollIndicator = document.querySelector('.scroll-indicator');

// Default directions
const DEFAULT_DIRECTION = {
    marquee1: -1, // Right to Left
    marquee2: 1   // Left to Right
};

// Duplicate content for seamless looping
function setupMarquee(marqueeElement, originalContent) {
    const clone = originalContent.cloneNode(true);
    clone.classList.remove('original');
    clone.classList.add('clone');
    marqueeElement.appendChild(clone);
    return originalContent.offsetWidth;
}

// Get measurements
const contentWidth1 = setupMarquee(marquee1, originalContent1);
const contentWidth2 = setupMarquee(marquee2, originalContent2);

// Set initial positions for perfect looping
gsap.set(marquee1, { x: 0 });
gsap.set(marquee2, { x: -contentWidth2 });

// Animation state
let scrollDirection = 0; // 0 = not scrolling, 1 = down, -1 = up
let targetSpeed = 1;
let currentSpeed = 1;
let scrollTimeout;
let animationId;
let lastScrollTime = 0;

// Show scroll indicator on load
function showInitialIndicator() {
    scrollIndicator.classList.add('visible');
    setTimeout(() => {
        scrollIndicator.classList.remove('visible');
    }, 3000);
}
setTimeout(showInitialIndicator, 1000);

// Handle scroll end - return to default directions
function handleScrollEnd() {
    scrollIndicator.classList.add('visible');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        scrollIndicator.classList.remove('visible');
        targetSpeed = 1;
        scrollDirection = 0; // Reset to not scrolling
    }, 300);
}

// ScrollTrigger controller
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
        const now = Date.now();
        lastScrollTime = now;
        
        const velocity = self.getVelocity();
        
        if (velocity > 10) { // Scrolling down
            scrollDirection = 1;
            targetSpeed = Math.min(5, 1 + (velocity / 600));
        } else if (velocity < -10) { // Scrolling up
            scrollDirection = -1;
            targetSpeed = Math.min(5, 1 + (Math.abs(velocity) / 600));
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            handleScrollEnd();
        }, 300);
    }
});

// Animation loop
function animateMarquees() {
    // Smooth speed transition
    currentSpeed += (targetSpeed - currentSpeed) * 0.1;
    
    // Determine movement directions based on scroll state
    let marquee1Direction, marquee2Direction;
    
    if (scrollDirection === 1) { // Scrolling down
        marquee1Direction = -1; // Right to Left
        marquee2Direction = 1;  // Left to Right
    } else if (scrollDirection === -1) { // Scrolling up
        marquee1Direction = 1;  // Left to Right
        marquee2Direction = -1; // Right to Left
    } else { // Not scrolling - use defaults
        marquee1Direction = DEFAULT_DIRECTION.marquee1;
        marquee2Direction = DEFAULT_DIRECTION.marquee2;
    }
    
    // Calculate movement
    const marquee1Movement = marquee1Direction * currentSpeed;
    const marquee2Movement = marquee2Direction * currentSpeed;
    
    // Animate first marquee
    const currentX1 = parseFloat(gsap.getProperty(marquee1, "x"));
    let newX1 = currentX1 + marquee1Movement;
    
    // Animate second marquee
    const currentX2 = parseFloat(gsap.getProperty(marquee2, "x"));
    let newX2 = currentX2 + marquee2Movement;
    
    // Seamless loop logic for first marquee
    if (marquee1Direction < 0 && newX1 <= -contentWidth1) {
        newX1 += contentWidth1;
    } 
    else if (marquee1Direction > 0 && newX1 >= contentWidth1) {
        newX1 -= contentWidth1;
    }
    
    // Seamless loop logic for second marquee
    if (marquee2Direction > 0 && newX2 >= 0) {
        newX2 -= contentWidth2;
    }
    else if (marquee2Direction < 0 && newX2 <= -contentWidth2) {
        newX2 += contentWidth2;
    }
    
    // Apply positions
    gsap.set(marquee1, { x: newX1 });
    gsap.set(marquee2, { x: newX2 });
    
    animationId = requestAnimationFrame(animateMarquees);
}

// Start animation
animateMarquees();

// Handle window resize
function handleResize() {
    const newContentWidth1 = originalContent1.offsetWidth;
    const newContentWidth2 = originalContent2.offsetWidth;
    
    const currentX1 = parseFloat(gsap.getProperty(marquee1, "x"));
    const ratio1 = newContentWidth1 / contentWidth1;
    gsap.set(marquee1, { x: currentX1 * ratio1 });
    
    const currentX2 = parseFloat(gsap.getProperty(marquee2, "x"));
    const ratio2 = newContentWidth2 / contentWidth2;
    gsap.set(marquee2, { x: currentX2 * ratio2 });
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
        animateMarquees();
    }
});