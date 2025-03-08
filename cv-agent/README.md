# AI Agent Dashboard

A responsive dashboard for an AI-powered Agentic Tool. This dashboard helps users manage real-time inference results, display performance metrics, configure model settings, and provide feedback.

## Features

- **Real-time Monitoring**: Track performance metrics, status, and alerts in real-time.
- **Live Inference**: View video feed with overlay of object detection and tracking results.
- **Performance Analytics**: Interactive charts showing accuracy, FPS, and latency over time.
- **Configurable Settings**: Adjust model parameters, thresholds, and processing options.
- **Feedback System**: Submit feedback on detection accuracy for model improvement.
- **Responsive Design**: Works on both desktop and mobile devices.

## Technologies Used

- HTML5, CSS3, JavaScript
- Chart.js for data visualization
- Socket.io for real-time communication
- Express.js for the server

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-agent-dashboard.git
   cd ai-agent-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   For development with automatic restart:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Login Credentials

For demonstration purposes, use the following credentials:
- Username: `admin`
- Password: `password123`

## Project Structure

```
ai-agent-dashboard/
├── public/                  # Client-side files
│   ├── assets/
│   │   ├── css/             # CSS stylesheets
│   │   ├── js/              # JavaScript files
│   │   └── images/          # Image assets
│   ├── index.html           # Login page
│   └── dashboard.html       # Main dashboard page
├── server/                  # Server-side files
│   └── server.js            # Express server with Socket.io
└── package.json             # Project configuration
```

## Customization

### Connecting to Your AI Model

To connect this dashboard to your actual AI model:

1. Modify the server code in `server/server.js` to connect to your model API or service.
2. Update the Socket.io events to match your model's data format and events.
3. Adjust the frontend code in `public/assets/js/dashboard.js` to handle your specific data format.

### Styling

The dashboard uses CSS variables for theming. You can change the color scheme by modifying the variables in `public/assets/css/style.css`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.