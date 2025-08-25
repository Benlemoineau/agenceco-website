// ===================================================================
// == 1. CONFIGURATION ET FONCTIONS PARTAGÉES
// ===================================================================

const API_BASE_URL = 'http://localhost:3000'; 

// Fonctions utilitaires pour gérer l'authentification
const getToken = () => localStorage.getItem('jwtToken');
const isLoggedIn = () => getToken() !== null;

/**
 * Met à jour le lien de connexion/déconnexion dans le footer de toutes les pages.
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
// == 2. LOGIQUE DE LA GALERIE (CARROUSEL)
// ===================================================================

let slideIndex = 1;
let slideInterval;

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  const slides = document.getElementsByClassName("galerie-diapositive");
  const dots = document.getElementsByClassName("dot");

  if (!slides.length) return; 

  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
  
  clearInterval(slideInterval);
  slideInterval = setInterval(() => plusSlides(1), 4000);
}


// ===================================================================
// == 3. INITIALISATION PRINCIPALE
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Initialisations globales (pour toutes les pages) ---
    updateAuthLinks();

    const burgerButton = document.getElementById('burger');
    const menuToToggle = document.getElementById('menu-barre');
    if (burgerButton && menuToToggle) {
        burgerButton.addEventListener('click', () => {
            menuToToggle.classList.toggle('is-open');
        });
    }

// --- LOGIQUE POUR LE HEADER FIXE AU DÉFILEMENT ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            // Si l'utilisateur a fait défiler de plus de 50 pixels vers le bas
            if (window.scrollY > 50) {
                // On ajoute la classe "scrolled" au header
                header.classList.add('scrolled');
            } else {
                // Sinon, on la retire
                header.classList.remove('scrolled');
            }
        });
    }
    // --- Logique spécifique à la page d'accueil (pour la galerie) ---
    const gallery = document.querySelector('.galerie-contenant');
    if (gallery) {
        showSlides(slideIndex);
    }

    // --- LOGIQUE POUR LA PAGE DE CONNEXION ---
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
                const response = await fetch(`${API_BASE_URL}/login`, {
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

    // --- LOGIQUE POUR LES PAGES AFFICHANT LES ACTUALITÉS ---
    const anyNewsContainer = document.querySelector('.contenant-actualite');
    if (anyNewsContainer) {
        const adminControlsContainer = document.getElementById('admin-controls-container');
        if (isLoggedIn() && adminControlsContainer) {
            adminControlsContainer.innerHTML = `<a href="ajout_actualités.html" class="boutton-actualité-forme">Ajouter une actualité</a>`;
        }

        function createArticleHtml(article, pageType) {
            let articleInnerHtml = '';
            if (!isLoggedIn()) {
                articleInnerHtml = `
                    <div class="contenant-titre"><p>${article.title}</p></div>
                    <div class="contenant-date"><p>Publié le ${new Date(article.publicationDate).toLocaleDateString('fr-FR')}</p></div>
                    <div class="contenant-description"><p>${article.description}</p></div>
                    <div class="contenant-content"><p>${article.content}</p></div>`;
            } else {
                const adminButtonsHtml = `
                    <div class="contenant-boutton">
                        <a href="modifier_actualité.html?id=${article.id}" class="boutton-orange">Modifier</a>
                        <button type="button" class="boutton-rouge" data-id="${article.id}">Supprimer</button>
                    </div>`;
                articleInnerHtml = `
                    <div class="contenant-titre"><p>${article.title}</p></div>
                    <div class="contenant-description"><p>${article.description}</p></div>
                    <div class="contenant-content"><p>${article.content}</p></div>
                    <div class="contenant-boutton-date">
                        <div class="contenant-date"><p>Publié le ${new Date(article.publicationDate).toLocaleDateString('fr-FR')}</p></div>
                        ${adminButtonsHtml}
                    </div>`;
            }
            const connectionClass = isLoggedIn() ? 'logged-in' : 'logged-out';
            const finalArticleHtml = `<div class="contenant-actualité-bloc ${connectionClass}">${articleInnerHtml}</div>`;

            if (pageType === 'home') {
                return `<a href="blog.html" class="article-link">${finalArticleHtml}</a>`;
            } else {
                return `<a href="détail.html?id=${article.id}" class="article-link">${finalArticleHtml}</a>`;
            }
        }

        async function fetchAndDisplayNews() {
            try {
                const response = await fetch(`${API_BASE_URL}/articles`);
                if (!response.ok) throw new Error('Erreur réseau.');
                const newsList = await response.json();
                newsList.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
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

    // --- LOGIQUE POUR LA PAGE DE MODIFICATION ---
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        const token = getToken();
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        const deleteButton = document.getElementById('delete-button');

        if (!articleId || !isLoggedIn()) {
            alert("Accès non autorisé.");
            window.location.href = 'login.html';
        } else {
            const loadArticleData = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);
                    if (!response.ok) throw new Error(`Article non trouvé.`);
                    const article = await response.json();
                    document.getElementById('news-title').value = article.title;
                    document.getElementById('news-description').value = article.description;
                    document.getElementById('news-content').value = article.content;
                    document.getElementById('news-date').value = article.publicationDate;
                } catch (error) {
                    alert(error.message);
                    window.location.href = 'index.html';
                }
            };
            loadArticleData();

            editForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const updatedData = {
                    title: document.getElementById('news-title').value,
                    description: document.getElementById('news-description').value,
                    content: document.getElementById('news-content').value,
                    publicationDate: document.getElementById('news-date').value,
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

    // --- LOGIQUE POUR LA PAGE D'AJOUT ---
    const addNewsForm = document.getElementById('add-news-form');
    if (addNewsForm) {
        const token = getToken();
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
    const dateInput = document.getElementById('news-date');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    dateInput.value = formattedDate;

        addNewsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newsData = {
                title: document.getElementById('news-title').value,
                description: document.getElementById('news-description').value, 
                content: document.getElementById('news-content').value,
                publicationDate: document.getElementById('news-date').value 
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
                alert("L'actualité a été ajoutée avec succès !");
                window.location.href = 'blog.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // --- LOGIQUE POUR LA PAGE DE DÉTAIL ---
    const detailContainer = document.getElementById('article-detail-container');
    if (detailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        if (!articleId) {
            detailContainer.innerHTML = "<p>Erreur : Aucun article spécifié.</p>";
        } else {
            const fetchSingleArticle = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);
                    if (!response.ok) throw new Error("L'article demandé n'a pas pu être chargé.");
                    const article = await response.json();
                    const articleHtml = `
                        <h1 class="article-detail-title">${article.title}</h1>
                        <p class="article-detail-description">${article.description || ''}</p>
                        <div class="article-detail-content">
                            <div>${article.content}</div>
                        </div>
                        <div class="article-detail-meta">
                            <p>Publié le ${new Date(article.publicationDate).toLocaleDateString('fr-FR')}</p>
                            <p>Auteur: BenjaminElPajaro</p>
                        </div>`;
                    detailContainer.innerHTML = articleHtml;
                } catch (error) {
                    detailContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
                }
            };
            fetchSingleArticle();
        }
    }
});