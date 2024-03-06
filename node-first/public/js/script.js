// document.addEventListener('DOMContentLoaded', function(){

//     const allButtons = document.querySelectorAll('.searchBtn');
//     const searchBar = document.querySelector('.searchBar');
//     const searchInput = document.getElementById('searchInput');
//     const searchClose = document.getElementById('searchClose');
  
//     for (var i = 0; i < allButtons.length; i++) {
//       allButtons[i].addEventListener('click', function() {
//         searchBar.style.visibility = 'visible';
//         searchBar.classList.add('open');
//         this.setAttribute('aria-expanded', 'true');
//         searchInput.focus();
//       });
//     }
  
//     searchClose.addEventListener('click', function() {
//       searchBar.style.visibility = 'hidden';
//       searchBar.classList.remove('open');
//       this.setAttribute('aria-expanded', 'false');
//     });
  
  
// });

// let allBtn = document.querySelectorAll('.navBtn')

// if(window.location.pathname == '/admin'){
//   const loginBtn = document.querySelector('#loginBtn');
//   loginBtn.classList.add('active');
// }

document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.navBtn');

  navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
  
      navLinks.forEach(otherLink => {
        otherLink.classList.remove('active');
      });

      link.classList.add('active');

      localStorage.setItem('activeLink', link.id);
    });
  });

  const activeLinkId = localStorage.getItem('activeLink');
  if (activeLinkId) {
    const activeLink = document.getElementById(activeLinkId);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  } else if (window.location.pathname === '/') {
    const homeLink = document.getElementById('homeBtn');
    if (homeLink) {
      homeLink.classList.add('active');
      localStorage.setItem('activeLink', 'homeBtn');
    }
  }
});

function toggleContent(postId, fullContent) {
  const article = document.getElementById(`postBody${postId}`);
  const button = document.querySelector(`button[onclick="toggleContent('${postId}', '${fullContent}')"]`);

  if (article.classList.contains('shortened')) {
    article.classList.remove('shortened');
    article.innerHTML = fullContent;
    button.textContent = 'Show Less';
  } else {
    article.classList.add('shortened');
    article.innerHTML = fullContent.slice(0, 50) + '...';
    button.textContent = 'Show More';
  }
}

async function handleFileChange() {
  const fileName = document.getElementById('fileInput').files[0]?.name;

  if (fileName) {
    const label = document.querySelector('.custom-file-input-label');
    label.setAttribute('data-file-name', fileName);
    label.classList.add('has-file');

    // Disable the file input and submit button during the form submission
    document.getElementById('fileInput').disabled = true;
    document.getElementById('submitButton').disabled = true;

    // Simulate an asynchronous operation (replace this with your actual logic)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Enable the file input and submit button after the asynchronous operation
    document.getElementById('fileInput').disabled = false;
    document.getElementById('submitButton').disabled = false;

    // Submit the form
    document.getElementById('customForm').submit();
  }
}

document.querySelector('.custom-file-input-label').addEventListener('click', function (e) {
  const fileInput = document.getElementById('fileInput');

  if (e.target !== fileInput) {
    // If the click is not directly on the file input, trigger the click
    fileInput.click();
  }
  
  // Prevent the default click behavior to avoid opening the file manager twice
  e.preventDefault();
});

const photoInput = document.getElementById('fileInput');
const photoFeedback = document.getElementById('photo-feedback');
const allowedTypesPhoto = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const maxSizeInBytes = 1024 * 1024; // 1MB

photoInput.addEventListener('change', function() {
  const isValidType = photoInput.files.length > 0 && allowedTypesPhoto.includes(photoInput.files[0].type);
  const isValidSize = photoInput.files.length > 0 && photoInput.files[0].size <= maxSizeInBytes;

  if (!isValidType || !isValidSize) {
    photoInput.classList.add('is-invalid');
    if (!isValidType) {
      photoFeedback.textContent = 'Il file caricato deve essere PNG, JPG, JPEG, o GIF.';
    } else {
      photoFeedback.textContent = 'Il file caricato deve essere inferiore a 1MB.';
    }
  } else {
    photoInput.classList.remove('is-invalid');
    photoFeedback.textContent = '';
  }
});
