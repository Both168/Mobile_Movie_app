<script>
(function() {
    function setupVideoFieldToggle() {
        const typeField = document.querySelector('#movie-type-field');
        const videoField = document.querySelector('#movie-video-field');
        
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
})();
</script>

