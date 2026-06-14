// Elon Healthcare — site interactions

(function () {
  const header = document.getElementById("siteHeader");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.getElementById("primaryNav");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // sticky header shadow on scroll
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // mobile nav
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    primaryNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  // reveal-on-scroll
  const revealTargets = document.querySelectorAll(
    ".section-head, .service-card, .value-item, .why-card, .why-list li, .step, .testimonial, .region-card, .hero-copy, .hero-art, .about-media, .about-copy, .contact-info, .contact-form, .trust-item"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${
              (entry.target.dataset.delayIndex || idx % 4) * 60
            }ms`;
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in-view"));
  }

  // animated counters
  const counters = document.querySelectorAll(".trust-num[data-count]");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "+";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(eased * target);
      el.textContent = value + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => animateCount(c));
  }

  // contact form — posts to the shared Firebase email function
  const FORM_ENDPOINT = "https://sendcontactmessage-35666ugduq-uc.a.run.app";
  const form = document.getElementById("contactForm");
  if (form) {
    const button = form.querySelector("button[type=submit]");
    const success = form.querySelector(".form-success");
    const error = form.querySelector(".form-error");
    const emailField = form.querySelector("input[name=email]");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // validate required fields + email format
      let valid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        if (!field.value.trim()) {
          field.style.borderColor = "#ef4444";
          valid = false;
        } else {
          field.style.borderColor = "";
        }
      });
      if (emailField && emailField.value.trim() && !emailPattern.test(emailField.value)) {
        emailField.style.borderColor = "#ef4444";
        valid = false;
      }
      if (!valid) return;

      if (error) error.hidden = true;
      const originalBtn = button.innerHTML;
      button.disabled = true;
      button.style.opacity = "0.75";
      button.textContent = "Sending…";

      const payload = {
        type: "contact",
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        message: form.message.value.trim(),
      };

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Network response was not ok");

        form
          .querySelectorAll(".field, .form-note, button[type=submit]")
          .forEach((el) => (el.style.display = "none"));
        if (success) {
          success.hidden = false;
          success.style.display = "flex";
        }
        form.reset();
      } catch (err) {
        console.error("Form submission failed:", err);
        button.disabled = false;
        button.style.opacity = "";
        button.innerHTML = originalBtn;
        if (error) {
          error.hidden = false;
          error.style.display = "flex";
        }
      }
    });
  }
})();
