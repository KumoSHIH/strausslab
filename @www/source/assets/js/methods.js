// 驗證
var isObject = function(obj){
  let $obj = $(obj);
  if(typeOf($obj) !== undefined && $obj.length >= 1) return false;
}

//IOS 回上一頁空白修正
function appleDebug() {
  window.onpageshow = function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  };
}

// 點擊開關class
// clickToggleClass(點擊目標,加上cls名稱)
function clickToggleClass(target, className) {
  $(target).off().click(function () {
    $(this).toggleClass(className);
  });
}

// 點擊切換active
// clickSwitchClass(點擊目標,加上cls名稱)
function clickSwitchClass(target, className) {
  $(target).off().click(function () {
    $(target).not(this).removeClass(className);
    $(this).addClass(className);
  });
}


// 驗證碼
// 搭配以下結構使用
// .verification-wrap(data-verify-code="")
//   input(type="number" maxlength="1")
//   input(type="number" maxlength="1")
//   input(type="number" maxlength="1")
//   input(type="number" maxlength="1")
//   input(type="number" maxlength="1")
//   input(type="number" maxlength="1")
function verificationInput() {
  let codeArray = [];
  let reducer = (accumulator, currentValue) => `${accumulator}` + `${currentValue}`;
  let clear = 0
  $('.verification-wrap input').val('')
  $('.verification-wrap input:first-child').focus();
  $(".verification-wrap input").each(function () {
    $(this).on('input', function (e) {
      let input = $(this);
      let typeNum = e.target.value.substr(e.target.value.length - 1);
      let onlyNumber = e.target.value.replace(/[^0-9\.-]/g, '') !== '';
      e.preventDefault()
      //如果輸入為數字
      if (onlyNumber) {
        input.val('').val(typeNum);
        codeArray.splice(input.index(), 1, typeNum);
        input.parents('.verification-wrap').attr('data-verify-code', codeArray.reduce(reducer));
        input.next().focus();
        clear = 0;
      } else {
        input.val('');
      }
    })
    $(this).keyup(function (e) {
      let input = $(this);
      let is_clear = e.key === "Backspace" || e.key === "Delete";
      if (is_clear) {
        e.preventDefault();
        if (clear == 0) {
          input.val('');
          clear += 1;
        } else if (clear == 1) {
          input.prev().focus();
          clear = 0;
        }
      }
    })
  });
}
//驗證碼貼上
function verificationPaste() {
  $('form .verification-wrap input').on('paste', function (event) {
    let paste = event.originalEvent.clipboardData.getData('text');
    let vm = $(this);
    let firstInput = $('form .verification-wrap input').eq(0);
    vm.on('change', function () {
      firstInput.val('');
      $('form .verification-wrap input').each(function (index, ele) {
        $(ele).val(paste.split('')[index]);
      });
    });
  });
}

// 倒數計時
// 搭配以下結構使用
// .countdown(data-seconds="600")  data-seconds 填入欲倒數秒數
function countDown(target,callback) {
  clearInterval(interval);
  $(target).html('');
  var callbackFun = callback || '';
  var set_seconds = Number($(target).attr('data-seconds')) + 1;
  var set_time = Math.floor(set_seconds / 60) + ':' + set_seconds % 60;
  clearInterval(interval);
  interval = setInterval(function () {
    var timer = set_time.split(':');
    var minutes = parseInt(timer[0], 10);
    var seconds = parseInt(timer[1], 10);
    // console.log(seconds)
    --seconds;
    minutes = (seconds < 0) ? --minutes : minutes;
    minutes = (minutes < 10) ? minutes = '0' + minutes : minutes;
    if (minutes == 0 && seconds == 0) clearInterval(interval);
    seconds = (seconds < 0) ? 59 : seconds;
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    $(target).html(minutes + ':' + seconds);
    set_time = minutes + ':' + seconds;

    if(minutes == parseInt(0) && seconds == parseInt(0)){
      if(callbackFun !== '') callbackFun();
    }
  }, 1000);

}

