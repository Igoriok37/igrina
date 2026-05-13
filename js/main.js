    // ---- Language switch ----
    let currentLang = 'ru';

    function setLang(lang) {
      currentLang = lang;

      // Toggle active class on buttons
      document.getElementById('btnRU').classList.toggle('lang-btn--active', lang === 'ru');
      document.getElementById('btnRO').classList.toggle('lang-btn--active', lang === 'ro');

      // Update all elements that have data-ru / data-ro
      document.querySelectorAll('[data-ru]').forEach(function(el) {
        var newText = el.getAttribute('data-' + lang);
        if (newText === null) return;

        // Element has no child elements — safe to set textContent directly
        if (el.children.length === 0) {
          el.textContent = newText;
          return;
        }

        // Element has child elements (e.g. button with SVG icon)
        // Update only the first text node found
        var updated = false;
        el.childNodes.forEach(function(node) {
          if (!updated && node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            node.textContent = newText;
            updated = true;
          }
        });
        if (!updated) {
          el.insertBefore(document.createTextNode(newText), el.firstChild);
        }
      });

      // Update input placeholders
      document.querySelectorAll('input[data-' + lang + ']').forEach(function(el) {
        var ph = el.getAttribute('data-' + lang);
        if (ph) el.placeholder = ph;
      });

      document.documentElement.lang = lang;
    }

// ---- Выбор мессенджера (чипсы) ----
function selectMessenger(btn) {
  document.querySelectorAll('.messenger-chip').forEach(function(c) {
      c.classList.remove('messenger-chip--selected');
      c.classList.remove('messenger-chip--error'); // Убираем ошибку при клике
  });
  
  btn.classList.add('messenger-chip--selected');
  document.getElementById('selectedMessenger').value = btn.getAttribute('data-messenger');
}

// ---- Обработка отправки формы ----
function handleSubmit(e) {
  e.preventDefault(); // Отменяем перезагрузку страницы
  
  var nameInput = document.getElementById('fieldName');
  var phoneInput = document.getElementById('fieldPhone');
  var messengerInput = document.getElementById('selectedMessenger');
  
  var valid = true;

  // 1. Валидация Имени
  if (!nameInput.value.trim()) {
      nameInput.classList.add('form-input--error');
      valid = false;
  } else {
      nameInput.classList.remove('form-input--error');
  }

  // 2. Валидация Телефона (минимум 8 цифр для Молдовы)
  var phoneValue = phoneInput.value.replace(/\D/g, ''); 
  if (phoneValue.length < 8) { 
      phoneInput.classList.add('form-input--error');
      valid = false;
  } else {
      phoneInput.classList.remove('form-input--error');
  }

  // 3. Валидация Мессенджера
  if (!messengerInput.value) {
      document.querySelectorAll('.messenger-chip').forEach(function(c) {
          c.classList.add('messenger-chip--error'); // Ваш новый CSS класс ошибки
      });
      valid = false;
  }

  // Если нашли ошибки — подсвечиваем их 2.5 секунды и останавливаем отправку
  if (!valid) {
      setTimeout(function() {
          nameInput.classList.remove('form-input--error');
          phoneInput.classList.remove('form-input--error');
          document.querySelectorAll('.messenger-chip').forEach(function(c) {
              c.classList.remove('messenger-chip--error');
          });
      }, 2500);
      return; 
  }

  // ЕСЛИ ВСЁ ПРАВИЛЬНО — запускаем отправку в Telegram
  if (valid) {
      sendToTelegram();
  }
}

// ---- НОВАЯ ФУНКЦИЯ: Отправка данных в Telegram ----
function sendToTelegram() {
  // Ключи для интеграции
  const botToken = "8750741879:AAG7NKxY_Mn7dE5XLuWWpETH2X3syS1JKtI";
  const chatId = "5109827733"; 
  
  // Сбор данных из полей
  const name = document.getElementById('fieldName').value.trim();
  const phone = document.getElementById('fieldPhone').value.trim();
  const messenger = document.getElementById('selectedMessenger').value;
  
  // Формируем текст
  const text = `🎯 <b>Новая заявка с сайта!</b>\n\n` +
               `👤 <b>Имя:</b> ${name}\n` +
               `📞 <b>Телефон:</b> ${phone}\n` +
               `💬 <b>Удобный мессенджер:</b> ${messenger}`;

  // Блокируем кнопку на время отправки
  const submitBtn = document.querySelector('.form-submit-btn');
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.7";

  // ХИТРЫЙ ХАК: собираем реальный URL из кусочков, чтобы он не урезался
  const protocol = "https://";
  const domain = "api.telegram.org";
  const fullUrl = protocol + domain + "/bot" + botToken + "/sendMessage";

  // Отправляем запрос
  fetch(fullUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
      })
  })
  .then(response => {
      if (response.ok) {
          alert('Ура! Заявка успешно долетела до вашего Telegram!'); 
          // Сброс формы
          document.getElementById('contactForm').reset();
          document.getElementById('selectedMessenger').value = "";
          document.querySelectorAll('.messenger-chip').forEach(c => c.classList.remove('messenger-chip--selected'));
      } else {
          alert('Telegram отклонил запрос. Проверьте, нажали ли вы СТАРТ в боте @igorok_md_bot.');
      }
  })
  .catch(error => {
      console.error('Error details:', error);
      alert('Ошибка соединения. Проверьте правильность URL или интернет.');
  })
  .finally(() => {
      // Возвращаем кнопку в активное состояние
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
  });
}




    // ---- Modal ----
    function openModal() {
      document.getElementById('successModal').classList.add('modal-overlay--visible');
      document.body.style.overflow = 'hidden';
      setLang(currentLang); // refresh modal texts to current language
    }

    function closeModal() {
      document.getElementById('successModal').classList.remove('modal-overlay--visible');
      document.body.style.overflow = '';
      document.getElementById('contactForm').reset();
      document.querySelectorAll('.messenger-chip').forEach(function(c) {
        c.classList.remove('messenger-chip--selected');
      });
      document.getElementById('selectedMessenger').value = '';
    }

    // Close on overlay click
    document.getElementById('successModal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });

    // ---- Scroll animations ----
    var scrollObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll--visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
      scrollObserver.observe(el);
    });