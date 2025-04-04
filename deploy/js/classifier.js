// Image classification functionality
import { getImageAsBase64 } from './image-handler.js';

let classificationResults = null;
let imageDescription = null;

export function getClassificationResults() {
    return classificationResults;
}

export function getImageDescription() {
    return imageDescription;
}

export function showLoading() {
    document.getElementById('loading-spinner').style.display = 'flex';
    document.getElementById('result').style.display = 'none';
}

export function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('result').style.display = 'block';
}

export async function classifyImage() {
    const preview = document.getElementById('preview');
    if (preview.style.display === 'none') {
        alert('Please upload an image first');
        return;
    }

    showLoading();

    try {
        const imageData = getImageAsBase64(preview);
        
        // Simulate API call for classification
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock classification results
        classificationResults = {
            labels: ['Nature', 'Landscape', 'Mountain'],
            confidence: [0.95, 0.85, 0.75]
        };

        // Update UI with results
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <h3>Classification Results:</h3>
            <ul>
                ${classificationResults.labels.map((label, index) => `
                    <li>${label}: ${(classificationResults.confidence[index] * 100).toFixed(2)}%</li>
                `).join('')}
            </ul>
        `;

        // Enable proceed button
        document.getElementById('proceed-to-step3').disabled = false;
        
        hideLoading();
    } catch (error) {
        console.error('Error during classification:', error);
        hideLoading();
        alert('An error occurred during classification. Please try again.');
    }
}

export async function generateDescription() {
    if (!classificationResults) {
        alert('Please classify the image first');
        return;
    }

    showLoading();

    try {
        // Simulate API call for description generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock description
        imageDescription = "This is a beautiful landscape photograph featuring majestic mountains against a clear blue sky. The image captures the natural beauty of the scene with excellent composition and lighting.";
        
        // Update UI with description
        const descriptionDiv = document.getElementById('description');
        descriptionDiv.textContent = imageDescription;
        
        hideLoading();
    } catch (error) {
        console.error('Error generating description:', error);
        hideLoading();
        alert('An error occurred while generating the description. Please try again.');
    }
} 