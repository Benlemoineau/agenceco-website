document.addEventListener('DOMContentLoaded', () => {

    const burgerButton = document.getElementById('burger');
    
    const menuToToggle = document.getElementById('menu-barre');

    if (burgerButton && menuToToggle) {
        burgerButton.addEventListener('click', () => {
            
            
            menuToToggle.classList.toggle('is-open');
        });
    }
     // lancement de la galerie dès que la page est prête
    showSlides(slideIndex);

});

// GALERIE //

let slideIndex = 1;
let slideInterval; // stockage minuteur

// avancer ou reculer dans la galerie
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// aller à une diapositive spécifique 
function currentSlide(n) {
  showSlides(slideIndex = n);
}

// affichage des diapositives
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("galerie-diapositive");
  let dots = document.getElementsByClassName("dot");

  // Sécurité pour éviter les erreurs si la galerie n'existe pas sur la page
  if (!slides.length) return; 

  // boucler la galerie
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}

  // cacher toutes les diapositives
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  // désactive tous les points
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  // affichage de la bonne diapositive et le bon point
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  
  // Automatisation //
  
  // supprime le minuteur précédent pour le réinitialiser
  clearInterval(slideInterval);
  
  
  slideInterval = setInterval(() => {
    plusSlides(1); 
  }, 4000); // 
}



// API //
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayNews();
});

/* Récupère les actualités de l'API et les affiche dans la page.*/
 
async function fetchAndDisplayNews() {
    
    
    const container = document.querySelector('.contenant-actualite');
    const API_URL = 'http://localhost:3000/articles';

    //message de chargement.
    container.innerHTML = '<p class="loading-message">Chargement des actualités...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const newsList = await response.json();

        // Si aucune actualité 
        if (!newsList || newsList.length === 0) {
            container.innerHTML = '<p>Aucune actualité à afficher.</p>';
            return;
        }

        // Génère le HTML pour tous les articles et remplace le contenu du conteneur.
        container.innerHTML = newsList.map(article => createArticleHtml(article)).join('');

    } catch (error) {
        console.error("Erreur lors de la récupération des actualités :", error);
        container.innerHTML = '<p class="error-message">Impossible de charger les actualités.</p>';
    }
}

/**
 * Crée la chaîne de caractères HTML pour un seul article.
 * @param {object} article 
 * @returns {string} 
 */

function createArticleHtml(article) {
    return `
        <div class="contenant-actualité-bloc">
            <div class="contenant-titre">
                <p>${article.title}</p>
            </div>
            <div class="contenant-description">
                <p>${article.description}</p>
                <p>${article.content}</p>
            </div>
            <div class="contenant-boutton-date">
                <div class="contenant-date">
                    <p>Publié le ${article.publicationDate}</p>
                </div>
                <div class="contenant-boutton">
                    <a href="edit-blog.html?id=${article.id}"class="boutton-orange">Modifier</a>
                    <a href="edit-blog.html?id=${article.id}"class="boutton-rouge">Supprimer</a>
                </div>
            </div>
        </div>
    `;
}

