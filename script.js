 // Utility: qs / qsa
        const qs = (sel, ctx = document) => ctx.querySelector(sel);
        const qsa = (sel, ctx = document) =>
            Array.from(ctx.querySelectorAll(sel));

        // Year
        qs("#year").textContent = new Date().getFullYear();

        // Mobile menu toggle
        const menuBtn = qs("#menuToggle");
        const mobileNav = qs("#mobileNav");
        let mobileOpen = false;

        function setMobileMenu(open) {
            mobileOpen = !!open;
            menuBtn.setAttribute("aria-expanded", String(mobileOpen));
            if (mobileOpen) {
                mobileNav.classList.remove(
                    "pointer-events-none",
                    "opacity-0",
                    "translate-y-[-8px]"
                );
            } else {
                mobileNav.classList.add(
                    "pointer-events-none",
                    "opacity-0",
                    "translate-y-[-8px]"
                );
            }
        }

        menuBtn.addEventListener("click", () => setMobileMenu(!mobileOpen));
        // Close menu on link click (mobile)
        qsa("#mobileNav a[data-navlink]").forEach((a) => {
            a.addEventListener("click", () => setMobileMenu(false));
        });

        // Smooth scroll is handled by CSS scroll-smooth; ensure offset scroll for header if needed:
        function offsetScrollIntoView(id) {
            const el = qs(id);
            if (!el) return;
            const y =
                el.getBoundingClientRect().top +
                window.scrollY -
                parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue(
                        "--header-h"
                    )
                );
            window.scrollTo({ top: y, behavior: "smooth" });
        }
        qsa("a[data-navlink]").forEach((a) => {
            a.addEventListener("click", (e) => {
                const href = a.getAttribute("href");
                if (href && href.startsWith("#")) {
                    e.preventDefault();
                    offsetScrollIntoView(href);
                }
            });
        });

        // Theme toggle with localStorage + prefers-color-scheme
        const themeBtn = qs("#themeToggle");
        const root = document.documentElement;

        // Icons inside the theme button (fallback if Tailwind dark: classes aren't applied)
        const sunIcon = themeBtn ? qs("#themeToggle .ri-sun-line") : null;
        const moonIcon = themeBtn ? qs("#themeToggle .ri-moon-line") : null;

        function updateIcons(dark) {
            if (sunIcon) {
                if (dark) {
                    sunIcon.classList.remove("hidden");
                    sunIcon.classList.add("inline-block");
                } else {
                    sunIcon.classList.add("hidden");
                    sunIcon.classList.remove("inline-block");
                }
            }
            if (moonIcon) {
                if (dark) {
                    moonIcon.classList.add("hidden");
                    moonIcon.classList.remove("inline-block");
                } else {
                    moonIcon.classList.remove("hidden");
                    moonIcon.classList.add("inline-block");
                }
            }
        }

        function applyTheme(theme) {
            const dark =
                theme === "dark" ||
                (theme === "system" &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches);
            root.classList.toggle("dark", dark);
            if (themeBtn) themeBtn.setAttribute("aria-pressed", String(dark));
            updateIcons(dark);
            // Fallback: set inline body background and text color from CSS vars so changes are visible
            try {
                const bgVar = dark ? "--color-bg-dark" : "--color-bg";
                const fgVar = dark ? "--color-fg-dark" : "--color-fg";
                const bg = getComputedStyle(root).getPropertyValue(bgVar) || (dark ? "#0b1220" : "#ffffff");
                const fg = getComputedStyle(root).getPropertyValue(fgVar) || (dark ? "#e6eef8" : "#0b1220");
                document.body.style.backgroundColor = bg.trim();
                document.body.style.color = fg.trim();
            } catch (e) {
                // no-op
            }
        }

        function getStoredTheme() {
            try {
                return localStorage.getItem("theme") || "system";
            } catch (e) {
                return "system";
            }
        }

        function setStoredTheme(theme) {
            try {
                localStorage.setItem("theme", theme);
            } catch (e) {
                // ignore
            }
            applyTheme(theme);
        }

        // Initialize theme (guard in case button/DOM is missing)
        applyTheme(getStoredTheme());
        // Update when system theme changes
        if (window.matchMedia) {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            if (mq.addEventListener) mq.addEventListener("change", () => applyTheme(getStoredTheme()));
            else if (mq.addListener) mq.addListener(() => applyTheme(getStoredTheme()));
        }

        // Toggle on click: light <-> dark (stays off system)
        if (themeBtn) {
            themeBtn.addEventListener("click", () => {
                const isDark = root.classList.contains("dark");
                setStoredTheme(isDark ? "light" : "dark");
            });
        }

        // Scroll spy: highlight nav link matching current section
        const sections = [
            "#home",
            "#about",
            "#skills",
            "#projects",
            "#contact",
        ].map((id) => qs(id));
        const navLinks = qsa("a[data-navlink]");
        const linkForId = (id) =>
            navLinks.find((a) => a.getAttribute("href") === "#" + id);

        const spyObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinks.forEach((a) =>
                            a.classList.remove(
                                "bg-slate-100/80",
                                "dark:bg-slate-900/60",
                                "text-slate-900",
                                "dark:text-slate-50"
                            )
                        );
                        const active = linkForId(id);
                        if (active) {
                            active.classList.add(
                                "bg-slate-100/80",
                                "dark:bg-slate-900/60",
                                "text-slate-900",
                                "dark:text-slate-50"
                            );
                        }
                    }
                });
            },
            { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
        );

        sections.forEach((sec) => sec && spyObserver.observe(sec));

        // Reveal on scroll (intersection)
        const revealEls = qsa(".reveal");
        const revealObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
        );

        revealEls.forEach((el) => revealObserver.observe(el));

        // Animated counters
        const counters = qsa("[data-counter]");
        const counterObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const target = Number(el.getAttribute("data-target") || "0");
                    let current = 0;
                    const step = Math.max(1, Math.floor(target / 60));
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = current + (target < 10 ? "+" : "");
                    }, 20);
                    obs.unobserve(el);
                });
            },
            { threshold: 0.6 }
        );

        counters.forEach((c) => counterObserver.observe(c));

        // Back to top
        qs("#backToTop").addEventListener("click", () =>
            window.scrollTo({ top: 0, behavior: "smooth" })
        );

        // Contact fake submit
        function handleContactSubmit(form) {
            const btn = form.querySelector('button[type="submit"]');
            const status = qs("#contactStatus");
            btn.disabled = true;
            btn.classList.add("opacity-70", "cursor-not-allowed");
            status.textContent = "Sending...";
            setTimeout(() => {
                status.textContent = "Thanks! Your message has been received.";
                btn.disabled = false;
                btn.classList.remove("opacity-70", "cursor-not-allowed");
                form.reset();
            }, 1200);
        }
        window.handleContactSubmit = handleContactSubmit;

        // Hide/Show header on scroll for extra polish
        let lastY = window.scrollY;
        const header = document.querySelector("header");
        let pinned = true;
        function pinHeader(pin) {
            if (pinned === pin) return;
            pinned = pin;
            header.style.transform = pinned ? "translateY(0)" : "translateY(-100%)";
            header.style.transition = "transform .35s ease";
        }
        window.addEventListener(
            "scroll",
            () => {
                const y = window.scrollY;
                if (y > lastY && y > 80) pinHeader(false);
                else pinHeader(true);
                lastY = y;
            },
            { passive: true }
        );

        function handleContactSubmit(form) {
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const subject = form.subject.value.trim();
            const message = form.message.value.trim();

            const phoneNumber = "919658780033"; // ← yahan apna WhatsApp number daalo (with country code, no +)

            // WhatsApp message text format
            const whatsappMessage = `
New Contact Form Submission 👤

Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}
    `.trim();

            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

            // Redirect to WhatsApp
            window.open(whatsappURL, "_blank");

            // Optional: reset form
            form.reset();
        }