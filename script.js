(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.getElementById("header");

  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 30);
  }

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    document.body.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Открыть меню");
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  var parallaxEls = document.querySelectorAll("[data-parallax]");

  if (!reduceMotion && parallaxEls.length) {
    var ticking = false;

    function updateParallax() {
      var vh = window.innerHeight;

      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -40 || rect.top > vh + 40) return;

        var img = el.querySelector("img");
        if (!img) return;

        var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        var y = progress * speed * 100;
        img.style.transform = "scale(1.16) translateY(" + y.toFixed(2) + "px)";
      });

      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateParallax();
  }

  var LEAD_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxLyU7UbGPSocF6ddcBYkdqFnju5IvKc7c5fVpyYgDqmH17M9cg9fVEixTPgWm6apWN1w/exec";

  var form = document.getElementById("leadForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]');
      var phone = form.querySelector('[name="phone"]');
      var submitBtn = form.querySelector('[type="submit"]');

      if (!name.value.trim() || !phone.value.trim()) {
        [name, phone].forEach(function (field) {
          field.style.borderBottomColor = "#A8664D";
        });
        return;
      }

      [name, phone].forEach(function (field) {
        field.style.borderBottomColor = "";
      });

      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Отправляем...";

      function showSuccess() {
        var success = document.createElement("div");
        success.className = "form-success";
        success.innerHTML =
          "<strong>Спасибо, заявка принята.</strong>" +
          "<p>Я свяжусь с вами в течение 2 часов в рабочее время — с 10:00 до 19:00 по МСК. А до этого уже начну собирать предварительную подборку под ваш запрос.</p>";
        form.replaceWith(success);
      }

      function showError() {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        var note = form.querySelector(".form-error");
        if (!note) {
          note = document.createElement("p");
          note.className = "form-error";
          form.querySelector(".form-note").after(note);
        }
        note.textContent = "Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 900 000-00-00";
      }

      if (!LEAD_FORM_ENDPOINT) {
        showSuccess();
        return;
      }

      fetch(LEAD_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          name: name.value.trim(),
          phone: phone.value.trim(),
          source: "Лендинг «Свой дом»"
        })
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data && data.result === "success") {
            showSuccess();
          } else {
            showError();
          }
        })
        .catch(showError);
    });
  }

  document.querySelectorAll(".year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
