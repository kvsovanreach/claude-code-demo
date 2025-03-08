document.addEventListener('DOMContentLoaded', function() {
    // Auth check - redirect to login if not authenticated
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }

    // Display username in navbar
    document.getElementById('user-name').textContent = user.username;

    // Socket.io Setup
    const socket = io('http://localhost:3000');

    // Socket Event Handlers
    socket.on('connect', () => {
        showToast('success', 'Connection Established', 'Successfully connected to the server.');
    });

    socket.on('disconnect', () => {
        showToast('error', 'Connection Lost', 'Lost connection to the server. Attempting to reconnect...');
    });

    socket.on('metrics_update', (data) => {
        updateMetrics(data);
    });

    socket.on('detection', (data) => {
        addDetection(data);
    });

    socket.on('alert', (data) => {
        addAlert(data);
        showToast(data.type, data.title, data.message);
    });

    // Nav Links & Section Switching
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Logout Button
    document.getElementById('logout-btn').addEventListener('click', function() {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Initialize Charts
    initializeCharts();

    // Event listeners for Settings sliders
    initializeSettingsControls();

    // Event listeners for Video Feed controls
    initializeVideoControls();

    // Initialize Feedback form
    initializeFeedbackForm();

    // Populate with mock data
    populateMockData();
});

// Initialize Charts
function initializeCharts() {
    // Overview Chart
    const overviewCtx = document.getElementById('overview-chart').getContext('2d');
    const overviewChart = new Chart(overviewCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => (i * 5) + 's ago'),
            datasets: [
                {
                    label: 'FPS',
                    data: Array.from({length: 10}, () => Math.random() * 10 + 20),
                    borderColor: 'rgba(74, 108, 247, 1)',
                    backgroundColor: 'rgba(74, 108, 247, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Accuracy (%)',
                    data: Array.from({length: 10}, () => Math.random() * 10 + 85),
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 60,
                    title: {
                        display: true,
                        text: 'Frames Per Second'
                    }
                },
                y1: {
                    beginAtZero: true,
                    max: 100,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Accuracy (%)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    usePointStyle: true
                }
            }
        }
    });

    // Performance Charts
    const performanceOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    // Accuracy Chart
    const accuracyCtx = document.getElementById('accuracy-chart').getContext('2d');
    const accuracyChart = new Chart(accuracyCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 7}, (_, i) => `Day ${i+1}`),
            datasets: [{
                label: 'Accuracy',
                data: [91, 92.5, 90.8, 93.2, 91.7, 94.1, 92.7],
                borderColor: 'rgba(40, 167, 69, 1)',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...performanceOptions,
            scales: {
                ...performanceOptions.scales,
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100
                }
            }
        }
    });

    // FPS Chart
    const fpsCtx = document.getElementById('fps-chart').getContext('2d');
    const fpsChart = new Chart(fpsCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 7}, (_, i) => `Day ${i+1}`),
            datasets: [{
                label: 'FPS',
                data: [24.2, 25.7, 23.9, 26.1, 24.8, 25.3, 24.5],
                borderColor: 'rgba(74, 108, 247, 1)',
                backgroundColor: 'rgba(74, 108, 247, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: performanceOptions
    });

    // Latency Chart
    const latencyCtx = document.getElementById('latency-chart').getContext('2d');
    const latencyChart = new Chart(latencyCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 7}, (_, i) => `Day ${i+1}`),
            datasets: [{
                label: 'Latency (ms)',
                data: [45, 43, 48, 41, 44, 40, 42],
                borderColor: 'rgba(220, 53, 69, 1)',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: performanceOptions
    });

    // Store chart references in window object for later updates
    window.dashboardCharts = {
        overview: overviewChart,
        accuracy: accuracyChart,
        fps: fpsChart,
        latency: latencyChart
    };
}