// 複製網址
// el => 點擊的對象
// text => 想要顯示的文字
// 使用範例 common.copylink('.xxx','Copied 您已成功複製連結')
// css在 sass/base/_common 要改樣式可以進去改
function copylink(el, text) {
  let notice = "<div class='notice-wrapper'><div class='text'>" + text + "</div><input id='clipboard' type='text' readonly></div>"
  $(el).on('click', function () {
    $('body').append(notice)
    if ($(notice).length > 0) {
      let url = window.location.href
      let clipboard = $('#clipboard')
      let offset = $(this).offset()
      let elWidth = $(this).innerWidth() / 2
      $('.notice-wrapper').css({
        'top': offset.top,
        'left': offset.left + elWidth,
      }).show()
      clipboard.val(url);
      clipboard[0].setSelectionRange(0, 9999);
      clipboard.select();
      if (document.execCommand('copy')) {
        document.execCommand('copy');
        $('.notice-wrapper .text').fadeIn(300).promise().done(function () {
          setTimeout(function () {
            $('.notice-wrapper .text').fadeOut(300).promise().done(function () {
              $('.notice-wrapper').remove()
            })
          }, 1500)
        });
      }
    }
  })
}

//Android / iOS 判斷
function deviceDetect() {
  let u = navigator.userAgent;
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
  let isiOS = u.indexOf('Mac') > -1 && 'ontouchend' in document; //ios终端
  let isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  if (isAndroid) {
    return 'android'
  }
  if (isiOS) {
    return 'iOS'
  }
  if (isMac) {
    return 'Mac'
  }
}

function fixMobile100vh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px')
  $(window).on('resize', function () {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px')
  })
}

function wordAnimation(target, delayStartTime, delaySpace) {
  let word = $(target).html()
  let removeBr = word.split('<br>')
  $(target).text("")
  $(removeBr).each(function () {
    let html = this.split('')
    $(html).each(function () {
      if (this.trim() == '') {
        $(target).append('<span class="letter-wrap" style="display: inline-block">&nbsp;</span>');
      } else {
        $(target).append('<span class="letter"> ' + this + ' </span>');
      }
    })
    $(target).find("span").each(function () {
      let i = $(this).index()
      let delayTime = i * delaySpace + delayStartTime + "s"
      $(this).css("transition-delay", delayTime);
    });
    $(target).append('<br>')
  })
};

function isMobile() {
  if ('ontouchstart' in document.documentElement && 'ontouchmove' in document.documentElement) return true;
  else return false;
};

function isSafari(){
  if(window.navigator.userAgent.match(/^((?!chrome|android).)*safari/i)) return true;
  else return false;
};

function checkWidth(type){
  if(type === 'pad'){
    return $(window).width() <= 1200
  }
  else if(type === 'mobile'){
    return $(window).width() <= 767
  }
};

//判斷Swiper輪播數量
function getSlidesCount(swiper) {
  const container = swiper.$el
  const slidesCount = function () {
    if (swiper.loopedSlides) {
      return swiper.slides.length - swiper.loopedSlides * 2
    }
    else {
      return swiper.slides.length
    }
  }
  if (slidesCount() <= swiper.params.slidesPerView) {
    container.addClass('swiper-no-swiping')
    $(swiper.params.navigation.nextEl).hide()
    $(swiper.params.navigation.prevEl).hide()
    $(swiper.params.pagination.el).hide()
    swiper.params.autoplay.enabled = false
    swiper.autoplay.stop()
  }
  else {
    container.removeClass('swiper-no-swiping')
    $(swiper.params.navigation.nextEl).show()
    $(swiper.params.navigation.prevEl).show()
    $(swiper.params.pagination.el).show()
    if (swiper.params.autoplay.enabled) {
      swiper.autoplay.start()
    }
  }
};

