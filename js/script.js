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

const API_BASE_URL = 'http://localhost:3000'; // URL de base pour la VRAIE API

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
    
    updateAuthLinks();

    // Dans votre script.js

// --- LOGIQUE POUR LA PAGE DE CONNEXION (login.html) ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    console.log("CHECK 1: Page de connexion OK. Le script trouve bien le formulaire.");

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("CHECK 2: Bouton 'Me connecter' cliqué. L'événement est déclenché.");

        const email = document.getElementById('email2').value.trim();
        const password = document.getElementById('mdp').value.trim();
        console.log(`CHECK 3: Données récupérées -> Email: ${email}, Mot de passe: ${password}`);

        try {
            console.log("CHECK 4: Appel de la fonction de simulation d'API...");
            const data = await simulateApiLogin(email, password);
            
            console.log("CHECK 5: Simulation d'API RÉUSSIE ! Token reçu.");
            localStorage.setItem('jwtToken', data.token);

            console.log("CHECK 6: Tentative de redirection vers index.html...");
            window.location.href = 'index.html';

        } catch (error) {
            // Si une erreur se produit, le code saute directement ici
            console.error("ERREUR DÉTECTÉE DANS LE BLOC CATCH:", error);
            alert("Échec de la connexion : " + error.message);
        }
    });
}

    // --- LOGIQUE POUR LES PAGES AFFICHANT LES ACTUALITÉS (index.html, blog.html) ---
    const anyNewsContainer = document.querySelector('.contenant-actualite');
    if (anyNewsContainer) {

        function createArticleHtml(article) {
            const adminButtons = isLoggedIn() ? `
                <a href="modifier_actualite.html?id=${article.id}" class="boutton-orange">Modifier</a>
                <button type="button" class="boutton-rouge" data-id="${article.id}">Supprimer</button>
            ` : '';
            return `
                <div class="contenant-actualité-bloc">
                    <div class="contenant-titre"><p>${article.title}</p></div>
                    <div class="contenant-description"><p>${article.content}</p></div>
                    <div class="contenant-boutton-date">
                        <div class="contenant-date"><p>Publié le ${new Date(article.createdAt).toLocaleDateString('fr-FR')}</p></div>
                        <div class="contenant-boutton">${adminButtons}</div>
                    </div>
                </div>
            `;
        }

        async function fetchAndDisplayNews() {
            try {
                // CORRIGÉ : L'URL pour récupérer les articles était incorrecte.
                const response = await fetch(`${API_BASE_URL}/articles`);
                if (!response.ok) throw new Error('Erreur réseau lors de la récupération des articles.');
                const newsList = await response.json();
                
                // Si la section #Actualités existe, on est sur index.html
                if (document.getElementById('Actualités')) {
                    anyNewsContainer.innerHTML = newsList.slice(0, 3).map(createArticleHtml).join('');
                } else {
                    anyNewsContainer.innerHTML = newsList.map(createArticleHtml).join('');
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
                        const response = await fetch(`${API_BASE_URL}/articles`, {
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

    // --- LOGIQUE POUR LA PAGE DE MODIFICATION (modifier_actualite.html) ---
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        const token = getToken();
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (!articleId || !isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        (async () => {
            try {
                // CORRIGÉ : Il manquait un '/' dans l'URL.
                const response = await fetch(`${API_BASE_URL}/articles`);
                if (!response.ok) throw new Error("Article non trouvé.");
                const article = await response.json();
                document.getElementById('title').value = article.title;
                document.getElementById('content').value = article.content;
                document.getElementById('imageUrl').value = article.imageUrl;
            } catch (error) {
                alert(error.message);
                window.location.href = 'index.html';
            }
        })();

        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const updatedData = {
                title: document.getElementById('title').value,
                content: document.getElementById('content').value,
                imageUrl: document.getElementById('imageUrl').value,
            };
            try {
                // CORRIGÉ : Il manquait un '/' dans l'URL.
                const response = await fetch(`${API_BASE_URL}/articles${articleId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData)
                });
                if (!response.ok) throw new Error('La mise à jour a échoué.');
                window.location.href = 'index.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }
});