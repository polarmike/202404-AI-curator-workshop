// Main script file
import { setupImageUploadHandler, updateImageAcrossSteps } from './image-handler.js';
import { classifyImage, generateDescription } from './classifier.js';
import { setupNavigation, resetUI } from './navigation.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners
    setupImageUploadHandler();
    setupNavigation();

    // Setup classification button
    document.getElementById('classify-btn').addEventListener('click', classifyImage);

    // Setup description generation button
    document.getElementById('generate-description-btn').addEventListener('click', generateDescription);

    // Setup reset button
    document.getElementById('reset-btn').addEventListener('click', function() {
        resetUI();
        updateImageAcrossSteps();
    });
}); 