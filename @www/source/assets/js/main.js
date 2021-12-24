// 全域變數
let homeSwiper;
var bLazy;
var player;
var playerArr = [];
let filterArr = [];
let filterStr = '';
let filterNum = 0;
let topSwiper;
let contactSwiper;
var interval_count;
var interval_resend;


let _common = {
  //鎖住卷軸
  bodyLock() {
    if (deviceDetect() == 'iOS') {
      bodyScroll.lock();
      $('body').addClass('lock');
    } else {
      $('body').css('overflow-y', 'hidden');
    }
    $.smoothScroll.destroy()
  },
  //解鎖卷軸
  bodyUnlock() {
    if (deviceDetect() == 'iOS') {
      bodyScroll.unlock();
      $('body').removeClass('lock');
    } else {
      $('body').css('overflow-y', 'auto');
      $('.mouse-container').removeClass('libox-type');
    }
    $.smoothScroll.init()
  },
  //打開Ajax
  openAjax(route, container, callback) {
    $.ajax4({
      Route: route,
      Container: container,
      Block: '',
      Callback: callback,
      Backready: '',
      Backloaded: '',
    });
  },
  //關閉 Ajax - 移除結構
  closeAjax(container) {
    $(container).removeClass('show');
    $(container).on('transitionend webkitTransitionEnd oTransitionEnd', function () {
      //ajax關掉之後要做的事寫在這
      //....
      $(container).remove()
      $(container).unbind('transitionend webkitTransitionEnd oTransitionEnd')
      _common.bodyUnlock();
      $('.mouse-container').removeClass('libox-type');
      $('.fb_dialog').removeClass('z-index-0');
    })
  },
  //關閉 Ajax - 保留結構
  closeAjaxKeepDom(container) {
    function fadeOut() {
      return new Promise(function (resolve, reject) {
        _common.bodyUnlock();
        $('.mouse-container').removeClass('libox-type');
        resolve();
      });
    };

    function removeShow() {
      $(container).removeClass('show').css('z-index', '-1');
      $('.fb_dialog').removeClass('z-index-0');
    }
    fadeOut().then(removeShow);
  },
  //ajax共用
  ajaxCommon(data) {
    const container = data.Container

    // console.log(container);
    _common.bodyLock();
    $(container).addClass('ajax_close');
    $(container).fadeIn();
    setTimeout(() => {
      $(container).addClass('show');
    }, 100);
    $('.mouse-container').addClass('libox-type');
    $(container).find('.modal-scroll-wrap').scrollbar({
      ignoreMobile: true,
    });

    $(container).find('.modal-dialog').on('click', function (e) {
      e.stopPropagation()
    });
    $('.ajax_close').on('click', function (e) {
      e.stopPropagation();
      if ($(this).hasClass('shortage')) {
        _common.closeAjaxKeepDom(container);
      } else {
        _common.closeAjax(container);
        // $('.mouse-container').css('z-index','3');
      }
    });

    if ($('.libox-search').length > 0) {
      $('.libox-search .container').on('click', function (e) {
        e.stopPropagation();
      })
    }
  },
  //Blazy基本
  blazyInit($container) {
    bLazy = new Blazy({
      container: $container || 'body',
      offset: -100,
      success: function () {}
    });
  },
  // waypoint
  eachWaypoint: function (target, offsetValue, conainer) {
    if(conainer){
      $(target).each(function (index, element) {
        $(element).waypoint({
          handler: function () {
            $(element).addClass('show');
          },
          offset: offsetValue,
          context: $(conainer)
        });
      });
    }else{
      $(target).each(function (index, element) {
        $(element).waypoint({
          handler: function () {
            $(element).addClass('show');
          },
          offset: offsetValue,
        });
      });
    }
    
  },
  // 設定物件滾動方向
  setPath() {
    let $data = $('[data-path]');
    $data.each(function () {
      let vm = $(this);
      let val = vm.data('path');

      switch (val) {
        case 'right':
          vm.attr({
            'data-parallax': 'data-parallax',
            'data-parallax-x': '-10',
            // 'data-parallax-start': 'center'
          });
          break;
        case 'left':
          vm.attr({
            'data-parallax': 'data-parallax',
            'data-parallax-x': '10',
            // 'data-parallax-start': 'center'
          });
          break;
        case 'top':
          vm.attr({
            'data-parallax': 'data-parallax',
            'data-parallax-y': '20',
            // 'data-parallax-start': 'center'
          });
          break;
        case 'bottom':
          vm.attr({
            'data-parallax': 'data-parallax',
            'data-parallax-y': '-40',
            // 'data-parallax-start': 'center'
          });
          break;
      }
    });
  },
  // 自動播放效果
  autoPlay(ele, time) {
    let $slide = $(ele);
    let slideIndex = 0;
    let interval;
    let total = $slide.length;

    // 預設第一則顯示
    $slide.eq(0).addClass('show');
    interval = setInterval(function () {
      // 跑進來就+一次
      slideIndex++

      let prev = function () {
        // 前一張圖片
        let num = slideIndex - 1;
        if (num < 0) num = 0
        return num;
      }

      // 前一則移除show
      $slide.eq(prev()).removeClass('show');
      // 如果超過總長度 slideIndex 變回第一張
      if (slideIndex == total) slideIndex = 0;
      $slide.eq(slideIndex).addClass('show');

    }, time);
  },
  // 進場白色遮罩
  blockAnimate() {
    let page = $('body').attr('data-page');
    if(page === 'home'){
      setTimeout(() => {
        $('.white-after').addClass('in')
      }, 2000)
    }else{
      $('.white-after').addClass('in')
    }
  },
  // resize common
  resizeFun(fun) {
    let resize = false;
    let t;
    let doResize = fun;

    $(window).on('resize', function () {
      resize = true;
      clearTimeout(t);
      console.log('resize')
      t = setTimeout(doResize, 500);
    });
  },
  // 滾動到定位
  scrollPos(target) {
    let $target = $(target);
    let pos = $target.position().top;
    // console.log($target)
    // console.log(pos)
    $('body,html').animate({
      scrollTop: pos
    }, {
      duration: 900,
      easing: 'easeInOutCirc'
    });
  },
  // 超過高度出現按鈕
  btnShow() {
    let $p = $('.unit-title .left p');
    let H = $p.outerHeight();
    let $btn = $('.unit-title .more-intro');
    let $wrap = $('.unit-title .left .wrap');
    if (H > 100) {
      $wrap.addClass('active mask');
      $p.addClass('active');
      $btn.removeClass('hide');
      $btn.on('click', function () {
        let vm = $(this);
        if (!vm.hasClass('active')) {
          vm.addClass('active');
          $wrap.css('height', H).removeClass('mask');
        } else {
          vm.removeClass('active')
          $wrap.css('height', 100).addClass('mask');
        }
      });
    };
  },
  // 卷軸修正
  scrollFix(target) {
    // if(isMobile()) return;
    $(target).scrollbar({
      ignoreMobile: true,
    });
    $(target).on('DOMMouseScroll mousewheel wheel', function (e) {
      e.stopPropagation();
    });
  },

  // 開啟結構內燈箱
  openliboxInner(target) {
    $(`[data-name="${target}"]`).css('display', 'block');
    $('.mouse-container').addClass('libox-type');
    $('.fb_dialog').addClass('z-index-0');
    setTimeout(() => {
      _common.bodyLock();
      $(`[data-name="${target}"]`).addClass('show');
      pageUse(target);
    }, 200);

    function pageUse(target) {
      // 付款
      if (target === 'pay' || target === 'level') {
        $('.libox-inner .box').addClass('in');
        $('.libox-inner .box').off().on('click', function (e) {
          e.stopPropagation();
        });
      } else if (target === 'loading2') {
        $('.libox-inner[data-name="loading2"]').addClass('z-top');
      } else if (target === 'payType' || target === 'invType') {
        _mouseHover.cursorEnter('.hover-cir');
      }
      // 客服紀錄
      else if (target === 'service') {
        _member_detail.scrollBottom();
      } else if (target === 'failed') {
        $(`[data-name="${target}"] .wrap .btn-close`).on('click', function (e) {
          e.stopPropagation();
        });
      } else if (target === 'accountStop') {
        $('[data-name="accountStop"] .box').on('click', function (e) {
          e.stopPropagation();
        });
      }
      // 退換貨
      else if (target === 'return') {
        $('[data-name="return"] .content').on('click', function (e) {
          e.stopPropagation();
        });
      }
      // 商品成功加入購物車
      else if(target === 'addcart'){
        _common.closeliboxAutomatic();
      }
    }
  },
  // 燈箱關閉
  controlCommonLibox() {
    $('.libox-inner .ajax_close').on('click', function () {
      _common.closeliboxInner();
      let vm = $(this);
      if (vm.hasClass('returnSuccess')) {
        _common.closeliboxInner();
        _member_detail.btnStatus();
      } else {
        _common.closeliboxInner();
      }
    });

    $('.libox-inner .ajax_close2').on('click', function () {
      _common.closeliboxInner2();
    });

    $('.libox-inner').on('click', function () {
      let vm = $(this);
      let type = vm.attr('data-name');
      if (type === 'loading2' || type === 'edit' || type === 'logout') return;
      else if (type === 'returnSuccess') {
        _common.closeliboxInner();
        _member_detail.btnStatus();
      }
      // 普通燈箱關閉
      else {
        _common.closeliboxInner();
      }
    });

    $('.libox-inner2').on('click', function () {
      _common.closeliboxInner2();
    });
  },

  closeliboxInner() {
    $('.libox-inner .cir-wrap:not(.no-close)').off().on('click', function (e) {
      e.stopPropagation();
    });

    $(".libox-inner").removeClass('show z-top');
    _common.bodyUnlock();
    // console.log(target)
    $('.libox-inner[data-name="pay"] .libox-inner .box').removeClass('in');
    $('.libox-inner[data-name="level"] .libox-inner .box').removeClass('in');
    $('.mouse-container').removeClass('libox-type');
    $('.fb_dialog').removeClass('z-index-0');
  },
  closeliboxInner2() {
    $('.libox-inner2').removeClass('show z-top');
  },

  // 1秒後自動關閉燈箱
  closeliboxAutomatic(){
    setTimeout(()=>{
      _common.closeliboxInner();
    },1500);
  }
}

// click 展開選單控制
let _categoryList = {
  init() {
    let $parent = $('.category-list');
    let $ul = $('.category-list ul');
    let ulH = $ul.outerHeight();
    let page = $('body').attr('data-page');
    if (ulH > 40) {
      $parent.addClass('spread');
      $('.category .btn-wrap').fadeIn(300);
      _categoryList.control($parent, ulH);
      if (page === 'faq') $('.category .btn-wrap').fadeIn(300)
    } else return
  },
  // 開關
  control(cls, height) {
    let $parent = $(cls);
    $('.btn-wrap .link-open').off().on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        vm.addClass('active');
        vm.find('.icon.rotate').addClass('active');
        $parent.css('height', `${height}px`);

      } else {
        vm.removeClass('active');
        vm.find('.icon.rotate').removeClass('active');
        $parent.removeClass('spread');
        $parent.css('height', `38px`);
      }
    });
  },
  // 後端用 展開選單
  open() {
    let $btn = $('.btn-wrap .link-open');
    let $parent = $('.category-list');
    let $ul = $('.category-list ul');
    let ulH = $ul.outerHeight();
    $btn.addClass('active');
    $btn.find('.icon.rotate').addClass('active');
    $parent.css('height', `${ulH}px`);
    _common.scrollPos('.category');
  },
  all() {
    _categoryList.init();
    _common.resizeFun(_categoryList.init);
  }
};

//公版表單
let _form = {
  // 下拉
  formSelect() {
    $('.form-select .scrollbar-inner').scrollbar();
    let toggleList = vm => {
      let $select = $(vm);
      if (!$select.hasClass('active')) {
        $select.addClass('active').find('.select-content').slideDown(500);
        let all = $select.parents('.form').find('.form-select');
        all.not(vm).removeClass('active').find('.select-content').slideUp(500);
        // $select.parent().siblings().find('.form-select').removeClass('active').find('.select-content').slideUp(500);
      } else {
        $select.removeClass('active').find('.select-content').slideUp(500);
      }
    }
    $('.form-select .select-content li').on('click', function () {
      let $this = $(this);
      let word = $this.text();
      let page = $('body').attr('data-page');
      $this.parents('.form-select').find('p.option span:last-child').text(word);
      // if(page === 'contact'){
      //   $this.parents('.form-select').find('p.option span:first-child').text(word);
      // }else{
      //   $this.parents('.form-select').find('p.option span:last-child').text(word);
      // }
    });
    $('.form-select').on('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleList(this);
    });
    $(document).on('click', function (e) {
      let $select = $('.form-select');
      $select.removeClass('active').find('.select-content').slideUp(500);
    });
  },
  // 日曆
  datepicker() {
    $('#datepicker').datepicker({
      container: '.form-date',
      autoclose: true,
      orientation: 'left bottom',
      format: 'yyyy/mm/dd'
    });
  },
  // 更換檔名
  updateFiles() {
    $('.wdd-form input[type="file"]').on('change', function () {
      let vm = $(this);
      const val = vm.val();
      const strFile = val.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi, "$1");
      const fileExt = val.replace(/.+\./, "");
      const str = `${strFile}.${fileExt}`;
      let $fileNmae = vm.parents('.form-file').find('.file-name');
      $fileNmae.text(str);
    });
  },
  // 檔案抓取限制
  filesLimit() {
    let $file = $('.form-file');
    let limit = $file.attr('data-limit');
    $file.find('.file-name span').text(limit);
  },
  // 清除全部選項
  clear() {
    let page = $('body').attr('data-page');
    let originText = $('.contact .select-content ul li:first-child').text();
    $('.form-clear').on('click', function () {
      let limit = $('.form-file').attr('data-limit');
      $('.wdd-form input').val('');
      $('.wdd-form textarea').val('');
      $('.wdd-form input[type="checkbox"]').prop('checked', false);
      $('.form-file').find('.file-name').text(`File size is mainly below ${limit}`);
      if (page === 'contact') {
        $('.contact .form-group p.option span[data-name]').text(originText);
        $('.swiper-slide').removeClass('swiper-slide-active');
        $('.swiper-slide').eq(0).addClass('swiper-slide-active');
        contactSwiper.slideTo(0, 200);
        _common.scrollPos('body');
        setTimeout(() => {
          $('.inner-text.tks').removeClass('in');
          $('.inner-text.hi').removeClass('active');
        }, 200)
      }
    });
  },
  // 確認送出跳出燈箱
  submitCheck() {
    const container = '.form-error-alert'
    $(container).addClass('ajax_close').delay4({
      time: '100',
      add: 'show'
    })
    $(container).find('.modal-scroll-wrap').scrollbar({
      ignoreMobile: true,
    })
    $(container).find('.modal-dialog').on('click', function (e) {
      e.stopPropagation()
    })
    $('.ajax_close').on('click', function (e) {
      e.stopPropagation()
      _form.alertClose(container)
    })
    _common.bodyLock('.modal-scroll-wrap[data-scroll-content]')
  },

  alertClose(ele) {
    $(ele).removeClass('show')
    _common.bodyUnlock('.modal-scroll-wrap[data-scroll-content]')
    $(ele).on('transitionend webkitTransitionEnd oTransitionEnd', function () {
      $(ele).unbind('transitionend webkitTransitionEnd oTransitionEnd')
    })
  },
  all() {
    _form.formSelect();
    _form.datepicker();
    _form.filesLimit();
    _form.updateFiles();
    _form.clear();
  }
};

// ajaxCallback
let _ajaxCallback = {
  //一般訊息燈箱
  normalLightbox(data) {
    _common.ajaxCommon(data);
    _mouseHover.cursorEnter('.hover-cir');
    _ajaxCallback.bodyClick();
    $('.fb_dialog').addClass('z-index-0');
  },
  bodyClick() {
    $('.cir-wrap').on('click', function (e) {
      e.stopPropagation();
    });
  },
  // 庫存燈箱
  shortageLibox(data) {
    const container = data.Container
    _common.ajaxCommon(data);
    $(container).addClass('shortage');
    $('.stoke-wrap .scrollbar-inner').scrollbar();
    _mouseHover.cursorEnter('.hover-cir');
    _ajaxCallback.bodyClick();
    $('.fb_dialog').addClass('z-index-0');
  },
  // 商品評價
  evaLibox(data) {
    _common.ajaxCommon(data);
    $('[data-name="eva"] .scrollbar-inner').scrollbar();
    _mouseHover.cursorEnter('.hover-cir');
    _ajaxCallback.bodyClick();
    $('[data-anchor]').anchor4();
    $('.fb_dialog').addClass('z-index-0');
  }
};

