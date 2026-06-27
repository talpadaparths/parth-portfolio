'use strict';

// Initializes the animated particle background on the canvas
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles, mouseX = 0, mouseY = 0;

  const PARTICLE_COUNT = 90;
  const CONNECTION_DIST = 130;
  const MOUSE_RADIUS = 160;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = randomBetween(0, width);
      this.y = randomBetween(0, height);
      this.vx = randomBetween(-0.35, 0.35);
      this.vy = randomBetween(-0.35, 0.35);
      this.radius = randomBetween(1, 2.2);
      this.alpha = randomBetween(0.2, 0.7);
      const useBlue = Math.random() > 0.5;
      this.color = useBlue
        ? `rgba(91, 108, 255, ${this.alpha})`
        : `rgba(200, 80, 255, ${this.alpha})`;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.x += dx * force * 0.03;
        this.y += dy * force * 0.03;
      }

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(91, 108, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  animate();
})();

// Handles navbar background shift on scroll and active section highlighting
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveSection();
  }

  function highlightActiveSection() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }
  });
})();

// Triggers CSS transitions when elements enter the viewport
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));

  const cards = document.querySelectorAll(
    '.expertise-card, .artifact-accordion, .glass-card, .contact-info'
  );

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

// Manages visibility and scroll action of the Back to Top button
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

// Intercepts anchor links to provide smooth scrolling with navbar offset
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

// Executes dynamic max-height calculations for Section 3 accordion expansion
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
        const itemContent = item.querySelector('.artifact-content');
        if (itemContent) itemContent.style.maxHeight = null;
      });

      if (!isCurrentlyOpen) {
        artifact.classList.add('is-open');
        content.style.maxHeight = content.scrollHeight + "px";
        
        setTimeout(() => {
          const rect = artifact.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            window.scrollBy({ top: rect.bottom - window.innerHeight + 20, behavior: 'smooth' });
          }
        }, 350);
      }
    });
  });
})();

// Animates the main hero heading text on initial load
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

// Staggers the entrance animation of roadmap timeline nodes
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
    .timeline-item.in-view {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(styleSheet);
})();

// Generates a subtle gradient radial tracking the user's cursor
(function initCursorGlow() {
  const trail = document.createElement('div');
  trail.id = 'cursor-trail';
  trail.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,80,255,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: left 0.12s ease, top 0.12s ease;
    will-change: left, top;
  `;
  document.body.appendChild(trail);

  window.addEventListener('mousemove', e => {
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
  }, { passive: true });
})();

// Adds hover rotation to the navbar logo graphic
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

// Injects a CSS gradient separator at the top of designated sections
(function initSectionIndicator() {
  const sections = document.querySelectorAll('section[id]');

  sections.forEach(section => {
    if (section.id === 'home') return;
    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(91,108,255,0.4), rgba(200,80,255,0.4), transparent);
    `;
    section.appendChild(line);
  });
})();

// Handles 3D transform calculations and infinite rotation for the validation slider
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cert-3d-card');
    const prevBtn = document.getElementById('cert-prev');
    const nextBtn = document.getElementById('cert-next');
    const wrapper = document.querySelector('.cert-3d-wrapper');
    
    if(cards.length === 0) return;

    let currentIndex = 0;

    function updateCarousel() {
        cards.forEach(card => {
            card.classList.remove('active', 'prev', 'next');
        });

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
            if(card.classList.contains('prev')) {
                prevBtn.click();
            } else if (card.classList.contains('next')) {
                nextBtn.click();
            }
        });
    });

    let touchStartX = 0;
    let touchEndX = 0;
    
    wrapper.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    wrapper.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextBtn.click();
        if (touchEndX > touchStartX + 50) prevBtn.click();
    }

    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.getElementById("close-modal");
    const previewBtns = document.querySelectorAll('.preview-btn');

    previewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgSrc = btn.getAttribute('data-img');
            modalImg.src = imgSrc;
            modal.classList.add('show');
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.classList.remove('show');
        }
    });
});
