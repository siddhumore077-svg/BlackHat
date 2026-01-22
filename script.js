/* ============================================
   MAIN JAVASCRIPT FILE
   ============================================ */

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize localStorage with demo data if needed
    initializeStorageIfEmpty();
}

// Initialize localStorage with default data
function initializeStorageIfEmpty() {
    if (!localStorage.getItem('users')) {
        const demoUsers = [
            {
                id: 1,
                fullName: 'John Doe',
                email: 'customer@demo.com',
                phone: '9876543210',
                address: '123 Main Street',
                password: 'password123',
                role: 'customer',
                registeredDate: new Date().toISOString()
            },
            {
                id: 2,
                businessName: 'Quick Plumbing Services',
                ownerName: 'Mike Smith',
                email: 'plumber@demo.com',
                phone: '9111111111',
                serviceType: 'Plumbing',
                address: '456 Service St',
                password: 'password123',
                role: 'provider',
                registeredDate: new Date().toISOString(),
                rating: 4.5,
                completedRequests: 12
            },
            {
                id: 3,
                businessName: 'Bright Electrical Works',
                ownerName: 'Sarah Johnson',
                email: 'electrician@demo.com',
                phone: '9222222222',
                serviceType: 'Electrical',
                address: '789 Electric Ave',
                password: 'password123',
                role: 'provider',
                registeredDate: new Date().toISOString(),
                rating: 4.8,
                completedRequests: 25
            },
            {
                id: 4,
                businessName: 'Master Carpenter',
                ownerName: 'David Lee',
                email: 'carpenter@demo.com',
                phone: '9333333333',
                serviceType: 'Carpentry',
                address: '321 Wood Lane',
                password: 'password123',
                role: 'provider',
                registeredDate: new Date().toISOString(),
                rating: 4.6,
                completedRequests: 18
            }
        ];
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    if (!localStorage.getItem('requests')) {
        const demoRequests = [
            {
                id: 100,
                customerId: 1,
                customerName: 'John Doe',
                serviceType: 'Plumbing',
                description: 'Leaky faucet in kitchen needs repair',
                priority: 'High',
                phone: '9876543210',
                address: '123 Main Street',
                preferredDate: '2026-02-15',
                budget: 500,
                status: 'In Progress',
                assignedProviderId: 2,
                assignedProviderName: 'Quick Plumbing Services',
                createdDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
                updatedDate: new Date(Date.now() - 1*24*60*60*1000).toISOString()
            }
        ];
        localStorage.setItem('requests', JSON.stringify(demoRequests));
    }
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

function isUserLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}

// ============================================
// DATA MANAGEMENT
// ============================================

function saveRequest(request) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const index = requests.findIndex(r => r.id === request.id);
    
    if (index >= 0) {
        requests[index] = request;
    } else {
        requests.push(request);
    }
    
    localStorage.setItem('requests', JSON.stringify(requests));
}

function getRequestById(id) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    return requests.find(r => r.id === id);
}

function getRequestsByCustomerId(customerId) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    return requests.filter(r => r.customerId === customerId);
}

function getRequestsByProviderId(providerId) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    return requests.filter(r => r.assignedProviderId === providerId);
}

function getAvailableRequests(serviceType) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    return requests.filter(r => 
        r.serviceType === serviceType && 
        r.status === 'Pending' &&
        !r.assignedProviderId
    );
}

// ============================================
// FORM VALIDATION
// ============================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\d{10}$/;
    return re.test(phone.replace(/\D/g, ''));
}

function validatePassword(password) {
    return password.length >= 6;
}

// ============================================
// UI HELPERS
// ============================================

function showAlert(message, type = 'success') {
    const alertId = type === 'success' ? 'successMsg' : 'errorMsg';
    const alertEl = document.getElementById(alertId);
    if (alertEl) {
        alertEl.textContent = message;
        alertEl.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                alertEl.style.display = 'none';
            }, 5000);
        }
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// REQUEST STATUS MANAGEMENT
// ============================================

