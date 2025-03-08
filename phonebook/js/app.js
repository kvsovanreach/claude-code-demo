// DOM Elements
const contactForm = document.getElementById('contactForm');
const contactsList = document.getElementById('contactsList');
const searchInput = document.getElementById('searchInput');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const contactIdInput = document.getElementById('contactId');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const phoneError = document.getElementById('phoneError');
const emailError = document.getElementById('emailError');

// Variables
let contacts = [];
let isEditing = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', loadContacts);
contactForm.addEventListener('submit', saveContact);
cancelBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', filterContacts);
phoneInput.addEventListener('input', validatePhone);
emailInput.addEventListener('input', validateEmail);

// Load contacts from JSON file or localStorage
async function loadContacts() {
    try {
        // First try to load from localStorage
        const storedContacts = localStorage.getItem('contacts');
        
        if (storedContacts) {
            contacts = JSON.parse(storedContacts);
            renderContacts(contacts);
            return;
        }
        
        // If not in localStorage, try to load from JSON file
        const response = await fetch('contacts.json');
        if (!response.ok) {
            throw new Error('Failed to load contacts');
        }
        
        contacts = await response.json();
        
        // Store in localStorage for future use
        localStorage.setItem('contacts', JSON.stringify(contacts));
        
        renderContacts(contacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
        
        // If both localStorage and JSON file fail, start with empty contacts
        contacts = [];
        renderContacts(contacts);
    }
}

// Save contacts to localStorage
function saveContactsToStorage() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Render contacts list
function renderContacts(contactsToRender) {
    contactsList.innerHTML = '';
    
    if (contactsToRender.length === 0) {
        contactsList.innerHTML = '<p>No contacts found.</p>';
        return;
    }
    
    contactsToRender.forEach(contact => {
        const contactCard = document.createElement('div');
        contactCard.classList.add('contact-card');
        contactCard.dataset.id = contact.id;
        
        contactCard.innerHTML = `
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-details">
                    <div>${contact.phone}</div>
                    <div>${contact.email}</div>
                </div>
            </div>
            <div class="contact-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // Add event listeners for edit and delete buttons
        const editBtn = contactCard.querySelector('.edit-btn');
        const deleteBtn = contactCard.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => editContact(contact.id));
        deleteBtn.addEventListener('click', () => deleteContact(contact.id));
        
        contactsList.appendChild(contactCard);
    });
}

// Save or update contact
function saveContact(e) {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) {
        return;
    }
    
    const contact = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim()
    };
    
    if (isEditing) {
        // Update existing contact
        const id = parseInt(contactIdInput.value);
        contact.id = id;
        
        const index = contacts.findIndex(c => c.id === id);
        if (index !== -1) {
            contacts[index] = contact;
        }
    } else {
        // Add new contact
        contact.id = generateId();
        contacts.push(contact);
    }
    
    // Save to localStorage
    saveContactsToStorage();
    
    // Reset form and render updated contacts
    resetForm();
    renderContacts(contacts);
}

// Generate a unique ID for new contacts
function generateId() {
    return contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
}

// Edit contact
function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    
    // Fill form with contact details
    contactIdInput.value = contact.id;
    nameInput.value = contact.name;
    phoneInput.value = contact.phone;
    emailInput.value = contact.email;
    
    // Change UI to editing mode
    saveBtn.textContent = 'Update Contact';
    isEditing = true;
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

// Delete contact
function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        contacts = contacts.filter(c => c.id !== id);
        
        // Save to localStorage
        saveContactsToStorage();
        
        // If currently editing this contact, reset form
        if (isEditing && parseInt(contactIdInput.value) === id) {
            resetForm();
        }
        
        // Animate removal
        const contactCard = document.querySelector(`.contact-card[data-id="${id}"]`);
        contactCard.style.opacity = '0';
        contactCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            renderContacts(contacts);
        }, 300);
    }
}

// Reset form
function resetForm() {
    contactForm.reset();
    contactIdInput.value = '';
    saveBtn.textContent = 'Save Contact';
    isEditing = false;
    phoneError.textContent = '';
    emailError.textContent = '';
}

// Filter contacts based on search input
function filterContacts() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        renderContacts(contacts);
        return;
    }
    
    const filteredContacts = contacts.filter(contact => {
        return (
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.phone.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm)
        );
    });
    
    renderContacts(filteredContacts);
}

// Validate phone number format
function validatePhone() {
    const phone = phoneInput.value.trim();
    const phoneRegex = /^[\d\s\-()+]{10,15}$/;
    
    if (!phone) {
        phoneError.textContent = 'Phone number is required';
        return false;
    }
    
    if (!phoneRegex.test(phone)) {
        phoneError.textContent = 'Please enter a valid phone number';
        return false;
    }
    
    phoneError.textContent = '';
    return true;
}

// Validate email format
function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        emailError.textContent = 'Email is required';
        return false;
    }
    
    if (!emailRegex.test(email)) {
        emailError.textContent = 'Please enter a valid email address';
        return false;
    }
    
    emailError.textContent = '';
    return true;
}

// Form validation
function validateForm() {
    const isPhoneValid = validatePhone();
    const isEmailValid = validateEmail();
    
    // Validate name
    if (!nameInput.value.trim()) {
        return false;
    }
    
    return isPhoneValid && isEmailValid;
}