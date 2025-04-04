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
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('result').style.display = 'none';
}

export function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('result').style.display = 'block';
}

export function showDescriptionLoading() {
    document.getElementById('loading-spinner-description').style.display = 'block';
    document.getElementById('description').style.display = 'none';
}

export function hideDescriptionLoading() {
    document.getElementById('loading-spinner-description').style.display = 'none';
    document.getElementById('description').style.display = 'block';
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
        const modelUrl = document.getElementById('model-url').value;
        
        if (!modelUrl) {
            throw new Error('Please enter a valid Teachable Machine model URL');
        }

        // Use a more reliable CORS proxy
        const corsProxyUrl = 'https://api.allorigins.win/raw?url=';
        const proxyModelUrl = corsProxyUrl + encodeURIComponent(modelUrl);
        
        // Load the model with CORS proxy
        const model = await tf.loadLayersModel(proxyModelUrl);
        
        // Preprocess the image
        const tensor = tf.browser.fromPixels(preview)
            .resizeBilinear([224, 224])
            .toFloat()
            .expandDims();
        
        // Get predictions
        const predictions = await model.predict(tensor).data();
        
        // Get top 3 predictions
        const top3 = Array.from(predictions)
            .map((p, i) => ({ probability: p, index: i }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 3);

        // Store results
        classificationResults = {
            labels: top3.map(p => `Class ${p.index}`),
            confidence: top3.map(p => p.probability)
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
        document.getElementById('generate-description-btn').disabled = false;
        
        hideLoading();
    } catch (error) {
        console.error('Error during classification:', error);
        hideLoading();
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <p class="error">Error: ${error.message}</p>
            <p>Please make sure you have entered a valid Teachable Machine model URL and try again.</p>
            <p>Note: If you're experiencing CORS issues, you may need to:</p>
            <ol>
                <li>Use a CORS proxy service</li>
                <li>Host the model on your own server</li>
                <li>Contact Google support to enable CORS for your domain</li>
            </ol>
        `;
    }
}

export async function generateDescription() {
    if (!classificationResults) {
        alert('Please classify the image first');
        return;
    }

    showDescriptionLoading();

    try {
        // Simulate API call for description generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock description
        imageDescription = "This is a beautiful landscape photograph featuring majestic mountains against a clear blue sky. The image captures the natural beauty of the scene with excellent composition and lighting.";
        
        // Update UI with description
        const descriptionDiv = document.getElementById('description');
        descriptionDiv.textContent = imageDescription;
        
        hideDescriptionLoading();
    } catch (error) {
        console.error('Error generating description:', error);
        hideDescriptionLoading();
        const descriptionDiv = document.getElementById('description');
        descriptionDiv.textContent = `Error: ${error.message}`;
    }
} 