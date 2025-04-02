
// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
  }

  // Scroll to Top Button
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  const getStartedBtn = document.getElementById('get-started-btn');
  
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function() {
      document.getElementById('reminders').scrollIntoView({
        behavior: 'smooth'
      });
    });
  }

  // Notification System
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  const notificationClose = document.querySelector('.notification-close');
  
  if (notificationClose) {
    notificationClose.addEventListener('click', function() {
      hideNotification();
    });
  }

  function showNotification(message) {
    if (notificationMessage) {
      notificationMessage.textContent = message;
      notification.classList.add('show');
      
      // Auto hide after 5 seconds
      setTimeout(hideNotification, 5000);
    }
  }

  function hideNotification() {
    notification.classList.remove('show');
  }

  // Birthday Management System
  const birthdayForm = document.getElementById('birthday-form');
  const birthdayList = document.getElementById('birthday-list');
  
  // Load birthdays from localStorage
  let birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
  
  // Render birthdays
  renderBirthdays();
  
  if (birthdayForm) {
    birthdayForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('name');
      const birthDateInput = document.getElementById('birth-date');
      const relationInput = document.getElementById('relation');
      const remindDaysInput = document.getElementById('remind-days');
      
      if (nameInput && birthDateInput && relationInput && remindDaysInput) {
        const newBirthday = {
          id: Date.now(),
          name: nameInput.value,
          birthDate: birthDateInput.value,
          relation: relationInput.value,
          remindDays: remindDaysInput.value
        };
        
        birthdays.push(newBirthday);
        saveBirthdays();
        renderBirthdays();
        
        birthdayForm.reset();
        showNotification(`Birthday for ${newBirthday.name} added successfully!`);
        // Update gift dropdown options
        updateGiftPersonOptions();
        
        // Show confetti for celebration
        createConfetti();
      }
    });
  }
  
  function renderBirthdays() {
    if (!birthdayList) return;
    
    birthdayList.innerHTML = '';
    
    if (birthdays.length === 0) {
      birthdayList.innerHTML = '<p class="text-center">No birthdays added yet. Add your first birthday above!</p>';
      return;
    }
    
    // Sort birthdays by upcoming date
    birthdays.sort((a, b) => {
      return getNextBirthdayDays(a.birthDate) - getNextBirthdayDays(b.birthDate);
    });
    
    birthdays.forEach(birthday => {
      const daysUntil = getNextBirthdayDays(birthday.birthDate);
      const birthdayDate = new Date(birthday.birthDate);
      const month = birthdayDate.toLocaleString('default', { month: 'long' });
      const day = birthdayDate.getDate();
      
      const birthdayItem = document.createElement('div');
      birthdayItem.classList.add('birthday-item');
      birthdayItem.innerHTML = `
        <div class="birthday-info">
          <h4>${birthday.name}</h4>
          <p>${month} ${day} • ${birthday.relation}</p>
          <p class="days-until">${daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : daysUntil + ' days away'}</p>
        </div>
        <div class="birthday-actions">
          <button class="edit-btn" data-id="${birthday.id}"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${birthday.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      birthdayList.appendChild(birthdayItem);
      
      // Highlight today's birthdays
      if (daysUntil === 0) {
        birthdayItem.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
        birthdayItem.style.borderLeft = '4px solid var(--primary-color)';
      }
    });
    
    // Add delete event listeners
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        deleteBirthday(id);
      });
    });
    
    // Check for upcoming birthdays and show notifications
    checkForUpcomingBirthdays();
  }
  
  function saveBirthdays() {
    localStorage.setItem('birthdays', JSON.stringify(birthdays));
  }
  
  function deleteBirthday(id) {
    const birthdayToDelete = birthdays.find(b => b.id === id);
    birthdays = birthdays.filter(birthday => birthday.id !== id);
    saveBirthdays();
    renderBirthdays();
    showNotification(`Birthday for ${birthdayToDelete.name} removed.`);
    // Update gift dropdown options
    updateGiftPersonOptions();
  }
  
  function getNextBirthdayDays(birthDateStr) {
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    
    // Set birth date to this year
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    
    // If birthday has passed this year, set to next year
    if (today > thisYearBirthday) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    // Calculate days difference
    const diffTime = thisYearBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  function checkForUpcomingBirthdays() {
    const today = new Date();
    
    birthdays.forEach(birthday => {
      const daysUntil = getNextBirthdayDays(birthday.birthDate);
      const remindDays = parseInt(birthday.remindDays);
      
      // Check if we should show a notification
      if (daysUntil === remindDays) {
        const notificationShown = localStorage.getItem(`notification_${birthday.id}_${today.toDateString()}`);
        
        if (!notificationShown) {
          showNotification(`Reminder: ${birthday.name}'s birthday is in ${daysUntil} days!`);
          localStorage.setItem(`notification_${birthday.id}_${today.toDateString()}`, 'true');
        }
      }
    });
  }

  // Gift Management System
  const giftForm = document.getElementById('gift-form');
  const giftIdeasList = document.getElementById('gift-ideas-list');
  const giftForSelect = document.getElementById('gift-for');
  
  // Load gifts from localStorage
  let gifts = JSON.parse(localStorage.getItem('gifts')) || [];
  
  // Update select options
  updateGiftPersonOptions();
  
  // Render gifts
  renderGifts();
  
  if (giftForm) {
    giftForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const giftNameInput = document.getElementById('gift-name');
      const giftForInput = document.getElementById('gift-for');
      const giftPriceInput = document.getElementById('gift-price');
      const giftUrlInput = document.getElementById('gift-url');
      
      if (giftNameInput && giftForInput) {
        const newGift = {
          id: Date.now(),
          name: giftNameInput.value,
          for: giftForInput.value,
          price: giftPriceInput ? giftPriceInput.value : '',
          url: giftUrlInput ? giftUrlInput.value : ''
        };
        
        gifts.push(newGift);
        saveGifts();
        renderGifts();
        
        giftForm.reset();
        showNotification('Gift idea saved successfully!');
      }
    });
  }
  
  function updateGiftPersonOptions() {
    if (!giftForSelect) return;
    
    // Clear existing options
    while (giftForSelect.options.length > 1) {
      giftForSelect.remove(1);
    }
    
    // Add new options based on saved birthdays
    birthdays.forEach(birthday => {
      const option = document.createElement('option');
      option.value = birthday.id;
      option.textContent = birthday.name;
      giftForSelect.appendChild(option);
    });
  }
  
  function renderGifts() {
    if (!giftIdeasList) return;
    
    giftIdeasList.innerHTML = '';
    
    if (gifts.length === 0) {
      giftIdeasList.innerHTML = '<p class="text-center">No gift ideas saved yet. Add your first gift idea above!</p>';
      return;
    }
    
    gifts.forEach(gift => {
      const person = birthdays.find(b => b.id === parseInt(gift.for));
      const personName = person ? person.name : 'Unknown';
      
      const giftItem = document.createElement('div');
      giftItem.classList.add('gift-idea');
      giftItem.innerHTML = `
        <h4>${gift.name}</h4>
        <p>For: ${personName}</p>
        ${gift.price ? `<p>Price: $${gift.price}</p>` : ''}
        ${gift.url ? `<a href="${gift.url}" target="_blank" rel="noopener noreferrer">View Item <i class="fas fa-external-link-alt"></i></a>` : ''}
        <button class="remove-gift" data-id="${gift.id}">Remove</button>
      `;
      
      giftIdeasList.appendChild(giftItem);
    });
    
    // Add delete event listeners
    const removeButtons = document.querySelectorAll('.remove-gift');
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        deleteGift(id);
      });
    });
  }
  
  function saveGifts() {
    localStorage.setItem('gifts', JSON.stringify(gifts));
  }
  
  function deleteGift(id) {
    gifts = gifts.filter(gift => gift.id !== id);
    saveGifts();
    renderGifts();
    showNotification('Gift idea removed.');
  }

  // Audio Player
  const audioElement = document.getElementById('audio-element');
  const playButtons = document.querySelectorAll('.play-btn');
  const songs = document.querySelectorAll('.song');
  
  playButtons.forEach(button => {
    button.addEventListener('click', function() {
      const songFile = this.getAttribute('data-song');
      
      // For demo purposes, we'll just show a notification since we don't have actual audio files
      showNotification(`Playing ${songFile}`);
      
      // Reset all songs' active state
      songs.forEach(song => {
        song.classList.remove('active');
      });
      
      // Set this song as active
      this.closest('.song').classList.add('active');
      
      // In a real implementation, you would:
      // 1. Set the audio source
      // audioElement.src = `audio/${songFile}`;
      // 2. Play the audio
      // audioElement.play();
    });
  });

  // Confetti Animation
  function createConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    const colors = ['#ff6b6b', '#5e60ce', '#ffbe0b', '#64dfdf', '#ff9770'];
    
    for (let i = 0; i < 100; i++) {
      createConfettiPiece(confettiContainer, colors);
    }
    
    // Remove confetti after animation completes
    setTimeout(() => {
      confettiContainer.innerHTML = '';
    }, 3000);
  }
  
  function createConfettiPiece(container, colors) {
    const confetti = document.createElement('div');
    const size = Math.random() * 10 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    confetti.style.position = 'absolute';
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.opacity = Math.random() + 0.5;
    confetti.style.borderRadius = '50%';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-10px';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    const animationDuration = Math.random() * 2 + 1;
    confetti.style.animation = `fall ${animationDuration}s linear forwards`;
    
    // Create animation keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translate(${Math.random() * 150 - 75}px, ${window.innerHeight + 10}px) rotate(${Math.random() * 360}deg);
          opacity: 0;
        }
      }
    `;
    
    document.head.appendChild(style);
    container.appendChild(confetti);
  }
});