// Settings controls initialization
function initializeSettingsControls() {
    // Confidence Threshold slider
    const confidenceThreshold = document.getElementById('confidence-threshold');
    const confidenceValue = document.getElementById('confidence-value');
    
    confidenceThreshold.addEventListener('input', function() {
        confidenceValue.textContent = `${this.value}%`;
    });
    
    // FPS Limit slider
    const fpsLimit = document.getElementById('fps-limit');
    const fpsValue = document.getElementById('fps-value');
    
    fpsLimit.addEventListener('input', function() {
        fpsValue.textContent = `${this.value} FPS`;
    });
    
    // Alert Threshold slider
    const alertThreshold = document.getElementById('alert-threshold');
    const alertValue = document.getElementById('alert-value');
    
    alertThreshold.addEventListener('input', function() {
        alertValue.textContent = `${this.value}%`;
    });
    
    // Save Settings button
    document.getElementById('model-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect all settings
        const settings = {
            confidenceThreshold: confidenceThreshold.value,
            fpsLimit: fpsLimit.value,
            retrainInterval: document.getElementById('retrain-interval').value,
            alertThreshold: alertThreshold.value,
            nmsEnabled: document.getElementById('nms-enabled').checked,
            trackingEnabled: document.getElementById('tracking-enabled').checked,
            smoothingEnabled: document.getElementById('smoothing-enabled').checked,
            alertsEnabled: document.getElementById('alerts-enabled').checked
        };
        
        // In a real app, we would send these settings to the server
        console.log('Saving settings:', settings);
        
        // Show success toast
        showToast('success', 'Settings Saved', 'Your settings have been saved successfully.');
    });
    
    // Reset to Defaults button
    document.getElementById('reset-settings').addEventListener('click', function() {
        // Reset sliders
        confidenceThreshold.value = 70;
        confidenceValue.textContent = '70%';
        
        fpsLimit.value = 30;
        fpsValue.textContent = '30 FPS';
        
        alertThreshold.value = 80;
        alertValue.textContent = '80%';
        
        // Reset other settings
        document.getElementById('retrain-interval').value = '30';
        document.getElementById('nms-enabled').checked = true;
        document.getElementById('tracking-enabled').checked = true;
        document.getElementById('smoothing-enabled').checked = false;
        document.getElementById('alerts-enabled').checked = true;
        
        showToast('info', 'Settings Reset', 'Settings have been reset to default values.');
    });
}

