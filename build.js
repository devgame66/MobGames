// Builds index.html, the "more games" page our apps open in a WebView.
// Edit the lists below, then run:  node build.js
// Image rules and how to add a game: README.md.
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------- data

// The game on the card at the top. ios: App Store id, or '' when there is
// no iPhone version (the card is then hidden on iPhone and iPad).
// badge: a word beside the "Featured" label, or '' for none.
const featured = {
  name: 'Bullet Fury: PvP Online 3D',
  line: 'Real-time online 3D FPS battles with friends around the world',
  pkg: 'com.online.pvp.shooter',
  ios: '',
  badge: 'NEW',
};

// The icon grid, in page order. name: as on Google Play. line: one short
// sentence (not shown in the grid today, kept for the featured card and
// future layouts). pkg: Google Play package; the icon is icon/<pkg>.jpg.
// ios: App Store id ('' hides the game on iPhone and iPad).
const apps = [
  { name: 'FPS Strike Ops: Modern Arena', line: 'Realistic 3D team shooter with online PvP', pkg: 'com.ta.strike.ops', ios: '1547911490' },
  { name: 'Zombie 3D Gun Trigger: PvP', line: 'Fight the zombie horde to survive', pkg: 'com.zombieshooting.survivalhunter.gun3d', ios: '1480803816' },
  { name: 'Pro Sniper: PvP Gunfight 3D', line: 'PvP, zombies and battle royale in one shooter', pkg: 'com.fun.marvelat.strikeforce.heroes', ios: '1551770851' },
  { name: 'Hero Survival - Shooter 3D', line: 'Rogue-style shooter: dodge, blast, clear dungeons', pkg: 'com.gun.hero.survivorio', ios: '1480803816' },
  { name: 'Special Ops: PvP Sniper Shooter', line: 'Special forces sniper missions, play offline', pkg: 'com.freeshooting.specialforces.war3d', ios: '1547913326' },
  { name: 'Gun Strike: FPS Shooting Games', line: 'Offline 5v5 gun battles on your phone', pkg: 'com.devgame66.csshot', ios: '1499786854' },
  { name: 'Traffic Moto Rider: Bike Race', line: 'Extreme 3D motorbike riding, play offline', pkg: 'com.racingmoto.trafficrider.bikerace', ios: '1480803816' },
  { name: 'Zombie Trigger 3D Gun Shooter', line: 'Survive the zombie apocalypse as a sniper', pkg: 'freegames.zombiesniper.deadtrigger', ios: '1480803816' },
  { name: 'Sniper 3D Gun Shooter: Offline', line: 'Pure sniper assassin missions', pkg: 'com.shootinggames.sniper3d.assassin', ios: '1551770851' },
  { name: 'Frontline Shooter: PvP', line: 'Commando FPS gunfights and sniper missions', pkg: 'com.gunshooting.counterstrike.fps', ios: '1547913442' },
  { name: 'Gun Fury: Shooting Games 3D', line: 'Open-world FPS battles, play offline', pkg: 'com.battle.ganstar.fps', ios: '1547911490' },
];

// Web games on peersgames.com (our own site). slug: the game's page,
// https://peersgames.com/game/<slug>/. Only GamePix games: their covers come
// in small sizes (?w=240). more: the PeersGames category behind "See all".
const web = [
  { title: 'FPS & shooting', key: 'fps', more: 'shooting', games: [
    ['gorilgo-fps-online-shooter', 'Gorilgo FPS'],
    ['last-squad-3d', 'Last Squad 3D'],
    ['voxel-mayhem', 'Voxel Mayhem'],
    ['courageous-sniper', 'Courageous Sniper'],
  ] },
  { title: 'Moto & bike', key: 'moto', more: 'racing', games: [
    ['moto-maniac-2', 'Moto Maniac 2'],
    ['super-bike-racing', 'Super Bike Racing'],
    ['moto-fury', 'Moto Fury'],
    ['moto-maniac', 'Moto Maniac'],
  ] },
];

// ---------------------------------------------------------------- checks

