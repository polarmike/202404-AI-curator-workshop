// Global variables
let classificationResults = null;
let imageDescription = null;

// DOM Elements
const stepIndicators = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3')
];

const stepContents = [
    document.getElementById('step1-content'),
    document.getElementById('step2-content'),
    document.getElementById('step3-content')
];

// Navigation functions
function showStep(stepNumber) {
    // Update step indicators
    stepIndicators.forEach((step, index) => {
        if (index + 1 < stepNumber) {
            step.className = 'step completed';
        } else if (index + 1 === stepNumber) {
            step.className = 'step active';
        } else {
            step.className = 'step';
        }
    });
    
    // Show appropriate content
    stepContents.forEach((content, index) => {
        if (index + 1 === stepNumber) {
            content.className = 'step-content active-step';
        } else {
            content.className = 'step-content';
        }
    });
    
    // Update the image in all steps
    updateImageAcrossSteps();
}

// Function to keep the image consistent across all steps
function updateImageAcrossSteps() {
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

// Function to get image as base64
function getImageAsBase64(imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL('image/jpeg').split(',')[1]; // Remove data URL prefix
}

// Function to generate local description (no API)
function generateLocalDescription(imgElement, classResults) {
    if (!classResults || classResults.length === 0) {
        return "No classification data available to generate a description.";
    }
    
    // Get the top prediction and its confidence
    const topClass = classResults[0].className;
    const topConfidence = classResults[0].probability;
    
    // Get image properties
    const imgWidth = imgElement.naturalWidth;
    const imgHeight = imgElement.naturalHeight;
    const aspectRatio = imgWidth / imgHeight;
    
    // Determine image orientation
    let orientation = "square";
    if (aspectRatio > 1.2) orientation = "landscape";
    if (aspectRatio < 0.8) orientation = "portrait";
    
    // Get color information by analyzing the image with canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 50;  // Small size for faster processing
    canvas.height = 50;
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];
        totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (pixelData.length / 4);
    
    // Determine if image is dark, medium, or bright
    let brightness = "medium brightness";
    if (avgBrightness < 85) brightness = "dark";
    if (avgBrightness > 170) brightness = "bright";
    
    // Build the description
    let description = "";
    
    if (topConfidence > 0.85) {
        description = `This image clearly shows a ${topClass}.`;
    } else if (topConfidence > 0.6) {
        description = `This image appears to show a ${topClass}.`;
    } else {
        description = `This image might contain a ${topClass}, but I'm not very confident.`;
    }
    
    // Add additional details about image qualities
    description += ` It is a ${orientation} image with ${brightness} overall.`;
    
    // Add information about other possible classes if they have significant probability
    const otherClasses = classResults.slice(1).filter(c => c.probability > 0.15);
    if (otherClasses.length > 0) {
        description += ` I can also see elements of ${otherClasses.map(c => c.className).join(", ")}.`;
    }
    
    return description;
}

// Function to get image description from OpenAI
async function getOpenAIDescription(imgElement, classResults) {
    const apiKey = document.getElementById('api-key').value;
    if (!apiKey) {
        throw new Error('Please enter your OpenAI API key');
    }
    
    const base64Image = getImageAsBase64(imgElement);
    const topClasses = classResults.slice(0, 3).map(r => r.className).join(', ');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Describe this image in detail. Our classification model identified these possible objects: ${topClasses}. Please verify and provide a detailed description of the image.`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Function to get image description from DeepSeek
async function getDeepSeekDescription(imgElement, classResults) {
    const apiKey = document.getElementById('api-key').value;
    if (!apiKey) {
        throw new Error('Please enter your DeepSeek API key');
    }
    
    const base64Image = getImageAsBase64(imgElement);
    const topClasses = classResults.slice(0, 3).map(r => r.className).join(', ');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Describe this image in detail. Our classification model identified these possible objects: ${topClasses}. Please verify and provide a detailed description of the image.`
                        },
                        {
                            type: 'image',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Loading state functions
function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('result').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('result').style.display = 'block';
}

function showDescriptionLoading() {
    document.getElementById('loading-spinner-description').style.display = 'block';
    document.getElementById('description').style.display = 'none';
}

function hideDescriptionLoading() {
    document.getElementById('loading-spinner-description').style.display = 'none';
    document.getElementById('description').style.display = 'block';
}

