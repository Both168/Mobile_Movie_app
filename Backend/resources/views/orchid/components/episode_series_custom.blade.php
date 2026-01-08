<div class="mb-3">
    <label class="form-label">
        Series <span class="text-danger">*</span>
    </label>
    <input 
        type="text" 
        class="form-control episode-series-search" 
        placeholder="Search series..." 
        autocomplete="off"
    />
    <input type="hidden" name="episode[movie_id]" class="episode-series-id" />
    <div class="d-flex gap-2 mt-2">
        <button type="button" class="btn btn-primary btn-sm episode-search-seasons-btn" disabled>Search Seasons</button>
    </div>
    <div class="series-results mt-2" style="display: none; position: relative;">
        <div class="list-group" style="position: absolute; z-index: 1000; width: 100%; max-height: 200px; overflow-y: auto; background: white; border: 1px solid #ddd; border-radius: 4px;"></div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.querySelector('.episode-series-search');
    var hiddenInput = document.querySelector('.episode-series-id');
    var resultsDiv = document.querySelector('.series-results');
    var resultsList = resultsDiv.querySelector('.list-group');
    var searchBtn = document.querySelector('.episode-search-seasons-btn');
    var timeout = null;
    var selectedSeries = null;

    if (!searchInput || !hiddenInput || !resultsDiv) return;

    searchInput.addEventListener('input', function() {
        var query = this.value.trim();
        
        clearTimeout(timeout);
        
        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            hiddenInput.value = '';
            selectedSeries = null;
            return;
        }

        timeout = setTimeout(function() {
            fetch('{{ route("episodes.search-series") }}?q=' + encodeURIComponent(query), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.length === 0) {
                    resultsList.innerHTML = '<div class="list-group-item">No series found</div>';
                    resultsDiv.style.display = 'block';
                    return;
                }

                resultsList.innerHTML = '';
                data.forEach(function(series) {
                    var item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'list-group-item list-group-item-action';
                    item.textContent = series.title;
                    item.addEventListener('click', function() {
                        searchInput.value = series.title;
                        hiddenInput.value = series.id;
                        selectedSeries = series;
                        resultsDiv.style.display = 'none';
                        if (searchBtn) {
                            searchBtn.disabled = false;
                        }
                    });
                    resultsList.appendChild(item);
                });
                resultsDiv.style.display = 'block';
            })
            .catch(function(err) {
                console.error('Search error:', err);
            });
        }, 300);
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            var movieId = hiddenInput.value;
            if (!movieId) {
                alert('Please select a series first');
                return;
            }

            searchBtn.disabled = true;
            searchBtn.textContent = 'Loading...';

            fetch('{{ route("episodes.get-seasons") }}?movie_id=' + movieId, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var seasonSelect = document.querySelector('.episode-season-select');
                if (seasonSelect) {
                    seasonSelect.innerHTML = '<option value="">Select Season</option>';
                    if (data.length > 0) {
                        data.forEach(function(season) {
                            var option = document.createElement('option');
                            option.value = season.id;
                            option.textContent = season.title;
                            seasonSelect.appendChild(option);
                        });
                        seasonSelect.disabled = false;
                    } else {
                        seasonSelect.innerHTML = '<option value="">No seasons found</option>';
                    }
                }
                searchBtn.disabled = false;
                searchBtn.textContent = 'Search Seasons';
            })
            .catch(function(err) {
                console.error('Error loading seasons:', err);
                searchBtn.disabled = false;
                searchBtn.textContent = 'Search Seasons';
                alert('Error loading seasons. Please try again.');
            });
        });
    }
});
</script>
