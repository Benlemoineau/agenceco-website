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

// ===================================================================
// == 1. CONFIGURATION ET FONCTIONS PARTAGÉES
// ===================================================================

const API_BASE_URL = 'http://localhost:3000'; 

/**
 * SIMULATION de l'appel API pour la connexion.
 */
async function simulateApiLogin(email, password) {
    const CORRECT_EMAIL = 'admin@test.com';
    const CORRECT_PASSWORD = 'password';
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
                resolve({ token: 'fake_jwt_token_for_testing_12345' });
            } else {
                reject(new Error('Email ou mot de passe incorrect (simulation).'));
            }
        }, 500);
    });
}

// Fonctions utilitaires pour gérer le token
const getToken = () => localStorage.getItem('jwtToken');
const isLoggedIn = () => getToken() !== null;

/**
 * Met à jour le lien de connexion/déconnexion dans le footer.
 */
function updateAuthLinks() {
    const authLinksContainer = document.getElementById('auth-links');
    if (!authLinksContainer) return;

    if (isLoggedIn()) {
        authLinksContainer.innerHTML = '<button id="logout-button" class="login-boutton">Se déconnecter</button>';
        document.getElementById('logout-button').addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            alert('Vous avez été déconnecté.');
            window.location.reload();
        });
    } else {
        authLinksContainer.innerHTML = '<a href="login.html" class="login-boutton">Me connecter</a>';
    }
}


// ===================================================================
// == 2. LOGIQUE EXÉCUTÉE AU CHARGEMENT DE CHAQUE PAGE
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
     /**
     * Vérifie si un token est présent dans le localStorage.
     * @returns {boolean}
     */
    const isLoggedIn = () => {
        return localStorage.getItem('jwtToken') !== null;
    }

    // On cible le conteneur qui doit accueillir les boutons d'administration
    const adminControlsContainer = document.getElementById('admin-controls-container');

    // On vérifie deux choses :
    // 1. Est-ce qu'on est sur une page qui contient ce conteneur ?
    // 2. Est-ce que l'utilisateur est connecté ?
    if (adminControlsContainer && isLoggedIn()) {
        
        // Si les deux conditions sont vraies, on crée le HTML du bouton.
        // C'est une balise <a> pour assurer la redirection.
        const addButtonHtml = `
            <a href="ajout_actualités.html" class="boutton-actualité-forme">Ajouter une actualité</a>
        `;

        // On insère le bouton dans le conteneur.
        adminControlsContainer.innerHTML = addButtonHtml;
    }

    updateAuthLinks();

    // --- LOGIQUE POUR LA PAGE DE CONNEXION (login.html) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        if (isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email2').value.trim();
            const password = document.getElementById('mdp').value.trim();
            try {
                const data = await simulateApiLogin(email, password);
                localStorage.setItem('jwtToken', data.token);
                window.location.href = 'index.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // --- LOGIQUE POUR LES PAGES AFFICHANT LES ACTUALITÉS (index.html, blog.html) ---
    const anyNewsContainer = document.querySelector('.contenant-actualite');
    if (anyNewsContainer) {

        // CORRECTION 1 : La fonction est maintenant correctement structurée
        
function createArticleHtml(article, pageType) {
    
    // Le contenu interne de la carte
    const articleInnerHtml = `
        <div class="contenant-titre"><p>${article.title}</p></div>
        <div class="contenant-description"><p>${article.content}</p></div>
        <div class="contenant-boutton-date">
            <div class="contenant-date"><p>Publié le ${new Date(article.createdAt).toLocaleDateString('fr-FR')}</p></div>
            
            <div class="contenant-boutton" ${!isLoggedIn() ? 'style="visibility: hidden;"' : ''}>
                <a href="modifier_actualité.html?id=${article.id}" class="boutton-orange">Modifier</a>
                <button type="button" class="boutton-rouge" data-id="${article.id}">Supprimer</button>
            </div>
        </div>
    `;
            
            // CORRECTION 2 : La logique pour envelopper le lien a été ajoutée
            if (pageType === 'home') {
                return `<a href="blog.html" class="article-link"><div class="contenant-actualité-bloc">${articleInnerHtml}</div></a>`;
            } else {
                return `<div class="contenant-actualité-bloc">${articleInnerHtml}</div>`;
            }
        }

        async function fetchAndDisplayNews() {
            try {
                const response = await fetch(`${API_BASE_URL}/articles`);
                if (!response.ok) throw new Error('Erreur réseau.');
                const newsList = await response.json();

                if (document.getElementById('Actualités')) {
                    anyNewsContainer.innerHTML = newsList.slice(0, 3).map(article => createArticleHtml(article, 'home')).join('');
                } else {
                    anyNewsContainer.innerHTML = newsList.map(article => createArticleHtml(article, 'blog')).join('');
                }
            } catch (error) {
                anyNewsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
            }
        }
        
        anyNewsContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('boutton-rouge') && isLoggedIn()) {
                const articleId = event.target.dataset.id;
                if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${getToken()}` }
                        });
                        if (!response.ok) throw new Error('La suppression a échoué.');
                        fetchAndDisplayNews();
                    } catch (error) {
                        alert(error.message);
                    }
                }
            }
            
        });

        fetchAndDisplayNews();
    }

    // --- LOGIQUE POUR LA PAGE D'AJOUT (ajout_actualite.html) ---
    const addNewsForm = document.getElementById('add-news-form');
    if (addNewsForm) {
        // ... (votre code pour la page d'ajout ici) ...
    }


    // --- LOGIQUE POUR LA PAGE DE MODIFICATION (modifier_actualite.html) ---
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        // ... (votre code pour la page de modification ici...)
    }
});
