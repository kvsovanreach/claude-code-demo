document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const loginMessage = document.getElementById('login-message');

    // Mock credentials - in a real app, these would be validated on the server
    const validCredentials = {
        username: 'admin',
        password: 'password123'
    };

    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Reset error messages
        usernameError.textContent = '';
        passwordError.textContent = '';
        loginMessage.textContent = '';
        
        // Validate username
        if (!usernameInput.value.trim()) {
            usernameError.textContent = 'Username is required';
            isValid = false;
        }
        
        // Validate password
        if (!passwordInput.value) {
            passwordError.textContent = 'Password is required';
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        return isValid;
    }

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Check credentials
            if (usernameInput.value === validCredentials.username && 
                passwordInput.value === validCredentials.password) {
                
                // Set user in session storage
                sessionStorage.setItem('user', JSON.stringify({
                    username: usernameInput.value,
                    isAuthenticated: true,
                    loginTime: new Date().toISOString()
                }));
                
                // Show success message and redirect
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.style.color = 'var(--success-color)';
                
                // Redirect to dashboard after a small delay
                setTimeout(function() {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Show error message
                loginMessage.textContent = 'Invalid username or password';
                loginMessage.style.color = 'var(--danger-color)';
                
                // Clear password field
                passwordInput.value = '';
            }
        }
    });

    // Add input event listeners to clear errors as user types
    usernameInput.addEventListener('input', function() {
        usernameError.textContent = '';
        loginMessage.textContent = '';
    });
    
    passwordInput.addEventListener('input', function() {
        passwordError.textContent = '';
        loginMessage.textContent = '';
    });

    // Check if user is already logged in
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.isAuthenticated) {
        window.location.href = 'dashboard.html';
    }
});