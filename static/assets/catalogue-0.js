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
function filterRows(value){const q=normalizeSearch(value);let count=0;document.querySelectorAll('.entry').forEach(row=>{row.hidden=!normalizeSearch(row.textContent+' '+(row.dataset.keywords||'')).includes(q);if(!row.hidden)count++;});document.querySelectorAll('main>section').forEach(section=>{section.hidden=!Array.from(section.querySelectorAll('.entry')).some(row=>!row.hidden);});document.getElementById('result-count').textContent=count+' / '+document.querySelectorAll('.entry').length+' entries';document.getElementById('no-results').hidden=count!==0;}
document.getElementById('q').addEventListener('input',event=>filterRows(event.target.value));
document.getElementById('print').addEventListener('click',()=>window.print());