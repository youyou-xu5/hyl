
(function () {
  const page = document.body.dataset.page || "home";
  const depth = document.body.dataset.depth || "";
  const app = document.getElementById("app");

  const routes = [
    ["home", depth + "index.html", "Home"],
    ["timeline", depth + "timeline/", "Timeline"],
    ["archive", depth + "archive/", "Archive"],
    ["our-story", depth + "our-story/", "Our Story"],
    ["letter", depth + "letter/", "Letter"],
  ];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function nl2br(value) {
    return escapeHtml(value).replace(/\n/g, "<br />");
  }

  function imageFor(config, imageId) {
    if (!imageId || !config.images || !config.images[imageId]) return "";
    return depth + config.images[imageId].assetPath;
  }

  function imageMarkup(config, imageId, className, label) {
    const src = imageFor(config, imageId);
    if (!src) {
      return '<div class="' + className + ' image-placeholder"><span>' + escapeHtml(label || "Add photo") + "</span></div>";
    }

    const image = config.images[imageId];
    return '<img class="' + className + '" src="' + escapeHtml(src) + '" alt="' + escapeHtml(image.alt || image.name || "Memory photo") + '" loading="lazy" />';
  }

  function shell(config, content) {
    document.body.dataset.theme = config.themeId || "rose-orbit";
    const nav = routes
      .map(function (route) {
        const active = route[0] === page ? " is-active" : "";
        return '<a class="nav-link' + active + '" href="' + route[1] + '">' + route[2] + "</a>";
      })
      .join("");

    app.innerHTML =
      '<header class="site-header">' +
      '<a class="brand" href="' + depth + 'index.html"><span class="brand-mark"></span><span>' + escapeHtml(config.meta.siteTitle) + "</span></a>" +
      '<nav class="site-nav">' + nav + "</nav>" +
      "</header>" +
      content +
      '<footer class="site-footer">' + escapeHtml(config.meta.footerText) + "</footer>";
  }

  function renderHome(config) {
    const timeline = config.sections.timeline.entries.slice(0, 3);
    const previewNodes = timeline
      .map(function (entry) {
        return '<li><span>' + escapeHtml(entry.year) + "</span>" + escapeHtml(entry.title) + "</li>";
      })
      .join("");

    const content =
      '<section class="hero">' +
      '<div class="hero-copy">' +
      '<p class="eyebrow">' + escapeHtml(config.meta.occasion) + "</p>" +
      '<h1>' + escapeHtml(config.meta.recipientName) + "</h1>" +
      '<p class="hero-intro">' + escapeHtml(config.meta.intro) + "</p>" +
      '<div class="hero-actions"><a href="' + depth + 'timeline/" class="button primary">Start the album</a><a href="' + depth + 'letter/" class="button ghost">Read letter</a></div>' +
      "</div>" +
      '<div class="memory-orbit">' +
      '<div class="orbit-core"><span>Memory</span><strong>' + escapeHtml(config.meta.recipientName) + "</strong></div>" +
      '<ul class="orbit-list">' + previewNodes + "</ul>" +
      "</div>" +
      "</section>" +
      '<section class="section-grid">' +
      card("Timeline", config.sections.timeline.description, "timeline/") +
      card("Archive", config.sections.archive.description, "archive/") +
      card("Our Story", config.sections.ourStory.description, "our-story/") +
      card("Letter", config.sections.letter.title, "letter/") +
      "</section>";

    shell(config, content);
  }

  function card(title, text, href) {
    return '<a class="feature-card" href="' + depth + href + '"><span>' + escapeHtml(title) + "</span><p>" + escapeHtml(text) + "</p></a>";
  }

  function renderTimeline(config) {
    const entries = config.sections.timeline.entries;
    const items = entries
      .map(function (entry, index) {
        return (
          '<article class="timeline-item">' +
          '<div class="timeline-year">' + escapeHtml(entry.year) + "</div>" +
          '<div class="timeline-media">' + imageMarkup(config, entry.imageId, "timeline-image", "Timeline photo " + (index + 1)) + "</div>" +
          '<div class="timeline-copy"><h2>' + escapeHtml(entry.title) + "</h2><p>" + nl2br(entry.text) + "</p></div>" +
          "</article>"
        );
      })
      .join("");

    shell(
      config,
      '<section class="page-title"><p class="eyebrow">Timeline</p><h1>' +
        escapeHtml(config.sections.timeline.title) +
        "</h1><p>" +
        escapeHtml(config.sections.timeline.description) +
        '</p></section><section class="timeline-track">' +
        items +
        "</section>",
    );
  }

  function renderArchive(config) {
    const years = config.sections.archive.years
      .map(function (year) {
        const tags = (year.tags || [])
          .filter(Boolean)
          .map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
          })
          .join("");

        const posts = (year.posts || [])
          .map(function (post) {
            const images = (post.imageIds || [])
              .map(function (imageId) {
                return imageMarkup(config, imageId, "archive-image", post.title);
              })
              .join("");

            return (
              '<article class="post">' +
              '<div class="post-meta">' + escapeHtml(post.date) + "</div>" +
              '<h3>' + escapeHtml(post.title) + "</h3>" +
              '<p>' + nl2br(post.text) + "</p>" +
              (images ? '<div class="archive-images">' + images + "</div>" : "") +
              "</article>"
            );
          })
          .join("");

        return (
          '<section class="archive-year">' +
          '<div class="year-heading"><span>' + escapeHtml(year.year) + "</span><h2>" + escapeHtml(year.title) + "</h2><p>" + escapeHtml(year.note) + "</p><div class=\"tag-row\">" + tags + "</div></div>" +
          '<div class="post-stack">' + posts + "</div>" +
          "</section>"
        );
      })
      .join("");

    shell(
      config,
      '<section class="page-title"><p class="eyebrow">Archive</p><h1>' +
        escapeHtml(config.sections.archive.title) +
        "</h1><p>" +
        escapeHtml(config.sections.archive.description) +
        "</p></section>" +
        years,
    );
  }

  function renderStory(config) {
    const chapters = config.sections.ourStory.chapters
      .map(function (chapter, chapterIndex) {
        const photos = (chapter.photos || [])
          .map(function (photo, photoIndex) {
            return (
              '<figure class="story-photo">' +
              imageMarkup(config, photo.imageId, "story-image", "Story photo " + (photoIndex + 1)) +
              '<figcaption><strong>' + escapeHtml(photo.caption) + "</strong><span>" + escapeHtml(photo.reflection) + "</span></figcaption>" +
              "</figure>"
            );
          })
          .join("");

        return (
          '<article class="story-chapter">' +
          '<div class="chapter-number">0' + (chapterIndex + 1) + "</div>" +
          '<div><h2>' + escapeHtml(chapter.title) + "</h2><p>" + escapeHtml(chapter.summary) + "</p></div>" +
          '<div class="story-gallery">' + photos + "</div>" +
          "</article>"
        );
      })
      .join("");

    shell(
      config,
      '<section class="page-title"><p class="eyebrow">Our Story</p><h1>' +
        escapeHtml(config.sections.ourStory.title) +
        "</h1><p>" +
        escapeHtml(config.sections.ourStory.description) +
        "</p></section>" +
        chapters,
    );
  }

  function renderLetter(config) {
    const letter = config.sections.letter;
    const key = "memory-album-letter-" + config.meta.siteTitle;
    const hasCode = Boolean(letter.accessCode);
    const unlocked = !hasCode || window.localStorage.getItem(key) === "yes";

    if (!unlocked) {
      shell(
        config,
        '<section class="letter-lock"><p class="eyebrow">Private note</p><h1>' +
          escapeHtml(letter.title) +
          '</h1><p>This page has a light front-end access curtain. It is not encrypted.</p><form id="letter-form"><input name="code" autocomplete="off" placeholder="Access code" /><button class="button primary" type="submit">Open letter</button></form><p id="letter-error" class="error-text" hidden>Wrong code. Please try again.</p></section>',
      );

      var form = document.getElementById("letter-form");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.elements.code;
        if (input.value === letter.accessCode) {
          window.localStorage.setItem(key, "yes");
          renderLetter(config);
        } else {
          document.getElementById("letter-error").hidden = false;
        }
      });
      return;
    }

    const paragraphs = (letter.paragraphs || [])
      .filter(Boolean)
      .map(function (paragraph) {
        return "<p>" + nl2br(paragraph) + "</p>";
      })
      .join("");

    shell(
      config,
      '<article class="letter-page"><p class="eyebrow">Letter</p><h1>' +
        escapeHtml(letter.title) +
        "</h1><h2>" +
        escapeHtml(letter.greeting) +
        "</h2><div class=\"letter-body\">" +
        paragraphs +
        '</div><p class="signature">' +
        escapeHtml(letter.signature) +
        "</p></article>",
    );
  }

  fetch(depth + "content.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Cannot load content.json");
      return response.json();
    })
    .then(function (config) {
      if (page === "timeline") renderTimeline(config);
      else if (page === "archive") renderArchive(config);
      else if (page === "our-story") renderStory(config);
      else if (page === "letter") renderLetter(config);
      else renderHome(config);
    })
    .catch(function () {
      app.innerHTML =
        '<section class="loading-screen"><h1>Could not load this album</h1><p>Please open it through a static web server instead of a direct file URL.</p></section>';
    });
})();
