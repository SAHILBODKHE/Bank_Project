'use strict'

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal')
const overlay = document.querySelector('.overlay')
const btnCloseModal = document.querySelector('.btn--close-modal')
const btnsOpenModal = document.querySelectorAll('.btn--show-modal')

const openModal = function (e) {
  e.preventDefault()
  modal.classList.remove('hidden')
  overlay.classList.remove('hidden')
}

const closeModal = function () {
  modal.classList.add('hidden')
  overlay.classList.add('hidden')
}
btnsOpenModal.forEach((btn) => btn.addEventListener('click', openModal))
// for (let i = 0; i < btnsOpenModal.length; i++)
//   btnsOpenModal[i].addEventListener('click', openModal);

btnCloseModal.addEventListener('click', closeModal)
overlay.addEventListener('click', closeModal)

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal()
  }
})
console.log(document.documentElement)
console.log(document.head)
const header = document.querySelector('.header')
const allSections = document.querySelectorAll('.section')
document.getElementById('section--1')
const allButtons = document.getElementsByTagName('button')
console.log(allButtons)
console.log(document.getElementsByClassName('btn'))
const message = document.createElement('div')
message.classList.add('cookie-message')
message.innerHTML =
  'We use cookies for better experience .<button class="btn btn--close-cookie">Got it!</button>'
header.append(message)
document
  .querySelector('.btn--close-cookie')
  .addEventListener('click', function () {
    message.parentElement.removeChild(message)
  })
message.style.backgroundColor = '#37383d'
message.style.width = '120%'
console.log(message.style.color)
console.log(message.style.backgroundColor)
console.log(message.style.color)
console.log(getComputedStyle(message).color)
console.log(getComputedStyle(message).height)
message.style.height =
  Number.parseFloat(getComputedStyle(message).height, 10) + 30 + 'px'
console.log(message.style.height)
document.documentElement.style.setProperty('--color-primary', 'orangered')
const logo = document.querySelector('.nav__logo')
console.log(logo.getAttribute('designer'))
logo.setAttribute('designer', 'SB')
const btnScrollTo = document.querySelector('.btn--scroll-to')
const section1 = document.querySelector('#section--1')
btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect()
  console.log(s1coords)
  console.log(e.target.getBoundingClientRect())
  console.log('Current scroll(X/Y)', window.scrollX, scrollY)
  section1.scrollIntoView({ behavior: 'smooth' })
})
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min)
const randomColor = () =>
  `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`
console.log(randomColor(0, 255))
document.querySelector('.nav__link').addEventListener('click', function (e) {
  setInterval(function () {
    document.querySelector('.nav__link').style.backgroundColor = randomColor()
  }, 1000)
  // e.stopPropagation();
})
document.querySelector('.nav__links').addEventListener('click', function () {
  setInterval(function () {
    document.querySelector('.nav__links').style.backgroundColor = randomColor()
  }, 1000)
})
document.querySelector('.nav').addEventListener('click', function () {
  setInterval(function () {
    document.querySelector('.nav').style.backgroundColor = randomColor()
  }, 1000)
})
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();

//     const id = this.getAttribute('href');
//     console.log(id);
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault()
  console.log(e.target)
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href')
    console.log(id)
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' })
  }
})
const h1 = document.querySelector('h1')
console.log(h1.querySelectorAll('.highlight'))
;[...h1.parentElement.children].forEach(function (el) {
  if (el !== h1) el.style.transform = 'scale(0.5)'
})
const tabs = document.querySelectorAll('.operations__tab')
const tabsContainer = document.querySelector('.operations__tab-container')
const tabsContent = document.querySelectorAll('.operations__content')
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab')

  // Guard clause
  if (!clicked) return

  // Remove active classes
  tabs.forEach((t) => t.classList.remove('operations__tab--active'))
  tabsContent.forEach((c) => c.classList.remove('operations__content--active'))

  // Activate tab
  clicked.classList.add('operations__tab--active')

  // Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active')
})
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target
    const siblings = link.closest('.nav').querySelectorAll('.nav__link')
    const logo = link.closest('.nav').querySelector('img')
    siblings.forEach((el) => {
      if (el !== link) el.style.opacity = this
    })
    logo.style.opacity = this
  }
}
const nav = document.querySelector('.nav')
nav.addEventListener('mouseover', handleHover.bind(0.5))
nav.addEventListener('mouseout', handleHover.bind(1))
// const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height
console.log(navHeight)
const stickyNav = function (entries) {
  const [entry] = entries

  if (!entry.isIntersecting) nav.classList.add('sticky')
  else nav.classList.remove('sticky')
}
const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`,
})
headerObserver.observe(header)
// const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries

  if (!entry.isIntersecting) return

  entry.target.classList.remove('section--hidden')
  observer.unobserve(entry.target)
}

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
})

allSections.forEach(function (section) {
  sectionObserver.observe(section)
  section.classList.add('section--hidden')
})
const imgTargets = document.querySelectorAll('img[data-src]')

const loadImg = function (entries, observer) {
  const [entry] = entries

  if (!entry.isIntersecting) return

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src

  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img')
  })

  observer.unobserve(entry.target)
}

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
})

imgTargets.forEach((img) => imgObserver.observe(img))
