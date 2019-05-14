/**
 * 基础参数：
 * type层类型。类型：Number，默认：0；0为信息框，1为tips层、loading层
 * className层样式类名。类型：String，默认：''
 * shadeClassName遮罩样式类名。类型：String，默认：''
 * title标题。类型：String，默认：'信息'
 * content内容。类型：String/DOM，默认：''
 * area宽高，类型：Array，默认：['auto', 'auto']。当你宽高都要定义时，你可以area: ['500px', '300px']
 * btn提示按钮，类型：Array，默认：[]
 * closeBtn右上关闭，类型：Boolean，默认：true
 * shade遮罩，类型：Boolean，默认：true
 * shadeClose是否点击遮罩关闭，类型：Boolean，默认：true
 * time自动关闭，类型：Number，默认：0；默认不会自动关闭。当你想自动关闭时，可以time: 5000，即代表5秒后自动关闭，注意单位是毫秒（1秒=1000毫秒）
 * fixed固定，类型：Boolean，默认：true
 * maxWidth最大宽度，类型：Number，默认：360；请注意：只有当area[0]为'auto'时，maxWidth的设定才有效
 * maxHeight最大高度，类型：Number，默认：无；请注意：只有当area[1]为'auto'时，maxHeight的设定才有效
 * success层弹出后的成功回调方法，该回调携带两个参数，分别为当前层索引、当前层DOM对象
 * yes确定按钮回调方法，该回调携带两个参数，分别为当前层索引、当前层DOM对象；默认会自动触发关闭，如果不想关闭，return false即可
 * cancel右上角关闭按钮触发的回调，该回调携带两个参数，分别为当前层索引、当前层DOM对象；默认会自动触发关闭，如果不想关闭，return false即可
 * end层销毁后触发的回调
 * 内置方法：
 * popupBox.open(options)
 * popupBox.msg(content, options)
 * popupBox.load(options)
 * popupBox.close(index)
 * popupBox.closeAll()
 * **/