// Function to update agent with classification results and description
function updateAgent() {
    if (!classificationResults) {
        console.warn('No classification result to update the agent with.');
        return;
    }
    
    // If no description has been generated yet, generate one now
    if (!imageDescription) {
        const imageElement = document.getElementById('preview');
        if (imageElement && imageElement.complete && imageElement.naturalHeight > 0) {
            imageDescription = generateLocalDescription(imageElement, classificationResults);
            document.getElementById('image-description').textContent = imageDescription;
        } else {
            imageDescription = "Image description could not be generated automatically.";
        }
    }
    
    // Format the classification results as a clean string
    let formattedResults = '';
    classificationResults.forEach((result, index) => {
        const percentage = (result.probability * 100).toFixed(1);
        formattedResults += `${result.className}: ${percentage}%`;
        if (index < classificationResults.length - 1) {
            formattedResults += ', ';
        }
    });
    
    // Get the top prediction
    const topClass = classificationResults[0].className;
    const topProbability = (classificationResults[0].probability * 100).toFixed(1);
    
    // Create a dynamic variables object
    const dynamicVars = {
        classification_results: formattedResults,
        top_class: topClass,
        top_probability: topProbability,
        classification_time: new Date().toLocaleTimeString(),
        image_description: imageDescription
    };
    
    try {
        // Get the existing agent element
        const agentElement = document.getElementById('elevenlabs-agent');
        
        // Update the dynamic-variables attribute
        agentElement.setAttribute('dynamic-variables', JSON.stringify(dynamicVars));
        
    } catch (error) {
        console.error("Error updating agent:", error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Preview uploaded image
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

    // Classify button click handler
    document.getElementById('classify-button').addEventListener('click', async function() {
        const modelURL = document.getElementById('model-url').value;
        const imageElement = document.getElementById('preview');
        const resultElement = document.getElementById('result');
        const progressBar = document.getElementById('classification-progress-bar');
        
        if (!modelURL) {
            resultElement.textContent = 'Please enter a model URL.';
            return;
        }
        
        if (imageElement.style.display === 'none' || !imageElement.src) {
            resultElement.textContent = 'Please upload an image first.';
            return;
        }
        
        resultElement.textContent = 'Loading model and classifying image...';
        progressBar.style.width = '10%';
        
        try {
            // Check if TensorFlow.js is loaded
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js could not be loaded. Please check your internet connection and try again.');
            }
            
            // Load the model
            const modelFolderPath = modelURL.substring(0, modelURL.lastIndexOf('/') + 1);
            
            resultElement.textContent = 'Loading model... (This may take a few moments)';
            progressBar.style.width = '30%';
            
            try {
                const model = await tf.loadLayersModel(modelURL);
                progressBar.style.width = '50%';
                
                // Load metadata
                resultElement.textContent = 'Loading metadata...';
                const metadataURL = `${modelFolderPath}metadata.json`;
                const metadataResponse = await fetch(metadataURL);
                
                progressBar.style.width = '70%';
                
                if (!metadataResponse.ok) {
                    throw new Error(`Failed to fetch metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
                }
                
                const metadata = await metadataResponse.json();
                
                // Convert the image to a tensor
                const tensor = tf.browser.fromPixels(imageElement)
                    .resizeNearestNeighbor([metadata.imageSize || 224, metadata.imageSize || 224])
                    .toFloat()
                    .div(tf.scalar(255))
                    .expandDims();
                
                progressBar.style.width = '80%';
                
                // Make prediction
                resultElement.textContent = 'Analyzing image...';
                const prediction = await model.predict(tensor).data();
                
                progressBar.style.width = '90%';
                
                // Process results
                const results = Array.from(prediction)
                    .map((score, i) => ({ 
                        className: metadata.labels[i],
                        probability: score
                    }))
                    .sort((a, b) => b.probability - a.probability);
                
                // Store the result in the global variable
                classificationResults = results;
                
                // Display results
                let resultHTML = '<h3>Classification Results:</h3>';
                resultHTML += '<ul>';
                results.forEach(result => {
                    const percentage = (result.probability * 100).toFixed(2);
                    resultHTML += `<li>${result.className}: <strong>${percentage}%</strong></li>`;
                });
                resultHTML += '</ul>';
                
                resultHTML += '<p><strong>Top prediction:</strong> ' + results[0].className + '</p>';
                
                resultElement.innerHTML = resultHTML;
                progressBar.style.width = '100%';
                
                // Enable generate description button
                document.getElementById('generate-description').disabled = false;
                
            } catch (modelError) {
                console.error('Model loading error:', modelError);
                progressBar.style.width = '0%';
                
                // Provide more specific error messages
                if (modelError.message.includes('fetch')) {
                    resultElement.innerHTML = `
                        <p>Error: Failed to fetch the model or metadata.</p>
                        <p><strong>Troubleshooting steps:</strong></p>
                        <ol>
                            <li>Check that your Teachable Machine model URL is correct and ends with "model.json"</li>
                            <li>Ensure your model is publicly accessible (not private)</li>
                            <li>Verify your internet connection is working</li>
                            <li>If using a custom-hosted model, ensure CORS is enabled on your server</li>
                        </ol>
                        <p>Detailed error: ${modelError.message}</p>
                    `;
                } else {
                    resultElement.innerHTML = `Error: ${modelError.message}<br>Check the console for more details.`;
                }
                
                throw modelError;
            }
        } catch (error) {
            if (!resultElement.innerHTML.includes('Troubleshooting')) {
                resultElement.innerHTML = `
                    <p>Error: ${error.message}</p>
                    <p>Please check your model URL, internet connection, and try again.</p>
                `;
            }
            progressBar.style.width = '0%';
            console.error('Classification error:', error);
        }
    });

    // Generate description button click handler
    document.getElementById('generate-description').addEventListener('click', async function() {
        if (!classificationResults) {
            alert('Please classify the image first.');
            return;
        }
        
        const imageElement = document.getElementById('preview');
        if (!imageElement || !imageElement.complete || imageElement.naturalHeight === 0) {
            alert('Image not fully loaded. Please wait a moment and try again.');
            return;
        }
        
        const provider = document.getElementById('ai-provider').value;
        const descriptionElement = document.getElementById('image-description');
        const loader = document.getElementById('description-loader');
        
        // Show the loader
        loader.style.display = 'block';
        descriptionElement.textContent = 'Generating description...';
        
        try {
            switch (provider) {
                case 'openai':
                    imageDescription = await getOpenAIDescription(imageElement, classificationResults);
                    break;
                case 'deepseek':
                    imageDescription = await getDeepSeekDescription(imageElement, classificationResults);
                    break;
                default:
                    // Local generation (no API call)
                    imageDescription = generateLocalDescription(imageElement, classificationResults);
            }
            
            // Display the description
            descriptionElement.textContent = imageDescription;
            
            // Enable proceed button
            document.getElementById('proceed-to-step3').disabled = false;
            
        } catch (error) {
            descriptionElement.textContent = `Error generating description: ${error.message}`;
            console.error('Description generation error:', error);
        } finally {
            // Hide the loader
            loader.style.display = 'none';
        }
    });

    // Navigation button listeners
    document.getElementById('proceed-to-step2').addEventListener('click', function() {
        showStep(2);
    });

    document.getElementById('back-to-step1').addEventListener('click', function() {
        showStep(1);
    });

    document.getElementById('proceed-to-step3').addEventListener('click', function() {
        // Update the agent before proceeding
        updateAgent();
        showStep(3);
    });

    document.getElementById('back-to-step2').addEventListener('click', function() {
        showStep(2);
    });

    document.getElementById('reset-process').addEventListener('click', function() {
        // Reset all data
        classificationResults = null;
        imageDescription = null;
        
        // Clear UI elements
        document.getElementById('preview').src = '';
        document.getElementById('preview').style.display = 'none';
        document.getElementById('no-image').style.display = 'block';
        document.getElementById('image-info').style.display = 'none';
        document.getElementById('image-upload').value = '';
        document.getElementById('result').textContent = 'Click "Classify Image" to see results.';
        document.getElementById('image-description').textContent = 'Click "Generate Description" to analyze the image.';
        document.getElementById('classification-progress-bar').style.width = '0%';
        
        // Reset buttons
        document.getElementById('proceed-to-step2').disabled = false;
        document.getElementById('generate-description').disabled = true;
        document.getElementById('proceed-to-step3').disabled = true;
        
        // Go back to step 1
        showStep(1);
    });

    // Show/hide API key input based on selected provider
    document.getElementById('ai-provider').addEventListener('change', function() {
        const provider = this.value;
        const apiKeyContainer = document.getElementById('api-key-container');
        
        if (provider === 'local') {
            apiKeyContainer.style.display = 'none';
        } else {
            apiKeyContainer.style.display = 'block';
        }
    });

    // Initialize the page
    const provider = document.getElementById('ai-provider').value;
    const apiKeyContainer = document.getElementById('api-key-container');
    
    if (provider === 'local') {
        apiKeyContainer.style.display = 'none';
    } else {
        apiKeyContainer.style.display = 'block';
    }
    
    // Make sure the Proceed button is enabled by default
    document.getElementById('proceed-to-step2').disabled = false;
    
    // Initialize preview containers in other steps
    updateImageAcrossSteps();
    
    // Add some animations for a better first impression
    document.querySelector('h1').style.opacity = 0;
    document.querySelector('.steps-container').style.opacity = 0;
    document.querySelector('.main-content').style.opacity = 0;
    
    setTimeout(() => {
        document.querySelector('h1').style.transition = 'opacity 0.8s ease';
        document.querySelector('h1').style.opacity = 1;
        
        setTimeout(() => {
            document.querySelector('.steps-container').style.transition = 'opacity 0.8s ease';
            document.querySelector('.steps-container').style.opacity = 1;
            
            setTimeout(() => {
                document.querySelector('.main-content').style.transition = 'opacity 0.8s ease';
                document.querySelector('.main-content').style.opacity = 1;
            }, 200);
        }, 200);
    }, 300);
}); 