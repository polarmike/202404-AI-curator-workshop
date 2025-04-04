// Navigation and UI state management
export function setupNavigation() {
    // Step 1 to Step 2
    document.getElementById('proceed-to-step2').addEventListener('click', function() {
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        updateStepIndicator(2);
    });

    // Step 2 to Step 3
    document.getElementById('proceed-to-step3').addEventListener('click', function() {
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
        updateStepIndicator(3);
    });

    // Back buttons
    document.getElementById('back-to-step1').addEventListener('click', function() {
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        updateStepIndicator(1);
    });

    document.getElementById('back-to-step2').addEventListener('click', function() {
        document.getElementById('step3').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        updateStepIndicator(2);
    });
}

function updateStepIndicator(currentStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

export function resetUI() {
    // Reset step indicators
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    steps[0].classList.add('active');

    // Reset step displays
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';

    // Reset buttons
    document.getElementById('proceed-to-step2').disabled = true;
    document.getElementById('proceed-to-step3').disabled = true;

    // Reset image preview
    const preview = document.getElementById('preview');
    preview.style.display = 'none';
    document.getElementById('no-image').style.display = 'block';
    document.getElementById('image-info').style.display = 'none';

    // Reset results
    document.getElementById('result').innerHTML = '<p>Click "Classify Image" to see results.</p>';
    document.getElementById('description').textContent = 'Click "Generate Description" to analyze the image.';
} 