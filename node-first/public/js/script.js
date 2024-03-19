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
  const fileInput = document.getElementById('fileInput');
  const feedbackDiv = document.getElementById('photo-feedback');
  
  feedbackDiv.innerText = '';
  feedbackDiv.style.display = 'none';

  const file = fileInput.files[0];

  if (file) {
    if (file.size > 1024 * 1024 * 2 ) { 
      feedbackDiv.innerText = "Dimensione dell'immagine superiore a 2MB";
      feedbackDiv.style.display = 'block';
      return; 
    }

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);
    
    if (!allowedExtensions.includes('.' + fileExtension)) {
      feedbackDiv.innerText = 'Estensione del file non valido. Le estensioni permesse sono: ' + allowedExtensions.join(', ');
      feedbackDiv.style.display = 'block';
      return;
    }

    fileInput.disabled = true;
    document.getElementById('submitButton').disabled = true;

    await new Promise(resolve => setTimeout(resolve, 1000));

    fileInput.disabled = false;
    document.getElementById('submitButton').disabled = false;

    document.getElementById('customForm').submit();
  }
}

function hideChat(){
  if ($('#chatWindow').hasClass('d-none')) {
    $('#chatWindow').removeClass('d-none').addClass('d-flex');
  } else {
    $('#chatWindow').removeClass('d-flex').addClass('d-none');
  }
}