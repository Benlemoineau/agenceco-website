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
                // ▼▼▼ C'EST ICI QUE LA MAGIE OPÈRE : LE VRAI APPEL FETCH ▼▼▼
                const response = await fetch(`${API_BASE_URL}/login`, { // Assurez-vous que l'URL est correcte
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Email ou mot de passe incorrect.');
                }

                const data = await response.json();
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
        // ▼▼▼ AJOUTEZ CE BLOC DE CODE ICI ▼▼▼
    const adminControlsContainer = document.getElementById('admin-controls-container');
    if (isLoggedIn() && adminControlsContainer) {
        adminControlsContainer.innerHTML = `
            <a href="ajout_actualités.html" class="boutton-actualité-forme">Ajouter une actualité</a>
        `;
    }

       
        
// La version corrigée et propre :
// Dans votre script.js
function createArticleHtml(article, pageType) {
    let articleInnerHtml = '';

    // A. Si l'utilisateur est DÉCONNECTÉ
    if (!isLoggedIn()) {
        // On crée la structure simple et centrée
        articleInnerHtml = `
            <div class="contenant-titre"><p>${article.title}</p></div>
            <div class="contenant-date"><p>Publié le ${new Date(article.createdAt).toLocaleDateString('fr-FR')}</p></div>
            <div class="contenant-description"><p>${article.content}</p></div>
        `;

    // B. Si l'utilisateur est CONNECTÉ
    } else {
        // On crée la structure complexe
        const adminButtonsHtml = `
            <div class="contenant-boutton">
                <a href="modifier_actualité.html?id=${article.id}" class="boutton-orange">Modifier</a>
                <button type="button" class="boutton-rouge" data-id="${article.id}">Supprimer</button>
            </div>
        `;
        articleInnerHtml = `
            <div class="contenant-titre"><p>${article.title}</p></div>
            <div class="contenant-description"><p>${article.content}</p></div>
            <div class="contenant-boutton-date">
                <div class="contenant-date"><p>Publié le ${new Date(article.createdAt).toLocaleDateString('fr-FR')}</p></div>
                ${adminButtonsHtml}
            </div>
        `;
    }
    const connectionClass = isLoggedIn() ? 'logged-in' : 'logged-out';
    // 1. On crée la carte une seule fois et on la stocke dans notre variable
    const finalArticleHtml = `<div class="contenant-actualité-bloc ${connectionClass}">${articleInnerHtml}</div>`;

    // 2. On UTILISE cette variable dans les deux cas
    if (pageType === 'home') {
        // On l'enveloppe dans un lien pour la page d'accueil
        return `<a href="blog.html" class="article-link">${finalArticleHtml}</a>`;
    } else {
        // On la retourne directement pour le blog
        return finalArticleHtml;
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
        // GESTION DU CLIC SUR LE BOUTON SUPPRIMER (sur index.html et blog.html)
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


// --- LOGIQUE POUR LA PAGE DE MODIFICATION (modifier_actualite.html) ---
const editForm = document.getElementById('edit-form');
if (editForm) {
    console.log("CHECK 1: Page de modification détectée.");

    const token = getToken();
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    // Sécurité : si pas d'ID ou pas connecté, on renvoie à la connexion
    if (!articleId || !isLoggedIn()) {
        alert("Accès non autorisé.");
        window.location.href = 'login.html';
    } else {
        // ---- Tout le code d'action doit être DANS ce bloc 'else' ----

        console.log(`CHECK 2: ID de l'article récupéré depuis l'URL : ${articleId}`);
        const deleteButton = document.getElementById('delete-button');

        // Fonction pour charger les données de l'article
        const loadArticleData = async () => {
            try {
                const fetchUrl = `${API_BASE_URL}/articles/${articleId}`;
                console.log(`CHECK 3: Tentative de récupération depuis l'URL : ${fetchUrl}`);
                
                const response = await fetch(fetchUrl);
                if (!response.ok) throw new Error(`Article non trouvé.`);
                
                const article = await response.json();
                console.log("CHECK 4: Données reçues avec succès !", article);

                // CORRIGÉ : On remplit les bons champs du formulaire
                document.getElementById('news-title').value = article.title;
                document.getElementById('news-description').value = article.description;
                document.getElementById('news-content').value = article.imageUrl; // Assurez-vous que votre HTML a bien un input avec id="news-image"

            } catch (error) {
                console.error("ERREUR lors de la récupération :", error);
                alert(error.message);
                window.location.href = 'index.html';
            }
        };

        // On lance le chargement des données
        loadArticleData();

        // Gérer la soumission du formulaire pour la MISE À JOUR
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // CORRIGÉ : On lit les données depuis les bons champs
            const updatedData = {
                title: document.getElementById('news-title').value,
                content: document.getElementById('news-description').value,
                imageUrl: document.getElementById('news-content').value,
            };
            try {
                const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData)
                });
                if (!response.ok) throw new Error('La mise à jour a échoué.');
                alert('Article mis à jour avec succès !');
                window.location.href = 'index.html';
            } catch (error) {
                alert(error.message);
            }
        });
        
        // Gérer le clic sur le bouton SUPPRIMER de cette page
        deleteButton.addEventListener('click', async () => {
             if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('La suppression a échoué.');
                    alert('Article supprimé avec succès !');
                    window.location.href = 'index.html';
                } catch (error) {
                    alert(error.message);
                }
            }
        });
    }
}

    
        
    // --- LOGIQUE POUR LA PAGE D'AJOUT (ajout_actualite.html) ---
    const addNewsForm = document.getElementById('add-news-form');
    if (addNewsForm) {
        const token = getToken();

        // Sécurité : si l'utilisateur n'est pas connecté, on le renvoie à la page de connexion
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        addNewsForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // On récupère les données du formulaire
            const newsData = {
                title: document.getElementById('news-title').value,
                content: document.getElementById('news-description').value,
                imageUrl: document.getElementById('news-content').value,
                // Votre API peut nécessiter d'autres champs comme un 'userId'
                // Exemple : userId: 1 
            };

            try {
                const response = await fetch(`${API_BASE_URL}/articles`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newsData)
                });

                if (!response.ok) {
                    const errorResult = await response.json();
                    throw new Error(errorResult.message || "La création de l'actualité a échoué.");
                }
                
                // Si tout s'est bien passé, on alerte l'utilisateur et on le redirige
                alert("L'actualité a été ajoutée avec succès !");
                window.location.href = 'blog.html'; // Redirige vers la page du blog

            } catch (error) {
                alert(error.message);
            }
        });
    }

});
