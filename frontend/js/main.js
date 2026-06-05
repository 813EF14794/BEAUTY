const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbarState();

    // Check if on services view
    if (document.getElementById('servicesContainer')) {
        fetchServices();
    }

    // Contact Form Listener
    if (document.getElementById('contactForm')) {
        document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);
    }

    // Registration Form Listener
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);
    }

    // Login Form Listener
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    }

    // Appointment Booking Form Listener
    if (document.getElementById('bookingForm')) {
        // Redirection security wall
        if (!localStorage.getItem('token')) {
            showAlert('Please login to get access to custom bookings!', 'danger');
            setTimeout(() => window.location.href = 'auth.html', 2000);
        }
        document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    }
});

// Update authentication dynamic options in Navbar header
function updateNavbarState() {
    const authLinkElement = document.getElementById('authLink');
    if (!authLinkElement) return;

    if (localStorage.getItem('token')) {
        authLinkElement.innerHTML = `<button class="logout-btn" onclick="logout()">Logout (${localStorage.getItem('userName')})</button>`;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Display visual notifications on active layouts
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { alertBox.style.display = 'none'; }, 5000);
}

// API Connection: Fetch dynamic services portfolio
async function fetchServices() {
    try {
        const response = await fetch(`${API_URL}/services`);
        const services = await response.json();
        const container = document.getElementById('servicesContainer');
        container.innerHTML = '';

        services.forEach(item => {
            container.innerHTML += `
                <div class="card">
                    <div class="card-img"><img src="${item.image}" alt="${item.title}"></div>
                    <div class="card-content">
                        <h3>${item.title}</h3>
                        <p>Duration: ${item.duration}</p>
                        <span class="price">${item.price}</span><br>
                        <a href="booking.html" class="btn" style="display:inline-block; margin-top:10px; font-size:0.9rem; padding:8px 20px;">Book Now</a>
                    </div>
                </div>`;
        });
    } catch (err) {
        document.getElementById('servicesContainer').innerHTML = '<p style="color:red; text-align:center;">Could not fetch services at this moment.</p>';
    }
}

// API Connection: Sign up management
async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('rName').value;
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.status === 201) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            showAlert('Registration Success! Welcome aboard.', 'success');
            setTimeout(() => window.location.href = 'booking.html', 1500);
        } else {
            showAlert(data.message || 'Error occurred', 'danger');
        }
    } catch (err) {
        showAlert('Server communication issue', 'danger');
    }
}

// API Connection: Login authentication tracking
async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('lEmail').value;
    const password = document.getElementById('lPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.status === 200) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            showAlert('Logged in successfully!', 'success');
            setTimeout(() => window.location.href = 'booking.html', 1500);
        } else {
            showAlert(data.message || 'Invalid Credentials', 'danger');
        }
    } catch (err) {
        showAlert('Server communication issue', 'danger');
    }
}

// API Connection: Submit protected booked slot
async function handleBookingSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('Access token expired. Please login again.', 'danger');
        return;
    }

    const bookingData = {
        name: document.getElementById('bName').value,
        email: document.getElementById('bEmail').value,
        service: document.getElementById('bService').value,
        date: document.getElementById('bDate').value,
        time: document.getElementById('bTime').value
    };

    try {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        const data = await res.json();
        if (res.status === 201) {
            showAlert('Amazing! Your luxury treatment spot has been booked.', 'success');
            document.getElementById('bookingForm').reset();
        } else {
            showAlert(data.message || 'Booking submission error', 'danger');
        }
    } catch (err) {
        showAlert('Server connection down.', 'danger');
    }
}

// API Connection: Submit feedback / Support messages
async function handleContactSubmit(e) {
    e.preventDefault();
    const contactData = {
        name: document.getElementById('cName').value,
        email: document.getElementById('cEmail').value,
        message: document.getElementById('cMessage').value
    };

    try {
        const res = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        if (res.status === 201) {
            showAlert('Thank you! Your inquiry message has been recorded.', 'success');
            document.getElementById('contactForm').reset();
        } else {
            showAlert('Could not send message now.', 'danger');
        }
    } catch (err) {
        showAlert('Server connectivity error.', 'danger');
    }
}