// AJAX 產品內頁
let _ajaxProduct = {
  // callback
  callback(){
    let container = $('[data-ajax]').attr('data-ajax-container');
    $(container).addClass('libox-close-common');
    $(container).fadeIn();
    $('body').css({
      'overflow-y': 'hidden'
    });
    $('.fb_dialog').addClass('z-index-0');
    setTimeout(() => {
      $(container).addClass('show');
      _common.blazyInit('[data-scroll-content]');
    }, 100);

    setTimeout(()=>{
      // parallax();
      $('[data-scroll-content]').scrollbar();
      _ajaxProduct.scrollShowBack();
      _ajaxProduct.getColor();
      _swiper.ajax_productDetail();
      _swiper.proDetail_gallery();
      $('[data-anchor]').anchor4();
      $('.mouse-container').addClass('z-index-top');
      $("._articleBlock").article4();
      _mouseHover.cursorEnter('.hover-cir');
      _common.eachWaypoint('.waypoint', '90%', '[data-scroll-content]')
    },200);

    $('.ajax_close').on('click', function () {
      _ajaxProduct.closeAjax();
    });
    _ajaxProduct.bodyClick();
  },
  closeAjax(){
    let $container = $('.libox-container')
    $container.delay4({
      time: '100',
      remove: 'show'
    });
    $container.on('transitionend webkitTransitionEnd oTransitionEnd', function () {
      setTimeout(() => {
        $('body').css({
          'overflow-y': 'auto'
        });
        $('.mouse-container').removeClass('z-index-top');
        $container.remove();
        $container.unbind('transitionend webkitTransitionEnd oTransitionEnd');
        $('.fb_dialog').removeClass('z-index-0');
      }, 300)
    })
  },
  bodyClick(){
    $('[data-scroll-content] .libox-ajax-detail').on('click', function (e) {
      e.stopPropagation();
    });
    $('[data-scroll-content]').on('click', function () {
      _ajaxProduct.closeAjax();
    });
  },
  // 取得背景顏色
  getColor(){
    let dataColor = $('.product_detail').attr('data-color');
    $('.libox-ajax-detail').css('background-color', dataColor);
  },
  // 滾動出現返回按鈕
  scrollShowBack(){
    let $back = $('[data-scroll-content] .go-back');
    let swiperH = $('[data-scroll-content] .top-wrap').outerHeight();
    let zero;
    $('[data-scroll-content]').on('scroll',function(){
      let scrollAfter = $(this).scrollTop();
      if(scrollAfter > zero && scrollAfter > (swiperH/2)){
        $back.addClass('show');
      }
      else if(scrollAfter === 0){
        $back.removeClass('show');
      }
      setTimeout(()=>{
        zero = scrollAfter
      },200)
    });
  },
  // 產品內頁 funtion
  detailPage(){
    $('[data-scroll-content]').scrollbar();
    _ajaxProduct.getColor();
    _swiper.ajax_productDetail();
    _swiper.proDetail_gallery();
    setTimeout(()=>{
      parallax();
    },200);
  }
}

////////////////////////
// component
////////////////////////