// Video Feed controls initialization
function initializeVideoControls() {
    const videoFeed = document.getElementById('video-feed');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const zoomLevel = document.getElementById('zoom-level');
    
    // Play button
    playBtn.addEventListener('click', function() {
        // In a real app, this would control a video stream
        console.log('Play video');
        showToast('info', 'Video Feed', 'Stream playback started.');
    });
    
    // Pause button
    pauseBtn.addEventListener('click', function() {
        console.log('Pause video');
        showToast('info', 'Video Feed', 'Stream playback paused.');
    });
    
    // Fullscreen button
    fullscreenBtn.addEventListener('click', function() {
        if (videoFeed.requestFullscreen) {
            videoFeed.requestFullscreen();
        } else if (videoFeed.webkitRequestFullscreen) {
            videoFeed.webkitRequestFullscreen();
        } else if (videoFeed.msRequestFullscreen) {
            videoFeed.msRequestFullscreen();
        }
    });
    
    // Zoom level dropdown
    zoomLevel.addEventListener('change', function() {
        const zoom = parseFloat(this.value);
        videoFeed.style.transform = `scale(${zoom})`;
        videoFeed.style.transformOrigin = 'center center';
    });
    
    // Click on detection
    videoFeed.addEventListener('click', function(e) {
        // This would normally get coordinates and find the clicked detection
        // For demo, we'll just show details of the first detection
        
        const detectionDetails = document.getElementById('detection-details');
        
        // Toggle between empty state and detection details
        if (detectionDetails.querySelector('.empty-state')) {
            detectionDetails.innerHTML = `
                <div class="detection-details-content">
                    <h4>Person</h4>
                    <div class="detection-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Confidence:</span>
                            <span class="detail-value">95.7%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Bounding Box:</span>
                            <span class="detail-value">x: 142, y: 256, w: 108, h: 320</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Detection Time:</span>
                            <span class="detail-value">42ms</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tracking ID:</span>
                            <span class="detail-value">#1245</span>
                        </div>
                    </div>
                    
                    <div class="detection-actions">
                        <button class="btn-secondary" id="btn-mark-incorrect">
                            <i class="fas fa-times"></i> Mark as Incorrect
                        </button>
                        <button class="btn-primary" id="btn-save-detection">
                            <i class="fas fa-save"></i> Save Detection
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners to the buttons
            document.getElementById('btn-mark-incorrect').addEventListener('click', function() {
                showToast('info', 'Feedback Recorded', 'Detection marked as incorrect.');
                detectionDetails.innerHTML = '<p class="empty-state">Click on any detection in the video feed to see details</p>';
            });
            
            document.getElementById('btn-save-detection').addEventListener('click', function() {
                showToast('success', 'Detection Saved', 'The detection has been saved for reference.');
            });
        } else {
            detectionDetails.innerHTML = '<p class="empty-state">Click on any detection in the video feed to see details</p>';
        }
    });
}

// Feedback form initialization
function initializeFeedbackForm() {
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackImage = document.getElementById('feedback-image');
    const imagePreview = document.getElementById('image-preview');
    
    // Image upload preview
    feedbackImage.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            
            reader.readAsDataURL(this.files[0]);
        } else {
            imagePreview.innerHTML = '';
        }
    });
    
    // Form submission
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const feedbackType = document.getElementById('feedback-type').value;
        const feedbackDescription = document.getElementById('feedback-description').value;
        
        // In a real app, this would be sent to the server
        console.log('Feedback submitted:', {
            type: feedbackType,
            description: feedbackDescription,
            image: feedbackImage.files[0] ? feedbackImage.files[0].name : null
        });
        
        // Add to the feedback history
        addFeedbackToHistory(feedbackType, feedbackDescription);
        
        // Reset form
        this.reset();
        imagePreview.innerHTML = '';
        
        // Show success toast
        showToast('success', 'Feedback Submitted', 'Thank you for your feedback!');
    });
}

// Toast notification function
function showToast(type, title, message) {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.style.animation = 'slide-out 0.3s ease forwards';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toastContainer.contains(toast)) {
            toast.style.animation = 'slide-out 0.3s ease forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);
}

// Update metrics from server data
function updateMetrics(data) {
    // Update top metrics
    document.getElementById('current-fps').textContent = data.fps.toFixed(1);
    document.getElementById('current-accuracy').textContent = `${data.accuracy.toFixed(1)}%`;
    document.getElementById('current-latency').textContent = `${data.latency}ms`;
    
    // Update model status
    const modelStatus = document.getElementById('model-status');
    const statusDot = document.querySelector('.status-dot');
    
    modelStatus.textContent = data.status;
    statusDot.className = 'status-dot';
    
    if (data.status === 'Active') {
        statusDot.classList.add('active');
    } else if (data.status === 'Warning') {
        statusDot.classList.add('warning');
    } else if (data.status === 'Error') {
        statusDot.classList.add('danger');
    }
    
    // Update health metrics
    document.getElementById('memory-usage').style.width = `${data.memory}%`;
    document.querySelector('#memory-usage + .progress-text').textContent = `${data.memory}%`;
    
    document.getElementById('cpu-load').style.width = `${data.cpu}%`;
    document.querySelector('#cpu-load + .progress-text').textContent = `${data.cpu}%`;
    
    document.getElementById('drift-score').style.width = `${data.drift}%`;
    document.querySelector('#drift-score + .progress-text').textContent = `${data.drift}%`;
    
    document.getElementById('gpu-util').style.width = `${data.gpu}%`;
    document.querySelector('#gpu-util + .progress-text').textContent = `${data.gpu}%`;
    
    // Update charts
    updateCharts(data);
}

// Update charts with new data
function updateCharts(data) {
    if (!window.dashboardCharts) return;
    
    // Update overview chart
    const overviewChart = window.dashboardCharts.overview;
    
    // Remove oldest data point and add new one
    overviewChart.data.datasets[0].data.shift();
    overviewChart.data.datasets[0].data.push(data.fps);
    
    overviewChart.data.datasets[1].data.shift();
    overviewChart.data.datasets[1].data.push(data.accuracy);
    
    overviewChart.update();
    
    // In a real app, we would also update the other charts based on the data
}

// Add a new detection to the recent detections list
function addDetection(data) {
    const recentDetections = document.getElementById('recent-detections');
    
    // Create new detection item
    const detectionItem = document.createElement('div');
    detectionItem.className = 'detection-item';
    detectionItem.innerHTML = `
        <div class="detection-header">
            <span class="detection-title">${data.object}</span>
            <span class="detection-time">${formatTime(data.timestamp)}</span>
        </div>
        <div class="detection-info">
            ${data.location}
            <span class="detection-confidence">${data.confidence}%</span>
        </div>
    `;
    
    // Add to the list
    recentDetections.prepend(detectionItem);
    
    // Remove old items if too many
    while (recentDetections.children.length > 10) {
        recentDetections.removeChild(recentDetections.lastChild);
    }
    
    // Add to predictions table
    addPredictionToTable(data);
}

// Add a prediction to the table
function addPredictionToTable(data) {
    const predictionsTable = document.querySelector('#predictions-table tbody');
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formatTime(data.timestamp)}</td>
        <td>${data.object}</td>
        <td>${data.confidence}%</td>
        <td>${data.processingTime}ms</td>
        <td>${data.action || 'None'}</td>
    `;
    
    // Add to the table
    predictionsTable.prepend(row);
    
    // Remove old rows if too many
    while (predictionsTable.children.length > 10) {
        predictionsTable.removeChild(predictionsTable.lastChild);
    }
}

// Add an alert to the alerts container
function addAlert(data) {
    const alertsContainer = document.getElementById('alerts-container');
    
    // Create new alert item
    const alertItem = document.createElement('div');
    alertItem.className = `alert-item ${data.type}`;
    alertItem.innerHTML = `
        <div class="alert-header">
            <span class="alert-title">${data.title}</span>
            <span class="alert-time">${formatTime(new Date())}</span>
        </div>
        <div class="alert-message">${data.message}</div>
    `;
    
    // Add to the container
    alertsContainer.prepend(alertItem);
    
    // Remove old alerts if too many
    while (alertsContainer.children.length > 5) {
        alertsContainer.removeChild(alertsContainer.lastChild);
    }
}

// Add feedback to the history
function addFeedbackToHistory(type, description) {
    const feedbackHistory = document.getElementById('feedback-history');
    const typeDisplay = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Create new feedback item
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.innerHTML = `
        <div class="feedback-header">
            <span class="feedback-type">${typeDisplay}</span>
            <span class="feedback-time">${formatTime(new Date())}</span>
        </div>
        <div class="feedback-message">${description}</div>
    `;
    
    // Add to the history
    feedbackHistory.prepend(feedbackItem);
    
    // Remove old feedback if too many
    while (feedbackHistory.children.length > 5) {
        feedbackHistory.removeChild(feedbackHistory.lastChild);
    }
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

// Populate with mock data for demo
function populateMockData() {
    // Add mock alerts
    const mockAlerts = [
        { 
            type: 'warning', 
            title: 'Low Confidence Detection', 
            message: 'Several detections with confidence below threshold in the last 5 minutes.' 
        },
        { 
            type: 'info', 
            title: 'Model Update Available', 
            message: 'A new model version is available for deployment.' 
        },
        { 
            type: 'success', 
            title: 'Daily Calibration Complete', 
            message: 'The system has successfully completed its daily calibration routine.' 
        }
    ];
    
    mockAlerts.forEach(alert => addAlert(alert));
    
    // Add mock detections
    const mockDetections = [
        { 
            object: 'Person', 
            timestamp: new Date(Date.now() - 10000), 
            location: 'Zone A', 
            confidence: 95.7, 
            processingTime: 42, 
            action: 'Logged' 
        },
        { 
            object: 'Vehicle', 
            timestamp: new Date(Date.now() - 30000), 
            location: 'Zone B', 
            confidence: 89.2, 
            processingTime: 48, 
            action: 'Alert Triggered' 
        },
        { 
            object: 'Animal', 
            timestamp: new Date(Date.now() - 60000), 
            location: 'Zone C', 
            confidence: 78.5, 
            processingTime: 51, 
            action: 'None' 
        }
    ];
    
    mockDetections.forEach(detection => addDetection(detection));
    
    // Add mock feedback
    const mockFeedback = [
        {
            type: 'incorrect_detection',
            description: 'The system misidentified a large dog as a person in Zone B.'
        },
        {
            type: 'performance_issue',
            description: 'System lagging when processing multiple objects in the frame.'
        }
    ];
    
    mockFeedback.forEach(feedback => addFeedbackToHistory(feedback.type, feedback.description));
}