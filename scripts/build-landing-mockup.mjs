// Generates a self-contained landing-page mockup (real photos inlined as data
// URIs) for quick review, written to the scratchpad. Not part of the app.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const OUT = process.argv[2] || join(ROOT, 'landing-mockup.html')

const mime = (f) => f.endsWith('.png') ? 'image/png' : 'image/jpeg'
const dataUri = (rel) => {
  const b = readFileSync(join(ROOT, 'public', rel))
  return `data:${mime(rel)};base64,${b.toString('base64')}`
}

const hero = dataUri('images/environment/girl-painting.jpg')
const parents = dataUri('images/environment/baby-playing.jpg')
const schools = dataUri('images/environment/girls-art.jpg')
const story = dataUri('images/environment/reading-nook.jpg')
const covers = [
  '2024-may', '2024-august', '2024-february',
  '2023-november', '2023-september', '2023-april', '2022-november',
].map(n => dataUri(`newsletters/covers/${n}.jpg`))

const coverImgs = covers.map(c => `<img class="cover" src="${c}" alt="Tomorrow's Child cover" />`).join('\n        ')

const html = `<style>
  :root{
    --cream:#faf6f0; --paper:#fffdfa; --ink:#1f1330; --ink-soft:#5b4f66;
    --plum:#2d1b4e; --purple:#4a2c82; --terra:#c97a3c; --sage:#3f7a6d;
    --line:#e7ded2;
    --serif: Georgia, 'Cormorant Garamond', 'Times New Roman', serif;
    --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  *{box-sizing:border-box;}
  body{margin:0;}
  .mk{background:var(--cream); color:var(--ink); font-family:var(--sans); -webkit-font-smoothing:antialiased; line-height:1.5;}
  .mk .wrap{max-width:1120px; margin:0 auto; padding:0 clamp(24px,5vw,72px);}
  .mk .serif{font-family:var(--serif);}
  .mk .eyebrow{font-size:11px; letter-spacing:.2em; text-transform:uppercase; font-weight:700; color:var(--terra);}

  /* nav */
  .mk nav{display:flex; align-items:center; justify-content:space-between; padding:22px clamp(24px,5vw,72px); max-width:1264px; margin:0 auto;}
  .mk .brand{font-family:var(--serif); font-size:20px; font-weight:700; letter-spacing:-.01em;}
  .mk .navlinks{display:flex; align-items:center; gap:26px; font-size:14px; font-weight:500; color:var(--ink-soft);}
  .mk .navlinks a{color:var(--ink-soft); text-decoration:none;}
  .mk .btn{display:inline-flex; align-items:center; gap:8px; background:var(--purple); color:#fff; font-weight:600; font-size:14px; padding:11px 22px; border-radius:999px; text-decoration:none; border:none; cursor:pointer;}
  .mk .btn.terra{background:var(--terra);}
  .mk .btn.ghost{background:transparent; color:var(--ink); border:1px solid var(--line);}

  /* hero */
  .mk .hero{position:relative; min-height:78vh; display:flex; align-items:flex-end; color:#fff; overflow:hidden;}
  .mk .hero img.bg{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 30%;}
  .mk .hero .scrim{position:absolute; inset:0; background:linear-gradient(180deg, rgba(31,19,48,.15) 0%, rgba(31,19,48,.35) 45%, rgba(31,19,48,.82) 100%);}
  .mk .hero .inner{position:relative; padding:0 0 84px; max-width:720px;}
  .mk .hero .eyebrow{color:#f4d9bf;}
  .mk .hero h1{font-family:var(--serif); font-weight:600; font-size:clamp(2.6rem,6vw,4.6rem); line-height:1.03; margin:16px 0 18px; text-wrap:balance;}
  .mk .hero h1 em{color:#e6b98b; font-style:italic;}
  .mk .hero p{font-size:clamp(1.05rem,1.6vw,1.28rem); color:rgba(255,255,255,.9); max-width:560px; margin:0 0 26px;}
  .mk .hero .cta{display:flex; gap:12px; flex-wrap:wrap;}
  .mk .hero .founder{margin-top:22px; font-size:13px; color:rgba(255,255,255,.7); font-style:italic; font-family:var(--serif);}

  /* audience */
  .mk section{padding:clamp(64px,9vw,110px) 0;}
  .mk .aud{display:grid; grid-template-columns:1fr 1fr; gap:32px;}
  .mk .card{background:var(--paper); border:1px solid var(--line); border-radius:22px; overflow:hidden; display:flex; flex-direction:column;}
  .mk .card .ph{aspect-ratio:16/10; overflow:hidden;}
  .mk .card .ph img{width:100%; height:100%; object-fit:cover; transition:transform .5s ease;}
  .mk .card:hover .ph img{transform:scale(1.04);}
  .mk .card .body{padding:32px 34px 36px;}
  .mk .card h3{font-family:var(--serif); font-size:1.7rem; font-weight:600; margin:10px 0 12px; line-height:1.15;}
  .mk .card p{color:var(--ink-soft); font-size:.98rem; margin:0 0 18px;}
  .mk .card .go{font-weight:600; font-size:.95rem; text-decoration:none; display:inline-flex; gap:8px; align-items:center;}
  .mk .card.p .go, .mk .card.p .eyebrow{color:var(--purple);}
  .mk .card.s .go, .mk .card.s .eyebrow{color:var(--sage);}

  .mk h2.sec{font-family:var(--serif); font-weight:600; font-size:clamp(2rem,3.6vw,2.7rem); text-align:center; max-width:720px; margin:8px auto 0; line-height:1.12; text-wrap:balance;}
  .mk h2.sec em{color:var(--purple); font-style:italic;}
  .mk .center-eyebrow{text-align:center;}

  /* quote */
  .mk .quote{background:var(--plum); color:#fff; text-align:center;}
  .mk .quote blockquote{font-family:var(--serif); font-style:italic; font-size:clamp(1.5rem,2.8vw,2rem); color:#e9d8c6; max-width:780px; margin:0 auto; line-height:1.45;}
  .mk .quote cite{display:block; margin-top:22px; font-style:normal; font-family:var(--sans); font-size:12px; letter-spacing:.12em; color:rgba(255,255,255,.55);}

  /* features */
  .mk .feat{display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:60px;}
  .mk .fcard{background:var(--paper); border:1px solid var(--line); border-radius:18px; padding:30px 30px 32px;}
  .mk .fcard .tag{width:38px; height:3px; border-radius:2px; background:var(--terra); margin-bottom:16px;}
  .mk .fcard h4{font-family:var(--serif); font-size:1.15rem; margin:0 0 8px;}
  .mk .fcard p{color:var(--ink-soft); font-size:.92rem; margin:0;}

  /* covers */
  .mk .tc{background:linear-gradient(180deg,#fff8ef,#faf6f0);}
  .mk .coverrow{display:flex; gap:22px; overflow-x:auto; padding:20px clamp(24px,5vw,72px) 28px; scroll-snap-type:x mandatory;}
  .mk .coverrow .cover{height:300px; border-radius:10px; box-shadow:0 10px 30px rgba(31,19,48,.16); scroll-snap-align:start; flex:0 0 auto;}

  /* story */
  .mk .story{display:grid; grid-template-columns:1.05fr 1fr; gap:clamp(40px,6vw,72px); align-items:center;}
  .mk .story .ph{border-radius:20px; overflow:hidden; aspect-ratio:4/5;}
  .mk .story .ph img{width:100%; height:100%; object-fit:cover;}
  .mk .story h2{font-family:var(--serif); font-weight:600; font-size:clamp(1.9rem,3.2vw,2.5rem); line-height:1.14; margin:12px 0 18px; text-wrap:balance;}
  .mk .story p{color:var(--ink-soft); font-size:1.02rem; margin:0 0 16px;}

  /* cta */
  .mk .final{background:var(--purple); color:#fff; text-align:center; border-radius:0;}
  .mk .final h2{font-family:var(--serif); font-weight:600; font-size:clamp(2rem,3.4vw,2.6rem); margin:0 0 14px; text-wrap:balance;}
  .mk .final p{color:rgba(255,255,255,.85); max-width:520px; margin:0 auto 26px;}
  .mk .final .btn.terra{background:#fff; color:var(--purple);}

  .mk footer{padding:34px 24px; text-align:center; color:var(--ink-soft); font-size:13px;}

  @media(max-width:760px){
    .mk .aud,.mk .feat,.mk .story{grid-template-columns:1fr;}
    .mk .navlinks a:not(.btn){display:none;}
    .mk .coverrow .cover{height:220px;}
  }
</style>

<div class="mk">
  <nav>
    <div class="brand">Montessori Family Alliance</div>
    <div class="navlinks">
      <a href="#">For Parents</a>
      <a href="#">For Schools</a>
      <a href="#">Learning Center</a>
      <a href="#">Log in</a>
      <a class="btn" href="#">Get Started</a>
    </div>
  </nav>

  <header class="hero">
    <img class="bg" src="${hero}" alt="A child painting" />
    <div class="scrim"></div>
    <div class="wrap"><div class="inner">
      <div class="eyebrow">From The Montessori Foundation</div>
      <h1 class="serif">Where Montessori families and schools <em>come together</em></h1>
      <p>Trusted guidance, curriculum insight, and tools that turn parents into real partners — in step with the schools that guide them.</p>
      <div class="cta">
        <a class="btn terra" href="#">Explore for Parents →</a>
        <a class="btn ghost" style="color:#fff;border-color:rgba(255,255,255,.5)" href="#">For Schools →</a>
      </div>
      <div class="founder">Founded by Tim Seldin, President of The Montessori Foundation</div>
    </div></div>
  </header>

  <section class="wrap">
    <div class="aud">
      <a class="card p" href="#" style="text-decoration:none;color:inherit">
        <div class="ph"><img src="${parents}" alt="Parent and child" /></div>
        <div class="body">
          <div class="eyebrow">For Parents</div>
          <h3 class="serif">Deepen your understanding at home</h3>
          <p>Montessori guidance, curriculum-area insight, and observation tools so you can be the informed partner your child's teachers count on.</p>
          <span class="go">For Parents →</span>
        </div>
      </a>
      <a class="card s" href="#" style="text-decoration:none;color:inherit">
        <div class="ph"><img src="${schools}" alt="Children learning together" /></div>
        <div class="body">
          <div class="eyebrow">For Schools</div>
          <h3 class="serif">Support your families, strengthen your community</h3>
          <p>Give every family philosophy-aligned guidance, a re-enrollment playbook, and Foundation content that keeps parents engaged.</p>
          <span class="go">For Schools →</span>
        </div>
      </a>
    </div>
  </section>

  <section class="quote">
    <div class="wrap">
      <blockquote>"The greatest gifts we can give our children are the roots of responsibility and the wings of independence."</blockquote>
      <cite>— MARIA MONTESSORI</cite>
    </div>
  </section>

  <section class="wrap">
    <div class="center-eyebrow eyebrow">What the Alliance Provides</div>
    <h2 class="sec serif">The trusted source for the <em>Montessori movement</em></h2>
    <div class="feat">
      <div class="fcard"><div class="tag"></div><h4 class="serif">Foundation Library</h4><p>Hundreds of articles, videos, and webinars from Tim Seldin and Foundation contributors.</p></div>
      <div class="fcard"><div class="tag"></div><h4 class="serif">Abigail, the AI Guide</h4><p>A philosophy-aligned assistant answering Montessori questions 24/7 — never contradicting the classroom.</p></div>
      <div class="fcard"><div class="tag"></div><h4 class="serif">Family–School Partnership</h4><p>Observation prompts, conference prep, and age-appropriate guidance that bridge home and school.</p></div>
      <div class="fcard"><div class="tag"></div><h4 class="serif">Tomorrow's Child</h4><p>The Foundation's flagship magazine for parents and educators — decades of issues in one place.</p></div>
      <div class="fcard"><div class="tag"></div><h4 class="serif">Development Tracking</h4><p>Help families celebrate growth using the official Foundation curriculum framework.</p></div>
      <div class="fcard"><div class="tag"></div><h4 class="serif">Built with Educators</h4><p>Designed with Montessori schools — to support, never replace, trained guides.</p></div>
    </div>
  </section>

  <section class="tc">
    <div class="wrap" style="padding-bottom:0">
      <div class="center-eyebrow eyebrow">From the Archive</div>
      <h2 class="sec serif" style="margin-bottom:8px">Decades of <em>Tomorrow's Child</em></h2>
    </div>
    <div class="coverrow">
        ${coverImgs}
    </div>
  </section>

  <section class="wrap">
    <div class="story">
      <div class="ph"><img src="${story}" alt="A child reading" /></div>
      <div>
        <div class="eyebrow">Our Heritage</div>
        <h2 class="serif">Built on decades of Montessori wisdom</h2>
        <p>The Montessori Foundation has guided families and schools for over thirty years — through its magazine, its conferences, and the leadership of Tim Seldin.</p>
        <p>Family Alliance brings that trusted body of knowledge into everyday family life: the same philosophy that shapes the classroom, now supporting the hours children spend at home.</p>
        <a class="btn terra" style="margin-top:8px" href="#">Meet the Foundation →</a>
      </div>
    </div>
  </section>

  <section class="final">
    <div class="wrap">
      <h2 class="serif">Give every family a prepared environment</h2>
      <p>Join the parents, educators, and schools building a stronger Montessori community together.</p>
      <a class="btn terra" href="#">Get Started →</a>
    </div>
  </section>

  <footer>© Montessori Family Alliance · A prepared environment for parents · <em>Mockup preview</em></footer>
</div>`

writeFileSync(OUT, html, 'utf8')
console.log('Wrote', OUT, `(${Math.round(html.length / 1024)} KB)`)
