// Select provider storefronts using browser language and region preferences.
// Browser locale is a preference, not geolocation. Unknown locales use the UK store.
function rsStoreForLanguages(languages) {
  const regions = {
    FR:'fr', GB:'uk', IE:'ie', DE:'de', AT:'at', CH:'ch', NL:'nl',
    IT:'it', ES:'es', PT:'pt', PL:'pl', CZ:'cz', DK:'dk', NO:'no',
    SE:'se', FI:'fi', AU:'au', NZ:'nz', SG:'sg', MY:'my', PH:'ph',
    TH:'th', JP:'jp', KR:'kr', ZA:'za'
  };
  const defaults = {
    fr:'fr', en:'uk', de:'de', nl:'nl', it:'it', es:'es', pt:'pt',
    pl:'pl', cs:'cz', da:'dk', no:'no', nb:'no', nn:'no', sv:'se',
    fi:'fi', ja:'jp', ko:'kr', th:'th', ms:'my'
  };
  for (const language of languages) {
    let locale;
    try { locale = new Intl.Locale(language); } catch { continue; }
    if (locale.region === 'BE') return locale.language === 'nl' ? 'benl' : 'befr';
    if (locale.region === 'HK') return locale.language === 'zh' ? 'hkcn' : 'hken';
    if (locale.region === 'TW') return locale.language === 'zh' ? 'twcn' : 'twen';
    if (regions[locale.region]) return regions[locale.region];
    if (defaults[locale.language]) return defaults[locale.language];
  }
  return 'uk';
}
function localizeRsLinks() {
  const preferences = navigator.languages && navigator.languages.length
    ? navigator.languages : [navigator.language || 'en-GB'];
  const store = rsStoreForLanguages(preferences);
  document.querySelectorAll('.buy-links a[href*=".rs-online.com/"]').forEach(link => {
    const url = new URL(link.href);
    if (!/^(?:[a-z]+\.)?rs-online\.com$/.test(url.hostname)) return;
    url.hostname = store + '.rs-online.com';
    url.pathname = '/web/c/';
    link.href = url.href;
  });
}
localizeRsLinks();
window.addEventListener('languagechange', localizeRsLinks);

function providerHostForLanguages(languages, regions, defaults, fallback) {
  for (const language of languages) {
    let locale;
    try { locale = new Intl.Locale(language); } catch { continue; }
    if (regions[locale.region]) return regions[locale.region];
    if (defaults[locale.language]) return defaults[locale.language];
  }
  return fallback;
}
function localizeMouserAndFarnellLinks() {
  const preferences = navigator.languages && navigator.languages.length
    ? navigator.languages : [navigator.language || 'en-GB'];
  const mouser = providerHostForLanguages(preferences, {
    FR:'www.mouser.fr', GB:'www.mouser.co.uk', DE:'www.mouser.de',
    IT:'www.mouser.it', ES:'www.mouser.es', NL:'www.mouser.nl',
    BE:'www.mouser.be', CH:'www.mouser.ch', AT:'www.mouser.at',
    US:'www.mouser.com', CA:'www.mouser.ca', AU:'www.mouser.com.au',
    JP:'www.mouser.jp', IN:'www.mouser.in'
  }, {
    fr:'www.mouser.fr', en:'www.mouser.com', de:'www.mouser.de',
    it:'www.mouser.it', es:'www.mouser.es', nl:'www.mouser.nl', ja:'www.mouser.jp'
  }, 'www.mouser.com');
  const farnellRegions = {};
  for (const region of ['AT','BE','BG','CZ','DK','EE','FI','FR','DE','HU','IE','IL',
    'IT','LV','LT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH','TR','JP']) {
    farnellRegions[region] = region.toLowerCase() + '.farnell.com';
  }
  farnellRegions.GB = 'uk.farnell.com';
  const farnell = providerHostForLanguages(preferences, farnellRegions, {
    fr:'fr.farnell.com', en:'uk.farnell.com', de:'de.farnell.com',
    it:'it.farnell.com', es:'es.farnell.com', nl:'nl.farnell.com',
    pt:'pt.farnell.com', pl:'pl.farnell.com', cs:'cz.farnell.com',
    da:'dk.farnell.com', no:'no.farnell.com', nb:'no.farnell.com',
    nn:'no.farnell.com', sv:'se.farnell.com', fi:'fi.farnell.com', ja:'jp.farnell.com'
  }, 'uk.farnell.com');
  document.querySelectorAll('.buy-links a').forEach(link => {
    const url = new URL(link.href);
    if (/^www\.mouser\.(?:com|fr|co\.uk|de|it|es|nl|be|ch|at|ca|com\.au|jp|in)$/.test(url.hostname)) {
      url.hostname = mouser;
      url.pathname = '/c/';
    } else if (/^[a-z]+\.farnell\.com$/.test(url.hostname)) {
      url.hostname = farnell;
      url.pathname = '/search';
    } else return;
    link.href = url.href;
  });
}
localizeMouserAndFarnellLinks();
window.addEventListener('languagechange', localizeMouserAndFarnellLinks);

function digiKeyStoreForLanguages(languages) {
  // Explicit storefronts avoid constructing country domains that may not exist.
  const regions = {
    FR:['www.digikey.fr',['fr','en']], GB:['www.digikey.co.uk',['en']],
    DE:['www.digikey.de',['de','en']], AT:['www.digikey.at',['de','en']],
    CH:['www.digikey.ch',['de','fr','it','en']],
    BE:['www.digikey.be',['nl','fr','en']], NL:['www.digikey.nl',['nl','en']],
    IT:['www.digikey.it',['it','en']], ES:['www.digikey.es',['es','en']],
    PT:['www.digikey.pt',['pt','en']], PL:['www.digikey.pl',['pl','en']],
    US:['www.digikey.com',['en','es']], CA:['www.digikey.ca',['en','fr']],
    AU:['www.digikey.com.au',['en']], NZ:['www.digikey.co.nz',['en']],
    JP:['www.digikey.jp',['ja','en']]
  };
  const defaults = {fr:'FR',en:'US',de:'DE',nl:'NL',it:'IT',es:'ES',pt:'PT',pl:'PL',ja:'JP'};
  for (const language of languages) {
    let locale;
    try { locale = new Intl.Locale(language); } catch { continue; }
    const store = regions[locale.region] || regions[defaults[locale.language]];
    if (store) return {
      host: store[0], language: store[1].includes(locale.language) ? locale.language : 'en'
    };
  }
  return {host:'www.digikey.com', language:'en'};
}
function localizeDigiKeyLinks() {
  const preferences = navigator.languages && navigator.languages.length
    ? navigator.languages : [navigator.language || 'en'];
  const store = digiKeyStoreForLanguages(preferences);
  document.querySelectorAll('.buy-links a').forEach(link => {
    // The stable icon identity still matches after a languagechange reroutes the link.
    if (link.querySelector('img')?.alt !== 'DigiKey') return;
    const url = new URL(link.href);
    url.hostname = store.host;
    url.pathname = '/' + store.language + '/products';
    link.href = url.href;
  });
}
localizeDigiKeyLinks();
window.addEventListener('languagechange', localizeDigiKeyLinks);
