const navToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

const updateActiveNavLink = (id) => {
    document.querySelectorAll('.nav-links a').forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', isActive);
    });
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (event) {
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navToggle?.setAttribute('aria-expanded', 'false');
        }

        updateActiveNavLink(target.id);
    });
});

const sectionObserver = new IntersectionObserver(
    (entries) => {
        const visibleSection = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) {
            updateActiveNavLink(visibleSection.target.id);
        }
    },
    {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.2, 0.4, 0.7]
    }
);

document.querySelectorAll('main section[id]').forEach((section) => {
    sectionObserver.observe(section);
});

const cardObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll('.section, .project-card, .skill-card').forEach((element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(element);
});

document.querySelectorAll('.social-link').forEach((icon) => {
    icon.addEventListener('mouseenter', () => {
        icon.classList.remove('is-bouncing');
        void icon.offsetWidth;
        icon.classList.add('is-bouncing');
    });

    icon.addEventListener('mouseleave', () => {
        icon.classList.remove('is-bouncing');
    });
});

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Thanks for reaching out! Your message has been captured.');
    event.target.reset();
});

const canvas = document.querySelector('.background-canvas');
const context = canvas?.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (canvas && context) {
    let particles = [];
    let animationFrame;
    let isVisible = true;

    const resizeCanvas = () => {
        window.cancelAnimationFrame(animationFrame);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * pixelRatio);
        canvas.height = Math.floor(window.innerHeight * pixelRatio);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const count = Math.min(100, Math.max(36, Math.floor((window.innerWidth * window.innerHeight) / 16000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.32,
            vy: (Math.random() - 0.5) * 0.32,
            radius: Math.random() * 1.4 + 1,
            hue: Math.random() > 0.5 ? 188 : 242
        }));

        drawFrame();
    };

    const drawFrame = () => {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particles.forEach((particle, index) => {
            if (!reducedMotion.matches) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
                if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
            }

            for (let neighborIndex = index + 1; neighborIndex < particles.length; neighborIndex += 1) {
                const neighbor = particles[neighborIndex];
                const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);
                if (distance < 145) {
                    context.beginPath();
                    context.moveTo(particle.x, particle.y);
                    context.lineTo(neighbor.x, neighbor.y);
                    context.strokeStyle = `hsla(${particle.hue}, 85%, 62%, ${(1 - distance / 145) * 0.16})`;
                    context.lineWidth = 1;
                    context.stroke();
                }
            }

            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = `hsla(${particle.hue}, 90%, 62%, 0.72)`;
            context.shadowBlur = 12;
            context.shadowColor = `hsla(${particle.hue}, 95%, 62%, 0.7)`;
            context.fill();
            context.shadowBlur = 0;
        });

        if (!reducedMotion.matches && isVisible) {
            animationFrame = window.requestAnimationFrame(drawFrame);
        }
    };

    const stopAnimation = () => window.cancelAnimationFrame(animationFrame);

    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible && !reducedMotion.matches) drawFrame();
        else stopAnimation();
    });
    reducedMotion.addEventListener('change', () => {
        stopAnimation();
        drawFrame();
    });
    resizeCanvas();
}
