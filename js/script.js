const burger = document.getElementById('burger');
const ul = document.getElementById('navigation-mobile');
burger.addEventListener('click' , () => {
    if(ul.style.display === 'flex') {
        ul.style.display = 'none';
    } else {
        ul.style.display = 'flex';
    }
});