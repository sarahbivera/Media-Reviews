let currentCategory = 'Movies';
let currentItem = null;

let media = [...movies, ...tvShows, ...books];

window.onload = init;

function init(){
    let user = localStorage.getItem('user');
    if(user) goTo('listPage'); else goTo('loginPage');
    render();
}

function goTo(id){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function signup(){
    let u = document.getElementById('signupUsername').value.trim();
    let p = document.getElementById('signupPassword').value;
    if(!u || !p){
        alert('Please enter both username and password.');
        return;
    }
    let existing = localStorage.getItem('account_'+u);
    if(existing){
        alert('That username is already taken. Please choose another.');
        return;
    }
    localStorage.setItem('account_'+u, p);
    goTo('loginPage');
}

function login(){
    let u = document.getElementById('loginUsername').value;
    let p = document.getElementById('loginPassword').value;
    let stored = localStorage.getItem('account_'+u);

    if(stored && stored === p){
        localStorage.setItem('user', u);
        goTo('listPage');
        render();
    } 
    else {
        alert('Invalid credentials');
    }
}

function logout(){ 
    localStorage.removeItem('user'); 
    goTo('loginPage'); 
}

function setCategory(cat){ 
    currentCategory = cat; 
    render();
}

function getReviews(){ 
    return JSON.parse(localStorage.getItem('reviews'))||[]; 
}

function render(){
    document.getElementById('categoryTitle').innerText = currentCategory;
    let grid = document.getElementById('mediaGrid');
    if(!grid) return;
    grid.innerHTML='';
    let reviews = getReviews();

    media.filter(m=>m.category===currentCategory).forEach(m=>{
    let r = reviews.filter(x=>x.id===m.id);
    let avg = r.length? (r.reduce((a,b)=>a+Number(b.rating),0)/r.length).toFixed(1):'No ratings';

    grid.innerHTML += `
    <div class='card' onclick='openDetail(${m.id})'>
    <img src='${m.img}'>
    <h4>${m.title}</h4>
    <p>${avg}</p>
    <p>${r.length} reviews</p>
    </div>`;
    });
}


function openDetail(id){
    currentItem = media.find(m=>m.id===id);
    goTo('detailPage');
    document.getElementById('detailTitle').innerText=currentItem.title;
    let metaText = '';
    if(currentItem.category === 'Movies') metaText = `Director: ${currentItem.director}`;
    else if(currentItem.category === 'TV') metaText = `Streaming: ${currentItem.service}`;
    else if(currentItem.category === 'Books') metaText = `Author: ${currentItem.author}`;
    document.getElementById('detailMeta').innerText = metaText;
    document.getElementById('detailImg').src=currentItem.img;
    document.getElementById('detailDesc').innerText=currentItem.desc;
    renderReviews();
}

function renderReviews(){
    let container = document.getElementById('reviews');
    container.innerHTML='';
    let reviews = getReviews().filter(r=>r.id===currentItem.id);
    reviews.forEach(r=>{
    container.innerHTML += `<p>${r.user}: ${r.comment} (${r.rating})</p>`;
    });
}

function addReview(){
    let sure = window.confirm('Submit review?');
    if(!sure) return;
    let reviews = getReviews();
    reviews.push({
    id: currentItem.id,
    user: localStorage.getItem('user'),
    comment: document.getElementById('comment').value,
    rating: document.getElementById('rating').value
    });
    localStorage.setItem('reviews', JSON.stringify(reviews));
    document.getElementById('comment').value='';
    renderReviews();
    render();
}
