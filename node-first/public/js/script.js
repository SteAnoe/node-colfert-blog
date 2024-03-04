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