// 鼠標效果
let _mouseHover = {
  getMouse() {
    if (isMobile()) return;
    let $ = document.querySelector.bind(document);
    let $on = document.addEventListener.bind(document);
    let mouseX, mouseY;
    $on('mousemove', function (e) {
      mouseX = e.clientX || e.pageX;
      mouseY = e.clientY || e.pageY;
    });
    let ball = $('#mouse')
    let x = void 0,
      y = void 0,
      dx = void 0,
      dy = void 0,
      tx = 0,
      ty = 0,
      key = -1;
    let followMouse = function followMouse() {
      key = requestAnimationFrame(followMouse);
      if (!x || !y) {
        x = mouseX;
        y = mouseY;
      } else {
        dx = (mouseX - x) * 0.3;
        dy = (mouseY - y) * 0.3;
        if (Math.abs(dx) + Math.abs(dy) < 0.1) {
          x = mouseX;
          y = mouseY;
        } else {
          x += dx;
          y += dy;
        }
      }
      ball.style.left = x + 'px'
      ball.style.top = y + 'px'
    }
    followMouse();
  },
  cursorEnter(target) {
    let $target = $(target);
    let $mouse = $('#mouse');

    if (isMobile()) return;

    $target.each(function () {
      let vm = $(this);
      if (!vm.hasClass('hover-active')) {
        vm.addClass('hover-active');
        mouseEvent();
      }
    });

    // 事件
    function mouseEvent() {
      $('body').on('mouseenter', '.hover-active', function () {
        let vm = $(this);
        let dataType = vm.attr('data-hover');
        $('.mouse-container').addClass('mix-blend-mode');
        effect(dataType);
        // console.log('enter')
      }).on('mouseleave', '.hover-active', function () {
        $('.mouse-container').removeClass('mix-blend-mode');
        $mouse.removeAttr('class');
        // console.log('leave')
      });
    }
    // 鼠標移入效果
    function effect(dataType) {
      switch (dataType) {
        case 'yellowBig':
          $mouse.addClass('hover-yBig');
          break;
        case 'yellowSmall':
          $mouse.addClass('hover-ySmall');
          break;
        case 'border':
          $mouse.addClass('hover-border');
          break;
        case 'gray':
          $mouse.addClass('hover-gray');
          break;
        case 'blue':
          $mouse.addClass('hover-blue');
          break;
        case 'blueBig':
          $mouse.addClass('hover-blueBig');
          break;
        case 'borderGreen':
          $mouse.addClass('hover-borderGreen');
          break;
        case 'faq':
          $mouse.addClass('hover-faq');
          break;
      }
    }
  },
  all() {
    if (!fesdDB.is.isMobile4) {
      _mouseHover.getMouse();
      _mouseHover.cursorEnter('.hover-cir');
    } else {
      $('.mouse-container').css('display', 'none');
    }
  }
};
// 下拉選單
let _dropdown = {
  open(vm, page) {
    let _this = vm;
    let $dropdown = _this.siblings('.filter-dropdown');
    let $scrollbar = $dropdown.find('.scrollbar-inner');

    // $scrollbar.scrollbar();
    _common.scrollFix($scrollbar);
    $dropdown.slideDown(500);

    if (page === 'product_detail') {

      _this.parents('li').addClass('active');
      _this.parents('li').siblings('').removeClass('active');
      _this.parents('li').siblings('').find('.filter-container,.filter-title,.icon').removeClass('active');
      _this.parents('li').siblings('').find('.filter-dropdown').slideUp(300);
      // 其它區塊
      _this.parents('.extra-block').siblings().find('li,.filter-container,.filter-title,.icon').removeClass('active')
      _this.parents('.extra-block').siblings().find('.filter-dropdown').slideUp(300);
    } else if (page === 'product_sale') {
      _this.parents('li').addClass('z-index-1')
    }
    _this.addClass('active');
    _this.parents('.filter-container').siblings().find('.filter-title').removeClass('active');
    _this.parents('.filter-container').siblings().find('.filter-dropdown').slideUp(300);
    _this.parents('.filter-container').siblings().find('.icon').removeClass('active');
    _this.find('.icon').addClass('active');
    $('.filter-options').removeClass('active');
    $('.options-dropdown').slideUp(300);
  },
  close() {
    let page = $('body').attr('data-page');
    $('.filter-container').removeClass('active');
    $('.filter-title').removeClass('active');
    $('.filter-container').find('.icon').removeClass('active');
    $('.filter-dropdown').slideUp(300);
    $('.options-dropdown').slideUp(300);
    if (page === 'product_sale') {
      $('.product_sale li').removeClass('z-index-1')
    }
  },
  // 替換文字
  replace(vm, page) {
    let $li = vm.siblings('.filter-dropdown').find('li');
    let $replace = vm.find('.filter-replace');
    let dataType = vm.attr('data-type');

    $li.off().on('click', function () {
      let _this = $(this);
      vm.find('.icon').removeClass('active');
      if (dataType === 'normal') {
        let val = $(this).text();
        $replace.text(val);
        _this.parents('.filter-container').find('.filter-title').removeClass('active');
        _this.parents('.filter-dropdown').slideUp(300);
        if (page === 'product_detail') {
          _this.parents('li').delay4({
            time: '400',
            remove: 'active'
          });
        } else if (page === 'product_sale') {
          _this.parents('li').removeClass('z-index-1');
        }
      } else if (dataType === 'img') {
        let $img = $replace.find('.img-cir img');
        let $span = $replace.find('span');
        let val = $(this).find('span').text();
        let url = _this.find('.img-cir img').attr('src');
        $img.attr('src', url);
        $span.text(val);
        _this.parents('.filter-container').find('.filter-title').removeClass('active');
        _this.parents('.filter-dropdown').slideUp(500);
        if (page === 'product_sale') {
          _this.parents('li').removeClass('z-index-1');
        }
      } else if (dataType === 'imgs') {
        let dataID = _this.find('.img-cir').attr('data-index');
        if (!_this.hasClass('active')) {
          let url = _this.find('.img-cir img').attr('src');
          let str =
            '<div class="img-cir imgs" data-id="' + dataID + '">' +
            '<img src="' + url + '">' +
            '</div>';

          $replace.find('.img-cir:not(.imgs)').remove();
          $replace.find('span').remove();
          $replace.append(str);
          _this.addClass('active');
        } else {
          _this.removeClass('active');
          $('.filter-replace .img-cir').each(function () {
            let vm = $(this);
            let id = vm.attr('data-id');
            if (dataID === id) {
              vm.remove();
            }
          });
        }
      }
    });
  },
  control() {
    // let $btn = $('.filter-title');
    let $btn = $('.filter-title:not(.other)');
    let page = $('body').attr('data-page');

    // if($(window).width() >= 1200) return;

    $btn.off().on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        _dropdown.open(vm, page);
        _dropdown.replace(vm, page);
      } else {
        vm.parents('li').delay4({
          time: '200',
          remove: 'active'
        });
        vm.removeClass('active');
        vm.find('.icon').removeClass('active');
        $('.filter-dropdown').slideUp(300);
        if (page === 'product_sale') {
          vm.parents('li').removeClass('z-index-1')
        }
        // 抓取 多選顏色項目的高度 重新給篩選的下拉訂高度
        _dropdown.padGetFilterTop();
      }
    });
  },
  // 多選下拉
  openOpts() {
    $('.options-dropdown .scrollbar-inner').scrollbar();
    _common.scrollFix('.options-dropdown .scrollbar-inner');
    $('.options-dropdown').slideDown(300);
    $('.filter-dropdown').slideUp(300);
    // 清除項目
    $('input:checkbox').prop('checked', false);
    // 塞回項目
    setTimeout(() => {
      _filter.openUpdateArr();
    }, 100)
  },
  closeOpts() {
    $('.options-dropdown').slideUp(300);
  },
  // 多項篩選下拉開啟
  filterControl() {
    if(!$('.filter-options').hasClass('isActive')){
      $('.filter-options').addClass('isActive')
    }
    else return 
    $('.filter-options.isActive').on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        _dropdown.padGetFilterTop();
        vm.addClass('active');
        vm.parents('.filter').find('.icon').removeClass('active');
        vm.find('.icon').addClass('active')
        _dropdown.openOpts()
      } else {
        vm.removeClass('active');
        _dropdown.closeOpts();
      }
    });
  },

  // 平板時 抓取 多選顏色項目的高度 重新給篩選的下拉訂高度
  padGetFilterTop() {
    if ($(window).width() <= 1200 && $(window).width() > 767) {
      let H = $('[data-type="imgs"]').outerHeight();
      let optH = $('.filter-options').outerHeight();
      $('.options-dropdown').css('top', H + optH);
    }
  },

  bodyClick() {
    $('.filter-container').on('click', function (e) {
      e.stopPropagation();
    });
    $('.options-dropdown').on('click', function (e) {
      e.stopPropagation();
    });
    $('.filter-options').on('click', function (e) {
      e.stopPropagation();
    });
    $('body').on('click', function (e) {
      _dropdown.close();
    });
  },

  all() {
    _dropdown.control();
    _dropdown.filterControl();
    _dropdown.bodyClick();
  }
};
// checkbox 篩選
let _filter = {
  // 確定篩選
  done() {
    $('.filter.desktop .btn-wrap .btn-done').on('click', function () {
      let vm = $(this);
      let checkLen = $('input:checkbox:checked').length || 0;
      vm.parents('.filter-options').find('.filter-replace').text(checkLen);

      _filter.add();
      _filter.update();
      _dropdown.closeOpts();
      _filter.append();
      vm.parents('.filter-options').find('.icon').removeClass('active')
    });
  },
  // 篩選項目更新
  update() {
    let str = '';
    filterArr.forEach(function (item, index) {
      let str2 =
        `<div class="stamp" data-clear-id="${item.id}">
        <span>${item.text}</span>
        <div class="stamp-clear">
          <div class="cross"></div>
        </div>
      </div>`;
      str += str2;
    });
    filterStr = str;
  },
  // 篩選刪除
  delete() {
    let $del = $('.stamp-clear');
    $del.on('click', function () {
      let vm = $(this);
      let $tag = vm.parents('.stamp');
      let id = $tag.attr('data-clear-id');
      let len = $('.stamp').length;
      // console.log('id ',id)
      filterArr.forEach(function (item, index) {
        if (id == item.id) {
          $tag.remove();
          // console.log(index);
          filterArr.splice(index, 1);
          _filter.update();
          $('.filter-options').find('.filter-replace').text(len - 1);
          if ($(".base-url").length > 0) deleteFilterItem($tag);
        }
      });
      if ($('.stamp').length == 0) {
        $('.filter-tag').addClass('hide');
      }
    });
  },
  // 篩選新增
  add() {
    filterArr = []
    let $check = $('.check-wrap input:checkbox');
    // console.log($check);
    $check.each(function () {
      let vm = $(this);
      let span = vm.siblings('label.word').text();
      let dataID = vm.attr('id');
      if (vm.prop('checked') === true) {
        filterArr.push({
          'text': span,
          'id': dataID
        });
      }
    });
  },
  // 項目塞入結構
  append() {
    let $wrap = $('.stamp-wrap');
    if (filterStr !== '') {
      $wrap.html(filterStr);
      $('.filter-tag').removeClass('hide');
      _filter.delete();
    }
  },
  // 清除全部篩選項目
  delAll() {
    $('.btn-wrap .btn-clear').off().on('click', function () {
      $('input:checkbox').prop('checked', false);
      filterArr = [];
      $('.filter-tag').addClass('hide');
      $('.filter-options').find('.filter-replace').text('0');
      // filterNum = 0;
      _filter.mobileOptInit();
    });
  },
  // 打開下拉時把陣列資料塞回已選取狀態
  openUpdateArr() {
    filterArr.forEach(function (item, index) {
      $(`#${item.id}`).prop('checked', true);
    });
  },
  // 手機版篩選開關
  mobileFilterControl() {
    if (!checkWidth('mobile')) return;

    _filter.mobileOpenFilter();
    _filter.mobileCkboxNum();
    _filter.mobileFilterDone();
    _filter.delAll();
    _filter.mobileCloseControl();
    $('.filter.mobile .scrollbar-inner').scrollbar();
  },
  // 手機版開啟篩選
  mobileOpenFilter() {
    $('.filter.mobile .mobile-filter').off().on('click', function () {
      // console.log('999')
      let vm = $(this);
      _common.bodyLock();
      $('.nav').fadeOut(100);
      $('.fb_dialog').addClass('z-index-0');
      vm.siblings('.wrap').fadeIn().addClass('show').delay4({
        time: '200',
        add: 'out'
      });
    });
  },
  // 手機版關閉篩選
  mobileCloseFilter() {
    $('.filter.mobile .wrap').removeClass('show').fadeOut();
    setTimeout(() => {
      _common.bodyUnlock();
      $('.nav').fadeIn(100);
      $('.fb_dialog').removeClass('z-index-0');
    }, 300);
  },
  // 手機版確定篩選
  mobileFilterDone() {
    $('.filter.mobile .btn-wrap .btn-done').on('click', function () {
      let vm = $(this);

      // _filter.append();
      vm.parents('.filter-options').find('.icon').removeClass('active');
      _filter.mobileCloseFilter();
    });
  },
  // 手機版篩選數量
  mobileCkboxNum() {
    $('input:checkbox').on('click', function (e) {
      let vm = $(this);
      let filterText = $('.filter.mobile .filter-options .filter-replace');
      let isChecked = vm.prop('checked');

      if ($(".base-url").length > 0) changeFilterBox();

      if (isChecked == true) {
        filterNum++;
        filterText.text(filterNum);
      } else {
        filterNum--;
        filterText.text(filterNum);
      }
      _filter.add();
      _filter.update();

    });
  },
  // 選項初始化
  mobileOptInit() {
    filterNum = 0;
    // filterArr = [];
    $('.filter.mobile .filter-options .filter-replace').text('0');
    $('.filter-container').each(function () {
      let vm = $(this);
      let $title = vm.find('.filter-title');
      let $replace = vm.find('.filter-replace');
      let $typeImg = vm.find('.filter-title[data-type="imgs"]');
      let imgSrc = $typeImg.siblings('.filter-dropdown').find('ul li:first-child .img-cir img').attr('src');

      if ($title.attr('data-type') === 'normal') {
        $replace.text('All');
      } else if ($title.attr('data-type') === 'imgs') {
        $replace.find('.img-cir').remove();
        $replace.html('<div class="img-cir"><img src="' + imgSrc + '"></div><span>All</span>');
        vm.find('.filter-dropdown li').removeClass('active');
      }
    });
    $('.filter-options,.filter-title,.icon').removeClass('active');
    $('.filter-dropdown,.options-dropdown').slideUp(300);
  },
  // 點旁邊關閉
  mobileCloseControl() {
    $('.filter.mobile .wrap-bg').on('click', function (e) {
      e.stopPropagation();
    });
    $('.filter.mobile .wrap').off().on('click', function () {
      _filter.mobileCloseFilter();
    });
    $('.filter.mobile .wrap .unit-link').off().on('click', function () {
      _filter.mobileCloseFilter();
    });
  },
  // resize
  resize() {
    $(window).on('resize', function () {
      _filter.mobileFilterControl();
    });
  },
};
// header
let _header = {
  // header滾動
  scrollHeader() {
    if ($('.nav').length == 0) return;
    let $header = $('.nav');
    let hdH = $header.outerHeight();
    let zero;
    let page = $('body').attr('data-page');
    let color = $('body').attr('data-color');
    let timer;

    $(window).on('scroll', function () {
      let totalH = Math.round($('.main-wrapper').outerHeight());
      let scrollAfter = $(window).scrollTop();

      if (scrollAfter > hdH) $header.addClass('not-top');
      else $header.removeClass('not-top');

      // 下滾
      if (scrollAfter > zero && scrollAfter > hdH) {
        // console.log('down') 
        $header.addClass('hide');
        if(page === 'news_detail') _news_detail.setNavColor();
      }
      // 上滾到頂
      else if (scrollAfter == 0 || scrollAfter < hdH){
        // console.log('top')
        $header.removeClass('hide');
        if(page === 'news_detail') $('.nav').css('background-color', 'transparent');
        setTimeout(()=>{
          removeNavType();
        },400);
      }
      // 上滾
      else{
        // console.log('up');
        $header.addClass('hide');
        if(page === 'news_detail') _news_detail.setNavColor();
      }

      clearTimeout(timer);
      timer = setTimeout(()=>{
        $header.removeClass('hide');
          if (page === 'product_detail') {
            $('.nav').addClass('bgc').css('background-color', color);
          } else if (page === 'contact') {
            $('.nav').addClass('dark');
          } else if (page === 'faq') {
            $('.nav').addClass('green');
          } else if (page === 'shopping_success') {
            $('.nav').addClass('pink');
          } else if (page === 'shopping_failure') {
            $('.nav').addClass('gray');
          } else if (page === 'member_info') {
            $('.nav').addClass('member-dark');
          } else if (page === 'member_lovelist') {
            $('.nav').addClass('member-gray');
          } else if (page === 'member_order') {
            $('.nav').addClass('warm');
          } else {
            $('.nav').addClass('light');
          }
      },300);
      setTimeout(() => {
        zero = scrollAfter;
      }, 200)
    });

    function removeNavType() {
      // console.log('123')
      if (page === 'product_detail') {
        $('.nav').removeClass('bgc').css('background-color', color);
      } else if (page === 'contact') {
        $('.nav').removeClass('dark');
      } else if (page === 'faq') {
        $('.nav').removeClass('green');
      } else if (page === 'shopping_success') {
        $('.nav').removeClass('pink');
      } else if (page === 'shopping_failure') {
        $('.nav').removeClass('gray');
      } else if (page === 'member_info') {
        $('.nav').removeClass('member-dark');
      } else if (page === 'member_lovelist') {
        $('.nav').removeClass('member-gray');
      } else if (page === 'member_order') {
        $('.nav').removeClass('warm');
      } else {
        $('.nav').removeClass('light');
      }
    }
  },
  // 背景圖路徑
  getBg() {
    let $target = $('.libox-menu .login-wrap');
    let desktopImg = $target.attr('data-desktop');
    let padImg = $target.attr('data-pad');
    let mobileImg = $target.attr('data-mobile');

    if ($(window).width() <= 1200) {
      $target.css('background-image', `url(${padImg})`);
      $('.mob-wrap').addClass('mob-click');

    } else if ($(window).width() <= 767) {
      $target.css('background-image', `url(${mobileImg})`);
    } else {
      $target.css('background-image', `url(${desktopImg})`);
      $('.mob-wrap').removeClass('mob-click');
    }
  },
  // 展開產品
  spreadCategory() {
    let $btn = $('.libox-menu .mob-click');
    $btn.on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        vm.addClass('active');
        vm.siblings('ul').slideDown(500);
      } else {
        vm.removeClass('active');
        vm.siblings('ul').slideUp(500);
      }
    });
  },

  // 展開探索更多
  spreadItem() {
    let $target = $('.explore-wrap .txt-wrap');
    $target.on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        vm.parent().siblings('.explore-wrap').find('.txt-wrap').removeClass('active');
        vm.parent().siblings('.explore-wrap').find('ul').slideUp(300);
        vm.addClass('active');
        vm.siblings('ul').slideDown(500);
      } else {
        vm.removeClass('active');
        vm.siblings('ul').slideUp(500);
      }
    });
  },
  openMenu(btn) {
    let $btn = $(btn);
    $btn.on('click', function () {
      let vm = $(this);
      let menuType = vm.attr('data-menu');
      _header.openEvent(menuType);
    });
  },
  openEvent(menuType) {
    $(`.libox-menu[data-name="${menuType}"]`).css('display', 'block');
    $('.mouse-container').addClass('libox-type');
    $('.fb_dialog').addClass('z-index-0');
    setTimeout(() => {
      _common.bodyLock();
      $(`[data-name="${menuType}"]`).addClass('show');
    }, 200);
    setTimeout(() => {
      $(`[data-name="${menuType}"]`).addClass('out');
    }, 500);
  },
  closeMenu() {
    let $close = $('.libox-menu .close-menu');
    $close.on('click', function () {
      _header.closeEvent();
    });
  },
  closeEvent() {
    _common.bodyUnlock();
    $('.libox-menu').removeClass('show');
    $('.mouse-container').removeClass('libox-type');
    $('.fb_dialog').removeClass('z-index-0');
    setTimeout(() => {
      $('.libox-menu').removeClass('out');
      setTimeout(() => {
        $('.libox-menu').fadeOut(300)
      }, 500);
    }, 500);
  },
  // 點擊外圍關閉
  otherClick() {
    $('.menu-box').on('click', function (e) {
      e.stopPropagation();
    });
    $('.libox-menu').on('click', function () {
      _header.closeEvent();
    })
  },

  all() {
    _header.getBg();
    _header.scrollHeader();
    _header.openMenu('[data-menu="menu"]');
    _header.closeMenu();
    _header.spreadItem();
    _header.otherClick();
    _header.spreadCategory();
    $('.other-wrap .scrollbar-inner').scrollbar({
      ignoreMobile: true,
    });
    _common.resizeFun(_header.getBg);
  }
};
// footer
let _footer = {
  // gotop 按鈕顯示
  gotopShow() {
    if ($('.footer').length == 0) return;
    let page = $('body').attr('data-page');
    let $gotop = $('.footer .go-top');
    let windowH = $(window).height();
    let zero = 0;

    if ($(window).width() <= 1200 && page === 'product_detail') return;
    if (page === 'member' || page === 'member_center') return;
    // console.log(windowH)
    $gotop.fadeOut(100);
    $(window).on('scroll', function () {
      let scrollAfter = $(window).scrollTop();

      if (scrollAfter > zero) {
        // console.log('down')
        if (scrollAfter > windowH) {
          // console.log('in')
          $gotop.fadeIn(0).addClass('show');
          if (scrollAfter + windowH - 10 >= $('footer').offset().top) {
            $('.footer .go-top').addClass('bottom');
          }
        }
      } else if (scrollAfter == 0) {
        $gotop.removeClass('show').fadeOut(100);
      } else {
        // console.log('up')
        // $gotop.removeClass('show').fadeOut(100);
        if (scrollAfter + windowH <= $('footer').offset().top) {
          $('.footer .go-top').removeClass('bottom');
        }
      }
      setTimeout(() => {
        zero = scrollAfter;
      }, 200)
    });
  }
}
// ad
let _ad = {
  init() {
    var adShow = JSON.parse(localStorage.getItem('adShow'));
    var trans = $('body').attr('data-trans');
    if (!adShow) {
      // 有轉場的頁面
      if (trans) {
        setTimeout(() => {
          _ad.open();
        }, 2300)
      } else {
        _ad.open();
      }
    }
  },
  open() {
    let len = $('.pub').length;
    if(len === 0) return;
    _common.bodyLock();
    $('.pub').fadeIn();
    $('.fb_dialog').addClass('z-index-0');
    setTimeout(() => {
      $('.pub').addClass('show');
    }, 200);
    $('.mouse-container').css('z-index', 20);
    _swiper.ad();
  },
  close() {
    $('.pub-wrap').on('click', function (e) {
      e.stopPropagation();
    });
  },
  closeEvent() {
    localStorage.setItem('adShow', true);
    $('.mouse-container').css('z-index', 3);
    $('.pub').removeClass('show');
    $('.fb_dialog').removeClass('z-index-0');
    setTimeout(() => {
      $('.pub').fadeOut();
    }, 500);
    _common.bodyUnlock();
  },
  all() {
    _ad.init();
  }
}
// 會員生日gif
let _gif = {
  init() {
    let gif = JSON.parse(localStorage.getItem('gif'));
    if (!gif) {
      _gif.open();
    }
  },
  open() {
    _common.bodyLock();
    $('.gif').fadeIn();
    $('.fb_dialog').addClass('z-index-0');
    setTimeout(() => {
      $('.gif').addClass('show');
    }, 200);
    $('.mouse-container').css('z-index', 20);
    _gif.close();
  },
  close() {
    $('.gif').on('click', function () {
      localStorage.setItem('gif', true);
      $('.mouse-container').css('z-index', 3);
      $('.gif').removeClass('show');
      $('.fb_dialog').removeClass('z-index-0');
      setTimeout(() => {
        $('.gif').fadeOut();
      }, 500);
      _common.bodyUnlock();
    });
  },
}
// _animationLibox
// privacy，member
let _animationLibox = {
  scrollbar(libox) {
    $(`${libox} .scrollbar-macosx[data-scroll-wrapper]`).scrollbar();
    $(`${libox} .scrollbar-inner[data-modal-content]`).scrollbar();
  },
  openBox(libox) {
    _animationLibox.scrollbar(libox);
    _common.bodyLock();
    const $lightbox = $(libox),
      $mouse = $('.mouse-container');
    // console.log(libox);
    $lightbox.fadeIn().find('.modal-dialog').addClass('show');
    $mouse.addClass('z-103');
    $('.mouse-container').addClass('libox-type');
    $('.fb_dialog').addClass('z-index-0');
  },
  closeBox(libox) {
    // $('body').css('overflow', 'visible');
    // $.smoothScroll.init();
    _common.bodyUnlock();
    const $dialog = $(`${libox} .modal-dialog`),
      $mouse = $('.mouse-container');
    $dialog.removeClass('show').parents(libox).fadeOut(800);
    $mouse.removeClass('z-103');
    $('.footer .go-top').fadeIn().addClass('show');
    $('.mouse-container').removeClass('libox-type');
    $('.fb_dialog').removeClass('z-index-0');
  },
  useOpenClose(target, libox) {
    const $btn = $(target),
      $lightbox = $(libox),
      $closeBtn = $lightbox.find('a.btn-cir'),
      $dialog = $lightbox.find('.modal-dialog');
    // $btn.on('click', _animationLibox.openBox(libox));
    // $lightbox.on('click', _animationLibox.closeBox(libox));
    // $closeBtn.on('click', _animationLibox.closeBox(libox));
    $btn.on('click', function () {
      _animationLibox.openBox(libox)
    });
    $lightbox.on('click', function () {
      _animationLibox.closeBox(libox)
    });
    $closeBtn.on('click', function () {
      _animationLibox.closeBox(libox)
    });
    $dialog.on('click', function (e) {
      e.stopPropagation();
    });
  },
}
// 加購選項
let _addtion = {
  // 加購電腦版打開選項
  open() {
    let $btn = $('.extra-block li');
    _common.scrollFix('.extra-block .dropdown-item .scrollbar-inner');

    $btn.off().on('click', function (e) {
      let vm = $(this);
      // console.log(e.target.className);
      if (e.target.className === 'img' || e.target.className === 'dropdown-item') {
        return;
      }
      if (!vm.hasClass('active')) {
        vm.siblings().find('.btn-cir.open').removeClass('active');
        vm.siblings().removeClass('active');
        vm.addClass('active');
        vm.find('.btn-cir.open').addClass('active');
        vm.siblings().find('.dropdown-item').slideUp(500);
        vm.find('.dropdown-item').slideDown(500);
      } else {
        vm.removeClass('active');
        vm.find('.btn-cir.open').removeClass('active');
        vm.find('.dropdown-item').slideUp(500);
      }
    });

    $('.dropdown-item').off().on('click', function (e) {
      e.stopPropagation();
    });
  },
  // 加購行動裝置打開選項
  openMobile() {
    // if(!$(window).width() >= 1200) return;
    function addMob() {
      if ($(window).outerWidth() > 1201) {
        $('.extra-block>ul>li.spread').removeClass('mob-click');
      } else {
        $('.extra-block>ul>li.spread').addClass('mob-click');
      }
    }
    addMob();
    $(window).on('resize', addMob);

    let $btn = $('.extra-block li.mob-click');
    $btn.off().on('click', function (e) {
      // console.log(e.target.className);
      // if(e.target.className == 'dropdown-item') return;
      let vm = $(this);
      _common.bodyLock();
      $('.nav').fadeOut(300);
      $('.fb_dialog').addClass('z-index-0');
      if (!vm.hasClass('active')) {
        vm.addClass('active');
        vm.find('.dropdown-item').css('display', 'flex');
        $('.fixed-block').fadeOut(200);
        setTimeout(() => {
          vm.find('.dropdown-item').addClass('in');
        }, 200);
      }
    });


  },
  closeMobile() {
    setTimeout(() => {
      $('.mob-click').removeClass('active');
      $('.mob-click .dropdown-item').removeClass('in');
    }, 100)

    setTimeout(() => {
      $('.mob-click .dropdown-item').css('display', 'none');
      _common.bodyUnlock();
      $('.nav').fadeIn(300);
      $('.fixed-block').fadeIn(300);
      $('.fb_dialog').removeClass('z-index-0');
    }, 300);
  },
  controlMobile() {
    $('.extra-block .mob-check').on('click', function (e) {
      e.stopPropagation();
      _addtion.closeMobile();
    });
    $('.extra-block .mob-show .btn-cir.open').on('click', function (e) {
      e.stopPropagation();
      _addtion.closeMobile();
    });
    $('.extra-block li.mob-click .scrollbar-inner').on('click', function (e) {
      e.stopPropagation();
    });
    $('.extra-block li.mob-click .dropdown-item').on('click', function (e) {
      // console.log(e.target.className);
      // $(this).removeClass('in');
      _addtion.closeMobile();
    });
  },
  // 下拉選單補上下間距
  addSpace() {
    $('.dropdown-item').each(function () {
      let vm = $(this);
      let len = vm.find('li').length;
      if (len > 1) {
        vm.find('ul li:first-child').prepend('<div class="space"></div>');
        vm.find('ul li:last-child').append('<div class="space"></div>');
      }
    })
  },
  // 初始化設定
  init() {
    $('.extra-block li').removeClass('active');
    $('.extra-block li .dropdown-item').css('display', 'none');
    $('.extra-block li .type .btn-cir').removeClass('active');
  },
  resize() {
    $(window).on('resize', function () {
      _addtion.init();
    });
  },
  closeAll() {
    $('.extra-block').removeClass('active');
    $('.extra-block').find('.btn-cir.open').removeClass('active');
    $('.extra-block').find('.dropdown-item').slideUp(500);
  },
  all() {
    _addtion.addSpace();
    _addtion.open();
    _addtion.openMobile();
    _addtion.controlMobile();
  },
}


