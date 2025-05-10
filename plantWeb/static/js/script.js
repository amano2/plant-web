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
        
        // Get disease information if available
        let diseaseName = "Unknown";
        let diseaseCause = "Not available";
        let diseaseCure = "Not available";
        
        // Try to extract disease information from the DOM
        const diseaseDetailsElement = document.querySelector('.disease-details h4');
        if (diseaseDetailsElement) {
            diseaseName = diseaseDetailsElement.textContent.trim();
        }
        
        const diseaseSections = document.querySelectorAll('.disease-section');
        diseaseSections.forEach(section => {
            const heading = section.querySelector('h5');
            const content = section.querySelector('p');
            
            if (heading && content) {
                const headingText = heading.textContent.trim();
                const contentText = content.textContent.trim();
                
                if (headingText.includes('Cause')) {
                    diseaseCause = contentText;
                } else if (headingText.includes('Treatment')) {
                    diseaseCure = contentText;
                }
            }
        });
        
        // Format date and time
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const formattedDate = now.toLocaleDateString(undefined, dateOptions);
        const formattedTime = now.toLocaleTimeString(undefined, timeOptions);
        
        // Create report content
        const reportContent = 
            "PLANT DISEASE ANALYSIS REPORT\n" +
            "==============================\n\n" +
            `Date: ${formattedDate}\n` +
            `Time: ${formattedTime}\n\n` +
            "DISEASE INFORMATION\n" +
            "------------------------------\n" +
            `Disease Name: ${diseaseName}\n` +
            `Disease Severity: ${percentage}%\n\n` +
            "DISEASE DETAILS\n" +
            "------------------------------\n" +
            `Cause: ${diseaseCause}\n\n` +
            `Recommended Treatment: ${diseaseCure}\n\n` +
            "RECOMMENDATIONS\n" +
            "------------------------------\n";
        
        // Add recommendations based on severity
        let recommendations = "";
        if (parseInt(percentage) < 30) {
            recommendations += "• Low level of disease detected. Monitor the plant regularly.\n";
            recommendations += "• Ensure proper watering and sunlight exposure.\n";
            recommendations += "• Consider preventive measures to avoid disease spread.\n";
            recommendations += "• Inspect other plants in the vicinity for early signs of infection.";
        } else if (parseInt(percentage) < 70) {
            recommendations += "• Moderate level of disease detected. Take action soon.\n";
            recommendations += "• Apply appropriate fungicide or treatment as recommended above.\n";
            recommendations += "• Isolate the plant from healthy ones if possible.\n";
            recommendations += "• Improve air circulation around the plant.\n";
            recommendations += "• Remove affected leaves and dispose properly.";
        } else {
            recommendations += "• High level of disease detected. Immediate action required.\n";
            recommendations += "• Apply appropriate treatment immediately as recommended above.\n";
            recommendations += "• Remove severely affected leaves or parts.\n";
            recommendations += "• Consider consulting a plant specialist for advanced treatment.\n";
            recommendations += "• Take preventive measures for other plants in the vicinity.";
        }
        
        // Add footer
        const footer = 
            "\n\n==============================\n" +
            "Generated by PlantGuard\n" +
            "Advanced Plant Disease Detection System\n" +
            "© 2025 PlantGuard";
        
        // Create downloadable text file
        const blob = new Blob([reportContent + recommendations + footer], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create download link and trigger click
        const a = document.createElement('a');
        a.href = url;
        a.download = `plant_disease_report_${now.toISOString().split('T')[0]}.txt`;
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