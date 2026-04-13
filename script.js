let currentCategory = 'Movies';
let currentItem = null;

const firebaseConfig = {
    apiKey: "AIzaSyAdc4HxzZu3NbTx4RiclXPhQUu5JyTofhQ",
    authDomain: "media-reviews-5930a.firebaseapp.com",
    projectId: "media-reviews-5930a",
    storageBucket: "media-reviews-5930a.firebasestorage.app",
    messagingSenderId: "154442583411",
    appId: "1:154442583411:web:15a3dac0509306685d0906",
    measurementId: "G-Z68LMVNHDD"
    
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
firebase.analytics();

let media = [...movies, ...tvShows, ...books];

window.onload = init;

async function init(){
    let user = localStorage.getItem('user');
    if(user) goTo('listPage'); else goTo('loginPage');
    await render();
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

async function login(){
    let u = document.getElementById('loginUsername').value;
    let p = document.getElementById('loginPassword').value;
    let stored = localStorage.getItem('account_'+u);

    if(stored && stored === p){
        localStorage.setItem('user', u);
        goTo('listPage');
        await render();
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

async function getReviews(){ 
    let snapshot = await db.collection('reviews').get();
    return snapshot.docs.map(doc => doc.data());
}

async function render(){
    document.getElementById('categoryTitle').innerText = currentCategory;
    let grid = document.getElementById('mediaGrid');
    if(!grid) return;
    grid.innerHTML='';
    let reviews = await getReviews();

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

async function renderReviews(){
    let container = document.getElementById('reviews');
    container.innerHTML='';
    let snapshot = await db.collection('reviews').where('id', '==', currentItem.id).get();
    snapshot.forEach(doc => {
        let r = doc.data();
        container.innerHTML += `<p>${r.user}: ${r.comment} (${r.rating})</p>`;
    });
}

async function addReview(){
    if(!confirm('Submit review?')) return;
    let comment = document.getElementById('comment').value.trim();
    let rating = document.getElementById('rating').value;
    if(!comment){
        alert('Please enter a review before submitting.');
        return;
    }
    await db.collection('reviews').add({
    id: currentItem.id,
    user: localStorage.getItem('user'),
    comment,
    rating,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('comment').value='';
    await renderReviews();
    await render();
}
