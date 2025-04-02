/**
 * Virtual Try-On functionality for Luxe Hair Collection
 * Handles image upload and processing using Nebius AI
 */

document.addEventListener('DOMContentLoaded', function() {
    const tryOnContainer = document.getElementById('virtual-try-on');
    const fileInput = document.getElementById('user-image');
    const productSelect = document.getElementById('hair-style-select');
    const previewContainer = document.getElementById('image-preview-container');
    const userImagePreview = document.getElementById('user-image-preview');
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const tryOnButton = document.getElementById('try-on-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    
    // If elements not found, don't initialize the virtual try-on
    if (!tryOnContainer || !fileInput || !tryOnButton) {
        console.error('Virtual Try-On elements not found on page');
        return;
    }
    
    // Handle file input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                showError('Please select a valid image file (JPEG or PNG)');
                fileInput.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('Image size should be less than 5MB');
                fileInput.value = '';
                return;
            }
            
            // Show image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                userImagePreview.src = e.target.result;
                previewContainer.classList.remove('d-none');
                
                // Hide any previous results or errors
                resultContainer.classList.add('d-none');
                hideError();
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Handle try-on button click
    if (tryOnButton) {
        tryOnButton.addEventListener('click', function() {
            // Validate inputs
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                showError('Please select an image first');
                return;
            }
            
            if (!productSelect || !productSelect.value) {
                showError('Please select a hairstyle');
                return;
            }
            
            // Get base64 image data
            const imageData = userImagePreview.src;
            // Remove the data:image/xyz;base64, prefix
            const base64Data = imageData.split(',')[1];
            
            // Show loading indicator
            showLoading();
            
            // Send to server
            fetch('/virtual-try-on', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Data,
                    hairStyleId: productSelect.value
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server returned an error');
                }
                return response.json();
            })
            .then(data => {
                hideLoading();
                
                if (data.success && data.image) {
                    // Show result
                    resultImage.src = `data:image/jpeg;base64,${data.image}`;
                    resultContainer.classList.remove('d-none');
                    
                    // Scroll to result
                    resultContainer.scrollIntoView({ behavior: 'smooth' });
                } else {
                    showError(data.message || 'An error occurred while processing your image');
                }
            })
            .catch(error => {
                console.error('Error in virtual try-on:', error);
                hideLoading();
                showError('Failed to process image. Please try again later.');
            });
        });
    }
    
    // Helper function to show loading state
    function showLoading() {
        if (loadingIndicator) {
            loadingIndicator.classList.remove('d-none');
        }
        if (tryOnButton) {
            tryOnButton.disabled = true;
            tryOnButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        }
    }
    
    // Helper function to hide loading state
    function hideLoading() {
        if (loadingIndicator) {
            loadingIndicator.classList.add('d-none');
        }
        if (tryOnButton) {
            tryOnButton.disabled = false;
            tryOnButton.innerHTML = 'Try On This Hairstyle';
        }
    }
    
    // Helper function to show error message
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('d-none');
        }
    }
    
    // Helper function to hide error message
    function hideError() {
        if (errorMessage) {
            errorMessage.classList.add('d-none');
        }
    }
});
