// script.js - validation, theme toggle, preview & cookies

document.addEventListener('DOMContentLoaded', () => {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('year' + (i === 1 ? '' : i));
    if (el) el.textContent = new Date().getFullYear();
  }

  const themeButtons = document.querySelectorAll('[id^=themeToggle]');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      btn.textContent = document.body.classList.contains('dark') ? 'Light' : 'Dark';
    });
  });

  const form = document.getElementById('joinForm');
  if (form) setupForm(form);

  restoreNameEmailFromCookie();
});

function setupForm(form) {
  const fullname = form.querySelector('#fullname');
  const email = form.querySelector('#email');
  const password = form.querySelector('#password');
  const password2 = form.querySelector('#password2');
  const age = form.querySelector('#age');
  const cv = form.querySelector('#cv');
  const photo = form.querySelector('#photo');
  const bio = form.querySelector('#bio');
  const agree = form.querySelector('#agree');
  const msgBox = form.querySelector('#formMessage');
  const photoPreview = form.querySelector('#photoPreview');
  const bioCount = form.querySelector('#bioCount');
  const resetBtn = form.querySelector('#resetBtn');

  bio.addEventListener('input', () => {
    bioCount.textContent = bio.value.length;
    clearError('bio');
  });

  photo.addEventListener('change', () => {
    clearError('photo');
    renderPhotoPreview(photo, photoPreview);
  });

  [fullname, email, password, password2, age, cv, photo].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      clearError(inp.id);
    });
  });

  agree.addEventListener('change', () => clearError('agree'));

  resetBtn.addEventListener('click', () => {
    eraseCookie('studeng_name');
    eraseCookie('studeng_email');
    photoPreview.innerHTML = '';
    msgBox.style.display = 'none';
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    clearAllErrors();
    msgBox.style.display = 'none';

    const errors = {};

    if (!fullname.value.trim()) errors.fullname = 'Please enter your full name.';
    if (!validateEmail(email.value)) errors.email = 'Please enter a valid email address.';
    if (!password.value || password.value.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (password2.value !== password.value) {
      errors.password2 = 'Passwords do not match.';
    }
    const ageNum = Number(age.value);
    if (!age.value || isNaN(ageNum) || ageNum < 18) {
      errors.age = 'You must be at least 18 years old to join.';
    }
    if (!cv.files || cv.files.length === 0) {
      errors.cv = 'Please upload your CV (PDF).';
    } else {
      const cvName = cv.files[0].name.toLowerCase();
      if (!cvName.endsWith('.pdf')) errors.cv = 'CV must be a .pdf file.';
    }
    if (!photo.files || photo.files.length === 0) {
      errors.photo = 'Please upload a profile photo (jpg/jpeg).';
    } else {
      const pName = photo.files[0].name.toLowerCase();
      if (!(pName.endsWith('.jpg') || pName.endsWith('.jpeg'))) {
        errors.photo = 'Photo must be .jpg or .jpeg.';
      }
    }
    if (!agree.checked) errors.agree = 'You must accept the forum rules.';

    if (Object.keys(errors).length > 0) {
      for (const k in errors) showError(k, errors[k]);
      showFormMessage('Some fields need attention. Please fix errors and submit again.', 'error');
      const first = Object.keys(errors)[0];
      const el = form.querySelector('#' + first);
      if (el) el.focus();
      return;
    }

    setCookie('studeng_name', fullname.value.trim(), 7);
    setCookie('studeng_email', email.value.trim(), 7);

    showFormMessage('Submission successful! Welcome to StudEng Forum — a confirmation was simulated (no server).', 'success');
  });
}

function showError(fieldId, message) {
  const el = document.getElementById('err-' + fieldId);
  if (el) {
    el.textContent = message;
  } else {
    const input = document.getElementById(fieldId);
    if (input) input.title = message;
  }
}

function clearError(fieldId) {
  const el = document.getElementById('err-' + fieldId);
  if (el) el.textContent = '';
}

function clearAllErrors() {
  document.querySelectorAll('.error').forEach(e => e.textContent = '');
}

function showFormMessage(message, type) {
  const msgBox = document.getElementById('formMessage');
  msgBox.textContent = message;
  msgBox.className = 'form-message ' + (type === 'success' ? 'success' : 'error');
  msgBox.style.display = 'block';
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function renderPhotoPreview(inputEl, container) {
  container.innerHTML = '';
  if (!inputEl.files || inputEl.files.length === 0) return;
  const file = inputEl.files[0];
  const name = file.name.toLowerCase();
  if (!(name.endsWith('.jpg') || name.endsWith('.jpeg'))) {
    showError('photo', 'Photo must be .jpg or .jpeg.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.alt = 'Profile preview';
    container.appendChild(img);
  };
  reader.readAsDataURL(file);
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(name) {
  const cname = name + "=";
  const decoded = decodeURIComponent(document.cookie);
  const parts = decoded.split(';');
  for (let p of parts) {
    p = p.trim();
    if (p.indexOf(cname) === 0) return p.substring(cname.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + "=; Max-Age=0; path=/";
}

function restoreNameEmailFromCookie() {
  const name = getCookie('studeng_name');
  const email = getCookie('studeng_email');
  if (name) {
    const f = document.getElementById('fullname');
    if (f) f.value = name;
  }
  if (email) {
    const e = document.getElementById('email');
    if (e) e.value = email;
  }
}
/* ----------------------------------------------------
   Cookie Banner UI — Accept / Decline
---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  const consent = getCookie('studeng_cookie_consent');

  // Si pas encore choisi → afficher bannière
  if (!consent) banner.style.display = "flex";

  const btnAccept = document.getElementById('cookieAccept');
  const btnDecline = document.getElementById('cookieDecline');

  btnAccept.addEventListener('click', () => {
    setCookie("studeng_cookie_consent", "accepted", 180);
    banner.style.display = "none";
  });

  btnDecline.addEventListener('click', () => {
    setCookie("studeng_cookie_consent", "declined", 180);
    banner.style.display = "none";

    // Effacer les cookies utilisateur (nom & email)
    eraseCookie('studeng_name');
    eraseCookie('studeng_email');
  });
});
