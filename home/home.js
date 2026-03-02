document.addEventListener("DOMContentLoaded", () => {
  const pageSkeleton = document.getElementById("page-skeleton");

  const hideSkeleton = () => {
    if (!pageSkeleton || !pageSkeleton.parentElement) {
      return;
    }
    pageSkeleton.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      if (pageSkeleton.parentElement) {
        pageSkeleton.remove();
      }
    }, 300);
  };

  window.addEventListener("load", () => {
    setTimeout(hideSkeleton, 320);
  });
  setTimeout(hideSkeleton, 2000);

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("home-mobile-menu");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const THEME_KEY = "micasa-theme";

  const applyStoredTheme = () => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (storedTheme === "light") {
        document.documentElement.classList.remove("dark");
      }
    } catch (_) {
    }
  };

  const setThemeIcon = () => {
    if (!themeIcon) {
      return;
    }
    themeIcon.textContent = document.documentElement.classList.contains("dark") ? "light_mode" : "dark_mode";
  };

  applyStoredTheme();
  setThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      try {
        localStorage.setItem(THEME_KEY, document.documentElement.classList.contains("dark") ? "dark" : "light");
      } catch (_) {
      }
      setThemeIcon();
    });
  }

  if (menuToggle && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.add("hidden");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden");
      menuToggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (mobileMenu.classList.contains("hidden")) {
        return;
      }
      if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }
});
