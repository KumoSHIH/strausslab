//@prepros-prepend ./rolly.min.js

var bodyRolly;
var selector = '.main-wrapper'
var scrollEase = Number($(selector).attr('data-scroll-ease')) ? Number($(selector).attr('data-scroll-ease')) : 0.1
var options = {
  view: document.querySelector(selector),
  native: true,
  ease: scrollEase,
  ready: function (e) {
    setTimeout(function () {
      if (e.current == 0) {
        $('html,body').animate({
          opacity: 1
        }, 300, function () {
          // Animation complete.
        })
      }
    },100)
  },
  changeEnd: function () {
    $('html,body').animate({
      opacity: 1
    }, 300, function () {
      // Animation complete.
    })
  }
}

bodyRolly = rolly(options)

if ($(selector).find('*[data-scene]').length > 0) {
  bodyRolly.init()
}
else {
  $('html,body').animate({
    opacity: 1
  }, 300, function () {
    // Animation complete.
  })
}