(function (window, document, undefined) {

    var ready = {
        index: 0,  //弹窗个数
        timer: {},  //倒计时关闭存储
        end: {}  //弹窗关闭回调
    }
    var popupBox = {
        open: function (options) {
            var o = new PopupBox(options);
            return o.boxIndex;
        },
        msg: function (content, options) {
            var defaultConfig= {
                type: 1,
                className: 'customLayer-msg',
                shadeClassName: 'customLayer-msgShade',
                shade: false,
                shadeClose: false,
                closeBtn: false,
                title: false,
                content: '<div class="png"></div><div class="pngCon">'+ content +'</div>',
                btn: [],
                time: 3000
            };
            if(options){
                var userConfig= options;
                userConfig.className= 'customLayer-msg '+ (userConfig.className? userConfig.className: '');
                userConfig.shadeClassName= 'customLayer-msgShade '+ (userConfig.shadeClassName? userConfig.shadeClassName: '');
                $.extend(defaultConfig, userConfig);
            }
            var o= new PopupBox(defaultConfig);
            return o.boxIndex;
        },
        load: function (options) {
            var defaultConfig= {
                type: 1,
                className: 'customLayer-load',
                shadeClassName: 'customLayer-loadShade',
                shade: true,
                shadeClose: false,
                closeBtn: false,
                title: false,
                content: '<div class="loading"></div>',
                btn: [],
                time: 3000
            };
            if(options){
                var userConfig= options;
                userConfig.className= 'customLayer-load '+ (userConfig.className? userConfig.className: '');
                userConfig.shadeClassName= 'customLayer-loadShade '+ (userConfig.shadeClassName? userConfig.shadeClassName: '');
                $.extend(defaultConfig, userConfig);
            }
            var o= new PopupBox(defaultConfig);
            return o.boxIndex;
        },
        close: function (index) {
            var elem = $('#customLayer' + index), contentDom = elem.find('.customLayer-content').children(), shadeDom = $('#customLayer-shade' + index);
            clearTimeout(ready.timer[index]);
            delete ready.timer[index];
            shadeDom.remove();
            if (elem.attr('contype') == 'Object') {
                elem.find('.customLayer-setwin').remove();
                elem.find('.customLayer-title').remove();
                elem.find('.customLayer-btn').remove();
                contentDom.parents('.customLayer-content').unwrap();
                contentDom.unwrap().css('display', 'none');
            } else {
                elem.remove();
            }
            //弹窗结束回调
            typeof ready.end[index] === 'function' && ready.end[index]();
            delete ready.end[index];
        },
        closeAll: function () {
            var _this= this;
            $('.customLayer').each(function () {
                var Index= Number($(this).attr('id').replace('customLayer', ''));  //获取弹窗索引标识
                _this.close(Index)
            })
        }
    }

    var PopupBox = function (options) {
        var that = this;
        that.config = {
            type: 0,  //0为信息框，1为tips层、loading层
            className: '',
            shadeClassName: '',
            shade: true,
            shadeClose: true,
            closeBtn: true,
            fixed: true,
            area: ['auto', 'auto'],
            maxWidth: 360,
            title: '信息',  //title值为false，则不显示标题
            content: '',
            btn: [],
            time: 0
        }
        $.extend(that.config, options);
        that.view();
    }
    PopupBox.prototype.view = function () {
        var that = this,
            config = that.config,
            noTitle = config.title ? '' : 'customLayer-noTitle',
            windowW = $(window).width(),
            windowH = $(window).height(),
            initialZindex = 998,
            contype = config.content instanceof Object ? 'Object' : 'String';  //content类型

        that.boxIndex = ++ready.index;
        var titleStr = '<div class="customLayer-title">' + config.title + '</div>',
            shadeStr = '<div class="customLayer-shade '+ config.shadeClassName +'" id="customLayer-shade'+ that.boxIndex +'" style="z-index: ' + (initialZindex + that.boxIndex- 1) + ';"></div>',
            closeBtnStr = '<div class="customLayer-setwin">' +
                '<a href="javascript:void(0);" class="customLayer-close"></a>' +
                '</div>',
            btnStr = '';
        if (config.btn.length > 0) {
            btnStr += '<div class="customLayer-btn">';
            for (var i = 0; i < (config.btn.length > 2 ? 2 : config.btn.length); i++) {
                btnStr += '<a href="javascript:void(0);" class="customLayer-btn' + i + '">' + config.btn[i] + '</a>';
            }
            btnStr += '</div>';
        }

        //config.content，判断类型
        if (contype == 'Object') {
            config.content.css('display', 'block').wrap('<div class="customLayer ' + config.className + ' ' + noTitle + '" id="customLayer' + that.boxIndex + '" contype="' + contype + '" style="z-index: ' + (initialZindex + that.boxIndex) + ';"><div class="customLayer-content"></div></div>');
            //标题
            if (config.title) {
                config.content.parents('.customLayer').prepend(titleStr);
            }
            //关闭按钮
            if (config.closeBtn) {
                config.content.parents('.customLayer').prepend(closeBtnStr);
            }
            //操作按钮
            if (config.btn.length > 0) {
                config.content.parents('.customLayer').append(btnStr);
            }
        } else {
            var domStr = '<div class="customLayer ' + config.className + ' ' + noTitle + '" id="customLayer' + that.boxIndex + '" contype="' + contype + '" style="z-index: ' + (initialZindex + that.boxIndex) + '">';
            //标题
            if (config.title) {
                domStr += titleStr;
            }
            //关闭按钮
            if (config.closeBtn) {
                domStr += closeBtnStr;
            }
            domStr += '<div class="customLayer-content">';
            domStr += config.content;
            domStr += '</div>';
            //操作按钮
            if (config.btn.length > 0) {
                domStr += btnStr;
            }
            domStr += '</div>';

            $('body').append(domStr);
        }
        //遮罩
        if (config.shade) {
            $('body').append(shadeStr);
        }

        var elem = $('#customLayer' + that.boxIndex);

        //弹窗是否固定
        if(!config.fixed){
            elem.css('position', 'absolute');
        }

        //设置弹窗style属性
        config.area[0]= (function () {
            var a;
            if(config.area[0]== 'auto'){
                a= (elem.width()> config.maxWidth)? config.maxWidth: elem.width();
            }else{
                a= config.area[0].split('px')[0];
            }
            return a;
        })();
        elem.width(config.area[0]);
        config.area[1]= (function () {
            var a;
            if(config.area[1]== 'auto'){
                a= (elem.height()> config.maxHeight)? config.maxHeight: elem.height();
            }else{
                a= config.area[1].split('px')[0];
            }
            return a;
        })();
        elem.height(config.area[1]);
        var boxX = (windowW - config.area[0]) / 2,
            boxY = (function () {
                if(windowH> config.area[1]){
                    return (windowH - config.area[1]) / 2+ (config.fixed? 0: $(document).scrollTop());
                }else{
                    return config.fixed? 0: $(document).scrollTop();
                }
            })(),
            titleH= elem.find('.customLayer-title').outerHeight()== null? 0: elem.find('.customLayer-title').outerHeight(),
            btnH= elem.find('.customLayer-btn').outerHeight()== null? 0: elem.find('.customLayer-btn').outerHeight();
        elem.addClass('customLayer-anim-scale').css({
            'top': boxY + 'px',
            'left': boxX + 'px'
        });
        if(config.type== 0){
            elem.find('.customLayer-content').css({
                'height': (config.area[1]- titleH- btnH) + 'px'
            });
        }
        //删除弹框弹出动画
        setTimeout(function () {
            elem.removeClass('customLayer-anim-scale');
        }, 300)

        //弹窗弹出后的成功回调方法
        if (typeof config.success === 'function') {
            config.success(that.boxIndex, elem);
        }

        that.action(config, elem)
    }
    PopupBox.prototype.action = function (config, elem) {
        var that = this, closeBtnDom = elem.find('a.customLayer-close'), shadeDom = $('#customLayer-shade' + that.boxIndex),
            confirmBtnDom = elem.find('.customLayer-btn0'), cancelBtnDom = elem.find('.customLayer-btn1');

        //弹窗结束回调
        config.end && (ready.end[that.boxIndex] = config.end);

        //点击遮罩关闭弹窗
        if (config.shadeClose) {
            shadeDom.off('click').on('click', function () {
                popupBox.close(that.boxIndex);
            });
        }
        //关闭按钮
        if (config.closeBtn) {
            closeBtnDom.on('click', function () {
                var isClose = config.cancel && config.cancel(that.boxIndex, elem);  //当config.cancel方法里有返回值return false，则不关闭弹窗
                if (isClose == undefined) {
                    popupBox.close(that.boxIndex);
                }
            })
        }
        //自动删除隐藏
        if (config.time) {
            ready.timer[that.boxIndex] = setTimeout(function () {
                popupBox.close(that.boxIndex);
            }, config.time);
        }
        //确认和取消按钮
        if (config.btn.length > 0) {
            confirmBtnDom.on('click', function () {
                var isClose = config.yes && config.yes(that.boxIndex, elem);  //当config.yes方法里有返回值return false，则不关闭弹窗
                if (isClose == undefined) {
                    popupBox.close(that.boxIndex);
                }
            })
            cancelBtnDom.on('click', function () {
                popupBox.close(that.boxIndex);
            })
        }

    }

    window.popupBox = popupBox;

})(window, document);