////////////////////////
// page
////////////////////////
let _home = {
  // 第一個section + banner-text
  firstSectionAddClass() {
    $('main').find('section').eq(0).addClass('banner-text');
    if (checkWidth('pad')) {
      if ($('section').eq(0).hasClass('type-mix')) {
        $('main').css('padding', 0);
        $('section').eq(0).css('padding-top', '155px');
      }
    }
  },
  // 有上兩張圖的給 hover樣式
  setHover() {
    let $cover = $('.img-cover');
    $cover.each(function () {
      let vm = $(this);
      vm.parents('.block').addClass('hover');
    });
  },

  // 文字動態設定
  textAnimation() {
    let $title = $('.title-move');
    $title.each(function (i) {
      let vm = $(this);
      let dataMove = vm.data('move');
      let $li = vm.find('li');
      vm.addClass(`title-move${i}`);
      if (dataMove === 'loop') {
        _common.autoPlay(`.title-move${i}[data-move="loop"] div`, 200);
      }
    });
  },

  // 滾動換圖
  scrollChangeImg() {
    let $wrap = $('.type-mix');
    $wrap.each(function (index) {
      let vm = $(this);
      let $block = vm.find('.block-wrap');
      let len = $block.length;
      let $fix = vm.find('.fix-wrap');

      $(window).on('scroll', function () {
        let wrapTop = vm.offset().top;
        let blockH = $block.outerHeight();
        let totalH = blockH * (len + 1);
        let scrollAfter = $(window).scrollTop();
        let windowH = $(window).height();

        if (scrollAfter >= wrapTop && scrollAfter < (wrapTop + totalH)) {
          $fix.addClass('active');

          for (let i = 0; i < len; i++) {
            if (scrollAfter >= (wrapTop + (i * blockH))) {
              $block.siblings('').removeClass('show');
              $block.eq(i).addClass('show');
            }
          }
          // 往下滾
          if (scrollAfter >= (wrapTop + totalH - windowH)) {
            // console.log('scroll down');
            $fix.css({
              'position': 'absolute',
              'top': (totalH - windowH),
              'left': 0,
              'width': '100%',
              'height': '100%'
            });
            $fix.removeClass('active');
            // 往下滾超過
            if (scrollAfter >= wrapTop + totalH) {
              // console.log('over')
              $fix.css('top', (totalH - (totalH - windowH)))
            }
          } else {
            // console.log('else')
            $fix.attr('style', '');
            $fix.addClass('active');
          }
        }
        // 往上滾超過
        else if (scrollAfter <= wrapTop) {
          $fix.removeClass('active');
        }
      });
    });
  },

  anchorCallback() {
    let $wrap = $('.type-mix');
    $wrap.each(function () {
      let vm = $(this);
      let $block = vm.find('.block-wrap');
      $block.removeClass('show');
      $block.eq(0).addClass('show');
    });
  },

  // 解除gasp
  clearGsap() {
    if (checkWidth('pad')) {
      gsap.killTweensOf("[data-shift]");
      gsap.killTweensOf("[data-clear]");
      // gsap.killTweensOf("[data-path]");
      $('[data-clear]').addClass('pos-reset');
    }
  },
  homeResize() {
    // 重新計算高度
    getTypeMixH();
    if (checkWidth('pad')) {
      // 解除gasp
      _home.clearGsap();
      // 綁swiper
      _swiper.homeResizeSwiper();
    } else {
      // 解除swiper
      _swiper.homeResizeSwiper();
      // 綁gasp
      $("[data-clear]").removeClass('pos-reset');
      objMoveParallax();
    }
  },
};
let _news = {
  // 滾動固定左側標題
  scrollFixTitle() {
    let $zone = $('.category');
    let top = $zone.offset().top;
    let $title = $('.news-left .left-wrap');
    let $content = $('.news-content');
    let contentH = $content.outerHeight();

    if ($(window).width() >= 1201) {
      $(window).on('scroll', function () {
        let scrollAfter = $(window).scrollTop();
        // console.log(scrollAfter);
        if (scrollAfter > top) {
          $title.addClass('fix');
          if (scrollAfter >= contentH + 200) {
            $title.addClass('hide');
          } else {
            $title.removeClass('hide');
          }
        } else {
          $title.removeClass('fix');
        }
      });
    }
  },
  // 後端用callback
  newsCallback() {
    parallax();
    _news.scrollFixTitle();
    bLazy.revalidate();
    if (!fesdDB.is.isMobile4) _mouseHover.cursorEnter('.hover-cir');
    AOST.init();
  },
  // 後端用 tag篩選顯示
  showTagList() {
    $('.category-list ul').addClass('hide');
    $('.unit-link.link-open').addClass('hide');
    $('.tag-list').fadeIn(300);
    $('.unit-link.link-close').addClass('show');
    _news.closeTagList();
  },
  // tag篩選 關閉
  closeTagList() {
    $('.unit-link.link-close').on('click', function () {
      $('.tag-list').fadeOut(300);
      $('.unit-link.link-close').fadeOut(300);
      $('.unit-link.link-open').delay4({
        time: '400',
        remove: 'hide'
      });
      $('.category-list ul').delay4({
        time: '400',
        remove: 'hide'
      });
    });
  }
};
let _news_detail = {
  // 社群按鈕定位**********
  sharePos() {
    let $share = $('.share');
    let $content = $('.news_detail .content');
    let top = $content.offset().top;
    let left = $content.offset().left;
    let w = $content.outerWidth();
    $share.css({
      'top': top + 20,
      'left': left + w + 40
    });
  },
  // gotop定位
  gotopPos() {
    let $gotop = $('.info-next .goTop');
    $(window).on('scroll', function () {
      let scrolled = $(window).scrollTop();
      let bottomTop = $('.info-next').position().top;
      let windowH = window.screen.height;

      if (scrolled > (bottomTop - windowH + 100)) {
        $gotop.addClass('bottom');
      } else {
        $gotop.removeClass('bottom');
      }
    });
  },
  // nav 底色設定
  setNavColor(){
    let $nav = $('.nav');
    let color = $('body').css('background-color');
    $nav.css('background-color',color);
    $('main').css('background-color',color);
  }
};
let _product = {
  // 斷行補div
  addBlock() {
    let w = 0;
    let count = 0;
    let $wrap = $('.product-category ul').innerWidth();

    if (checkWidth('mobile')) return;
    $('.product-category li').each(function (index, el) {
      w = w + $(el).outerWidth();
      count++;
      if (w + $('.product-category li').eq(index + 1).outerWidth() > $wrap) {
        if (count % 2 !== 0) $(el).after('<div></div>');
        w = 0;
        count = 0;
      }
    })
  },
  pro2Hover() {
    if (checkWidth('mobile')) return;
    $('.swiper-row2 a').on('mouseenter', function () {
      let vm = $(this);
      vm.parent('').addClass('show');
    }).on('mouseleave', function () {
      $('.swiper-row2 a').parent('').removeClass('show');
    });
  },
  openBrand() {
    let $btn = $('[data-ajax]');
    $btn.on('click', function () {
      let vm = $(this);
      let route = vm.attr('data-route');
      _common.openAjax(route, '.libox-container', _common.ajaxCommon())
    });
  },
};
let _product_list = {
  // 取得圖片寬
  getBLockWidth() {
    // if(checkWidth('mobile')) return;
    let $block = $('.more-content li');
    $block.each(function () {
      let vm = $(this);
      let image = new Image();
      image.onload = function (e) {
        // console.log(e)
        let w = vm.find('img').outerWidth();
        vm.css('width', w);
      };
      image.src = vm.find('img').attr('src');
    })
  },
  // hover產品 其他+灰階效果
  addGrayscale() {
    let page = $('body').attr('data-page');
    let $block = $('.product_list_result li,.result li');
    // if(isMobile()) return;
    let data = [];

    $block.on('mouseenter', function (e) {
      let vm = $(this);
      let bgcolor = vm.find('a').attr('data-bgcolor');
      let $dot = vm.find('.dot');
      data.img = vm.find('.img img').attr('src');
      data.name = vm.find('.text-detail h2').text();
      data.price = vm.find('.text-detail .price span:last-child').text();
      data.txt = vm.find('.text-detail .txt span:last-child').text();
      data.route = vm.find('a').attr('href');
      data.bgc = vm.find('a').attr('data-bgcolor');
      data.line = vm.find('.txt').attr('data-line');

      if (page === 'product_list') {
        vm.find('.text-detail').addClass('show');
        vm.siblings('').addClass('grayscale');
        $dot.fadeIn(200);
        // console.log(e.target.tagName)
        if (checkWidth('pad') && e.target.tagName === 'IMG') {
          bgcolor = vm.attr('data-bg');
          // bgcolor = vm.find('.dot-block.active').attr('data-bg');
          // $('body').css('background-color', `${bgcolor}`);
        }
      }
      $('body').css('background-color', `${bgcolor}`);
      $('.main-wrapper').css('background-color', `${bgcolor}`);

    }).on('mouseleave', function () {
      let vm = $(this);
      let $dot = vm.find('.dot');

      if (page === 'product_list') {
        vm.find('.text-detail').removeClass('show');
        vm.siblings('').removeClass('grayscale');
        $dot.fadeOut(200);
      }

      $('body').css('background-color', '#fff');
      $('.main-wrapper').css('background-color', '#fff');

      vm.find('.img img').attr('src', data.img);
      vm.find('.text-detail h2').text(data.name);
      vm.find('.text-detail .price span:last-child').text(data.price);
      vm.find('.text-detail .txt span:last-child').text(data.txt);
      vm.find('a').attr('href', data.route);

      if (data.line === 'true') {
        vm.find('.text-detail .txt').addClass('line-through');
      } else {
        vm.find('.text-detail .txt').removeClass('line-through');
      }
    });
  },
  // 標準品選色
  pickStyle() {
    let $dot = $('.dot-block');
    let page = $('body').attr('data-page');
    $dot.on('mouseenter', function () {
      let vm = $(this);
      let img = vm.attr('data-img');
      let name = vm.attr('data-name');
      let price = vm.attr('data-price');
      let txt = vm.attr('data-text');
      let route = vm.attr('data-route');
      let bgc = vm.attr('data-bg');
      let line = vm.attr('data-line');

      let $route = vm.parents('li').find('a');
      let $img = vm.parents('li').find('a .img img');
      let $name = vm.parents('li').find('.text-detail h2');
      let $price = vm.parents('li').find('.text-detail .price span:last-child');
      let $text = vm.parents('li').find('.text-detail .txt span:last-child');
      let $line = vm.parents('li').find('.text-detail .txt');

      vm.addClass('active');
      $route.attr('href', route);
      $img.attr('src', img);
      $name.text(name);
      $price.text(price);
      $text.text(txt);
      if (line === 'true') {
        $line.addClass('line-through');
      } else {
        $line.removeClass('line-through');
      }
      $('body').css('background-color', bgc);
      $('.main-wrapper').css('background-color', bgc);
    }).on('mouseleave', function () {
      let vm = $(this);
      vm.removeClass('active');
      if (page === 'search_product') {
        $('.main-wrapper').css('background-color', '#fff');
      }
    });
  },
  mobileEffect() {
    let $li = $('.product_list_result li');
    let bgcolor;
    $li.on('touchstart', function () {
      let vm = $(this);
      // let bgcolor;
      vm.find('.text-detail').addClass('show');
      vm.siblings('').addClass('grayscale');
      if (!vm.find('.dot-block').hasClass('active')) {
        bgcolor = vm.find('a').attr('data-bgcolor');
      } else {
        bgcolor = vm.find('.dot-block.active').attr('data-bg');
      }
      $('body').css('background-color', bgcolor);
      $('.main-wrapper').css('background-color', bgcolor);
    });
    $li.on('touchend', function () {
      let vm = $(this);
      vm.find('.text-detail').removeClass('show');
      vm.siblings('').removeClass('grayscale');
      // $('body').css('background-color', "#fff");
      // $('.main-wrapper').css('background-color', "#fff");
    })
  },
  // 手機板點選色碼
  mobileDot() {
    if (!checkWidth('pad')) return;
    $('.dot-wrap').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  },
  // 斷行補div
  addBlock() {
    let w = 0;
    let count = 0;
    let $wrap = $('.product_list_result ul').innerWidth();

    if ($(window).width() <= 900) return;

    $('.product_list_result li').each(function (index, el) {
      w = w + $(el).outerWidth();
      count++;
      if (w + $('.product_list_result li').eq(index + 1).outerWidth() > $wrap) {
        if (count % 2 !== 0) $(el).after('<div></div>');
        w = 0;
        count = 0;
      }
    })
  },
  // 大圖給class
  setLargeImg() {
    if ($(window).width() <= 900) {
      let $img = $('.product_list_result li img');
      $img.each(function () {
        let vm = $(this);
        let w = vm.width();
        let h = vm.height();
        if (w > h) {
          vm.parents('li').addClass('large');
        }
      });
    }
  },
  backendCallback() {
    _common.blazyInit();
    AOST.init();
    _product_list.addBlock();
    _product_list.pickStyle();
    _product_list.addGrayscale();
    _product_list.mobileEffect();
    _product_list.mobileDot();
    if (!fesdDB.is.isMobile4) _mouseHover.cursorEnter('.hover-cir');
  },

};
let _product_detail = {
  // 設定頁面文字顏色
  textColor() {
    let $color = $('body').attr('data-text');
    if ($color === 'white') {
      $('.icon-wrap').find('.icon').removeClass('active');
      $('.icon-wrap').find('.icon-white').addClass('active');
      $('.unit-link').addClass('white');
      $('.breadcrumb').removeClass('dark').addClass('white');
      $('.btn-less').addClass('white');
      $('.filter-count').addClass('white');
      $('.extra-block li .count').addClass('white');
    } else {
      $('.filter-title').addClass('white');
    }
  },
  // 電腦版 : 規格選擇下拉
  dropdown() {
    let $select = $('.filter-wrap');

    if (checkWidth('pad')) return;
    $select.off().on('click', function () {
      let vm = $(this);
      let dataClass = vm.attr('data-content');
      let h = $(`.select-block.${dataClass}`).outerHeight();

      if (!vm.hasClass('active')) {
        vm.siblings('').removeClass('active');
        vm.addClass('active');
        vm.siblings('').find('.icon').removeClass('active');
        vm.find('.icon').addClass('active');
        $(`.select-block.${dataClass}`).siblings('').fadeOut(500);
        $(`.select-block.${dataClass}`).fadeIn(500);
        $('.select-content').css('height', h);
        // 預設第一個項目active
        if (!$(`.select-block.${dataClass} li`).hasClass('active')) {
          $(`.select-block.${dataClass} li`).eq(0).addClass('active');
        }
      } else {
        vm.removeClass('active');
        $(`.select-block.${dataClass}`).fadeOut(800);
        $('.select-content').css('height', 0);
        vm.find('.icon').removeClass('active');
      }
    });
  },
  // 存取規格下拉內容高度
  getHeight() {
    let $block = $('.select-libox .select-block');
    $block.each(function () {
      let vm = $(this);
      let h = vm.height();
      vm.attr('data-height', h);
    });
  },
  // RWD打開選項
  mobileOpenItem() {
    $('.filter-wrap').addClass('mob-click');
    let $select = $('.filter-wrap.mob-click.ready');
    let isClick = false;
    let isFixBtn = $('.product_detail_filter .fix-btn').length;
    $select.on('click', function () {
      let vm = $(this);
      let dataClass = vm.attr('data-content');
      isClick = true;
      if (isClick) {
        // console.log(isClick);
        if (!vm.hasClass('active')) {
          $('.fb_dialog').addClass('z-index-0');
          _common.bodyLock();
          if(isFixBtn !== 0) $('.product_detail_filter .fix-btn').addClass('hide');
          $('.nav').fadeOut(300);
          vm.siblings('').removeClass('active');
          vm.addClass('active');
          $('.select-libox').css('display', 'flex');
          $('.select-libox').addClass('in');
          $(`.select-block.${dataClass}`).siblings().removeClass('active').fadeOut();
          $(`.select-block.${dataClass}`).addClass('active').fadeIn(500);
          // 預設第一個項目active
          if (!$(`.select-block.${dataClass} li`).hasClass('active')) {
            $(`.select-block.${dataClass} li`).eq(0).addClass('active');
          }
          $('.fixed-block').fadeOut(200);
          setTimeout(() => {
            isClick = false;
          }, 1000);
        }
      }
    });
  },
  mobileCloseItem() {
    let isFixBtn = $('.product_detail_filter .fix-btn').length;
    // 初始化狀態
    _product_detail.init();
    setTimeout(() => {
      $('.fb_dialog').removeClass('z-index-0');
      $('.select-libox').css('display', 'none');
      $('.fixed-block').fadeIn(300);
      _common.bodyUnlock();
      $('.nav').fadeIn(300);
      if(isFixBtn !== 0) $('.product_detail_filter .fix-btn').removeClass('hide');
    }, 300);
  },
  bodyClick() {
    $('.select-block').on('click', function (e) {
      e.stopPropagation();
    });
    $('.select-libox').on('click', function () {
      _product_detail.mobileCloseItem();
    });
  },
  mobileControl() {
    if (checkWidth('pad')) {
      _product_detail.mobileControlEvent();
    }
  },
  mobileControlEvent() {
    _product_detail.mobileOpenItem();
    _product_detail.bodyClick();
    $('.select-libox .mob-check').on('click', _product_detail.mobileCloseItem);
    $('.select-libox .scroll-content').scrollbar();
  },
  // 替換文字/圖
  itemReplace() {
    let $li = $('.select-block li');
    $li.on('click', function () {
      let vm = $(this);
      let text = vm.find('.text').text();
      let src = vm.find('.img img').attr('src');
      let $replace = $('.filter-wrap.active');
      let type = $replace.attr('data-type');
      let dataIndex = vm.attr('index');

      vm.siblings('').removeClass('active');
      vm.addClass('active');
      if (type === 'normal') {
        $replace.find('.filter-replace').text(text).attr('data-index', dataIndex);
      } else if (type === 'img') {
        // console.log('img')
        $replace.find('.filter-replace').attr('data-index', dataIndex);
        $replace.find('.filter-replace span').text(text);
        $replace.find('.filter-replace .img-cir img').attr('src', src);
      }
    });
  },
  getColor() {
    let dataColor = $('body').attr('data-color');
    $('.main-wrapper').css('background-color', dataColor);
    $('.style .filter-title').css('background-color', dataColor);
    $('.dropdown-item .opt,.dropdown-item .qty,.dropdown-item .type,.dropdown-item .space').css('background-color', dataColor);
    if ($(window).width() <= 1200) {
      $('.select-libox .scrollbar-inner').css('background-color', dataColor);
      $('.select-libox .scroll-content').css('background-color', dataColor);
      $('.mob-check').css('background-color', dataColor);
      $('.extra-block .dropdown-item .scrollbar-inner').css('background-color', dataColor);
      $('.fixed-block .go-top').css('background-color', dataColor);
    } else if ($(window).width() <= 900) {
      $('.dropdown-item ul').css('background-color', dataColor);
    }
  },
  // 手機板 固定按鈕顯示
  mobildFixBtn() {
    let $gotop = $('.footer .go-top');
    let windowH = document.body.clientHeight;
    let zero;

    if ($(window).width() >= 1200) return;

    $(window).on('scroll', function () {
      let scrollAfter = $(window).scrollTop();

      if (scrollAfter > zero && scrollAfter > windowH) {
        // console.log('down')
        // $gotop.fadeIn(0).addClass('show');
        if (scrollAfter + windowH - 10 >= $('footer').offset().top) {
          // $('.fixed-block').fadeOut(300);
          // $('.fixed-block').addClass('show');
        }
      } else if (scrollAfter == 0) {
        // $('.fixed-block').removeClass('show');
        // $('.fixed-block').fadeOut(300);
      } else {
        // console.log('up')
        // $('.fixed-block').fadeIn(300);
        // $('.fixed-block').addClass('show');
        if (scrollAfter + windowH + 10 <= $('footer').offset().top) {
          // $('.fixed-block').fadeIn(300);
          // $('.fixed-block').removeClass('show');
        }
      }
      setTimeout(() => {
        zero = scrollAfter;
      }, 200)
    });
  },
  // 初始化狀態
  init() {
    $('.filter-wrap.mob-click').removeClass('active');
    $('.select-block.active').fadeOut(500);
    $('.select-libox').removeClass('in');
    $('.filter-wrap').removeClass('active');
    $('.filter-wrap .icon').removeClass('active');
  },
  // resize
  resize() {
    _product_detail.getColor();
    _product_detail.getHeight();

    if ($(window).width() >= 1201) {
      $('.filter-wrap').removeClass('mob-click');
      _product_detail.dropdown();
      _addtion.open();
      $('.extra-block ul li .dropdown-item .scrollbar-inner').css('background-color', 'transparent');
      setTimeout(() => {
        let h = $('.select-libox .select-block.active').attr('data-height');
        $('.select-libox').removeClass('in').css('display', 'block');
        $('.select-libox .scroll-content').css('background-color', 'transparent');
        $('.select-libox .scroll-content').css('height', h);
      }, 200);
    } else {
      // 電腦裝置
      if (!fesdDB.is.isMobile4) {
        _addtion.init();
        _product_detail.init();
      }
      // _addtion.init();
      // _product_detail.init();
      // _product_detail.mobildFixBtn();
      // _addtion.openMobile();
      // _addtion.controlMobile();
      _product_detail.mobileControlEvent();
      _addtion.openMobile();
      _addtion.controlMobile();
    }
  },
  // 客製化按鈕
  // 手機板加入購物
  scrollFixBolck() {
    let $btn = $('.fix-btn');
    let top = $('.top-wrap').offset().top;
    let topH = $('.top-wrap').outerHeight() / 2;
    let bottom = $('.other-swiper').offset().top;
    let bottomH = $('.other-swiper .swiper-container').outerHeight() / 3;
    $(window).on('scroll', function () {
      let scrollAfter = $(window).scrollTop();
      // console.log(scrollAfter);
      if (scrollAfter >= (top + topH)) {
        $btn.addClass('show');
        $('.fixed-block').addClass('show');
        if (scrollAfter >= (bottom + bottomH)) {
          $btn.removeClass('show');
          $('.fixed-block').removeClass('show');
        } else {
          $btn.addClass('show');
          $('.fixed-block').addClass('show');
        }
      } else {
        $btn.removeClass('show');
        $('.fixed-block').removeClass('show');
      }
    });
  },
  // 後端 callback
  backendCallback() {
    topSwiper.destroy();
    _swiper.proDetail_topSwiper();
    _product_detail.textColor();
    _product_detail.dropdown();
    _product_detail.itemReplace();
    _product_detail.mobileControl();
    _product_detail.getColor();
    // _addtion.all();
    AOST.init();
    _mouseHover.cursorEnter('.hover-cir');
    $('[data-anchor]').anchor4();
  },
  // 後端用: 加入購物車後選單回到初始狀態
  filterInit() {
    if (!checkWidth('pad')) {
      _product_detail.init();
      $('.select-block').fadeOut(800);
      $('.select-content').css('height', 0);
      // $('.select-block ul li').removeClass('active');
      // $('.select-block ul li:first-child').addClass('active');
    }
  },
  // 展開所有評價
  spreadEva() {
    let $btn = $('.product_detail_evaluate .unit-link');
    let $li = $('.evaluate-wrap .right ul li');
    let len = $li.length;
    // console.log(len);
    $btn.on('click', function () {
      let vm = $(this);
      if (len > 3) {
        $li.fadeIn(800);
        vm.fadeOut(0);
      }
    });
  }
};
let _product_sale = {
  // 電腦版展開已選
  spreadSelected() {
    if (checkWidth('mobile')) return;

    let $selectWrap = $('.pro_selected');
    let originH = $selectWrap.outerHeight();
    let $spreadBtn = $('.pro_selected .left .cir-btn');
    // console.log(originH);
    $spreadBtn.on('click', function () {
      let vm = $(this);
      let nowH = $selectWrap.find('ul').outerHeight();
      if (!vm.hasClass('active')) {
        vm.addClass('active');
        $selectWrap.addClass('active');
        $selectWrap.css('height', nowH + 25);
      } else {
        vm.removeClass('active');
        $selectWrap.removeClass('active');
        $selectWrap.css('height', originH);
      }
    });
  },
  // 手機版展開已選
  mobSpreadSelected() {
    if (!checkWidth('pad')) return;
    let $btn = $('.right .mobile-show');
    $('.pro_selected').css('height', 'auto');
    $btn.off().on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        $('.nav').fadeOut(100);
        vm.addClass('active');
        _common.bodyLock();
        $('.pro_selected').addClass('active')
        $('[data-class="hide"]').removeClass('mob-hide');
        // $('.pro_selected .left').removeClass('mob-hide');
        // $('.pro_selected .selected-block').removeClass('mob-hide');

      } else {
        $('.nav').fadeIn(100);
        vm.removeClass('active');
        _common.bodyUnlock();
        $('.pro_selected').removeClass('active')
        $('[data-class="hide"]').addClass('mob-hide');
        // $('.pro_selected .left').addClass('mob-hide');
        // $('.pro_selected .selected-block').addClass('mob-hide');
      }
    });
  },
  // 滾動出現
  scrollShow() {
    let windowH = $(window).height();
    let bannerH = $('.product-banner').innerHeight() || $(window).height() / 2;
    let ftPos;
    let $selected = $('.pro_selected');
    let zero = 0;

    $(window).on('scroll', function () {
      let scrollAfter = $(this).scrollTop();
      let scrollBottom = scrollAfter + windowH;
      ftPos = $('footer').position().top + 200;
      // console.log('scrollAfter',scrollAfter)
      // console.log('bannerH',bannerH)
      // console.log('ftPos',ftPos)
      // console.log('scrollBottom',scrollBottom)
      // 下滾
      if (scrollAfter > zero) {
        // console.log('down');
        // 下滾超過banner 出現銷售固定欄
        if (scrollAfter > bannerH) {
          $selected.addClass('show');
          // 下滾超過banner 超過 footer 隱藏
          if (scrollBottom > ftPos) {
            // console.log('in');
            $selected.removeClass('show');
          }
        }
      } else if (scrollAfter == 0) {
        $selected.removeClass('show');
      } else {
        // console.log('up');
        if (scrollBottom < ftPos) {
          $selected.addClass('show');
        }
      }
      setTimeout(() => {
        zero = scrollAfter;
      }, 200);
    });
  },
  // 後端用Callback
  callback() {
    _dropdown.all();
    $('[data-ajax]').ajax4();
    AOST.init();
    setTimeout(()=>{
      _mouseHover.cursorEnter('.hover-cir');
      _common.blazyInit();
    },200)
  },
  // 後端用 單獨區塊callback
  itemCallback() {
    _dropdown.all();
  },
  // resize
  resize() {
    $(window).on('resize', function () {
      _filter.mobileFilterControl();
      _product_sale.mobSpreadSelected();
    });
  }
};
let _product_recommend = {
  // hover項目更換背景色
  hoverBgc() {
    let $slide = $('.other-swiper .swiper-slide');
    let originColor = $('body').attr('data-color');

    $('body').css('background-color', `${originColor}`);
    $slide.on('mouseenter', function () {
      let vm = $(this);
      let dataColor = vm.find('a').attr('data-color');
      $('body').css('background-color', dataColor);
      $('.main-wrapper').css('background-color', dataColor);
      $('.nav').css('background-color', dataColor);
    }).on('mouseleave', function () {
      $('body').css('background-color', originColor);
      $('.main-wrapper').css('background-color', originColor);
      $('.nav').css('background-color', originColor);
    });
  },
  mobileEffect() {
    let $slide = $('.other-swiper .swiper-slide');
    let originColor = $('body').attr('data-color');

    $slide.on('touchstart', function () {
      let vm = $(this);
      let dataColor = vm.find('a').attr('data-color');
      $('body').css('background-color', dataColor);
      $('.main-wrapper').css('background-color', dataColor);
      $('.nav').css('background-color', dataColor);
    });
    $slide.on('touchend', function () {
      $('body').css('background-color', originColor);
      $('.main-wrapper').css('background-color', originColor);
      $('.nav').css('background-color', originColor);
    })
  },
  all() {
    _swiper.proRecommend();
    _product_recommend.hoverBgc();
    _product_recommend.mobileEffect();
  }
};
// 品牌介紹燈箱
let _brand = {
  commonCallback() {
    let container = $('[data-ajax]').attr('data-ajax-container');
    // console.log(container);
    $('body').css({
      'overflow-y': 'hidden',
      'cursor': 'default'
    });
    $('body a').css({
      'cursor': 'default'
    });
    $('.mouse-container').addClass('libox-type');
    $.smoothScroll.destroy();
    $(container).addClass('libox-close-common');
    $(container).fadeIn()
    $('.fb_dialog').addClass('z-index-0');
    setTimeout(() => {
      $(container).addClass('show');
    }, 100)

    $('[data-scroll-content]').scrollbar();
    $('[data-anchor]').anchor4();
    $('[data-ajax]').ajax4()

    $('.ajax_close').on('click', function () {
      _brand.closeAjax();
    });
    _brand.bodyClick();
  },
  closeAjax() {
    let $comContainer = $('.libox-close-common');
    $('.brand').removeClass('in');
    $comContainer.removeClass('show');
    $comContainer.delay4({
      time: '100',
      remove: 'show'
    });
    $comContainer.on('transitionend webkitTransitionEnd oTransitionEnd', function () {
      setTimeout(() => {
        if ($(".base-url").length > 0) closeBrand();
        $.smoothScroll.init();
        $('body').css({
          'overflow-y': 'auto',
          'cursor': 'none'
        });
        $('body a').css({
          'cursor': 'none'
        });
        $('.mouse-container').removeClass('libox-type');
        $comContainer.remove();
        $comContainer.unbind('transitionend webkitTransitionEnd oTransitionEnd');
        $('.fb_dialog').removeClass('z-index-0');
      }, 500)
    })
  },
  bodyClick() {
    $('.brand').on('click', function (e) {
      e.stopPropagation();
    });
    $('.libox-close-common').on('click', function () {
      _brand.closeAjax();
    });
  },
  overviewCallback() {
    _brand.commonCallback();
    $('.brand').addClass('in');
    _mouseHover.cursorEnter('.hover-cir');
  },
  detailCallback() {
    _brand.commonCallback();
    $('.libox-container2').addClass('libox-close-common');
    $('.libox-container2').delay4({
      time: '100',
      add: 'show'
    });
    $('.brand').addClass('in');
    $('body a').css({
      'cursor': 'pointer'
    });
    _mouseHover.cursorEnter('.hover-cir');
    $('.mouse-container').addClass('libox-type');
    copylink('.share .copy-link', 'Copied!');
    $('.brand-back').on('click', function () {
      $('.libox-container2 .brand').removeClass('in')
      setTimeout(function () {
        $('.libox-container2').remove();
      }, 500);
      $('.libox-container2').unbind('transitionend webkitTransitionEnd oTransitionEnd');
    });
    _brand.bodyClick();
  },
  detailOnly() {
    $('.libox-container2').css({
      'background-color': 'rgba(0,0,0,0.2)',
    });
    _brand.detailCallback();
  },
};
// 聯絡我們
let _contact = {
  // input focus 狀態
  onFocus() {
    $('.form-group').off().on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('focus')) {
        vm.parents('.wdd-form').find('.form-group').removeClass('focus');
        vm.parents('.wdd-form').find('.form-select').removeClass('focus');
        vm.addClass('focus');
      }
    });
  },
  // 下拉 focus 狀態
  selectClick() {
    $('.form-select').on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('focus')) {
        vm.addClass('focus');
        vm.parents('.wdd-form').find('.form-group').removeClass('focus');
        vm.parents('.form-group').addClass('focus');
        vm.parents('.wdd-form').find('.subject span:last-child').fadeOut(300)
        vm.find('.option span:last-child').fadeIn(300);
      }
    });
  },
  // 滾動
  scroll() {
    let $text = $('.inner-text');
    let hiOffset = $('.inner-text.hi').offset().top;
    let certification = ($('.certification').offset().top) - ($(window).height() / 3);
    let correct = $(window).innerHeight() - 115;
    let zero = 0;

    $(window).on('scroll', function () {
      // console.log(hiOffset)
      let scrollTop = $(this).scrollTop();
      let distance = $(this).scrollTop() - hiOffset + correct;
      // console.log(distance)
      if (scrollTop > zero) {
        // console.log('down')
        if (scrollTop > $(window).height() / 3) {
          // console.log('in')
          $text.css('top', distance);
          $('.inner-text.hi').addClass('show');
          if (distance >= certification) {
            // console.log('tks show')
            $('.inner-text.hi').addClass('active');
            setTimeout(() => {
              $('.inner-text.tks').addClass('in');
            }, 400)
            $text.css('top', certification);
          }
        }
      } else {
        // console.log('up')
        if (scrollTop < $(window).height() / 3) {
          $('.inner-text.hi').removeClass('show').css('top', 0);;
        } else {
          if (distance < certification) {
            // console.log('up hide')
            $('.inner-text.tks').removeClass('in');
            $('.inner-text.hi').removeClass('active');
            $text.css('top', distance);
          }
        }
      }
      setTimeout(() => {
        zero = scrollTop;
      }, 200)
    });
  }

};
// FAQ
let _faq = {
  // 展開內容
  openItem() {
    let $item = $('.right li');
    $item.on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        closeEvent(vm).then(openEvent(vm));
      } else {
        closeEvent(vm).then(scroll(vm));
      }
    });

    function openEvent(vm) {
      vm.siblings().removeClass('active');
      vm.siblings().find('.item-content').slideUp(300);
      vm.addClass('active');
      vm.find('.item-content').slideDown(300);
      
      setTimeout(() => {
        let hdH = $('.nav').outerHeight();
        let top = vm.offset().top;
        // console.log('open',top)
        $('body,html').animate({
          scrollTop: top - hdH
        }, {
          duration: 900,
          easing: 'easeInOutCirc'
        });
        
      }, 300);

      setTimeout(()=>{
        $('.nav').removeClass('green');
      },1000)
    };

    function closeEvent(vm) {
      return new Promise(function (resolve, reject) {
        $('.right li').removeClass('active');
        $('.right li .item-content').slideUp(300);
        vm.removeClass('active');
        vm.find('.item-content').slideUp(300);
        resolve();
      });
    };

    function scroll(vm) {
      let hdH = $('.nav').outerHeight();
      let pos = vm.offset().top;
      setTimeout(() => {
        $('body,html').animate({
          scrollTop: pos - hdH
        }, {
          duration: 900,
          easing: 'easeInOutCirc'
        });
      }, 800);
    }
  },
  bodyClick() {
    $('.right li').on('click', function (e) {
      e.stopPropagation();
    });
    $('.item-content').on('click', function (e) {
      e.stopPropagation();
    })
    $('body').on('click', function () {
      $('.right li').removeClass('active');
      $('.item-content').slideUp(800);
    })
  }
};
// 搜尋
let _search = {
  callback(data) {
    _common.ajaxCommon(data);
    if (!fesdDB.is.isMobile4) _mouseHover.cursorEnter('.hover-cir');
    $('.mouse-container').css('z-index','103');
    _search.openSearch();
  },
  // 展開搜尋欄位
  openSearch() {
    let $li = $('.libox-search .search-content li');
    $li.on('click', function () {
      let vm = $(this);
      let data = vm.attr('data-search');
      if (!vm.hasClass('active')) {
        vm.siblings().addClass('opacity').removeClass('active')
        vm.addClass('active').removeClass('opacity');
        vm.parent().addClass('active');
        if (data === 'news') {
          $('.search-product').slideUp(500);
          $(`.search-${data}`).slideDown(500);
        } else if (data === 'product') {
          $('.search-news').slideUp(500);
          $(`.search-${data}`).slideDown(500);
          _search.setClass();
          _common.resizeFun(_search.setClass);
        }
      }
    });
  },
  // 電腦版打開下拉
  openDeskList() {
    let $list = $('.select.desktop');
    $list.off().on('click', function () {
      let vm = $(this);
      let data = vm.attr('data-class');
      if (!vm.hasClass('active')) {
        vm.siblings().removeClass('active');
        vm.addClass('active');
        $('.select-content.desktop').css('display', 'block');
        $(`.ul-${data}`).siblings().removeClass('active').slideUp(500);
        $(`.ul-${data}`).addClass('active').slideDown(500);
      } else {
        vm.removeClass('active');
        $(`.ul-${data}`).removeClass('active').slideUp(500);
      }
    });
  },
  // 手機板控制下拉
  mobileControlList() {
    $('.select-content').off().on('click', function () {
      _search.mobileCloseList();
    });
    $('.select-content>div').on('click', function (e) {
      e.stopPropagation();
    });
    $('.select.mob').on('click', function () {
      let vm = $(this);
      let data = vm.attr('data-class');
      vm.addClass('active');
      _search.mobileOpenList(data);
    });
  },
  // 手機板打開下拉
  mobileOpenList(data) {
    $('.select-content').addClass('active').fadeIn(300);
    $(`.ul-${data}`).addClass('active').fadeIn(500);
    $('.libox-search .modal-scroll-wrap[data-scroll-content]').css('overflow-y', 'hidden');
  },
  // 手機關閉下拉
  mobileCloseList() {
    $('.select').removeClass('active');
    $('.select-content').fadeOut(500).removeClass('active');
    $('.select-content >div').fadeOut(500).removeClass('active');
    $('.libox-search .modal-scroll-wrap[data-scroll-content]').css('overflow-y', 'scroll');
  },
  // 判斷螢幕寬度給class
  setClass() {
    _search.replaceText();
    if ($(window).width() <= 767) {
      $('.select').removeClass('desktop').addClass('mob');
      $('.select-content').removeClass('desktop').addClass('mob');
      _search.mobileControlList();
    } else {
      $('.select').removeClass('mob').addClass('desktop');
      $('.select-content').removeClass('mob').addClass('desktop');
      _search.openDeskList();
    }
  },
  // 取代文字
  replaceText() {
    let $li = $('.select-content li');
    $li.off().on('click', function () {
      let vm = $(this);
      let num = vm.find('.num').text();
      let unit = vm.find('.en').text();
      let ch = vm.find('.ch').text();
      let $parents = vm.parents('.search-filter');
      let $replaceNum = $parents.find('.select.active .select-tit p:first-child span.num');
      let $replaceUnit = $parents.find('.select.active .select-tit p:first-child span.en');
      let $replaceCh = $parents.find('.select.active .select-tit p:first-child span.ch');

      $replaceNum.text(num);
      $replaceUnit.text(unit);
      $replaceCh.text(ch);

      if ($(window).width() <= 767) {
        _search.mobileCloseList();
      } else {
        $('.select-content >div').slideUp(500).removeClass('active');
      }
    });
  },
  // 搜尋結果頁
  // hover 背景變色
  hoverColor() {
    let $block = $('.result li a');
    if (checkWidth('pad')) return;
    $block.on('mouseenter', function () {
      let vm = $(this);
      let dataColor = vm.attr('data-bgcolor');
      $('body').css('background-color', dataColor);
    }).on('mouseleave', function () {
      $('body').css('background-color', '#fff');
    });
  },

  // 後端用: 展開搜尋產品
  openSearchPro(data) {
    _search.callback(data);
    $('[data-search="product"]').addClass('active').siblings().addClass('opacity');
    $('.search-product').slideDown(500);
    // _search.openList();
    _search.setClass();
    _search.replaceText();
  },
  // 後端用: 展開搜尋新聞
  openSearchNews(data) {
    _search.callback(data);
    $('[data-search="news"]').addClass('active').siblings().addClass('opacity');
    $('.search-news').slideDown(500);
  },
};
// 購物流程
let _shopping = {
  // 判斷可下拉選項
  select() {
    let $target = $('.pick-wrap[data-pick="common"]:not(.discount-code)');
    $target.on('click', function () {
      let vm = $(this);
      if (vm.hasClass('allow-pick')) {
        // vm.siblings('.pick-wrap[data-pick="common"]').removeClass('active');
        vm.siblings('.pick-wrap[data-pick="common"]').find('.pick-dropdown').slideUp(500);
        if (vm.hasClass('spread')) {
          vm.find('.pick-dropdown').slideDown(500);
        }
        vm.addClass('active');
      }
      _shopping.preventClick();
    });
  },
  // 打開優惠
  openCode(_this) {
    _this.find('.pick-dropdown').slideDown(500);
  },
  // 關閉優惠
  closeCode(_this) {
    _this.find('.pick-dropdown').slideUp(500);
  },

  // 開啟優惠碼
  openDiscountCode() {
    $('.discount-code').addClass('spread').find('.pick-dropdown').slideDown(500);
  },
  // 顯示折扣碼
  showDiscount() {
    let $target = $('.pick-wrap.discount');
    $target.find('.pick-dropdown').slideDown(500);
    // $target.addClass('allow-pick');
    // _shopping.select();
  },
  preventClick() {
    $('.form-row').on('click', function (e) {
      e.stopPropagation();
    })
  },
  // 開啟測量說明燈箱
  openGuide() {
    let $btn = $('.item-form .desc-tit .desc-btn');
    $btn.on('click', function () {
      _common.openliboxInner('guide');
      $('.libox-inner[data-name="guide"] .scrollbar-inner').scrollbar();
      $('.libox-inner[data-name="guide"] .cir-wrap').on('click', function (e) {
        e.stopPropagation();
      })
    });
  },
  // 開啟庫存不足燈箱
  openShortage() {
    function mainZindex() {
      return new Promise(function (resolve, reject) {
        $('.main-wrapper').css('z-index', 0);
        resolve();
      });
    };

    function liboxShow() {
      $('.libox-container').addClass('show').css('z-index', '2');
      _common.bodyLock();
      $('.mouse-container').addClass('libox-type');
      $('.fb_dialog').addClass('z-index-0');
    };
    mainZindex().then(liboxShow);
  },
  // 開啟庫存控制
  shortageControl() {
    let $btnType1 = $('.item-box.alert h2');
    let $btnType2 = $('.item-box.alert .txt-name');
    let $btnType3 = $('.item-box.alert .txt-color');
    let $btnType4 = $('.item.alert h2');

    $btnType1.on('click', function (e) {
      _shopping.openShortage();
    });
    $btnType2.on('click', function (e) {
      e.stopPropagation();
      _shopping.openShortage();
    });
    $btnType3.on('click', function (e) {
      e.stopPropagation();
      _shopping.openShortage();
    });
    $btnType4.on('click', function (e) {
      _shopping.openShortage();
    });
  },
  // 加入鼠標效果
  shortageHover() {
    $('.item-box.alert h2').addClass('hover-cir').attr('data-hover', 'yellowSmall');
    $('.item-box.alert .txt-name').addClass('hover-cir').attr('data-hover', 'yellowSmall');
    $('.item-box.alert .txt-color').addClass('hover-cir').attr('data-hover', 'yellowSmall');
    _mouseHover.cursorEnter('.hover-cir');
  },
  // 後端
  shortageCallback() {
    _shopping.shortageControl();
    _shopping.shortageHover();
  },
  // 移除 庫存燈箱 & 庫存不足狀態
  shortageRemove() {
    $('.libox-container.shortage').remove();
    $('.item-box.alert h2').removeClass('hover-cir hover-active').attr('data-hover', '');
    $('.item.alert h2').removeClass('hover-cir hover-active').attr('data-hover', '');
    $('.item-box.alert .txt-name').removeClass('hover-cir hover-active').attr('data-hover', '');
    $('.item-box.alert .txt-color').removeClass('hover-cir hover-active').attr('data-hover', '');
    $('.item-box').removeClass('alert');
    $('.item-packpage .item').removeClass('alert');
  },
  // 開啟樓層費燈箱
  openFloor() {
    _common.openliboxInner('floor');
    $('.libox-inner[data-name="floor"] .scrollbar-inner').scrollbar();
    $('.libox-inner[data-name="floor"] .cir-wrap').on('click', function (e) {
      e.stopPropagation();
    });
  },
  // 開啟運費規則
  openFare() {
    _common.openliboxInner('fare');
    $('.libox-inner[data-name="fare"] .img-wrap').on('click', function (e) {
      e.stopPropagation();
    });
  },
  // 付款燈箱選取
  payLiboxSelect() {
    let $btn = $('.libox-inner[data-name="pay"] .pick-wrap');
    $btn.on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        vm.addClass('active');
        vm.siblings().removeClass('active');
        if (vm.find('.pick-dropdown')) {
          vm.siblings().find('.pick-dropdown').slideUp(500);
          vm.find('.pick-dropdown').slideDown(500);
        }
      }
    });

    // $('.pick-wrap').on('click',function(e){
    //   e.stopPropagation();
    // });
  },
  // 結帳完成表單送出動畫
  successAnimate() {
    _common.scrollPos('.wdd-form');
    $('.wdd-form').addClass('out');
    $('.form-list,.button-wrap').delay4({
      time: '600',
      add: 'd-none'
    });
  },
  resize() {
    if ($(window).width() >= 1201) {
      _addtion.open();

    } else {
      if (!fesdDB.is.isMobile4) {
        _addtion.init();
      }
      _addtion.openMobile();
      _addtion.controlMobile();
    }
  }
};
// 關於我們
let _about = {
  canvas() {
    if (fesdDB.is.isBrowser4 === 'IE') return;
    if (checkWidth('pad')) return;
    var canvas = document.getElementById("bgCanvas");
    canvas.width = $('.bg').innerWidth();
    canvas.height = $('.bg').innerHeight();
    var w = canvas.width;
    var h = canvas.height;
    // console.log(w, h);

    var cxt = canvas.getContext("2d");
    cxt.fillStyle = "#fff";
    cxt.fillRect(0, 0, w, h);
    cxt.globalCompositeOperation = 'destination-out';
    cxt.lineWidth = '300';
    cxt.lineCap = 'round';

    canvas.onmousemove = function (event) {
      var ev = ev || window.event;
      var lastw = ev.clientX - canvas.offsetLeft;
      var lasth = event.offsetY - canvas.offsetTop;
      // console.log(lastw, lasth)
      cxt.beginPath();
      cxt.lineTo(lastw, lasth);
      cxt.stroke();
    }
    canvas.onmouse = function (event) {
      canvas.onmousemove = null;
    }
  },
  // 背景換圖
  changeBg() {
    let $bg = $('#bgCanvas');
    let desktopImg = $bg.attr('data-desktop');
    let mobileImg = $bg.attr('data-mobile');
    if ($(window).width() > 767) {
      $bg.attr('style', desktopImg);
    } else {
      $bg.attr('style', mobileImg);
    }
  }
};
// 會員登入
let _member = {
  // 同意條款
  agree() {
    let $btn = $('.agree .pick-wrap>div');
    $btn.on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        vm.addClass('active');
        nextStep();
      } else {
        vm.removeClass('active');
      }
    });

    function nextStep() {
      let $btn = $('[data-register]');
      $btn.on('click', function () {
        let vm = $(this);
        let route = vm.attr('data-route');
        window.location.href = route;
      });
    }
  },
  // 關閉權益
  closeBenefits() {
    let $btn = $('.member-lightbox .unit-link.reverse');
    $btn.on('click', function () {
      _animationLibox.closeBox('.member-lightbox');
    });
  },
  // 同意才可繼續註冊
  goRegister() {
    if ($('.agree .pick-wrap>div').hasClass('active')) {
      nextStep();
    }
  }
};
// 會員中心
let _member_center = {
  // hover換背景
  hoverEf() {
    desktop();
    // mobile();

    // 電腦
    function desktop() {
      let $block = $('.member-link');
      if (!fesdDB.is.isMobile4) {
        $block.on('mouseenter', function () {
          let vm = $(this);
          enter(vm);
        }).on('mouseleave', function () {
          let vm = $(this);
          leave(vm);
        });
      }
    };
    // 行動裝置
    function mobile() {
      let $block = $('.member-link');
      if (fesdDB.is.isMobile4) {
        $block.on('touchstart', function () {
          let vm = $(this);
          enter(vm);
        }).on('touchend', function () {
          let vm = $(this);
          leave(vm);
        });
      }
    };
    // 移入事件
    function enter(vm) {
      let $link = vm.find('a');
      let data = $link.attr('data-type');
      let textColor = $link.attr('data-text');

      $(`.bg-${data}`).addClass('active');
      $link.addClass(textColor).addClass('active');

      $('.member-link a .en').addClass('none');

      switch (data) {
        case 'info':
          _member_center.info(vm);
          break;
        case 'order':
          _member_center.order();
          break;
        case 'evaluation':
          _member_center.evaluation();
          break;
        case 'lovelist':
          _member_center.lovelist();
          break;
      }
    };
    // 移出事件
    function leave(vm) {
      let $link = vm.find('a');
      let data = $link.attr('data-type');
      let textColor = $link.attr('data-text');

      $link.removeClass(textColor).removeClass('active');
      $link.siblings('.img').removeClass('show');
      $('.content').removeClass('active-white active-dark');
      $('.member-link a .en').removeClass('none');
      $(`.bg-${data}`).removeClass('active');
      $('body').attr('data-color', '');
      $('.footer').removeClass('dark');
      $('.bg-wrap').removeClass('por poa');
      $('main').css('background-color', 'transparent');
      $('main').css('background-image', '');
      $('.footer').css('background-color', '#fff');
      $('body').css('background-color', 'transparent');
      $('.member-title').css('background-color', '#fff');
    };
  },
  // info 狀態
  info(vm) {
    $('.content').addClass('active-dark');
    if ($(window).width() <= 1100 && fesdDB.is.isMobile4) {
      vm.find('a').siblings('.img').addClass('show');
    }
  },
  // 圖片跟著滑鼠移動
  imgMousemove() {
    let $block = $('.member-link:nth-child(1) a');

    if (fesdDB.is.isMobile4) return;

    $block.on('mousemove', function (e) {
      let $img = $(this).siblings('.img');
      let offsetLeft = $(this).offset().left;
      let offsetTop = $(this).offset().top;
      let left = e.pageX - offsetLeft;
      let top = e.pageY - offsetTop;
      $img.addClass('active');
      // console.log(left,top)
      $img.css({
        'left': e.pageX - offsetLeft,
        'top': e.pageY - offsetTop
      })
    });
    $block.on('mouseleave', function (e) {
      let $img = $(this).siblings('.img');
      $img.removeClass('active');
    });
  },
  // order 狀態
  order() {
    let bg = $('.bg-order').attr('data-bg');
    $('.content').addClass('active-dark');
    $('.bg-wrap').addClass('poa');
    $('main').css('background-image', `url(${bg})`);
    $('main').css('background-color', '#ffe4ab');
    $('body').css('background-color', '#ffe4ab');
    $('.footer').css('background-color', '#ffe4ab');
    $('.member-title').css('background-color', 'transparent');
  },
  // evaluation 狀態
  evaluation() {
    $('.content').addClass('active-dark');
    $('.content').addClass('por');
    $('.member-title').css('background-color', 'transparent');
  },
  // lovelist 狀態
  lovelist() {
    $('.content').addClass('por');
    $('.content').addClass('active-dark');
    $('.footer').css('background-color', '#eee');
    $('body').css('background-color', '#eee');
    $('.member-title').css('background-color', 'transparent');
  },
  // 開啟會員等級燈箱
  openLevelLibox() {
    let $btn = $('.open-level');
    $btn.on('click', function () {
      _common.openliboxInner('level');
      $('[data-scroll-content]').scrollbar({
        ignoreMobile: true,
      });
    });
  },
  // 關閉
  closeLevelLibox() {
    let $close = $('.ajax_close');
    $close.on('click', function () {
      _common.closeliboxInner();
    });
  },
  // 展開會員等級說明
  spreadText() {
    let $list = $('.libox-inner[data-name="level"] .tbody');
    $list.on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        vm.siblings().removeClass('active');
        vm.addClass('active');
        vm.siblings().find('.item-content .wrap').slideUp(500);
        vm.find('.item-content .wrap').slideDown(500);
      } else {
        vm.removeClass('active');
        vm.find('.item-content .wrap').slideUp(500);
      }
    });
  },
  // 平板以下clone按鈕
  cloneBtn() {
    let $clone = $('.member-title .title .left-block .logout').clone();
    let $parent = $('.member-title .title .right');
    let cloneDOM = '<div class="clone-container"></div>';
    if ($('.clone-container').length <= 0) {
      $parent.append(cloneDOM);
      $('.clone-container').append($clone);
    }
  },
};
// 會員資料
let _member_info = {
  // 開啟更新大頭照燈箱
  openUpdate() {
    let $btn = $('.photo-wrap');
    $btn.on('click', function () {
      _common.openliboxInner('edit');
      _mouseHover.cursorEnter('.hover-cir');
    });
  },

  // 檔案限制大小
  limit() {
    let $input = $('#editImg');
    $input.on('change', function () {
      let size = $(this)[0].files.size;
      // let size = file.size;
      if (size > 1024 * 1024 * 2) {
        console.log('檔案大於 2M');
      }
    });
  },
  // 開啟停用帳號燈箱
  openAccountStop() {
    let $btn = $('.account-stop .button-wrap.stop');
    $btn.on('click', function () {
      _common.openliboxInner('accountStop');
    });
  },
  // 停用帳號成功
  stopSuccess() {
    $('.box-validate').addClass('out').fadeOut(300);
    setTimeout(() => {
      $('.box-success').fadeIn(300)
    }, 400);
  }
};
// 會員收藏
let _member_lovelist = {
  // 取消預設
  init() {
    let $block = $('.content li a');
    $block.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log(e.target.tagName);
      if (e.target.tagName === 'path') {
        console.log('111')
      }
    });
  },
};
// 會員流程
let _member_step = {
  // 取得步驟標題
  getTitle() {
    let $active = $('.step-content.active');
    let num = $active.attr('data-step');
    let text = $active.attr('data-text');
    $('.step-title .step-num .num').text(num);
    $('.step-title .step-num .text').text(text);
  },
  // 切換步驟
  step(step) {
    let $active = $('.step-content.active');
    let num = $active.attr('data-step');
    let page = $('body').attr('data-page');

    if (step == 'next' && num == 1) {
      stepNext(num);
      $('.unit-title').addClass('step2');
      _member_step.getTitle();
      _member_step.countDown();
      _common.scrollPos('.step-title');
    } 
    else if (step == 'next' && num == 2) {
      stepNext(num);
      if (page !== 'member_forget_password') {
        $('.step-title').fadeOut();
        $('.cir-btn.close').fadeOut();
      } else {
        _member_step.getTitle();
        $('.unit-title').removeClass('step2');
      }
      _common.scrollPos('.unit-title .left');
    } 
    else if (step == 'prev' && num == 2) {
      stepPrev(num);
      $('.unit-title').removeClass('step2');
      _member_step.getTitle();
      _common.scrollPos('.unit-title');
      $('.form-code input').val('');
      $('.form-row.password input').val('');
    } else if (step == 'next' && num == 3) {
      stepNext(num);
      $('.step-title').fadeOut();
      $('.cir-btn.close').fadeOut();
      _common.scrollPos('.step-title');
    }

    function stepNext(num) {
      $(`[data-step="${num}"]`).fadeOut(300).removeClass('active');
      $(`[data-step="${Number(num)+1}"]`).fadeIn(800).addClass('active');
    }

    function stepPrev(num) {
      $(`[data-step="${num}"]`).fadeOut(300).removeClass('active');
      $(`[data-step="${Number(num)-1}"]`).fadeIn(800).addClass('active');
    }
  },

  // 倒數計時
  countDown() {
    clearInterval(interval_count);
    clearInterval(interval_resend);
    $('.countdown').html('');
    $('.countdown').each(function (index, el) {
      let set_seconds = Number($(el).attr('data-seconds')) + 1;
      let set_time = Math.floor(set_seconds / 60) + ':' + set_seconds % 60;
      let type = $(el).attr('data-type');

      if (type === 'count') {
        interval_count = setInterval(function () {
          var timer = set_time.split(':');
          var minutes = parseInt(timer[0], 10);
          var seconds = parseInt(timer[1], 10);

          --seconds;
          minutes = (seconds < 0) ? --minutes : minutes;
          minutes = (minutes < 10) ? minutes = '0' + minutes : minutes;
          if (minutes == 0 && seconds == 0) clearInterval(interval_count);
          seconds = (seconds < 0) ? 59 : seconds;
          seconds = (seconds < 10) ? '0' + seconds : seconds;
          $(el).html(minutes + ':' + seconds);
          set_time = minutes + ':' + seconds;
        }, 1000);
      } else if (type === 'resend') {
        interval_resend = setInterval(function () {
          var timer = set_time.split(':');
          var minutes = parseInt(timer[0], 10);
          var seconds = parseInt(timer[1], 10);

          --seconds;
          minutes = (seconds < 0) ? --minutes : minutes;
          minutes = (minutes < 10) ? minutes = '0' + minutes : minutes;
          if (minutes == 0 && seconds == 0) clearInterval(interval_resend);
          seconds = (seconds < 0) ? 59 : seconds;
          seconds = (seconds < 10) ? '0' + seconds : seconds;
          $(el).html(minutes + ':' + seconds);
          set_time = minutes + ':' + seconds;

          if (minutes == parseInt(0) && seconds == parseInt(0)) {
            $('.resend').addClass('hover-cir active');
            _mouseHover.cursorEnter('.hover-cir');
            $('.resend').off().on('click', function () {
              _member_step.init_count();
            });
          }
        }, 1000);
      }
    });
  },

  // 重新計時
  init_count() {
    clearInterval(interval_count);
    clearInterval(interval_resend);
    $('.resend').removeClass('active');
    _member_step.countDown();
  }
};
// 會員訂單
let _member_order = {
  // 訂單狀態初始化
  init_status() {
    let $li = $('.member-status li.active');
    let color = $li.attr('data-color');
    $li.css('border-color', color);
    $li.find('div').css('background-color', color);
  },
  // 訂單狀態顏色顯示
  status() {
    let $btn = $('.member-status li');
    $btn.off().on('click', function () {
      let vm = $(this);
      let color = vm.attr('data-color');
      if (!vm.hasClass('active')) {
        vm.siblings().removeClass('active');
        vm.siblings().css('border-color', 'rgba(255,255,255,.5)');
        vm.siblings().find('div').css('background-color', '#000');
        vm.addClass('active');
        vm.css('border-color', color);
        vm.find('div').css('background-color', color);
      }
    })
  },
};
// 會員訂單紀錄
let _member_detail = {
  // 展開訂單金額
  openPrice() {
    let $btn = $('.order-list .detail');
    $btn.on('click', function () {
      let vm = $(this);
      if (!vm.hasClass('active')) {
        vm.addClass('active');
        vm.find('.detail-text').slideDown(500);
      } else {
        vm.removeClass('active');
        vm.find('.detail-text').slideUp(500);
      }
    });
  },
  // 切換頁籤
  switchTab() {
    let $btn = $('.order-explore [data-tab]');
    $btn.on('click', function () {
      let vm = $(this);
      let type = vm.attr('data-tab');
      if (!vm.hasClass('active')) {
        vm.siblings('[data-tab]').removeClass('active');
        vm.addClass('active');
        $(`.order-${type}`).siblings().fadeOut(200).removeClass('active');
        $(`.order-${type}`).fadeIn(500).addClass('active');
      }
    });
  },
  // 訂單客服紀錄
  stopEvent() {
    $('[data-name="service"] .content').on('click', function (e) {
      e.stopPropagation();
    });
  },
  // 打開客服紀錄 對話紀錄滾動到最下面
  scrollBottom() {
    let $h = $('.text-h').outerHeight();
    let $maxH = $('.text-wrap .scrollbar-inner').outerHeight();
    // console.log($h);
    // console.log($maxH);
    $('[data-scrollbody]').animate({
      scrollTop: ($h - $maxH)
    }, {
      duration: 900,
      easing: 'easeInOutCirc'
    });
  },
  // 退貨選擇
  returnCheck() {
    let $pick = $('[data-pick]');
    $pick.on('click', function () {
      let vm = $(this);
      let type = vm.attr('data-pick');
      if (type === 'main') {
        mainItem(vm);
      } else if (type === 'item') {
        detailItem(vm);
      }
      // 大項
      function mainItem(vm) {
        if (!vm.hasClass('active')) {
          vm.siblings().removeClass('active');
          vm.addClass('active');
          if (vm.hasClass('appoint')) vm.find('section').slideDown(800);
          else vm.siblings().find('section').slideUp(800);
        }
        $('.pick-wrap.appoint section').on('click', function (e) {
          e.stopPropagation();
        })
      };
      // 退貨細項
      function detailItem(vm) {
        if (!vm.hasClass('active')) vm.addClass('active');
        else vm.removeClass('active');
      };

    });
  },
  // 電腦版hover
  desktopHover() {
    if (fesdDB.is.isMobile4 === false) {
      $('[data-pick="item"]').addClass('desktop');
    }
  },
  // 申請退貨燈箱
  liboxReturn() {
    _member_detail.returnCheck();
    _member_detail.desktopHover();
  },
  // 申請退貨送出成功燈箱
  liboxReturnSuccess() {
    function returnOut() {
      return new Promise(function (resolve, reject) {
        $('.libox-inner[data-name="return"]').removeClass('show');
        resolve();
      });
    };

    function successIn() {
      $('.libox-inner[data-name="returnSuccess"]').css('display', 'block');
      $('.mouse-container').addClass('libox-type');
    };

    function successShow() {
      $('.libox-inner[data-name="returnSuccess"]').addClass('show');
      $('.libox-inner[data-name="returnSuccess"] .scrollbar-inner').scrollbar();
    }
    returnOut().then(successIn).then(successShow);
  },
  // 按鈕狀態改變
  btnStatus() {
    if ($('.order-cancle .button-wrap .form-btn.returnSuccess.active').length == 0) {
      step1().then(step2);
    }

    function step1() {
      return new Promise(function (resolve, reject) {
        $('.order-cancle .button-wrap .form-btn.other').fadeOut();
        resolve();
      });
    }

    function step2() {
      setTimeout(() => {
        $('.order-cancle .button-wrap .status-btn').fadeIn(300);
        $('.order-cancle .button-wrap .form-btn.returnSuccess').addClass('active');
      }, 500)
    }
  }
};
// 會員評價
let _member_evaluation = {
  // 切換頁籤
  switchTab() {
    let $tab = $('.member-tab li');
    $tab.on('click', function () {
      let vm = $(this);
      let content = vm.attr('data-class');
      if (!vm.hasClass('active')) {
        vm.siblings('li').removeClass('active');
        vm.addClass('active');
        $(`[data-tab="${content}"]`).siblings('[data-tab]').fadeOut(300);
        $(`[data-tab="${content}"]`).fadeIn(500);
        if (content === 'done') {
          $('.waypoint').addClass('show');
        }
      }
    });
  },
  // 評分
  score() {
    let $ul = $('.score-cont ul');

    $ul.each(function () {
      let vm = $(this);
      let $li = vm.find('li');

      // set data
      $li.each(function (index) {
        let bm = $(this);
        bm.attr('data-score', index + 1);
      });

      $li.on('mouseenter', function () {
        let _this = $(this);
        let score = _this.attr('data-score');
        _member_evaluation.getStar(score, vm);
      }).on('mouseleave', function () {
        let _this = $(this);
        if (!_this.hasClass('scored')) {
          $li.removeClass('active');
        }
      });

      $li.on('click', function () {
        let self = $(this);
        let score = self.attr('data-score');
        $li.removeClass('active');
        $li.removeClass('scored');
        $li.removeClass('myScore');

        if (!self.hasClass('scored')) {
          self.addClass('myScore');
          for (let i = 0; i < score; i++) {
            $li.eq(i).addClass('active');
            $li.eq(i).addClass('scored');
          }
        }
      });
    });
  },
  getStar(score, ul) {
    let k = score;
    for (let i = 0; i < k; i++) {
      ul.find('li').eq(i).addClass('active');
    }
  },
  // rwd複製結構(訂單編號)
  cloneDOM() {
    let $parent = $('.title');
    let $clone = $('.order-number').clone();
    let $container = '<div class="clone-order-number"></div>';
    if ($('.clone-order-number').length === 0) {
      $parent.siblings('.order-number').addClass('outside');
      $parent.append($container);
      $('.clone-order-number').append($clone);
    }
  }
};
// #swiper
let _swiper = {
  // 移除隱藏的區塊
  homeRemoveBlock() {
    let $hideBlock = $('.swiper-slide.v-hidden');
    $hideBlock.each(function () {
      $(this).remove();
    });
  },
  // each swiper 各別給 class
  homeSetSwiper() {
    _swiper.homeRemoveBlock();
    let $swiper = $('.swiper-container');
    $swiper.each(function (i) {
      let vm = $(this)
      vm.addClass(`swiper-container${i}`);

      // swiper set
      let setting = {
        on: {
          init() {
            $('.swiper-slide-active').addClass('show');
          },
          slideChangeTransitionStart() {
            $('.swiper-slide-active').addClass('show');
          },
          slideChangeTransitionEnd() {
            $('.swiper-slide-active').siblings('').removeClass('show');
          }
        },
        speed: 200,
        slidesPerView: 1,
        centeredSlides: true,
        pagination: {
          el: `.swiper-container${i} .swiper-pagination`,
          clickable: true,
        },
      }
      homeSwiper = new Swiper(`.swiper-container${i}`, setting);
    });
  },
  homeResizeSwiper() {
    if (checkWidth('pad')) {
      $('.swiper-container .swiper-slide').removeClass('swiper-no-swiping');
      if (homeSwiper == undefined) {
        _swiper.homeSetSwiper();
      }
    } else {
      if (homeSwiper !== undefined) {
        homeSwiper.destroy();
        $('.swiper-container .swiper-wrapper').attr('style', '')
        $('.swiper-container .swiper-slide').attr('style', '')
        $('.swiper-container .swiper-slide').addClass('swiper-no-swiping');
      }
    }
  },
  // 最新消息
  newsBannerSwiper() {
    let newsSwiper = new Swiper('.news-swiper .swiper-container', {
      loop: true,
      autoplay: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      speed: 800,
      navigation: {
        nextEl: '.swiper-next',
        prevEl: '.swiper-prev',
      },
    })
  },
  // 產品總覽
  // 產品row4
  proType4() {
    let $swiper = $('.swiper-row4');
    $swiper.each(function (i) {
      let vm = $(this);
      vm.find('.swiper-container').addClass(`row4-swiper${i}`);
      let setting = {
        on: {
          init() {
            let _this = $(this)[0];
            let len = _this.slides.length;
            // 少於4則
            if (len <= 4) {
              if ($(window).width() <= 1650 && $(window).width() > 799) {
                if (len <= 3) {
                  _this.slides.addClass('swiper-no-swiping');
                  $(_this.params.pagination.el).hide();
                }
              } else if ($(window).width() <= 799) {
                if (len <= 1) {
                  _this.slides.addClass('swiper-no-swiping');
                  $(_this.params.pagination.el).hide();
                }
              }
              // >1650
              else {
                _this.slides.addClass('swiper-no-swiping');
                $(_this.params.pagination.el).hide();
                _this.$wrapperEl.addClass('center');
              }
            }
          }
        },
        speed: 1200,
        // autoplay: true,
        // loop: true,
        breakpoints: {
          800: {
            slidesPerGroup: 3,
            slidesPerView: 3,
          },
          1650: {
            slidesPerGroup: 4,
            slidesPerView: 4,
          }
        },
        pagination: {
          el: `.row4-swiper${i} .swiper-pagination`,
          clickable: true,
        },
      };

      let swiperRow4 = new Swiper(`.row4-swiper${i}`, setting);
    })
  },
  // 產品row3
  proType3() {
    let $swiper = $('.swiper-row3');
    $swiper.each(function (i) {
      let vm = $(this);
      let len = vm.find('.swiper-slide').length;
      let setting;
      vm.find('.swiper-container').addClass(`row3-swiper${i}`);

      if (len <= 2) {
        setting = {
          on: {
            init() {
              let _this = $(this)[0];
              let len = _this.slides.length;
              if (len <= 1) {
                _this.slides.addClass('swiper-no-swiping');
                $(_this.params.pagination.el).hide();
              }
            }
          },
          autoplay: true,
          autoPlay: {
            disableOnInteraction: false
          },
          speed: 1200,
          spaceBetween: 10,
          pagination: {
            el: `.row3-swiper${i} .swiper-pagination`,
            clickable: true,
          },
          breakpoints: {
            320: {
              slidesPerView: 1
            },
            768: {
              centeredSlides: true,
              slidesPerView: 1.8,
            }
          }
        };
      } else {
        setting = {
          autoplay: true,
          loop: true,
          speed: 1200,
          spaceBetween: 10,
          pagination: {
            el: `.row3-swiper${i} .swiper-pagination`,
            clickable: true,
          },
          breakpoints: {
            320: {
              slidesPerView: 1
            },
            768: {
              centeredSlides: true,
              slidesPerView: 1.8,
            }
          }
        };
      }

      let swiperRow4 = new Swiper(`.row3-swiper${i}`, setting);
    })
  },
  // 產品row2
  proType2() {
    let $swiper = $('.swiper-row2');
    $swiper.each(function (i) {
      let vm = $(this);
      let len = vm.find('.swiper-slide').length;
      vm.find('.swiper-container').addClass(`row2-swiper${i}`);
      let setting;

      if (len <= 2) {
        setting = {
          on: {
            init() {
              let _this = $(this)[0];
              _this.slides.addClass('swiper-no-swiping');
              $(_this.params.pagination.el).hide();
            }
          },
          slidesPerGroup: 2,
          slidesPerView: 2,
          spaceBetween: 20,
        }
      } else {
        setting = {
          on: {
            init() {
              let _this = $(this)[0];
              $(`${_this.params.el}`).on('mouseenter', function () {
                _this.autoplay.stop();
              }).on('mouseleave', function () {
                _this.autoplay.start();
              });
            }
          },
          loop: true,
          speed: 1000,
          autoplay: true,
          autoPlay: {
            disableOnInteraction: false
          },
          pagination: {
            el: `.row2-swiper${i} .swiper-pagination`,
            clickable: true,
          },
          breakpoints: {
            320: {
              slidesPerGroup: 1,
              slidesPerView: 1,
              spaceBetween: 0,
            },
            768: {
              slidesPerGroup: 2,
              slidesPerView: 2,
              spaceBetween: 20,
              loopFillGroupWithBlank: true
            },
          }
        }
      }
      let swiperRow2 = new Swiper(`.row2-swiper${i}`, setting);
    })
  },
  // 下方推薦產品
  proRecommend() {
    let setting;
    let $slide = $('.other-swiper .swiper-container .swiper-slide');
    let len = $slide.length;
    
    if (len <= 4) {
      if($(window).width() <= 1100 && $(window).width() > 601){
        if(len <= 3){
          $('.other-swiper .swiper-container .swiper-wrapper').addClass('center');
          $slide.addClass('swiper-no-swiping');
          setting = {
            slidesPerView: len,
          }
        }else{
          $('.other-swiper .swiper-container .swiper-wrapper').removeClass('center');
          $slide.removeClass('swiper-no-swiping');
          setting = {
            speed: 1200,
            slidesPerView: len,
            pagination: {
              el: '.other-swiper .swiper-pagination',
              clickable: true
            }
          }
        }
      }
      else if($(window).width() <= 600 && $(window).width() > 321){
        if(len <= 1){
          $('.other-swiper .swiper-container .swiper-wrapper').addClass('center');
          $slide.addClass('swiper-no-swiping');
          setting = {
            slidesPerView: 1,
          }
        }else{
          $('.other-swiper .swiper-container .swiper-wrapper').removeClass('center');
          $slide.removeClass('swiper-no-swiping');
          setting = {
            speed: 1200,
            slidesPerView: 1,
            pagination: {
              el: '.other-swiper .swiper-pagination',
              clickable: true
            }
          }
        }
      }
      else{
        $('.other-swiper .swiper-container .swiper-wrapper').addClass('center');
        $slide.addClass('swiper-no-swiping');
        setting = {
          speed: 1200,
          slidesPerView: len,
        }
      }
      
    } else {
      setting = {
        // loop: true,
        speed: 1200,
        breakpoints: {
          320: {
            slidesPerView: 1
          },
          600: {
            slidesPerView: 2,
            slidesPerGroup: 2
          },
          1100: {
            slidesPerView: 3,
            slidesPerGroup: 3
          },
          1400: {
            slidesPerView: 4,
            slidesPerGroup: 4
          }
        },
        pagination: {
          el: '.other-swiper .swiper-pagination',
          clickable: true
        }
      }
    }
    let proRec = new Swiper('.other-swiper .swiper-container', setting);
  },
  // 產品內頁
  // 最上方產品
  proDetail_topSwiper() {
    let setting;
    let $slide = $('.product_detail_swiper .swiper-container .swiper-slide');
    let len = $slide.length;

    if (len == 1) {
      setting = {
        on: {
          init() {
            $('.product_detail_swiper .swiper-container .swiper-slide').addClass('swiper-no-swiping');
            $('.product_detail_swiper .swiper-pagination').fadeOut();
          }
        },
        slidesPerView: 1,
      }
      $('.swiper-arrow-wrap').hide();
    } else if (len <= 2) {
      setting = {
        speed: 1200,
        centeredSlides: true,
        slidesPerView: 3,
        pagination: {
          el: '.product_detail_swiper .swiper-pagination',
          clickable: true
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
          },
          900: {
            slidesPerView: 3,
          }
        },
        navigation: {
          prevEl: '.product_detail_swiper .prev-btn',
          nextEl: '.product_detail_swiper .next-btn',
        },
      }
    } else {
      setting = {
        loop: true,
        speed: 1200,
        centeredSlides: true,
        slidesPerView: 3,
        pagination: {
          el: '.product_detail_swiper .swiper-pagination',
          clickable: true
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
          },
          900: {
            slidesPerView: 3,
          }
        },
        navigation: {
          prevEl: '.product_detail_swiper .prev-btn',
          nextEl: '.product_detail_swiper .next-btn',
        },
      }
    }
    topSwiper = new Swiper('.product_detail_swiper .swiper-container', setting);
  },
  // 照片牆
  proDetail_gallery() {
    let $swiper = $('.type-swiper');
    $swiper.each(function (i) {
      let vm = $(this);
      vm.find('.swiper-container').addClass(`swiper-container${i}`);
      let setting = {
        on: {
          init() {
            let _this = $(this)[0];
            // let len = _this.slides.length;
            let len = _this.slides.length - _this.loopedSlides * 2;
            if (len <= 1) {
              _this.slides.addClass('swiper-no-swiping');
              $(_this.params.pagination.el).hide();
            }
            $('.swiper-slide-active').addClass('show');
          },
          slideChangeTransitionStart() {
            $('.swiper-slide-active').addClass('show');
          },
          slideChangeTransitionEnd() {
            $('.swiper-slide-active').siblings('').removeClass('show');
          }
        },
        loop: true,
        speed: 900,
        autoplay: true,
        effect: 'fade',
        pagination: {
          el: `.swiper-container${i} .swiper-pagination`,
          clickable: true,
        },
      }
      let photoSwiper = new Swiper(`.type-swiper .swiper-container${i}`, setting);
    })
  },
  // AJAX 產品內頁的
  ajax_productDetail(){
    let ajaxSwiper = new Swiper('.libox-ajax-detail .swiper-container', {
      loop: true,
      autoplay: true,
      speed: 900,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      pagination: {
        el: '.libox-ajax-detail .swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.libox-ajax-detail .next-btn',
        prevEl: '.libox-ajax-detail .prev-btn',
      },
    })
  },
  // 聯絡我們
  contact() {
    contactSwiper = new Swiper('.form-swiper .swiper-container', {
      speed: 1200,
      direction: 'vertical',
      slidesPerView: 3,
      // slidesPerGroup: 1,
      centeredSlides: true,
      slideToClickedSlide: true,

      navigation: {
        nextEl: '.swiper-next',
        prevEl: '.swiper-prev',
      },
    });
  },
  // 廣告
  ad() {
    let adSwiper = new Swiper('.pub-swiper .swiper-container', {
      init() {
        // getSlidesCount(this);
        let _this = $(this)[0];
        // let len = _this.slides.length - _this.loopedSlides * 2;
        let len = $('.pub-swiper .swiper-container .swiper-slide').length - 2;
        console.log(len)
        if (len <= 1) {
          _this.autoplay.stop();
          _this.slides.addClass('swiper-no-swiping');
          _this.params.pagination.el.hide();
        }else{
          _this.autoplay.start();
        }
      },
      loop: true,
      speed: 1000,
      // autoplay: {
      //   disableOnInteraction: false
      // },
      // effect: 'fade',
      // fadeEffect: {
      //   crossFade: true
      // },
      pagination: {
        el: '.pub .swiper-pagination',
        clickable: true,
      },
    });
  },
};


