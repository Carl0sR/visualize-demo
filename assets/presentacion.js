(function () {
  "use strict";

  var deck = document.getElementById("deck");
  var status = document.getElementById("deck-status");
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var fsBtn = document.getElementById("fullscreen");
  var data = window.JUSTICIA_DATA;
  var total = slides.length;
  var index = 0;

  var nf = new Intl.NumberFormat("es-ES", {
    useGrouping: "always",
    maximumFractionDigits: 0
  });
  var nf1 = new Intl.NumberFormat("es-ES", {
    useGrouping: "always",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  function fmt(value) {
    return nf.format(Number(value));
  }

  function fmtRate(value) {
    return nf1.format(Number(value));
  }

  function fmtChange(value) {
    var number = Number(value);
    return (number > 0 ? "+" : "") + nf1.format(number) + " %";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function fatal(message) {
    console.error(message);
    deck.classList.add("is-error");
    deck.innerHTML =
      '<div class="deck-error" role="alert">' +
        "<h1>No se pudo cargar la presentación</h1>" +
        "<p>" + escapeHtml(message) + "</p>" +
        "<p>Comprueba que <code>assets/data.js</code> está junto a este archivo.</p>" +
      "</div>";
  }

  function slideFromHash() {
    var match = window.location.hash.match(/^#(\d+)$/);
    if (!match) return 0;
    return Math.max(0, Math.min(total - 1, parseInt(match[1], 10) - 1));
  }

  function show(nextIndex, options) {
    options = options || {};
    index = Math.max(0, Math.min(total - 1, nextIndex));

    slides.forEach(function (slide, position) {
      var active = position === index;
      slide.hidden = !active;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;

    var label = slides[index].getAttribute("aria-label") || "";
    status.textContent = "Diapositiva " + (index + 1) + " de " + total + ": " + label;
    document.title =
      String(index + 1).padStart(2, "0") + " / " +
      String(total).padStart(2, "0") + " · Justicia juvenil 2025";

    if (options.updateHash !== false) {
      var hash = "#" + (index + 1);
      if (window.location.hash !== hash) {
        try {
          window.history.pushState({ slide: index + 1 }, "", hash);
        } catch (error) {
          window.location.hash = hash;
        }
      }
    }
  }

  function go(delta) {
    show(index + delta);
  }

  function setScale() {
    var scale = Math.min(
      window.innerWidth / 1600,
      window.innerHeight / 900
    );
    document.documentElement.style.setProperty(
      "--scale",
      String(Math.max(0.1, scale))
    );
  }

  function toggleFullscreen() {
    if (!document.fullscreenEnabled) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
      return;
    }

    document.documentElement.requestFullscreen().catch(function () {
      fsBtn.textContent = "Pantalla completa";
      fsBtn.setAttribute("aria-pressed", "false");
    });
  }

  function syncFullscreenButton() {
    var active = Boolean(document.fullscreenElement);
    fsBtn.setAttribute("aria-pressed", active ? "true" : "false");
    fsBtn.setAttribute(
      "aria-label",
      active ? "Salir de pantalla completa" : "Entrar en pantalla completa"
    );
    fsBtn.textContent = active ? "Salir" : "Pantalla completa";
    setScale();
  }

  function renderBars(containerId, rows, valueKey, formatValue, unit) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var maximum = Math.max.apply(
      null,
      rows.map(function (row) { return Number(row[valueKey]); })
    );

    container.innerHTML = rows.map(function (row) {
      var value = formatValue(row[valueKey]);
      var width = maximum > 0 ? (Number(row[valueKey]) / maximum) * 100 : 0;
      var key = row.id === 13 || row.id === 7;
      var aria = row.short + ": " + value + " " + unit;

      return (
        '<div class="bar-row' + (key ? " is-key" : "") + '" role="img" aria-label="' +
          escapeHtml(aria) + '">' +
          '<span class="bar-label">' + escapeHtml(row.short) + "</span>" +
          '<span class="bar-track" aria-hidden="true">' +
            '<span class="bar-fill" style="--w:' + width.toFixed(2) + '%"></span>' +
          "</span>" +
          '<span class="bar-value">' + value + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function populateCover(totalInfractions) {
    document.querySelectorAll("[data-total]").forEach(function (element) {
      element.textContent = fmt(totalInfractions);
    });
  }

  function populateFiscalia() {
    if (!data.fiscalia || !Array.isArray(data.fiscalia.activity)) {
      fatal("Falta el bloque fiscalia en los datos.");
      return false;
    }

    var required = ["diligencias", "reforma", "ejecucion"];
    var activity = new Map();
    data.fiscalia.activity.forEach(function (item) {
      activity.set(item.id, item);
    });

    var missing = required.filter(function (id) {
      return !activity.has(id);
    });

    if (missing.length) {
      fatal("Faltan cifras de Fiscalía: " + missing.join(", ") + ".");
      return false;
    }

    var grid = document.getElementById("fiscalia-metrics");
    if (!grid) return false;

    grid.innerHTML = required.map(function (id) {
      var item = activity.get(id);
      return (
        '<article class="metric-card" data-fiscalia="' + escapeHtml(id) + '">' +
          '<p class="metric-label">' + escapeHtml(item.label) + "</p>" +
          '<strong class="metric">' + fmt(item.value) + "</strong>" +
          '<p class="metric-unit">' + escapeHtml(item.unit) + "</p>" +
          '<p class="metric-change">' + fmtChange(item.changePct) +
            " respecto a " + (Number(data.fiscalia.year) - 1) + "</p>" +
        "</article>"
      );
    }).join("");

    return true;
  }

  function populateTerritories() {
    if (!Array.isArray(data.territories)) {
      fatal("Faltan los datos territoriales.");
      return false;
    }

    var names = {
      1: "Andalucía",
      7: "Castilla y León",
      9: "Cataluña",
      13: "Madrid"
    };
    var byId = new Map();
    data.territories.forEach(function (territory) {
      byId.set(territory.id, territory);
    });

    var selected = [1, 9, 13, 7].map(function (id) {
      return byId.get(id);
    }).filter(Boolean);

    if (selected.length !== 4) {
      fatal("Faltan territorios para la comparación.");
      return false;
    }

    var rows = selected.map(function (territory) {
      return Object.assign({}, territory, { short: names[territory.id] });
    });

    renderBars(
      "bars-count",
      rows.slice().sort(function (a, b) { return b.total - a.total; }),
      "total",
      fmt,
      "infracciones"
    );

    renderBars(
      "bars-rate",
      rows.slice().sort(function (a, b) { return b.rate - a.rate; }),
      "rate",
      fmtRate,
      "por 1.000 habitantes de 14 a 17 años"
    );

    return true;
  }

  function init() {
    slides.forEach(function (slide, position) {
      var label = slide.querySelector('.slide-num');
      if (label) label.textContent = String(position + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    });
    if (!data) {
      fatal("No se encontró JUSTICIA_DATA.");
      return;
    }

    var totalCategory = Array.isArray(data.categories)
      ? data.categories.find(function (category) { return category.id === "total"; })
      : null;

    if (!totalCategory || !Number.isFinite(Number(totalCategory.total))) {
      fatal("Falta el total de infracciones.");
      return;
    }

    var totalInfractions = Number(totalCategory.total);

    if (!populateFiscalia()) return;
    if (!populateTerritories()) return;

    populateCover(totalInfractions);

    if (!document.fullscreenEnabled) {
      fsBtn.disabled = true;
      fsBtn.textContent = "Sin pantalla completa";
      fsBtn.setAttribute("aria-label", "Pantalla completa no disponible");
    }

    prevBtn.addEventListener("click", function () { go(-1); });
    nextBtn.addEventListener("click", function () { go(1); });
    fsBtn.addEventListener("click", toggleFullscreen);

    document.addEventListener("fullscreenchange", function () {
      syncFullscreenButton();
      window.setTimeout(setScale, 60);
    });

    window.addEventListener("resize", setScale);
    window.addEventListener("orientationchange", setScale);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setScale);
    }

    window.addEventListener("popstate", function () {
      show(slideFromHash(), { updateHash: false });
    });

    window.addEventListener("hashchange", function () {
      show(slideFromHash(), { updateHash: false });
    });

    document.addEventListener("keydown", function (event) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      var target = event.target;
      if (target && (
        target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      )) {
        return;
      }

      if (
        (event.key === " " || event.key === "Enter") &&
        target &&
        /^(BUTTON|A)$/.test(target.tagName)
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
        case "Spacebar":
          event.preventDefault();
          go(1);
          break;
        case "ArrowLeft":
        case "PageUp":
          event.preventDefault();
          go(-1);
          break;
        case "Home":
          event.preventDefault();
          show(0);
          break;
        case "End":
          event.preventDefault();
          show(total - 1);
          break;
        case "f":
        case "F":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(function () {});
          }
          break;
      }
    });

    var initial = slideFromHash();
    show(initial, { updateHash: false });

    if (!/^#\d+$/.test(window.location.hash)) {
      try {
        window.history.replaceState({ slide: initial + 1 }, "", "#" + (initial + 1));
      } catch (error) {
        /* file:// puede bloquear replaceState; la navegación sigue funcionando. */
      }
    }

    setScale();
    syncFullscreenButton();

    window.__DECK__ = {
      show: show,
      total: total,
      slides: slides,
      data: data,
      get index() { return index; }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
