// Main script file
import { setupImageUploadHandler, updateImageAcrossSteps } from './image-handler.js';
import { classifyImage, generateDescription } from './classifier.js';
import { setupNavigation, resetUI } from './navigation.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Setup event listeners
        setupImageUploadHandler();
        setupNavigation();

        // Setup classification button
        const classifyBtn = document.getElementById('classify-btn');
        if (classifyBtn) {
            classifyBtn.addEventListener('click', classifyImage);
        }

        // Setup description generation button
        const generateDescriptionBtn = document.getElementById('generate-description-btn');
        if (generateDescriptionBtn) {
            generateDescriptionBtn.addEventListener('click', generateDescription);
        }

        // Setup reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                resetUI();
                updateImageAcrossSteps();
            });
        }

        // Setup AI provider selection
        const aiProvider = document.getElementById('ai-provider');
        const apiKeyContainer = document.getElementById('api-key-container');
        if (aiProvider && apiKeyContainer) {
            aiProvider.addEventListener('change', function() {
                apiKeyContainer.style.display = 
                    this.value === 'openai' || this.value === 'deepseek' ? 'block' : 'none';
            });
        }

        // Initialize UI state
        resetUI();
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('An error occurred while initializing the application. Please refresh the page and try again.');
    }
}); 