document.addEventListener('DOMContentLoaded', function() {
    // Handle file input change
    const fileInput = document.getElementById('image-input');
    const fileNameDisplay = document.getElementById('file-name');
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                // Update file name display
                const fileName = this.files[0].name;
                fileNameDisplay.textContent = fileName.length > 20 ? 
                    fileName.substring(0, 20) + '...' : fileName;
                
                // Add active class to label
                this.nextElementSibling.classList.add('active');
                
                // Preview image if desired
                // const reader = new FileReader();
                // reader.onload = function(e) {
                //     // Add preview code here if needed
                // }
                // reader.readAsDataURL(this.files[0]);
            } else {
                fileNameDisplay.textContent = 'Choose an image...';
                this.nextElementSibling.classList.remove('active');
            }
        });
    }
    
    // Handle percentage circle animation
    const percentageCircle = document.querySelector('.percentage-circle');
    if (percentageCircle) {
        const percentage = parseInt(percentageCircle.getAttribute('data-percentage')) || 0;
        
        // Animate percentage fill
        setTimeout(() => {
            percentageCircle.style.background = `conic-gradient(
                var(--primary-color) 0% ${percentage}%, 
                #e0e0e0 ${percentage}% 100%
            )`;
        }, 300);
        
        // Animate percentage number count
        const percentageValue = document.getElementById('percentage-value');
        if (percentageValue) {
            let currentValue = 0;
            const duration = 1500; // milliseconds
            const interval = 20; // update every 20ms
            const steps = duration / interval;
            const increment = percentage / steps;
            
            const counter = setInterval(() => {
                currentValue += increment;
                if (currentValue >= percentage) {
                    currentValue = percentage;
                    clearInterval(counter);
                }
                percentageValue.textContent = Math.round(currentValue);
            }, interval);
        }
        
        // Set severity class based on percentage
        if (percentage < 30) {
            percentageCircle.classList.add('low-severity');
        } else if (percentage < 70) {
            percentageCircle.classList.add('medium-severity');
        } else {
            percentageCircle.classList.add('high-severity');
        }
    }
    
    // Handle "Analyze Another" button
    const newUploadBtn = document.getElementById('new-upload');
    if (newUploadBtn) {
        newUploadBtn.addEventListener('click', function() {
            // Scroll to upload section
            const uploadSection = document.querySelector('.upload-section');
            if (uploadSection) {
                uploadSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Handle "Download Report" button
    const downloadReportBtn = document.getElementById('download-report');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', function() {
            // Generate report functionality
            generateReport();
        });
    }
    
    // Function to generate a simple report
    function generateReport() {
        // Get the disease percentage
        const percentageValue = document.getElementById('percentage-value');
        const percentage = percentageValue ? percentageValue.textContent : "N/A";
        
        // Create report content
        const reportContent = 
            "Plant Disease Analysis Report\n" +
            "==============================\n" +
            "Generated on: " + new Date().toLocaleString() + "\n" +
            "Disease Percentage: " + percentage + "%\n" +
            "==============================\n" +
            "Recommendations:\n";
        
        // Add recommendations based on severity
        let recommendations = "";
        if (parseInt(percentage) < 30) {
            recommendations += "- Low level of disease detected. Monitor the plant regularly.\n";
            recommendations += "- Ensure proper watering and sunlight exposure.\n";
            recommendations += "- Preventive measures are recommended.";
        } else if (parseInt(percentage) < 70) {
            recommendations += "- Moderate level of disease detected. Take action soon.\n";
            recommendations += "- Consider applying appropriate fungicide or treatment.\n";
            recommendations += "- Isolate the plant from healthy ones if possible.\n";
            recommendations += "- Improve air circulation around the plant.";
        } else {
            recommendations += "- High level of disease detected. Immediate action required.\n";
            recommendations += "- Apply appropriate treatment immediately.\n";
            recommendations += "- Remove severely affected leaves or parts.\n";
            recommendations += "- Consider consulting a plant specialist for advanced treatment.";
        }
        
        // Create downloadable text file
        const blob = new Blob([reportContent + recommendations], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create download link and trigger click
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plant_disease_report.txt';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Add hover effect to cards
    const cards = document.querySelectorAll('.card, .results-card, .info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
            this.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
        });
    });
    
    // Optional: Add form validation
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(event) {
            if (fileInput && !fileInput.files[0]) {
                event.preventDefault();
                alert('Please select an image file first!');
            }
        });
    }
});