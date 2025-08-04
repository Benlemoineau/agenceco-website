document.addEventListener('DOMContentLoaded', () => {

    const burgerButton = document.getElementById('burger');
    // On cible maintenant la balise <nav> qui a l'ID 'menu-barre'
    const menuToToggle = document.getElementById('menu-barre');

    if (burgerButton && menuToToggle) {
        burgerButton.addEventListener('click', () => {
            // Ajoute ou enlève la classe 'is-open' sur la barre de navigation.
            // C'est cette classe qui la fait apparaître en CSS.
            menuToToggle.classList.toggle('is-open');
        });
    }
     // On lance la galerie dès que la page est prête
    showSlides(slideIndex);

});

// --- DÉBUT DU CODE DE LA GALERIE ---

let slideIndex = 1;
let slideInterval; // NOUVEAU : Variable pour stocker notre minuteur

// Fonction pour avancer ou reculer dans la galerie
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Fonction pour aller à une diapositive spécifique (via les points)
function currentSlide(n) {
  showSlides(slideIndex = n);
}

// La fonction principale qui affiche les diapositives
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("galerie-diapositive");
  let dots = document.getElementsByClassName("dot");

  // Sécurité pour éviter les erreurs si la galerie n'existe pas sur la page
  if (!slides.length) return; 

  // Logique pour boucler la galerie
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}

  // On cache toutes les diapositives
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  // On désactive tous les points
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  // On affiche la bonne diapositive et le bon point
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  
  // --- GESTION DE L'AUTOMATISATION ---
  
  // NOUVEAU : On supprime le minuteur précédent pour le réinitialiser
  clearInterval(slideInterval);
  
  // NOUVEAU : On crée un nouveau minuteur qui passera à l'image suivante dans 4 secondes
  slideInterval = setInterval(() => {
    plusSlides(1); // Appelle la fonction pour passer à la diapositive suivante
  }, 4000); // 4000 millisecondes = 4 secondes
}

