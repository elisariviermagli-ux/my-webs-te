/**
 * 1. CONFIGURATION GÉNÉRALE ET VARIABLES
 */
const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');

let segments = []; // Stockage des traits
let mouse = { x: 0, y: 0, lastX: 0, lastY: 0 };
let isCanvasAllowed = true; // Contrôle si le dessin est autorisé

const TRAIL_LIFETIME = 5000; // Durée de vie des traits (2s)
const LINE_WIDTH = 2;

// Données des projets
const projectsData = {
    'p1': { title: "Projet Alpha", desc: "Description complète du projet Alpha..." },
    'p2': { title: "Projet Beta", desc: "Description complète du projet Beta..." }
};

/**
 * 2. SYSTÈME DE NAVIGATION (ROUTER)
 */

// Fonction pour changer d'URL/Vue
window.router = function(viewId, projectId = null) {
    const hash = projectId ? `${viewId}/${projectId}` : viewId;
    window.location.hash = hash;
};

// Gestionnaire d'état (s'exécute au changement d'URL)
function handleRouting() {
    const hash = window.location.hash.replace('#', '');
    const [viewId, projectId] = hash.split('/');
    
    const targetView = viewId || 'page-home';

    // 1. Mise à jour visuelle des sections
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const activeSection = document.getElementById(targetView);
    
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // 2. Injection du contenu si c'est une page détail
    if (targetView === 'page-detail' && projectId) {
        renderDetail(projectId);
    }

    // 3. Activation/Désactivation du canvas
    isCanvasAllowed = (targetView === 'page-home');
    
    // On remonte en haut de page à chaque changement
    window.scrollTo(0, 0);
}

// Rendu du contenu de la page détail
function renderDetail(id) {
    const project = projectsData[id];
    const container = document.getElementById('detail-content');
    
    if (project) {
        container.innerHTML = `
            <button onclick="window.history.back()">← RETOUR AUX PROJETS</button>
            <div class="project-info">
                <h1>${project.title}</h1>
                <p>${project.desc}</p>
            </div>
        `;
    }
}

// Écouteurs pour la navigation
window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

/**
 * 3. GESTION DU CANVAS ET DU TRAIT
 */

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
}

window.addEventListener('resize', resize);
window.addEventListener('load', resize);

// Capture du mouvement de souris
window.addEventListener('mousemove', (e) => {
    if (!isCanvasAllowed) return;

    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = e.pageX;
    mouse.y = e.pageY;

    if (mouse.lastX !== 0 && mouse.lastY !== 0) {
        segments.push({
            x1: mouse.lastX,
            y1: mouse.lastY,
            x2: mouse.x,
            y2: mouse.y,
            time: Date.now()
        });
    }
});

/**
 * 4. BOUCLE D'ANIMATION (LE MOTEUR)
 */

function animate() {
    // Si on n'est pas sur l'accueil, on nettoie tout et on attend
    if (!isCanvasAllowed) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        segments = []; // On vide les traits pour éviter les bugs au retour
        requestAnimationFrame(animate);
        return; 
    }

    // Dessin normal sur la page Home
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();

    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    segments = segments.filter(seg => {
        const age = now - seg.time;
        const remainingLife = 1 - (age / TRAIL_LIFETIME);

        if (remainingLife > 0) {
            ctx.globalAlpha = remainingLife;
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
            return true;
        }
        return false;
    });

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animate);
}

// Lancement initial
animate();














// Fonction pour ouvrir la Lightbox
window.openLightbox = function(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    lightboxImg.src = imageSrc; // On donne la source de l'image cliquée
    lightbox.classList.add('active');
    
    // On bloque le scroll du site derrière
    document.body.style.overflow = 'hidden';
};

// Fonction pour fermer la Lightbox
window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    
    // On réactive le scroll
    document.body.style.overflow = 'auto';
};
