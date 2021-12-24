///////////////////////////////////////
//            轉場href判斷           //
///////////////////////////////////////

$('a:not(.nocg)').click(function(e) {
    e.preventDefault();
    var thisTarget = $(this).attr("target");
    var aHref = $(this).attr("href");
    // 本地
    var x = window.location.pathname.replace("http://","")
    var xArr = x.split("/");
        xArr = lastArr(xArr)
    // 連結
    var href = $(this).attr("href");
    var y = this.href.replace("http://","")
    var yArr = y.split("/");
        yArr = lastArr(yArr);
    function lastArr(arr) {
        var last = arr.pop()
        if (last.indexOf("#") > -1) {
            arr.push(last)
        } else if (last.indexOf("html") > 0) {
            arr.push(last)
        } else if (last == "") {
            arr.push('index.html')
        } else {
            arr.push(last)
            arr.push('index.html')
        }
        return arr
    }
    if (thisTarget == "_blank" || e.ctrlKey||e.metaKey) {
        window.open(aHref);
    } else if (y.indexOf('jpg') > -1 || y.indexOf('javascript') > -1) {
        //啥事都不幹
    } else if (xArr.length == yArr.length && xArr[xArr.length - 1] == yArr[yArr.length - 1] && xArr[xArr.length - 2] == yArr[yArr.length - 2] && xArr[xArr.length - 3] == yArr[yArr.length - 3]) {
        //自己那頁 啥事都不幹
    } else {
        randonAnimte(href);
    }
})


function randonAnimte(href){
    var i = Math.floor(Math.random() * Math.floor(4)) + 1;
    switch (2) {
        case 1:
            pagechange.CG_A(href)
            break;
        case 2:
            pagechange.CG_B(href)
            break;
        case 3:
            pagechange.CG_C(href)
            break;
        case 4:
            pagechange.CG_D(href)
            break;
        default:
            break;
    }
}


var pagechange = {
    CG_A: function(href) {
        $('.white-after').addClass('out');
        $("html,body").delay(1000).animate({ opacity: "0" }, {
            queue: true,
            duration: 800,
            easing: "easeOutQuad",
            complete: function() {
                window.location.assign(href);
            }
        });
    },
    CG_B: function(href) {
        $('.white-after').addClass('out');
        
        $("body").delay(1000).animate({ opacity: "0" }, {
            queue: true,
            duration: 200,
            easing: "easeOutQuad",
            complete: function() {
                setTimeout(function() {
                    window.location.assign(href);
                }, 200);
            } 
        }); 
    }, 
    CG_C: function(href) {
        $("main").append("<div id='CG_Bbg'></div>");
        $("body").delay(1200).animate({ opacity: "0" }, {
            queue: true,
            duration: 200,
            easing: "easeOutQuad",
            complete: function() {
                setTimeout(function() {
                    window.location.assign(href);
                }, 100);
            } 
        }); 
    }, 
    CG_D: function(href) {
        $("main").append("<div id='CG_Cbg'><div class='CG_Cbg1'></div><div class='CG_Cbg2'></div></div>");
        $("body").delay(1200).animate({ opacity: "0" }, {
            queue: true,
            duration: 200,
            easing: "easeOutQuad",
            complete: function() {
                setTimeout(function() {
                    window.location.assign(href);
                }, 100);
            } 
        });
    } 
}

//動態曲線
jQuery.easing['jswing'] = jQuery.easing['swing'];
jQuery.extend(jQuery.easing, {
    def: 'easeOutQuad',

    easeOutQuad: function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutCirc: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
});
// var _lock = {
//     bodyLock: function(element) {
//         var target
//         if (typeof (element) === 'object') {
//             target = []
//             element.forEach(function (el) {
//             target.push(document.querySelector(el))
//             })
//         }
//         else {
//             target = document.querySelector(element)
//         }
//         bodyScrollLock.lock(target)
//     },
//     //解鎖卷軸 - 需將排除對象傳入
//     //用法同上
//     bodyUnlock: function(element) {
//         var target
//         if (typeof (element) === 'object') {
//             target = []
//             element.forEach(function (el) {
//             target.push(document.querySelector(el))
//             })
//         }
//         else {
//             target = document.querySelector(element)
//         }
//         bodyScrollLock.unlock(target)
//     },
// }

var transStart = {
    // 大單元才使用轉場
    needTrans: function(){
        // $.smoothScroll.destroy();
        var page = $('body').attr('data-page');
        // var data = $('body').attr('data-trans');
        if(page === 'home') transStart.randonIn();
        else return;
    },
    // 隨機轉場
    randonIn: function(){
        var i = Math.floor(Math.random() * Math.floor(2)) + 1;
        switch (i) {
            case 1:
                transStart.transIn1()
                break;
            case 2:
                transStart.transIn2()
                break;
            default:
                break;
        }
    },
    // 轉場fun
    transIn1: function(){

        var data = $('body').attr('data-random');
        var obj = JSON.parse(data);

        $('main').append(
            '<div class="transbox">'+
                '<div class="title-type"><div><span class="en">Strauss Lab</span><span class="en">Strauss Lab</span><span class="en border-bottom">Strauss Lab</span></div></div>'+
                '<div class="img type-shake">'+
                    '<div class="img-wrap"><img src="' + obj[0].pic + '" alt=""/></div>'+
                    '<div class="img-wrap"><img src="' + obj[1].pic + '" alt=""/></div>'+
                    '<div class="img-wrap"><img src="' + obj[2].pic + '" alt=""/></div>'+
                '</div>'+
            '</div>'
        );
        setTimeout(function(){
            $('.transbox').addClass('out');
        },1500)
        
        setTimeout(function(){
            $('.transbox').remove();
            // _lock.bodyUnlock('body');
        },2500);
    },
    transIn2: function(){
        $("main").append(
            '<div class="transbox">'+
                '<div class="big-text">'+
                    '<div class="text"><div><span>E</span><span>X</span><span>P</span><span>L</span><span>O</span><span>R</span></div></div>'+
                    '<div class="text"><div><span>C</span><span>U</span><span>R</span><span>I</span><span>O</span><span>S</span><span>I</span><span>T</span><span>Y</span></div></div>'+
                    '<div class="text"><div><span>A</span><span>D</span><span>V</span><span>E</span><span>N</span><span>T</span><span>U</span><span>R</span><span>E</span></div></div>'+
                '</div>'+
            '</div>'
        );
        setTimeout(function(){
            $('.transbox').addClass('out');
        },1200)
        
        setTimeout(function(){
            $('.transbox').remove();
            // $.smoothScroll.init();
        },2500);
    }
}
transStart.needTrans();

