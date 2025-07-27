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
});