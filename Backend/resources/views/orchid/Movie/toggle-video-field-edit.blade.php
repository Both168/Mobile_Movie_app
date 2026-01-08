<script>
(function() {
    function setupVideoFieldToggle() {
        const typeField = document.querySelector('#movie-type-field-edit');
        const videoField = document.querySelector('#movie-video-field-edit');
        
        if (!typeField || !videoField) return;

        const videoFieldContainer = videoField.closest('.form-group') || 
                                    videoField.closest('.row') ||
                                    videoField.parentElement;

        function toggleVideoField() {
            const selectedType = typeField.value;
            
            if (selectedType === '2') {
                // Hide video field for Series
                if (videoFieldContainer) {
                    videoFieldContainer.style.display = 'none';
                }
                videoField.removeAttribute('required');
            } else {
                // Show video field for Films
                if (videoFieldContainer) {
                    videoFieldContainer.style.display = '';
                }
                videoField.setAttribute('required', 'required');
            }
        }

        // Initial check
        toggleVideoField();

        // Listen for changes
        typeField.addEventListener('change', toggleVideoField);
        typeField.addEventListener('input', toggleVideoField);
    }

    // Setup when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupVideoFieldToggle);
    } else {
        setupVideoFieldToggle();
    }

    // Also setup when modal content is loaded (for deferred loading)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Check if the modal or its content was added
                    if (node.querySelector && (node.querySelector('#movie-type-field-edit') || node.id === 'editMovieModal')) {
                        setTimeout(setupVideoFieldToggle, 100);
                    }
                }
            });
        });
    });

    // Observe the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
</script>

