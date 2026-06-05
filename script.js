    /* =================================================
   PARTH TALPADA - PORTFOLIO JAVASCRIPT
   Handles: Canvas BG, Navbar, Scroll Reveal,
   Timeline animations, Form submission
================================================= */

'use strict';

// ================================================
// ANIMATED PARTICLE CANVAS BACKGROUND
// ================================================
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
      // Alternate between blue and purple
      const useBlue = Math.random() > 0.5;
      this.color = useBlue
        ? `rgba(91, 108, 255, ${this.alpha})`
        : `rgba(200, 80, 255, ${this.alpha})`;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.x += dx * force * 0.03;
        this.y += dy * force * 0.03;
      }

      // Wrap
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


// ================================================
// NAVBAR - Scroll & Active Link
// ================================================
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Scroll class
  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveSection();
  }

  // Highlight nav link for current section
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

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  });

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }
  });
})();


// ================================================
// SCROLL REVEAL ANIMATION (IntersectionObserver)
// ================================================
//(function initScrollReveal() {
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

  // Also reveal expertise cards and other major cards on scroll
  const cards = document.querySelectorAll(
    '.expertise-card, .combine-banner, .project-card, .stepping-stones, .journey-cta, .contact-info, .contact-form-wrap, .social-section'
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


// ================================================
// BACK TO TOP BUTTON
// ================================================
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


// ================================================
// CONTACT FORM HANDLER
// ================================================
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email-input').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    // Use Fetch to send data to Formspree
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                submitBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #00e5a0, #00c4cc)';
                if (successMsg) successMsg.style.display = 'flex';
                form.reset();
                await sleep(3500);
            } else {
                throw new Error('Formspree error');
            }
        } catch (error) {
            alert("Oops! Something went wrong. Please try again.");
        }

        submitBtn.style.background = '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send-fill"></i> Send Message';
        if (successMsg) successMsg.style.display = 'none';

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeForm(el) {
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => el.style.animation = '', { once: true });
  }

  function shakeField(el) {
    if (!el) return;
    el.style.borderColor = 'rgba(255,60,60,0.6)';
    el.style.boxShadow = '0 0 15px rgba(255,60,60,0.2)';
    setTimeout(() => {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    }, 2000);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();


// ================================================
// SMOOTH SCROLL FOR ALL NAV/ANCHOR LINKS
// ================================================
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


// ================================================
// SKILL CARDS STAGGER ANIMATION
// ================================================
(function initSkillCards() {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.skill-card, .focus-item, .tool-badge');
        cards.forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 100 + i * 60);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.expertise-card').forEach(card => skillObserver.observe(card));
})();


// ================================================
// TYPING EFFECT (Hero Heading)
// ================================================
(function initTypingEffect() {
  const headingEl = document.querySelector('.hero-heading');
  if (!headingEl) return;

  // Already styled with HTML, just add entrance animation
  headingEl.style.opacity = '0';
  headingEl.style.transform = 'translateY(24px)';

  setTimeout(() => {
    headingEl.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    headingEl.style.opacity = '1';
    headingEl.style.transform = 'translateY(0)';
  }, 200);
})();


// ================================================
// TIMELINE ITEMS STAGGER ON SCROLL
// ================================================
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

  // Augment IntersectionObserver callback to handle in-view
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .timeline-item.in-view {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(styleSheet);
})();


// ================================================
// GLOWING CURSOR TRAIL (Subtle)
// ================================================
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


// ================================================
// NAV LOGO HOVER ANIMATION
// ================================================
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


// ================================================
// STAT COUNTER ANIMATION (Attendance mockup)
// ================================================
(function initCounters() {
  const statNums = document.querySelectorAll('.stat-num');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.textContent;
        const isPercent = raw.includes('%');
        const target = parseFloat(raw.replace('%', ''));

        if (isNaN(target)) return;

        let current = 0;
        const duration = 1200;
        const steps = 40;
        const increment = target / steps;
        const stepTime = duration / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = isPercent
            ? current.toFixed(1) + '%'
            : Math.round(current).toString();
        }, stepTime);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
})();


// ================================================
// ACTIVE SECTION INDICATOR DOT (Section transitions)
// ================================================
(function initSectionIndicator() {
  const sections = document.querySelectorAll('section[id]');

  // Add subtle gradient line at top of each section for visual flow
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

// ========== 3D INFINITE CAROUSEL LOGIC ==========
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cert-3d-card');
    const prevBtn = document.getElementById('cert-prev');
    const nextBtn = document.getElementById('cert-next');
    const wrapper = document.querySelector('.cert-3d-wrapper');
    
    if(cards.length === 0) return;

    let currentIndex = 0;

    function updateCarousel() {
        // Sabse pehle sabhi classes hata do
        cards.forEach(card => {
            card.classList.remove('active', 'prev', 'next');
        });

        // Nayi classes assign karo math module (%) ka use karke taaki infinite rahe
        const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
        const nextIndex = (currentIndex + 1) % cards.length;

        cards[currentIndex].classList.add('active');
        cards[prevIndex].classList.add('prev');
        cards[nextIndex].classList.add('next');
    }

    // Button Clicks
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    });

    // Side Cards par click karne par bhi ghoomega
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if(card.classList.contains('prev')) {
                prevBtn.click();
            } else if (card.classList.contains('next')) {
                nextBtn.click();
            }
        });
    });

    // Touch / Swipe Support for Mobile
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
        if (touchEndX < touchStartX - 50) nextBtn.click(); // Swipe Left -> Next
        if (touchEndX > touchStartX + 50) prevBtn.click(); // Swipe Right -> Prev
    }
  // Image Preview Modal Logic
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.getElementById("close-modal");
    const previewBtns = document.querySelectorAll('.preview-btn');

    // Open Modal
    previewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents carousel from sliding when clicking eye
            const imgSrc = btn.getAttribute('data-img');
            modalImg.src = imgSrc;
            modal.classList.add('show');
        });
    });

    // Close Modal on X click
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Close Modal on background click
    modal.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.classList.remove('show');
        }
    });
});