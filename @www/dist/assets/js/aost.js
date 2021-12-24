/**
 * Animation on ScrollTrigger - v2.0.0 - 2020.09.18
 */

gsap.registerPlugin(ScrollTrigger);
class AOScrollTrigger {
  constructor() {
    this.el = '[data-aost]';
  }
  init(options = {}) {
    console.log('%c '+'%cAOST is enable'+'%c ','background-color: #000;padding: 5px 1px;margin-right: 4px;','background-color: #000;color: #fff;padding: 5px 10px;font-weight: 700;','background-color: #000;padding: 5px 1px;margin-left: 4px;');

    gsap.utils.toArray(this.el).forEach(dom => {
      this.offset = dom.dataset.aostOffset || 80;
      this.delay = dom.dataset.aostDelay / 1000 || 0;
      // true both
      this.repeat = dom.dataset.aostRepeat || false;
      this.scroller = options.scroller;
      this.class = dom.dataset.aostClass || false;

      if (this.class) {
        this.switchClass(dom)
      }
      else {
        this.defaultAnimation(dom)
      }
    });
  }

  switchClass(dom) {
    let set = {
      start: 'top '+ this.offset +'%',
      scroller: this.scroller || window,
    }
    if (this.repeat == 'true') {
      set.onEnter = () => dom.classList.add(this.class);
      set.onLeaveBack = () => dom.classList.remove(this.class);
    }
    else if (this.repeat == 'both') {
      set.onEnter = () => dom.classList.add(this.class);
      set.onLeave = () => dom.classList.remove(this.class),
      set.onEnterBack = () => dom.classList.add(this.class),
      set.onLeaveBack = () => dom.classList.remove(this.class);
    }
    else set.onEnter = () => dom.classList.add(this.class);
    ScrollTrigger.batch(dom, set);
  }
};

let AOST = new AOScrollTrigger();
