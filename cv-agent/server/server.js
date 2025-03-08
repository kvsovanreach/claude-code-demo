const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Socket.io event handling
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Send initial metrics
    socket.emit('metrics_update', generateRandomMetrics());
    
    // Set up interval to send metrics updates every 5 seconds
    const metricsInterval = setInterval(() => {
        socket.emit('metrics_update', generateRandomMetrics());
    }, 5000);
    
    // Set up interval to send random detections
    const detectionsInterval = setInterval(() => {
        if (Math.random() > 0.5) { // 50% chance to send a detection
            socket.emit('detection', generateRandomDetection());
        }
    }, 8000);
    
    // Set up interval to send random alerts
    const alertsInterval = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance to send an alert
            socket.emit('alert', generateRandomAlert());
        }
    }, 15000);
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Clear intervals
        clearInterval(metricsInterval);
        clearInterval(detectionsInterval);
        clearInterval(alertsInterval);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Helper function to generate random metrics
function generateRandomMetrics() {
    return {
        fps: 20 + Math.random() * 10,           // FPS between 20-30
        accuracy: 85 + Math.random() * 10,      // Accuracy between 85-95%
        latency: 35 + Math.floor(Math.random() * 15), // Latency between 35-50ms
        status: Math.random() > 0.9 ? 'Warning' : 'Active', // 10% chance of Warning
        memory: 50 + Math.floor(Math.random() * 30), // Memory usage between 50-80%
        cpu: 30 + Math.floor(Math.random() * 40),    // CPU load between 30-70%
        drift: 5 + Math.floor(Math.random() * 15),   // Drift score between 5-20%
        gpu: 65 + Math.floor(Math.random() * 25)     // GPU utilization between 65-90%
    };
}

// Helper function to generate random detections
function generateRandomDetection() {
    const objects = ['Person', 'Vehicle', 'Animal', 'Bicycle', 'Package'];
    const locations = ['Zone A', 'Zone B', 'Zone C', 'Entrance', 'Exit'];
    const actions = ['Logged', 'Alert Triggered', 'None', 'Tracked'];
    
    return {
        object: objects[Math.floor(Math.random() * objects.length)],
        timestamp: new Date(),
        location: locations[Math.floor(Math.random() * locations.length)],
        confidence: 70 + Math.floor(Math.random() * 25), // 70-95%
        processingTime: 35 + Math.floor(Math.random() * 20), // 35-55ms
        action: actions[Math.floor(Math.random() * actions.length)]
    };
}

// Helper function to generate random alerts
function generateRandomAlert() {
    const alertTypes = ['info', 'warning', 'danger', 'success'];
    const alertTitles = [
        'Low Confidence Detection',
        'High Processing Time',
        'Model Drift Detected',
        'Memory Usage High',
        'Connection Latency Increased',
        'Unknown Object Detected',
        'System Update Available'
    ];
    
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const title = alertTitles[Math.floor(Math.random() * alertTitles.length)];
    
    // Generate message based on title
    let message = '';
    switch (title) {
        case 'Low Confidence Detection':
            message = `Detection confidence below ${Math.floor(Math.random() * 20 + 60)}% threshold.`;
            break;
        case 'High Processing Time':
            message = `Processing time increased to ${Math.floor(Math.random() * 30 + 50)}ms per frame.`;
            break;
        case 'Model Drift Detected':
            message = `Model drift score increased to ${Math.floor(Math.random() * 15 + 10)}%. Consider retraining.`;
            break;
        case 'Memory Usage High':
            message = `System memory usage at ${Math.floor(Math.random() * 20 + 80)}%.`;
            break;
        case 'Connection Latency Increased':
            message = `Network latency increased to ${Math.floor(Math.random() * 50 + 100)}ms.`;
            break;
        case 'Unknown Object Detected':
            message = `Unclassified object detected in Zone ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}.`;
            break;
        case 'System Update Available':
            message = `New system update v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)} available.`;
            break;
        default:
            message = 'System alert triggered.';
    }
    
    return { type, title, message };
}