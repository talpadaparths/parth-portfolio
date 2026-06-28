'use strict';

// 1. Hardware-throttled canvas rendering (Dot/Particle Background - FIXED: Now runs everywhere)
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles, mouseX = 0, mouseY = 0;
  let animationFrameId;

  const PARTICLE_COUNT = 90;
  const CONNECTION_DIST = 130;
  const MOUSE_RADIUS = 160;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = randomBetween(0, width);
      this.y = randomBetween(0, height);
      this.vx = randomBetween(-0.35, 0.35);
      this.vy = randomBetween(-0.35, 0.35);
      this.radius = randomBetween(1, 2.2);
      this.alpha = randomBetween(0.2, 0.7);
      this.color = Math.random() > 0.5 ? `rgba(91, 108, 255, ${this.alpha})` : `rgba(200, 80, 255, ${this.alpha})`;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      const dx = this.x - mouseX; const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.x += dx * force * 0.03; this.y += dy * force * 0.03;
      }
      if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height; if (this.y > height) this.y = 0;
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color; ctx.fill();
    }
  }

  function createParticles() { particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle()); }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(91, 108, 255, ${alpha})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animationFrameId = requestAnimationFrame(animate);
  }

  // Observer हटा दिया गया है ताकि एनीमेशन कभी न रुके
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { resize(); createParticles(); }, 250);
  });

  resize(); createParticles(); animate();
})();

// 2. Navigation Tracking & Mobile Menu
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const topObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { rootMargin: '-40px 0px 0px 0px' });
  topObserver.observe(document.body);

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) link.classList.add('active');
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -50% 0px' });
  sections.forEach(section => sectionObserver.observe(section));

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
})();

// 3. Scroll Reveal Elements (Fixed: Removed .cert-card to prevent transform conflict)
(function initScrollReveal() {
  const cards = document.querySelectorAll('.expertise-card, .connect-info, .connect-form-wrap');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(28px)';
    card.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    cardObserver.observe(card);
  });
})();

// 4. Back to Top Button
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// 5. Smooth Scrolling
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

// 6. Section Gradient Lines
(function initSectionIndicator() {
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    if (section.id === 'home') return;
    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 100px; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(91,108,255,0.4), rgba(200,80,255,0.4), transparent);
    `;
    section.appendChild(line);
  });
})();

// 7. Center-Focused Peek Carousel & Modal (Updated for 14 Certificates)
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cert-card');
    const prevBtn = document.getElementById('cert-prev');
    const nextBtn = document.getElementById('cert-next');
    const wrapper = document.querySelector('.cert-carousel-wrapper');
    
    if(cards.length === 0) return;

    let currentIndex = 0;

    function updateCarousel() {
        cards.forEach(card => card.classList.remove('active', 'prev', 'next'));

        const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
        const nextIndex = (currentIndex + 1) % cards.length;

        cards[currentIndex].classList.add('active');
        cards[prevIndex].classList.add('prev');
        cards[nextIndex].classList.add('next');
    }

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    });

    // Click side cards to bring them to center
    cards.forEach((card) => {
        card.addEventListener('click', () => {
            if(card.classList.contains('prev')) prevBtn.click();
            else if (card.classList.contains('next')) nextBtn.click();
        });
    });

    // Swipe Support for Touch Devices
    let touchStartX = 0, touchEndX = 0;
    wrapper.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    wrapper.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) nextBtn.click();
        if (touchEndX > touchStartX + 50) prevBtn.click();
    }, {passive: true});

    // Modal Logic (Eye Icon Click)
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.getElementById("close-modal");
    const previewBtns = document.querySelectorAll('.preview-btn');

    previewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents clicking the card behind it
            modalImg.src = btn.getAttribute('data-img');
            modal.classList.add('show');
        });
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });
});