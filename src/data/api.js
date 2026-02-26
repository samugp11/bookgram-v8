/* ════════════════════════════════════════
   STRAPI API — BookGram
   ════════════════════════════════════════ */
const STRAPI_URL = 'http://89.167.92.61:1337';

async function strapiGet(path) {
    try {
        const res = await fetch(`${STRAPI_URL}/api/${path}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.warn(`[API] Error fetching ${path}:`, e.message);
        return [];
    }
}

function normalizeBook(item) {
    const a = item.attributes || item;
    return {
        id:       item.id,
        title:    a.titulo   || '',
        author:   a.autor    || '',
        genre:    a.genero   || '',
        rating:   a.rating_medio || 0,
        price:    a.precio ? `\u20ac${Number(a.precio).toFixed(2)}` : '\u20ac0.00',
        year:     a.anio    || 0,
        pages:    a.paginas || 0,
        badge:    a.badge   || '',
        img:      a.portada_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        synopsis: a.sinopsis || '',
    };
}

function normalizePost(item) {
    const a = item.attributes || item;
    const autor = a.autor?.data?.attributes || a.autor || {};
    return {
        id:       item.id,
        title:    a.titulo   || '',
        tag:      a.tag      || '',
        tagClass: a.tag_class || 'badge--cobalt',
        excerpt:  a.extracto || '',
        author:   autor.nombre || 'BookGram',
        avatar:   autor.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        date:     a.fecha_pub ? new Date(a.fecha_pub).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' }) : '',
        readTime: a.tiempo_lectura || '5 min',
        img:      a.imagen_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
        content:  a.contenido || '',
    };
}

function normalizeUser(item) {
    const a = item.attributes || item;
    return {
        id:         item.id,
        name:       a.nombre  || '',
        username:   '@' + (a.usuario?.data?.attributes?.username || a.usuario?.username || 'user'),
        level:      a.nivel   || 'Nuevo lector',
        levelClass: a.nivel_class || 'badge--neutral',
        booksRead:  a.libros_leidos || 0,
        reviews:    a.total_resenas || 0,
        followers:  a.seguidores || 0,
        following:  a.siguiendo_count || 0,
        avatar:     a.avatar_url || '',
        books:      [],
        bio:        a.bio || '',
        genres:     a.generos_fav || [],
    };
}

function normalizeReto(item) {
    const a = item.attributes || item;
    const parts = a.participantes?.data || [];
    return {
        id:              item.id,
        title:           a.titulo      || '',
        desc:            a.descripcion || '',
        progress:        a.meta_numero > 0 ? Math.min(100, Math.round(((a.total_part||0) / a.meta_numero) * 100)) : 0,
        current:         `${a.total_part || 0} participantes`,
        goal:            `Meta: ${a.meta_numero || 0}`,
        colorClass:      a.color_class || '--cobalt',
        participants:    parts.slice(0,3).map(p => p.attributes?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face'),
        participantCount:`${a.total_part || 0} lectores`,
        badgeText:       a.badge_text  || 'Activo',
        badgeClass:      a.badge_class || 'badge--sage',
    };
}

export const API = {
    books:     [],
    blogPosts: [],
    users:     [],
    activities: [
        { user:'María García',    avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', action:'terminó de leer',    book:'Cien años de soledad', bookAuthor:'García Márquez',    bookImg:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=110&fit=crop',  time:'Hace 2 horas',  rating:'★★★★★' },
        { user:'Carlos Ruiz',     avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', action:'escribió una reseña de', book:'Dune', bookAuthor:'Frank Herbert', bookImg:'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=80&h=110&fit=crop', time:'Hace 4 horas', rating:'★★★★★' },
        { user:'Laura Martín',    avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', action:'comenzó a leer',      book:'El nombre del viento', bookAuthor:'Patrick Rothfuss', bookImg:'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&h=110&fit=crop', time:'Hace 5 horas', rating:'' },
        { user:'Pedro Gómez',     avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', action:'añadió a pendientes', book:'Sapiens', bookAuthor:'Yuval Noah Harari', bookImg:'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=80&h=110&fit=crop', time:'Hace 6 horas', rating:'' },
    ],
    challenges: [],
    clubs: [
        { id:1, name:'Lectores de Ciencia Ficción', desc:'Para amantes de mundos futuros y tecnología',        members:48, icon:'sci-fi',  color:'badge--cobalt' },
        { id:2, name:'Club de Fantasía Épica',       desc:'Dragones, magia y mundos imposibles',               members:63, icon:'fantasy', color:'badge--cobalt' },
        { id:3, name:'Románticos Empedernidos',      desc:'Las mejores historias de amor de todos los tiempos', members:35, icon:'romance', color:'badge--amber'  },
        { id:4, name:'Non-Fiction Addicts',          desc:'Aprender algo nuevo cada semana',                    members:41, icon:'nonfic',  color:'badge--sage'   },
    ],
};

export async function loadFromStrapi() {
    const [libros, posts, usuarios, retos] = await Promise.all([
        strapiGet('libros?pagination[limit]=100&sort=createdAt:asc'),
        strapiGet('posts?filters[publicado][$eq]=true&populate=autor&sort=fecha_pub:desc&pagination[limit]=20'),
        strapiGet('perfil-usuarios?pagination[limit]=50&sort=libros_leidos:desc'),
        strapiGet('retos?filters[activo][$eq]=true&populate=participantes&pagination[limit]=10'),
    ]);

    if (libros.length)   API.books      = libros.map(normalizeBook);
    if (posts.length)    API.blogPosts  = posts.map(normalizePost);
    if (usuarios.length) API.users      = usuarios.map(normalizeUser);
    if (retos.length)    API.challenges = retos.map(normalizeReto);

    return { books: API.books.length, posts: API.blogPosts.length, users: API.users.length, challenges: API.challenges.length };
}

export const PROFILE_DATA = {
    currentUser: {
        id:0, name:'', username:'', bio:'', avatar:'',
        level:'Nuevo lector', levelClass:'badge--neutral',
        booksRead:0, reviews:0, followers:0, following:0,
        booksThisYear:0, goalBooks:24, recentBooks:[], badges:[], genres:[]
    },
    extended: {},
};
