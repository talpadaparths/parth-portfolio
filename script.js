'use strict';

// Hardware-throttled canvas rendering using IntersectionObserver & Debounce
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles, mouseX = 0, mouseY = 0;
  let animationFrameId;
  let isCanvasVisible = true;

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
    if (!isCanvasVisible) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animationFrameId = requestAnimationFrame(animate);
  }

  // Viewport observer to pause canvas rendering when off-screen (CPU save)
  const observer = new IntersectionObserver((entries) => {
    isCanvasVisible = entries[0].isIntersecting;
    if (isCanvasVisible) {
      animate();
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  }, { threshold: 0 });
  
  const homeSection = document.getElementById('home');
  if(homeSection) observer.observe(homeSection);

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
  
  // Resize debouncer to prevent calculation loop freezing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { resize(); createParticles(); }, 250);
  });

  resize(); createParticles(); animate();
})();

// IntersectionObserver based navigation tracking (Eliminates scroll layout thrashing)
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const topObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) { navbar.classList.add('scrolled'); } 
    else { navbar.classList.remove('scrolled'); }
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

// Scroll Reveal Logic
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));

  const cards = document.querySelectorAll('.expertise-card, .artifact-accordion, .glass-card, .contact-info');
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

// Back to Top Button
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

// Smooth Scrolling for anchor links
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

// A11y compliant accordion logic with responsive height clearing
(function initKnowledgeArtifacts() {
  const artifacts = document.querySelectorAll('.artifact-accordion');
  if (!artifacts.length) return;

  artifacts.forEach(artifact => {
    const trigger = artifact.querySelector('.artifact-trigger');
    const content = artifact.querySelector('.artifact-content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isCurrentlyOpen = artifact.classList.contains('is-open');

      artifacts.forEach(item => {
        item.classList.remove('is-open');
        item.querySelector('.artifact-trigger').setAttribute('aria-expanded', 'false');
        const itemContent = item.querySelector('.artifact-content');
        if (itemContent && itemContent.style.maxHeight !== 'none') {
          itemContent.style.maxHeight = null;
        } else if (itemContent) {
          // Force reflow before collapsing if height was stripped
          itemContent.style.maxHeight = itemContent.scrollHeight + 'px';
          setTimeout(() => itemContent.style.maxHeight = null, 10);
        }
      });

      if (!isCurrentlyOpen) {
        artifact.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + "px";
        
        setTimeout(() => {
          // Remove absolute height constraint post-transition to allow responsive reflow
          if (artifact.classList.contains('is-open')) content.style.maxHeight = 'none';
        }, 350);
      }
    });
  });
})();

// Typing Animation
(function initTypingEffect() {
  const headingEl = document.querySelector('.hero-heading');
  if (!headingEl) return;
  headingEl.style.opacity = '0';
  headingEl.style.transform = 'translateY(24px)';
  setTimeout(() => {
    headingEl.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    headingEl.style.opacity = '1';
    headingEl.style.transform = 'translateY(0)';
  }, 200);
})();

// Timeline Stagger Animation
(function initTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(24px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
  });

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .timeline-item.in-view { opacity: 1 !important; transform: translateY(0) !important; }
  `;
  document.head.appendChild(styleSheet);
})();

// GPU-accelerated cursor mapping utilizing transform logic
(function initCursorGlow() {
  const trail = document.createElement('div');
  trail.id = 'cursor-trail';
  trail.style.cssText = `
    position: fixed; top: 0; left: 0; width: 300px; height: 300px;
    border-radius: 50%; background: radial-gradient(circle, rgba(200,80,255,0.04) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
    transition: transform 0.12s ease; will-change: transform;
  `;
  document.body.appendChild(trail);

  window.addEventListener('mousemove', e => {
    trail.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
  }, { passive: true });
})();

// Nav Logo Animation
(function initLogoAnimation() {
  const logo = document.querySelector('.logo-icon');
  if (!logo) return;
  logo.addEventListener('mouseenter', () => {
    logo.style.transform = 'rotate(10deg) scale(1.1)';
    logo.style.transition = 'transform 0.3s ease';
  });
  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'rotate(0deg) scale(1)';
  });
})();

// Section Gradient Lines
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

// 3D Carousel Implementation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cert-3d-card');
    const prevBtn = document.getElementById('cert-prev');
    const nextBtn = document.getElementById('cert-next');
    const wrapper = document.querySelector('.cert-3d-wrapper');
    
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

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            if(card.classList.contains('prev')) prevBtn.click();
            else if (card.classList.contains('next')) nextBtn.click();
        });
    });

    let touchStartX = 0, touchEndX = 0;
    
    wrapper.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    wrapper.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) nextBtn.click();
        if (touchEndX > touchStartX + 50) prevBtn.click();
    }, {passive: true});

    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.getElementById("close-modal");
    const previewBtns = document.querySelectorAll('.preview-btn');

    previewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            modalImg.src = btn.getAttribute('data-img');
            modal.classList.add('show');
        });
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });
});