function updateRequestStatus(requestId, newStatus) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
        request.status = newStatus;
        request.updatedDate = new Date().toISOString();
        
        // Update provider stats if completed
        if (newStatus === 'Completed') {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const provider = users.find(u => u.id === request.assignedProviderId);
            if (provider) {
                provider.completedRequests = (provider.completedRequests || 0) + 1;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
        
        localStorage.setItem('requests', JSON.stringify(requests));
        return true;
    }
    return false;
}

function assignRequestToProvider(requestId, providerId, providerName) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
        request.assignedProviderId = providerId;
        request.assignedProviderName = providerName;
        request.status = 'Accepted';
        request.updatedDate = new Date().toISOString();
        
        localStorage.setItem('requests', JSON.stringify(requests));
        return true;
    }
    return false;
}

// ============================================
// SEARCH AND FILTER
// ============================================

function searchRequests(requests, query) {
    if (!query) return requests;
    
    const lower = query.toLowerCase();
    return requests.filter(r => 
        r.serviceType.toLowerCase().includes(lower) ||
        r.customerName.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower)
    );
}

function filterRequestsByStatus(requests, status) {
    if (!status) return requests;
    return requests.filter(r => r.status === status);
}

// ============================================
// LOCAL STORAGE EXPORT/IMPORT
// ============================================

function exportData() {
    const data = {
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        requests: JSON.parse(localStorage.getItem('requests') || '[]')
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'servicehub-data.json';
    a.click();
}

function resetData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('users');
        localStorage.removeItem('requests');
        localStorage.removeItem('currentUser');
        location.reload();
    }
}

// ============================================
// STATISTICS
// ============================================

function getProviderStats(providerId) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const providerRequests = requests.filter(r => r.assignedProviderId === providerId);
    
    return {
        total: providerRequests.length,
        active: providerRequests.filter(r => r.status === 'Accepted' || r.status === 'In Progress').length,
        completed: providerRequests.filter(r => r.status === 'Completed').length,
        pending: providerRequests.filter(r => r.status === 'Pending').length
    };
}

function getCustomerStats(customerId) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const customerRequests = requests.filter(r => r.customerId === customerId);
    
    return {
        total: customerRequests.length,
        pending: customerRequests.filter(r => r.status === 'Pending').length,
        accepted: customerRequests.filter(r => r.status === 'Accepted').length,
        inProgress: customerRequests.filter(r => r.status === 'In Progress').length,
        completed: customerRequests.filter(r => r.status === 'Completed').length
    };
}

// ============================================
// ANIMATION & EFFECTS
// ============================================

// Smooth scroll on navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add fade-in animation to elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize fade-in for cards
document.querySelectorAll('.service-card, .feature-item, .request-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getServiceIcon(serviceType) {
    const icons = {
        'Plumbing': '🔧',
        'Electrical': '⚡',
        'Carpentry': '🪜',
        'Painting': '🎨',
        'Cleaning': '🧹',
        'Maintenance': '🚪'
    };
    return icons[serviceType] || '🛠️';
}

function getStatusColor(status) {
    const colors = {
        'Pending': '#FFC107',
        'Accepted': '#2196F3',
        'In Progress': '#FF9800',
        'Completed': '#4CAF50',
        'Cancelled': '#f87171'
    };
    return colors[status] || '#9CA3AF';
}

// ============================================
// LOGGING & DEBUGGING
// ============================================

function logData(label) {
    console.log(label);
    console.log('Users:', JSON.parse(localStorage.getItem('users') || '[]'));
    console.log('Requests:', JSON.parse(localStorage.getItem('requests') || '[]'));
    console.log('Current User:', JSON.parse(localStorage.getItem('currentUser') || 'null'));
}

// Expose for console debugging
window.ServiceHub = {
    logData,
    exportData,
    resetData,
    getCurrentUser,
    getProviderStats,
    getCustomerStats
};