//頁面讀取完執行
const readyFunction = {
  checkFunction() {
    //擷取body的data-page
    var functionName = $('body').attr('data-page');
    //呼叫共用function
    readyFunction.common(functionName);
    //呼叫函數( 如果 data-page = home 輸出的結果為 readyFunction.home(); )
    // eval("readyFunction." + functionName + "();");
    if (functionName !== undefined) {
      eval("readyFunction." + functionName + "();");
    }
  },

  //呼叫共用function
  common(pagename) {
    console.log(`Now page is ${pagename}!`);
    //判斷瀏覽器/系統
    if (deviceDetect() == 'Mac') {
      $('html').addClass('isMac')
    }
    //除Mac系統 & IE瀏覽器外
    if (deviceDetect() != 'Mac' && (window.ActiveXObject || !("ActiveXObject" in window))) {
      $('html').addClass('scrollbarStyle')
    }
    //iOS 回上一頁空白修正
    appleDebug();
    //iOS viewHeight 計算
    fixMobile100vh();
    //初始化Blazy
    _common.blazyInit();
    //ajax
    $('[data-ajax]').ajax4();
    //錨點
    $('[data-anchor]').anchor4();
    //複製連結
    copylink('.share .copy-link', 'Copied!');
    // header
    _header.all();
    // 鼠標
    _mouseHover.all();
    // 卷軸套件
    $.smoothScroll.init();

    _common.blockAnimate();
    AOST.init();
    // footer
    setTimeout(function () {
      _footer.gotopShow();
    }, 200);
    // privacy
    _animationLibox.useOpenClose('.footer a.privacy', '.privacy-lightbox');
    // ad
    _ad.init();
  },

  //呼叫各頁面function
  //首頁
  home() {
    _home.firstSectionAddClass();
    _home.setHover();
    _common.setPath();
    _home.textAnimation();
    _home.scrollChangeImg();
    _home.clearGsap();
    _swiper.homeResizeSwiper();
    _common.resizeFun(_home.homeResize);
    _common.eachWaypoint('.waypoint', '90%');
    setTimeout(()=>{
      parallax();
      objMoveParallax();
    },200);
  },
  // 最新消息
  news() {
    clickSwitchClass('.category-list li', 'active');
    _swiper.newsBannerSwiper();
    _news.scrollFixTitle();
    _categoryList.all();
    setTimeout(()=>{
      parallax();
    },200);
  },
  // 最新消息內頁
  news_detail() {
    _news_detail.setNavColor();
    _news_detail.sharePos();
    _news_detail.gotopPos();
    _common.resizeFun(_news_detail.sharePos);
    $("._articleBlock").article4();
  },
  // 產品總覽
  product() {
    _product.addBlock();
    _swiper.proType4();
    _swiper.proType2();
    _swiper.proType3();
    _product.pro2Hover();
    _common.setPath();
    setTimeout(()=>{
      parallax();
      objMoveParallax();
    },200);
  },
  // 產品列表
  product_list() {
    _header.openMenu('[data-menu="promenu"]');
    _dropdown.all();
    _filter.done();
    _filter.delAll();
    _filter.mobileFilterControl();
    _product_list.addBlock();
    _product_list.getBLockWidth();
    _product_list.pickStyle();
    _product_list.addGrayscale();
    _product_list.mobileEffect();
    _product_list.mobileDot();
    _common.btnShow();
    _filter.resize();
  },
  // 產品行銷
  product_sale() {
    _header.openMenu('[data-menu="promenu"]');
    _dropdown.all();
    _filter.done();
    _filter.delAll();
    _filter.mobileFilterControl();
    _product_sale.spreadSelected();
    _product_sale.mobSpreadSelected();
    _product_sale.scrollShow();
    _common.btnShow();
    _product_sale.resize();
    _common.controlCommonLibox();
    setTimeout(()=>{
      parallax();
    },200);
  },
  // 產品內頁
  product_detail() {
    $('.nav').addClass('delay-normal');
    _product_detail.getHeight();
    _product_detail.textColor();
    clickToggleClass('.heart', 'active');
    _product_detail.dropdown();
    _product_detail.itemReplace();
    _product_detail.mobileControl();

    _addtion.all();
    _product_detail.getColor();
    // _product_detail.mobildFixBtn();
    _product_detail.scrollFixBolck();
    _common.resizeFun(_product_detail.resize);
    _swiper.proDetail_topSwiper();
    _swiper.proDetail_gallery();
    _product_recommend.all();
    _product_detail.spreadEva();
    _common.controlCommonLibox();
    $("._articleBlock").article4();
    _common.setPath();
    setTimeout(() => {
      parallax();
      objMoveParallax();
    }, 200);
  },
  // 聯絡我們
  contact() {
    _swiper.contact();
    _form.formSelect();
    _form.clear();
    _contact.scroll();
    _contact.onFocus();
    _common.controlCommonLibox();
  },
  // Q&A
  faq() {
    clickSwitchClass('.category-list li', 'active');
    _categoryList.all();
    _faq.openItem();
    _faq.bodyClick();
  },
  // 搜尋結果頁
  search_news() {
    parallax();
  },
  search_product() {
    _product_list.addGrayscale();
    _product_list.pickStyle();
    _product_list.mobileDot();
  },
  // 購物車
  shopping() {
    _addtion.all();
    _common.controlCommonLibox();
    _common.resizeFun(_shopping.resize);
  },
  shopping_check() {
    // _addtion.all(); 後端判斷打開
    _form.formSelect();
    _shopping.openGuide();
    $('.libox-inner .box .scrollbar-macosx').scrollbar();
    _shopping.payLiboxSelect();
    _common.controlCommonLibox();
  },
  shopping_success() {
    _form.clear();
  },
  shopping_failure() {},
  // 關於我們
  about() {
    _about.changeBg();
    _about.canvas();
  },
  // 會員
  member() {
    _animationLibox.useOpenClose('.btn-register', '.member-lightbox');
    _member.agree();
    _member.closeBenefits();
    _common.controlCommonLibox();
    $('.nav-content .scrollbar-inner').scrollbar()
  },
  // 會員中心
  member_center() {
    _member_center.hoverEf();
    _member_center.imgMousemove();
    _member_center.openLevelLibox();
    _member_center.closeLevelLibox();
    _common.controlCommonLibox();
    _member_center.spreadText();
    _member_center.cloneBtn();
  },
  // 會員基本資料
  member_info() {
    _member_info.openUpdate();
    // _member_info.limit();
    previewUploadPhoto('#editImg');
    _member_info.openAccountStop();
    _form.formSelect();
    _common.controlCommonLibox();
  },
  // 我的最愛
  member_lovelist() {
    _common.controlCommonLibox();
  },
  // 會員註冊
  member_register() {
    _member_step.getTitle();
    _form.formSelect();
    _common.controlCommonLibox();
  },
  // 會員修改密碼
  member_change_password() {
    _member_step.getTitle();
    _common.controlCommonLibox();
  },
  // 會員忘記密碼
  member_forget_password() {
    _member_step.getTitle();
    _common.controlCommonLibox();
  },
  // 會員修改帳號
  member_change_account() {
    _member_step.getTitle();
    _common.controlCommonLibox();
  },
  // 會員訂單
  member_order() {
    _member_order.init_status();
    _member_order.status();
    _common.controlCommonLibox();
    $('.member-status .scrollbar-inner').scrollbar({
      ignoreMobile: true,
    });
    _member_detail.stopEvent();
    $('.text-box .scrollbar-inner').scrollbar();
  },
  // 訂單紀錄
  member_detail() {
    _member_detail.openPrice();
    _member_detail.switchTab();
    _member_detail.stopEvent();
    _common.controlCommonLibox();
    $('.text-box .scrollbar-inner').scrollbar();
    _member_detail.liboxReturn();
  },
  // 會員評價
  member_evaluation() {
    _member_evaluation.switchTab();
    _common.controlCommonLibox();
  },
  // 會員評價內容
  member_evaluation_detail() {
    _member_evaluation.cloneDOM();
    _member_evaluation.score();
    _common.controlCommonLibox();
    $('.libox-inner[data-name="failed"] .scrollbar-inner').scrollbar();
  },
}

$(document).ready(function () {
  readyFunction.checkFunction();
})
