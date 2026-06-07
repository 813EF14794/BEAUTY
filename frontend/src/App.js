import React, { useState, useEffect } from 'react';
import './App.css';

// 🔌 Unga Live Backend Server URL.
const API_URL = 'http://localhost:5005/api';

function App() {
  // 🧭 Page view navigation indicators
  const [currentPage, setCurrentPage] = useState('home');
  
  // 🔔 Alert notification banner tracker
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // 👤 User state logging status matrix
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  // 💇 Dynamic services from backend database container
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // 📋 React Form State variables controller object
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', service: '', date: '', time: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  // Custom alert display controller
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  // 🔒 Route Protection: Login checks before opening booking screen
  const navigateToPage = (pageName) => {
    if (pageName === 'booking' && !localStorage.getItem('token')) {
      showAlert('Please login to get access to custom bookings!', 'danger');
      setCurrentPage('auth');
      return;
    }
    setCurrentPage(pageName);
  };

  // 🔄 Fetch dynamic listing from database backend
  useEffect(() => {
    if (currentPage === 'services') {
      setLoadingServices(true);
      fetch(`${API_URL}/services`)
        .then(res => res.json())
        .then(data => {
          setServices(data);
          setLoadingServices(false);
        })
        .catch(err => {
          console.error("Database connection issue:", err);
          setLoadingServices(false);
        });
    }
  }, [currentPage]);

  // 👤 Form submission: Register Account pipeline
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (res.status === 201) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        setIsLoggedIn(true);
        setUserName(data.user.name);
        showAlert('Registration Success! Welcome aboard.', 'success');
        setTimeout(() => setCurrentPage('booking'), 1500);
      } else {
        showAlert(data.message || 'Error occurred during signup', 'danger');
      }
    } catch (err) {
      showAlert('Cannot connect with backend server', 'danger');
    }
  };

  // 🔐 Form submission: Login credentials authentication
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.status === 200) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        setIsLoggedIn(true);
        setUserName(data.user.name);
        showAlert('Logged in successfully!', 'success');
        setTimeout(() => setCurrentPage('booking'), 1500);
      } else {
        showAlert(data.message || 'Invalid Credentials', 'danger');
      }
    } catch (err) {
      showAlert('Backend communications error', 'danger');
    }
  };

  // 📅 Form submission: Submit Appointment slot inside DB
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert('Access token expired. Please login again.', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingForm)
      });
      if (res.status === 201) {
        showAlert('Amazing! Your luxury treatment spot has been booked.', 'success');
        setBookingForm({ name: '', email: '', service: '', date: '', time: '' });
      } else {
        const data = await res.json();
        showAlert(data.message || 'Booking submission error', 'danger');
      }
    } catch (err) {
      showAlert('Server down, request aborted.', 'danger');
    }
  };

  // ✉️ Form submission: Support Message inbox
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.status === 201) {
        showAlert('Thank you! Your inquiry message has been recorded.', 'success');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        showAlert('Could not send message now.', 'danger');
      }
    } catch (err) {
      showAlert('Network communication drop.', 'danger');
    }
  };

  // 🚪 Account clear session routine logout
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
    setCurrentPage('home');
  };

  return (
    <div>
      {/* 🔔 Toast alerts dynamic render node header layer */}
      {alert.show && (
        <div className={`alert alert-${alert.type}`} style={{ display: 'block', position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10001, width: '90%', maxWidth: '600px' }}>
          {alert.message}
        </div>
      )}

      {/* 👑 FRONTEND MAIN NAVIGATION HEADER NAVBAR COMPONENT */}
      <header>
        <nav className="navbar">
          <div className="logo"><h2>Santhiya Elegance</h2></div>
          <ul className="nav-links">
            <li><button style={{background:'none', border:'none', fontSize:'1rem', cursor:'pointer'}} className={currentPage === 'home' ? 'active' : ''} onClick={() => navigateToPage('home')}>Home</button></li>
            <li><button style={{background:'none', border:'none', fontSize:'1rem', cursor:'pointer'}} className={currentPage === 'services' ? 'active' : ''} onClick={() => navigateToPage('services')}>Services</button></li>
            <li><button style={{background:'none', border:'none', fontSize:'1rem', cursor:'pointer'}} className={currentPage === 'booking' ? 'active' : ''} onClick={() => navigateToPage('booking')}>Book Appointment</button></li>
            <li><button style={{background:'none', border:'none', fontSize:'1rem', cursor:'pointer'}} className={currentPage === 'contact' ? 'active' : ''} onClick={() => navigateToPage('contact')}>Contact</button></li>
            <li id="authLink">
              {isLoggedIn ? (
                <button className="logout-btn" onClick={handleLogout}>Logout ({userName})</button>
              ) : (
                <button style={{background:'none', border:'none', fontSize:'1rem', cursor:'pointer'}} className={currentPage === 'auth' ? 'active' : ''} onClick={() => navigateToPage('auth')}>Login/Register</button>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* 🏠 DISPLAY LAYOUT 1: HOME PANEL */}
      {currentPage === 'home' && (
        <div>
          <section className="hero-image-only">
            <button className="hero-center-btn" onClick={() => navigateToPage('booking')}>Book Now</button>
          </section>
          <section>
            <h2 className="section-title">Our Masterpieces</h2>
            <div className="grid">
              <div className="card">
                <div className="card-img"><img src={process.env.PUBLIC_URL + '/image/B1.jpeg'} alt="Makeup" /></div>
                <div className="card-content">
                  <h3>Exquisite Makeup</h3>
                  <p>Professional glam setups for weddings, parties, and corporate events.</p>
                </div>
              </div>
              <div className="card">
                <div className="card-img"><img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500" alt="Spa" /></div>
                <div className="card-content">
                  <h3>Relaxing Oasis Spa</h3>
                  <p>Melt your anxiety away with our luxury aromatherapy treatments.</p>
                </div>
              </div>
              <div className="card">
                <div className="card-img"><img src={process.env.PUBLIC_URL + '/image/haircut.jpg.jpeg'} alt="Haircut" /></div>
                <div className="card-content">
                  <h3>Vogue Haircuts</h3>
                  <p>Modern styles, global hair coloring, and advanced care textures.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 💇 DISPLAY LAYOUT 2: SERVICES PORTFOLIO SYSTEM FEED */}
      {currentPage === 'services' && (
        <section>
          <h2 className="section-title">Our Premium Treatments</h2>
          {loadingServices ? (
            <p style={{ textAlign: 'center' }}>Synchronizing premium catalogue database...</p>
          ) : (
            <div className="grid">
              {services.length === 0 ? (
                <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No services available from database active tables.</p>
              ) : (
                services.map((item, index) => (
                  <div className="card" key={index}>
                    <div className="card-img"><img src={item.image} alt={item.title} /></div>
                    <div className="card-content">
                      <h3>{item.title}</h3>
                      <p>Duration: {item.duration}</p>
                      <span className="price">{item.price}</span><br />
                      <button className="btn" style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.9rem', padding: '8px 20px' }} onClick={() => navigateToPage('booking')}>Book Now</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* 📅 DISPLAY LAYOUT 3: SECURE BOOKING FORM GRID */}
      {currentPage === 'booking' && (
        <section>
          <h2 className="section-title">Reserve Your Luxury Session</h2>
          <div className="form-container">
            <form id="bookingForm" onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={bookingForm.name} onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={bookingForm.email} onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Select Treatment</label>
                <select className="form-control" value={bookingForm.service} onChange={(e) => setBookingForm({...bookingForm, service: e.target.value})} required>
                  <option value="">-- Choose a Service --</option>
                  <option value="Glamour Makeup">Glamour Makeup</option>
                  <option value="Luxury Spa Treatment">Luxury Spa Treatment</option>
                  <option value="Trendy Haircut & Style">Trendy Haircut & Style</option>
                  <option value="Deep Cleansing Facial">Deep Cleansing Facial</option>
                  <option value="Royal Bridal Package">Royal Bridal Package</option>
                </select>
              </div>
              <div className="form-group">
                <label>Appointment Date</label>
                <input type="date" className="form-control" value={bookingForm.date} onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <input type="time" className="form-control" value={bookingForm.time} onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})} required />
              </div>
              <button type="submit" className="btn" style={{ width: '100%' }}>Confirm Secure Booking</button>
            </form>
          </div>
        </section>
      )}

      {/* 🔐 DISPLAY LAYOUT 4: ACCESS AUTH CONTROL PORTAL */}
      {currentPage === 'auth' && (
        <section>
          <div className="auth-wrapper">
            <div className="form-container" style={{ margin: 0 }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--dark-pink)' }}>Welcome Back (Login)</h3>
              <form id="loginForm" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Email address</label>
                  <input type="email" className="form-control" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} required />
                </div>
                <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
              </form>
            </div>

            <div className="form-container" style={{ margin: 0 }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--dark-pink)' }}>Create Account (Register)</h3>
              <form id="registerForm" onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-control" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} required />
                </div>
                <button type="submit" className="btn" style={{ width: '100%' }}>Sign Up</button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* 📞 DISPLAY LAYOUT 5: FEEDBACK MESSAGES SUPPORT INBOX */}
      {currentPage === 'contact' && (
        <section>
          <h2 className="section-title">Drop Us A Message</h2>
          <div className="form-container">
            <form id="contactForm" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" className="form-control" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input type="email" className="form-control" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control" rows="5" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} required></textarea>
              </div>
              <button type="submit" className="btn" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </section>
      )}

      <footer>
        <p>&copy; 2026 Santhiya Beauty Parlour. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;