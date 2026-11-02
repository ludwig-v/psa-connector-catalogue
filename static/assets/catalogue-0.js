const modal=document.getElementById('image-zoom');
let photoTrigger=null;
document.querySelectorAll('.photo-button').forEach(button=>button.addEventListener('click',()=>{
 const thumbnail=button.querySelector('img');
 document.getElementById('zoom-image').src=thumbnail.src;
 document.getElementById('zoom-image').alt=thumbnail.alt;
 document.getElementById('zoom-image').style.transform=button.dataset.rotation==='180'?'rotate(180deg)':'none';
 document.getElementById('zoom-title').textContent=button.dataset.title;
 photoTrigger=button;modal.showModal();document.body.classList.add('zoom-open');
}));
document.getElementById('zoom-close').addEventListener('click',()=>modal.close());
modal.addEventListener('click',event=>{if(event.target===modal)modal.close();});
modal.addEventListener('close',()=>{document.body.classList.remove('zoom-open');document.getElementById('zoom-image').removeAttribute('src');if(photoTrigger)photoTrigger.focus();});
function normalizeSearch(value){return value.toLowerCase().replace(/\s+/g,'');}
function filterRows(value){const q=normalizeSearch(value);let count=0;document.querySelectorAll('.entry').forEach(row=>{row.hidden=!normalizeSearch(row.textContent+' '+(row.dataset.keywords||'')).includes(q);if(!row.hidden)count++;});document.querySelectorAll('main>section').forEach(section=>{const rows=Array.from(section.querySelectorAll('.entry'));section.hidden=rows.length>0&&!rows.some(row=>!row.hidden);});document.getElementById('result-count').textContent=count+' / '+document.querySelectorAll('.entry').length+' entries';document.getElementById('no-results').hidden=count!==0;}
document.getElementById('q').addEventListener('input',event=>filterRows(event.target.value));
document.getElementById('print').addEventListener('click',()=>window.print());
// Reveal anchor destinations before scrolling, including after a filtered search.
function revealCatalogueAnchor(hash){
 let id;try{id=decodeURIComponent(hash.slice(1));}catch{return;}
 const target=document.getElementById(id);if(!target)return;
 if(target.closest('[hidden]')){document.getElementById('q').value='';filterRows('');}
 for(let parent=target.parentElement;parent;parent=parent.parentElement){
  if(parent.tagName==='DETAILS')parent.open=true;
 }
 requestAnimationFrame(()=>{
  target.scrollIntoView({block:'start'});
  if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
  target.focus({preventScroll:true});
 });
}
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=event.target.closest('a[href^="#"]');if(!link||link.getAttribute('href')==='#')return;
 // Keep native hash/history behaviour; reveal the destination before it runs.
 revealCatalogueAnchor(link.getAttribute('href'));
});
window.addEventListener('hashchange',()=>revealCatalogueAnchor(location.hash));
if(location.hash)revealCatalogueAnchor(location.hash);