for (const a of [featured, ...apps]) {
  if (!fs.existsSync(path.join(__dirname, 'icon', `${a.pkg}.jpg`))) throw new Error(`missing icon/${a.pkg}.jpg (run tools/images.py ${a.pkg})`);
}
if (apps.some((a) => a.pkg === featured.pkg)) throw new Error('the featured game should not also be in the grid');

// ---------------------------------------------------------------- page

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const utm = (c) => `?utm_source=mo-mb&amp;utm_medium=more_page&amp;utm_campaign=${c}`;
const play = (pkg) => `https://play.google.com/store/apps/details?id=${pkg}&amp;referrer=utm_source%3Dmore%26utm_medium%3Dbanner`;
const cover = (slug) => `https://img.gamepix.com/games/${slug}/cover/${slug}.png?w=240`;
const tile = (a, i) => `<a class="tile" href="${play(a.pkg)}" data-app="${i}" data-ios="${a.ios}"><img src="icon/${a.pkg}.jpg" alt="" width="72" height="72"${i > 5 ? ' loading="lazy"' : ''}><b>${esc(a.name)}</b><i>GET</i></a>`;
const card = ([slug, name], key) => `<a class="card" href="https://peersgames.com/game/${slug}/${utm(key)}" data-h5="${slug}"><span class="th"><img src="${cover(slug)}" alt="" width="240" height="180" loading="lazy"><i>&#9654;</i></span><b>${esc(name)}</b></a>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Make People's Mobile Life More Connected Through Games.">
<meta name="theme-color" content="#0e1220">
<title>Featured Games</title>
<!-- Built by build.js; edit that file, not this one. -->
<style>
/* One small page for low-end phones: system fonts, no web fonts, no blur or
   animation, fixed image boxes so nothing moves while pictures load. */
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:#0e1220;color:#e9ecf5;font:14px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding-bottom:16px}
a{color:inherit;text-decoration:none;-webkit-tap-highlight-color:rgba(255,255,255,.08)}
[hidden]{display:none!important}
.wrap{max-width:640px;margin:0 auto;padding:0 12px}
header{padding:16px 4px 10px}
h1{font-size:20px;font-weight:800}
h1 small{display:block;font-size:12px;font-weight:400;color:#8f97ad;margin-top:2px}
h2{font-size:16px;font-weight:800}
.sub{font-size:12px;color:#8f97ad;margin-top:2px}
.hero{display:block;padding:12px;border-radius:16px;border:1px solid #33407a;background:#1e2a55;background:linear-gradient(135deg,#25356e 0%,#3a2060 100%)}
.lbl{display:block;font-size:11px;font-weight:800;letter-spacing:.8px;color:#ffb648;text-transform:uppercase}
.lbl i{margin-left:6px;padding:0 7px;border-radius:9px;background:#ffb648;color:#1a1200;font-style:normal;line-height:18px;display:inline-block}
.hero .r{display:flex;align-items:center;margin-top:10px}
.hero .r img{flex:none;width:72px;height:72px;border-radius:17px;background:#1b2133}
.hero .t{margin-left:12px;min-width:0}
.hero b{display:block;font-size:17px;line-height:1.2;font-weight:800}
.hero .t span{display:block;font-size:12px;color:#c3cbe2;margin-top:3px}
.hero .cta{display:block;margin-top:12px;padding:10px 0;border-radius:12px;background:#2fbf5b;color:#fff;text-align:center;font-weight:800;font-size:15px}
.apps{display:flex;flex-wrap:wrap;margin:6px -4px 0}
.tile{width:33.333%;padding:10px 4px 12px;text-align:center}
.tile img{display:block;width:72px;height:72px;margin:0 auto;border-radius:18px;background:#1b2133}
.tile b{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;height:30px;margin-top:7px;font-size:12px;line-height:15px;font-weight:600}
.tile i{display:inline-block;margin-top:6px;padding:0 14px;border-radius:11px;background:#2fbf5b;color:#fff;font-style:normal;font-weight:800;font-size:11px;line-height:22px}
.web{margin:10px -12px 0;padding:16px 0 6px;background:#161c30;border-top:1px solid #262f4b;border-bottom:1px solid #262f4b}
.web .hd{padding:0 16px}
.rowh{display:flex;align-items:baseline;justify-content:space-between;padding:0 16px;margin:14px 0 8px}
.rowh h3{font-size:12px;font-weight:700;color:#ffb648;text-transform:uppercase;letter-spacing:.6px}
.rowh a{font-size:12px;color:#8f97ad}
.swipe{display:flex;overflow-x:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;scroll-padding:0 16px;padding:0 16px 10px;scrollbar-width:none}
.swipe::-webkit-scrollbar{display:none}
.card{flex:none;width:148px;margin-right:10px;scroll-snap-align:start;border-radius:10px;overflow:hidden;background:#0e1220}
.th{display:block;position:relative;padding-top:75%;background:#1b2133}
.th img{position:absolute;left:0;top:0;width:100%;height:100%}
.th i{position:absolute;right:6px;bottom:6px;width:26px;height:26px;border-radius:50%;background:#ffb648;color:#1a1200;font-style:normal;font-size:11px;line-height:26px;text-align:center;padding-left:2px}
.card b{display:block;padding:6px 8px 8px;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style>
</head>
<body>
<div class="wrap">
<header><h1>Featured Games<small>Free games from our studio</small></h1></header>

<a class="hero" href="${play(featured.pkg)}" data-app="featured" data-ios="${featured.ios}">
  <span class="lbl">Featured${featured.badge ? `<i>${esc(featured.badge)}</i>` : ''}</span>
  <span class="r"><img src="icon/${featured.pkg}.jpg" alt="" width="72" height="72"><span class="t"><b>${esc(featured.name)}</b><span>${esc(featured.line)}</span></span></span>
  <span class="cta">Get it free</span>
</a>

<div class="apps">
${apps.map(tile).join('\n')}
</div>

<!-- Browser games on peersgames.com, our own site: plain links, nothing to
     install. Picked for small first loads and touch controls. -->
<section class="web">
  <div class="hd"><h2>Play instantly — no download</h2><p class="sub">Free browser games on our website, peersgames.com</p></div>
${web.map((g) => `  <div class="rowh"><h3>${esc(g.title)}</h3><a href="https://peersgames.com/category/${g.more}/${utm('more')}" data-h5="more-${g.key}">See all ›</a></div>
  <div class="swipe">${g.games.map((x) => card(x, g.key)).join('')}</div>`).join('\n')}
</section>
</div>

<script>
// iPhone and iPad go to the App Store; a game with no iPhone version is hidden there.
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  var rows = document.querySelectorAll('a[data-ios]');
  for (var i = 0; i < rows.length; i++) {
    var id = rows[i].getAttribute('data-ios');
    if (id) rows[i].href = 'itms-apps://itunes.apple.com/app/id' + id;
    else rows[i].hidden = true;
  }
}
// Google Analytics loads after the page is up, so it never holds the page back.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-RM37QWEYQ9');
window.addEventListener('load', function () {
  setTimeout(function () {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-RM37QWEYQ9';
    document.head.appendChild(s);
  }, 1200);
});
// Count the tap, then follow the link (at most 300 ms later).
// click_link: an app (label "featured" for the big card); click_h5: a web game.
document.addEventListener('click', function (e) {
  var a = e.target;
  while (a && !(a.tagName === 'A' && (a.hasAttribute('data-app') || a.hasAttribute('data-h5')))) a = a.parentNode;
  if (!a || a.nodeType !== 1) return;
  e.preventDefault();
  var href = a.href, gone = false;
  function go() { if (!gone) { gone = true; location.href = href; } }
  var app = a.getAttribute('data-app');
  if (app) gtag('event', 'click_link', { event_category: 'click', event_label: app === 'featured' ? 'featured' : 'link', value: app === 'featured' ? 100 : +app, transport_type: 'beacon', event_callback: go });
  else gtag('event', 'click_h5', { event_category: 'click', event_label: a.getAttribute('data-h5'), transport_type: 'beacon', event_callback: go });
  setTimeout(go, 300);
});
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log(`index.html ${Buffer.byteLength(html)} bytes, ${apps.length} apps + featured, ${web.reduce((n, g) => n + g.games.length, 0)} web games`);
