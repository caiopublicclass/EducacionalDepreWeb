const menuButton = document.querySelector('.toggle');
const navigation = document.querySelector('#nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('open', !expanded);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Estimativas PNS 2019: prevalência de diagnóstico autorreferido em adultos.
const states = [
  ['AC','Acre',6.0,'4,8–7,2'],['AL','Alagoas',6.2,'5,0–7,4'],['AP','Amapá',4.5,'2,4–6,7'],['AM','Amazonas',4.2,'3,2–5,2'],
  ['BA','Bahia',6.3,'5,3–7,3'],['CE','Ceará',8.1,'7,0–9,2'],['DF','Distrito Federal',9.4,'7,8–11,0'],['ES','Espírito Santo',11.3,'9,8–12,8'],
  ['GO','Goiás',12.0,'10,3–13,8'],['MA','Maranhão',5.4,'4,7–6,2'],['MT','Mato Grosso',8.2,'6,8–9,5'],['MS','Mato Grosso do Sul',10.1,'8,8–11,3'],
  ['MG','Minas Gerais',13.7,'12,1–15,2'],['PA','Pará',4.1,'3,0–5,2'],['PB','Paraíba',7.6,'6,3–8,8'],['PR','Paraná',13.9,'12,2–15,6'],
  ['PE','Pernambuco',6.8,'5,7–7,8'],['PI','Piauí',6.9,'5,6–8,2'],['RJ','Rio de Janeiro',8.1,'7,1–9,0'],['RN','Rio Grande do Norte',8.5,'7,2–9,8'],
  ['RS','Rio Grande do Sul',17.9,'16,2–19,6'],['RO','Rondônia',9.0,'7,3–10,7'],['RR','Roraima',5.1,'3,9–6,3'],['SC','Santa Catarina',13.1,'11,8–14,5'],
  ['SE','Sergipe',8.5,'7,4–9,7'],['SP','São Paulo',11.8,'10,6–12,9'],['TO','Tocantins',6.6,'5,3–8,0']
];
// Cartograma posicional aproximado para manter as 27 UFs legíveis sem dependência externa.
const positions = {RR:[4,1],AP:[6,1],AM:[3,2],PA:[5,2],AC:[2,3],RO:[3,3],TO:[5,3],MA:[6,3],CE:[7,3],RN:[8,3],PB:[8,4],PI:[6,4],PE:[7,4],AL:[8,5],SE:[7,5],BA:[6,5],MT:[4,4],DF:[5,5],GO:[5,4],MS:[4,5],MG:[6,6],ES:[7,6],RJ:[7,7],SP:[6,7],PR:[5,7],SC:[5,8],RS:[4,9]};
const map = document.querySelector('#state-map');
const selectedName = document.querySelector('#state-name');
const selectedValue = document.querySelector('#state-value');
const selectedCI = document.querySelector('#state-ci');
const selectedContext = document.querySelector('#state-context');
const min = 4.1;
const max = 17.9;
const mapStops = [
  { at: 0, rgb: [88, 121, 103] },
  { at: 0.5, rgb: [88, 118, 129] },
  { at: 1, rgb: [158, 96, 78] }
];
function mapColor(position) {
  const left = position < 0.5 ? mapStops[0] : mapStops[1];
  const right = position < 0.5 ? mapStops[1] : mapStops[2];
  const progress = (position - left.at) / (right.at - left.at);
  const rgb = left.rgb.map((value, channel) => Math.round(value + (right.rgb[channel] - value) * progress));
  return `rgb(${rgb.join(' ')})`;
}
function setSelection(state, button) {
  map.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  selectedName.textContent = state[1];
  selectedValue.textContent = `${state[2].toFixed(1).replace('.', ',')}%`;
  selectedCI.textContent = `Intervalo de confiança de 95%: ${state[3]}%.`;
  selectedContext.textContent = `Em cada 100 adultos, aproximadamente ${state[2].toFixed(1).replace('.', ',')} relataram diagnóstico na pesquisa.`;
}
states.forEach((state) => {
  const button = document.createElement('button');
  const intensity = (state[2] - min) / (max - min);
  button.type = 'button';
  button.className = 'state-tile';
  button.style.setProperty('--heat', intensity.toFixed(2));
  button.style.setProperty('--tile-color', mapColor(intensity));
  button.style.gridColumn = positions[state[0]][0];
  button.style.gridRow = positions[state[0]][1];
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', `${state[1]}: ${state[2].toFixed(1).replace('.', ',')} por cento`);
  button.innerHTML = `<strong>${state[0]}</strong><span>${state[2].toFixed(1).replace('.', ',')}%</span>`;
  button.addEventListener('click', () => setSelection(state, button));
  map.append(button);
});
const rioGrandeDoSul = states.find((state) => state[0] === 'RS');
setSelection(rioGrandeDoSul, map.querySelector('[aria-label^="Rio Grande do Sul"]'));

const carousel = document.querySelector('.story-carousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.story-slide')];
  const dots = carousel.querySelector('.carousel-dots');
  const status = carousel.querySelector('.carousel-status');
  let currentSlide = 0;

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.hidden = slideIndex !== currentSlide;
      slide.setAttribute('aria-label', `${slideIndex + 1} de ${slides.length}`);
    });
    [...dots.children].forEach((dot, dotIndex) => {
      dot.setAttribute('aria-pressed', String(dotIndex === currentSlide));
    });
    status.textContent = `Relato ${currentSlide + 1} de ${slides.length}`;
  }

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Mostrar relato ${index + 1}: ${slide.querySelector('h3').textContent}`);
    dot.setAttribute('aria-pressed', String(index === 0));
    dot.addEventListener('click', () => showSlide(index));
    dots.append(dot);
  });
  carousel.querySelector('[data-direction="prev"]').addEventListener('click', () => showSlide(currentSlide - 1));
  carousel.querySelector('[data-direction="next"]').addEventListener('click', () => showSlide(currentSlide + 1));
}
