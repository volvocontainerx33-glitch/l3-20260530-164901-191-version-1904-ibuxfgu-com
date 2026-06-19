(function () {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const resultBox = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');

  function card(movie) {
    const tags = [movie.type, movie.region, movie.year].filter(Boolean).join(' · ');
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '<span class="poster-wrap">',
      '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
      '<span class="poster-gradient"></span>',
      '<span class="play-badge">▶</span>',
      '<span class="duration-badge">★ ' + movie.rating + '</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + movie.title + '</strong>',
      '<span class="card-desc">' + movie.description + '</span>',
      '<span class="meta-row"><span>' + tags + '</span><span class="rating">' + movie.genre + '</span></span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function render() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('q') || '';
    if (fromUrl && !input.value) {
      input.value = fromUrl;
    }
    const query = input.value.trim().toLowerCase();
    const source = MOVIE_INDEX;
    const matched = query
      ? source.filter(function (movie) {
          const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.description, movie.tags.join(' ')].join(' ').toLowerCase();
          return text.includes(query);
        })
      : source.slice(0, 36);
    resultBox.innerHTML = matched.slice(0, 120).map(card).join('');
    status.textContent = query ? '搜索结果：' + matched.length + ' 部影片' : '推荐影片';
  }

  if (form && input && resultBox) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const params = new URLSearchParams(window.location.search);
      params.set('q', input.value.trim());
      history.replaceState(null, '', window.location.pathname + '?' + params.toString());
      render();
    });
    input.addEventListener('input', render);
    render();
  }
})();
