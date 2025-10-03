// Update current time and date
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime();

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const sectionId = this.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
        
        // Update page title
        const sectionTitle = this.querySelector('span:last-child').textContent;
        document.getElementById('page-title').textContent = sectionTitle;
    });
});

function showConfirm(message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    const msg = document.getElementById("confirmMessage");
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    msg.textContent = message;
    modal.style.display = "flex";

    // Remove old event listeners
    yesBtn.onclick = null;
    noBtn.onclick = null;

    yesBtn.onclick = () => {
        modal.style.display = "none";
        onConfirm();
    };

    noBtn.onclick = () => {
        modal.style.display = "none";
    };
}

// Check-in/Check-out functionality
let isCheckedIn = false;
let checkInTime = null;
let checkOutTime = null;

function handleCheckIn() {
    if (!isCheckedIn) {
        showConfirm("Are you sure you want to check in now?", () => {
            isCheckedIn = true;
            checkInTime = new Date();
            
            const timeString = checkInTime.toLocaleTimeString('en-US', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        
        document.getElementById('checkin-time').textContent = timeString;
        document.getElementById('status-text').textContent = 'Checked In';
        document.getElementById('status-indicator').classList.add('checked-in');
        
        // Disable check-in button and enable check-out button
        document.getElementById('checkin-btn').disabled = true;
        document.getElementById('checkout-btn').disabled = false;
        
        // Show success message
        //alert('✓ Successfully checked in at ' + timeString);
    });
    }
}

function handleCheckOut() {
    if (isCheckedIn) {
        showConfirm("Are you sure you want to check out now?", () => {
            checkOutTime = new Date();
            
            const timeString = checkOutTime.toLocaleTimeString('en-US', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        
        document.getElementById('checkout-time').textContent = timeString;
        document.getElementById('status-text').textContent = 'Checked Out';
        document.getElementById('status-indicator').classList.remove('checked-in');
        
        // Calculate work hours
        const workHours = Math.floor((checkOutTime - checkInTime) / (1000 * 60 * 60));
        const workMinutes = Math.floor(((checkOutTime - checkInTime) % (1000 * 60 * 60)) / (1000 * 60));
        
        // Disable check-out button
        document.getElementById('checkout-btn').disabled = true;
        
        // Show success message
        //alert(`✓ Successfully checked out at ${timeString}\nTotal work time: ${workHours}h ${workMinutes}m`);
        
        // Reset for next day (in real app, this would be handled by backend)
        isCheckedIn = false;
    });
    }
}

// Logout functionality
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logging out... Goodbye! 👋');
        // In a real application, this would redirect to login page
        // window.location.href = '/login';
    }
}

// Profile Edit Functions
function toggleEditMode() {
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';
}

function cancelEdit() {
    document.getElementById('profile-edit').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
}

// Profile Photo Upload Preview
document.getElementById('profile-photo-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photo-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Profile Form Submission
document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const phone = document.getElementById('edit-phone').value;
    const dob = document.getElementById('edit-dob').value;
    const emergencyName = document.getElementById('edit-emergency-name').value;
    const emergencyRelation = document.getElementById('edit-emergency-relation').value;
    const emergencyPhone = document.getElementById('edit-emergency-phone').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate password change if fields are filled
    if (newPassword || confirmPassword) {
        if (!currentPassword) {
            alert('Please enter your current password to change your password.');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (newPassword.length < 8) {
            alert('New password must be at least 8 characters long.');
            return;
        }
    }
    
    // Update display values
    document.getElementById('display-phone').textContent = phone;
    
    // Format and display date of birth
    const dobDate = new Date(dob);
    const dobFormatted = dobDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('display-dob').textContent = dobFormatted;
    
    document.getElementById('display-emergency-name').textContent = emergencyName;
    document.getElementById('display-emergency-relation').textContent = emergencyRelation;
    document.getElementById('display-emergency-phone').textContent = emergencyPhone;
    
    // Update profile photo if changed
    const photoPreview = document.getElementById('photo-preview').src;
    document.getElementById('profile-photo-display').src = photoPreview;
    
    // Show success message
    alert('✓ Profile updated successfully!');
    
    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    // Switch back to view mode
    cancelEdit();
});

// Chat functionality
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message) {
        const messagesContainer = document.getElementById('chat-messages');
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        const messageHTML = `
            <div class="message">
                <div class="message-avatar">SJ</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">Sarah Johnson</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        input.value = '';
    }
}

// Allow sending message with Enter key
document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Leave form submission
document.querySelector('.leave-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('✓ Leave request submitted successfully! Your manager will review it shortly.');
    this.reset();
});