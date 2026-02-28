// public/js/auth.js

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Show loading spinner
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Authenticating...';
        loginError.classList.add('d-none');

        try {
            // Send the email and password to our secure Node.js server
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success! Save the ticket and go to the dashboard
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userName', data.email);
                
                // Set roles 
                if (email === "fanolaboratory@gmail.com") {
                    localStorage.setItem('userRole', 'admin');
                } else {
                    localStorage.setItem('userRole', 'staff');
                }

                window.location.href = 'dashboard.html';
            } else {
                // Wrong password
                loginError.textContent = data.error || "Invalid email or password.";
                loginError.classList.remove('d-none');
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'SIGN IN';
            }
        } catch (error) {
            console.error("Connection error:", error);
            loginError.textContent = "Cannot connect to the server.";
            loginError.classList.remove('d-none');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'SIGN IN';
        }
    });
}