//會員照片上傳即時預覽
//傳要上傳的input進去
function previewUploadPhoto(input) {
  $(input).change(function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      if(this.files[0].size < 1024 * 1024 * 5){
        $('.libox-inner[data-name="edit"] .tips').fadeOut()
        reader.onload = function (e) {
          $('.content .photo-wrap .headshot').css('background-image', `url(${e.target.result})`);
          $('.libox-inner[data-name="edit"] .img .headshot').css('background-image', `url(${e.target.result})`);
          _common.closeliboxInner();
        }
        reader.readAsDataURL(this.files[0]);
        // 後端用
        if ($('.base-url').length > 0) updateInfoImg();
      }else{
        $('.libox-inner[data-name="edit"] .tips').fadeIn()
      }
    }
  });
}
// gsap.registerPlugin(ScrollTrigger);
function parallax() {
  $('[data-parallax]').each(function(index, el) {
    const $this = $(el),
          $trigger = $this.parents('[data-parallax-container]');
    let set = {
      scrollTrigger: {
        ease: "none",
        scrub: true,
      }
    }
    if($this.attr('data-parallax-active') == undefined) {
      $this.attr('data-parallax-active','on');
    }
    else return;
    // scrollerProxy
    // if ($this.attr('data-parallax-proxy')) set.scrollerProxy = $this.attr('data-parallax-proxy');
    if ($trigger) set.scrollTrigger.trigger = $trigger
    if ($this.attr('data-parallax-bg')) {
      // console.log($this.attr('data-parallax-bg'),'xxxxx')
      let y = 0;
      if ($this.attr('data-parallax-y')) set.y = $this.attr('data-parallax-y');
      // else if ($this.attr('data-parallax-yPercent')) set.yPercent = $this.attr('data-parallax-yPercent');
      else {
        let thisHeight = $this.innerHeight();
        let parentHeight = $trigger.innerHeight();
        set.y = (thisHeight - parentHeight) * 2;
      }
    }
    else if($this.attr('data-path')){
      let val = $this.attr('data-path');
      if(val === 'right'){
        set.xPercent = -20
      }
      else if(val === 'left'){
        set.xPercent = 20
      }
      else if(val === 'top'){
        set.yPercent = -20
      }
    }
    else {
      let yPercent = $this.attr('data-parallax-yPercent') || $this.attr('data-parallax-y') || 0
      set.yPercent = 0
      
      if ($this.attr('data-parallax-xPercent') || $this.attr('data-parallax-x')) {
        let xPercent = $this.attr('data-parallax-xPercent') || $this.attr('data-parallax-x') || 0
        set.xPercent = xPercent
      }
      else if($this.attr('data-parallax-yPercent') || $this.attr('data-parallax-y')){
        let yPercent = $this.attr('data-parallax-yPercent') || $this.attr('data-parallax-y') || 0
        set.yPercent = yPercent
      }
    }
    $this.css('transition', '0s')
    if ($this.attr('data-parallax-start') === 'center') set.scrollTrigger.start = '50% center'
    if ($this.attr('data-parallax-end') === 'center') set.scrollTrigger.end = '50% center'
    // console.log(set)
    if ($this.attr('data-parallax-mode') === 'from') gsap.from($this, set);
    else gsap.to($this, set);
  });
};

function objMoveParallax(){
  $('[data-shift]').each(function(i,el){
    // console.log(i,el)
    let vm = $(this);
    let direction = vm.attr('data-shift');
    let set = {
      scrollTrigger: {
        trigger: vm,
        scrub: true
      },
    };
    if(direction === 'up'){
      set.y = 150
    }
    else if (direction === 'down'){
      set.y = -100
    }
    gsap.from(vm,set);
  });
}

// 首頁 區塊需要先抓高度用
function getTypeMixH (){
  let $wrap = $('.type-mix');

  $wrap.each(function(){
    let vm = $(this);
    let $block = vm.find('.block-wrap');
    let len = $block.length;
    let blockH = $block.outerHeight();
    let totalH = blockH * (len + 1);

    vm.css('height',totalH);
  });
  
}
;
(function() {
  getTypeMixH();
})()
