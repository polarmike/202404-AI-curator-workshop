// Image handling functionality
export function getImageAsBase64(imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL('image/jpeg').split(',')[1]; // Remove data URL prefix
}

export function updateImageAcrossSteps() {
    const originalPreview = document.getElementById('preview');
    const noImageDiv = document.getElementById('no-image');
    const isImageVisible = originalPreview.style.display !== 'none';
    
    // Update step 2 preview
    const step2Container = document.getElementById('step2-preview-container');
    step2Container.innerHTML = ''; // Clear previous contents
    
    if (isImageVisible) {
        const previewClone = originalPreview.cloneNode(true);
        step2Container.appendChild(previewClone);
    } else {
        const noImageClone = noImageDiv.cloneNode(true);
        step2Container.appendChild(noImageClone);
    }
    
    // Update step 3 preview
    const step3Container = document.getElementById('step3-preview-container');
    step3Container.innerHTML = ''; // Clear previous contents
    
    if (isImageVisible) {
        const previewClone = originalPreview.cloneNode(true);
        step3Container.appendChild(previewClone);
    } else {
        const noImageClone = noImageDiv.cloneNode(true);
        step3Container.appendChild(noImageClone);
    }
}

export function setupImageUploadHandler() {
    document.getElementById('image-upload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('preview');
                preview.src = e.target.result;
                preview.style.display = 'block';
                document.getElementById('no-image').style.display = 'none';
                
                // Update image info
                document.getElementById('image-info').style.display = 'block';
                document.getElementById('image-name').textContent = `Filename: ${file.name}`;
                document.getElementById('image-size').textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
                
                // Enable proceed button
                document.getElementById('proceed-to-step2').disabled = false;
                
                // Update image in all steps
                updateImageAcrossSteps();
            };
            reader.readAsDataURL(file);
        }
    });
} 