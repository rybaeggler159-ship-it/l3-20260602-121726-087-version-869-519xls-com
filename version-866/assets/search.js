document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.search-page-form');
  var input = document.getElementById('site-search-input');
  var results = document.getElementById('search-results');
  var summary = document.getElementById('search-summary');
  var movies = window.SEARCH_MOVIES || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(movie) {
    var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="cover-frame" data-title="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'missing-image\'); this.parentElement.classList.add(\'cover-missing\');">',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-tags">' + tagHtml + '</div>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta-line">',
      '      <span>' + escapeHtml(movie.year || '更新') + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function runSearch(query) {
    var keyword = String(query || '').trim().toLowerCase();
    var matched = [];

    if (keyword) {
      matched = movies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 80);
    }

    if (!keyword) {
      matched = movies.slice(0, 24);
      summary.textContent = '展示部分推荐影片，可输入关键词继续筛选。';
    } else if (matched.length) {
      summary.textContent = '找到与“' + keyword + '”相关的影片。';
    } else {
      summary.textContent = '没有找到匹配内容，可以尝试更短的关键词。';
    }

    results.innerHTML = matched.map(card).join('');
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  if (input) {
    input.value = query;
  }
  runSearch(query);

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextQuery = input ? input.value : '';
      var url = new URL(window.location.href);
      if (nextQuery.trim()) {
        url.searchParams.set('q', nextQuery.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      runSearch(nextQuery);
    });
  }
});
