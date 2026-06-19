(function() {
  const root = document.querySelector('[data-search-page]');

  if (!root || !Array.isArray(window.MOVIE_SEARCH_INDEX) && typeof MOVIE_SEARCH_INDEX === 'undefined') {
    return;
  }

  const movies = typeof MOVIE_SEARCH_INDEX !== 'undefined' ? MOVIE_SEARCH_INDEX : window.MOVIE_SEARCH_INDEX;
  const input = root.querySelector('[data-search-input]');
  const category = root.querySelector('[data-category-filter]');
  const type = root.querySelector('[data-type-filter]');
  const summary = root.querySelector('[data-search-summary]');
  const results = root.querySelector('[data-search-results]');
  const params = new URLSearchParams(window.location.search);

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  function matchMovie(movie, keyword, cat, movieType) {
    const content = [
      movie.title,
      movie.year,
      movie.type,
      movie.region,
      movie.genre,
      movie.category,
      movie.oneLine,
      movie.tags.join(' ')
    ].join(' ').toLowerCase();

    return (!keyword || content.includes(keyword)) &&
      (!cat || movie.category === cat) &&
      (!movieType || movie.type === movieType);
  }

  function renderCard(movie) {
    const tags = movie.tags.slice(0, 3).map(function(tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card compact">',
      '  <a class="poster-link" href="' + escapeHtml(movie.path) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">',
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(movie.path) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="meta-line"><span>' + escapeHtml(movie.type || '') + '</span><span>' + escapeHtml(movie.region || '') + '</span></div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function update() {
    const keyword = input ? input.value.trim().toLowerCase() : '';
    const cat = category ? category.value : '';
    const movieType = type ? type.value : '';
    const matched = movies.filter(function(movie) {
      return matchMovie(movie, keyword, cat, movieType);
    });
    const limited = matched.slice(0, 120);

    if (summary) {
      summary.textContent = '共找到 ' + matched.length + ' 部影片，当前展示前 ' + limited.length + ' 部。';
    }

    if (results) {
      results.innerHTML = limited.map(renderCard).join('');
    }
  }

  [input, category, type].forEach(function(element) {
    if (element) {
      element.addEventListener('input', update);
      element.addEventListener('change', update);
    }
  });

  update();
})();
