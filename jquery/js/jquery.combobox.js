/*!
 * Datalist Plugin for iOS safari, version 0.1
 *
 * Copyright 2018, Tomohiro Yanagi
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: 2018-03-05
 */
(function () {

    jQuery.fn.extend({
        datalist: function (selectOptions) {
            return this.each(function () {
                var newDatalist = new Datalist(this, selectOptions);
                $(this).data("datalist", newDatalist );
            });
        },
        getDatalist: function(){
            return $(this).data("datalist");
        }
    });

    var Datalist = function (textInputElement, selectOptions) {
        this.textInputElement = jQuery(textInputElement);
        this.textInputElement.wrap(
            '<span class="datalist" style="position:relative; '+
            'display:-moz-inline-box; display:inline-block;"/>'
        );
        this.selector = new DatalistSelector(this);
        this.setSelectOptions(selectOptions);
        var inputHeight = this.textInputElement.outerHeight();
        var buttonLeftPosition = this.textInputElement.outerWidth() + 0;
        this.showSelectorButton = jQuery(
            '<a href="#" class="datalist_button" '+
            'style="position:absolute; height:'+inputHeight+'px; width:'+
            inputHeight+'px; left:'+buttonLeftPosition+'px;"><div class="datalist_arrow"></div></a>'
        );
        this.textInputElement.css('margin', '0 '+this.showSelectorButton.outerWidth()+'px 0 0');
        this.showSelectorButton.insertAfter(this.textInputElement);
        var thisSelector = this.selector;
        var thisDatalist = this;
        this.showSelectorButton.off("click").on("click", function (e) {
            jQuery('html').trigger('click');
            thisSelector.buildSelectOptionList(thisDatalist.getValue());
            thisSelector.show();
            thisDatalist.focus();
            return false;
        });
        this.bindKeypress();
    };

    Datalist.prototype = {

        setSelectOptions : function (selectOptions) {
            this.selector.setSelectOptions(selectOptions);
            this.selector.buildSelectOptionList(this.getValue());
        },

        bindKeypress : function () {
            var thisDatalist = this;
            //ブラー時に入力があれば選択肢を表示
            this.textInputElement.off('blur').on('blur',function(e) {
                if(thisDatalist.selector.selectedIndex === -1)return;
                if(thisDatalist.getValue().length > 0){
                    thisDatalist.selector.buildSelectOptionList(thisDatalist.getValue());
                    thisDatalist.selector.show();
                }else{
                    thisDatalist.selector.hide();
                }
            }, false).off("keyup").on("keyup", function (event) {
                if (event.keyCode === undefined) {
                    thisDatalist.selector.hide();
                    return;
                }
                if (Datalist.isRemoveCharKey(event)) {
                    thisDatalist.selector.buildSelectOptionList(thisDatalist.getValue());
                }
                if (Datalist.isTabKey(event)
                    || Datalist.isShiftKey(event)) {
                    return;
                }
                if (!Datalist.isDownArrowKey(event)
                    && !Datalist.isUpArrowKey(event)
                    && !Datalist.isEscapeKey(event)
                    //コンボボックスを日本語変換に対応
                    ) {
                    thisDatalist.selector.buildSelectOptionList(thisDatalist.getValue());
                }
                if (Datalist.isEnterKey(event)) {
                    return false;
                }
                thisDatalist.selector.show();
            });
        },

        setValue : function (value) {
            var oldValue = this.textInputElement.val();
            this.textInputElement.val(value);
            if (oldValue != value) {
                this.textInputElement.trigger('change');
            }
        },

        getValue : function () {
            return this.textInputElement.val();
        },

        focus : function () {
            this.textInputElement.trigger('focus');
        },

        disable : function () {
            this.showSelectorButton.off('click');
            this.showSelectorButton.css('cursor', 'default');
            this.showSelectorButton.find('div').replaceWith(
                    '<div class="datalist_arrow_disabled"></div>'
                    );
        },

        enable : function () {
            var thisSelector = this.selector;
            var thisDatalist = this;
            this.showSelectorButton.click(function (e) {
                jQuery('html').trigger('click');
                thisSelector.buildSelectOptionList(thisDatalist.getValue());
                thisSelector.show();
                thisDatalist.focus();
                return false;
            });
            this.showSelectorButton.css('cursor', 'pointer');
            this.showSelectorButton.find('div').replaceWith(
                    '<div class="datalist_arrow"></div>'
                    );
        }

    };

    /**
     * event.keyCodeに対応する値
     * @see https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/keyCode
     * @type Number
     */
    Datalist.keyCodes = {
        UPARROW : 38,
        DOWNARROW : 40,
        ENTER : 13,
        ESCAPE : 27,
        TAB : 9,
        SHIFT : 16,
        BACKSPACE : 8,
        DELETE : 46
    };

    /**
     * event.keyに対応する値
     * @see https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/key/Key_Values
     * @type String
     */
    Datalist.keys = {
        UPARROW : "ArrowUp",
        DOWNARROW : "ArrowDown",
        ENTER : "Enter",
        ESCAPE : "Escape",
        TAB : "Tab",
        SHIFT : "Shift",
        BACKSPACE : "Backspace",
        DELETE : "Delete"
    };

    Datalist.isTabKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.TAB)||(event.which === Datalist.keyCodes.TAB)||(event.key === Datalist.keys.TAB));
    };
    Datalist.isEnterKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.ENTER)||(event.which === Datalist.keyCodes.ENTER)||(event.key === Datalist.keys.ENTER));
    };
    Datalist.isShiftKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.SHIFT)||(event.which === Datalist.keyCodes.SHIFT)||(event.key === Datalist.keys.SHIFT));
    };
    Datalist.isEscapeKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.ESCAPE)||(event.which === Datalist.keyCodes.ESCAPE)||(event.key === Datalist.keys.ESCAPE));
    };
    Datalist.isDeleteKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.DELETE)||(event.which === Datalist.keyCodes.DELETE)||(event.key === Datalist.keys.DELETE));
    };
    Datalist.isBackspaceKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.BACKSPACE)||(event.which === Datalist.keyCodes.BACKSPACE)||(event.key === Datalist.keys.BACKSPACE));
    };
    Datalist.isUpArrowKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.UPARROW)||(event.which === Datalist.keyCodes.UPARROW)||(event.key === Datalist.keys.UPARROW));
    };
    Datalist.isDownArrowKey = function(event){
        return !!((event.keyCode === Datalist.keyCodes.DOWNARROW)||(event.which === Datalist.keyCodes.DOWNARROW)||(event.key === Datalist.keys.DOWNARROW));
    };
    Datalist.isVerticalDirectonKey = function(event){
        return Datalist.isUpArrowKey(event) || Datalist.isDownArrowKey(event);
    };
    Datalist.isRemoveCharKey = function(event){
        return Datalist.isDeleteKey(event) || Datalist.isBackspaceKey(event);
    };
    Datalist.isOptionalKeys = function(event){
        return Datalist.isTabKey(event) || Datalist.isEnterKey(event) || Datalist.isShiftKey(event) || Datalist.isEscapeKey(event) || Datalist.isVerticalDirectonKey(event) || Datalist.isRemoveCharKey(event);
    };

    /**
     *
     * @param {type} datalist
     * @returns {jquery.datalistL#10.DatalistSelector}
     */
    var DatalistSelector = function (datalist) {
        this.datalist = datalist;
        this.optionCount = 0;
        this.selectedIndex = -1;
        this.allSelectOptions = [];
        var selectorTop = datalist.textInputElement.outerHeight();
        var selectorWidth = datalist.textInputElement.outerWidth();
        this.selectorElement = jQuery(
            '<div class="datalist_selector" '+
            'style="display:none; width:'+selectorWidth+
            'px; position:absolute; left: 0; top: '+selectorTop+'px;"'+
            '></div>'
        ).insertAfter(this.datalist.textInputElement);
        var thisSelector = this;
        this.keypressHandler = function (e) {
            if (Datalist.isDownArrowKey(e)) {
                thisSelector.selectNext();
            } else if (Datalist.isUpArrowKey(e)) {
                thisSelector.selectPrevious();
            } else if (Datalist.isEscapeKey(e)) {
                thisSelector.hide();
                thisSelector.datalist.focus();
            } else if (Datalist.isEnterKey(e)) {
                if(thisSelector.selectedIndex !== -1){
                    e.preventDefault();
                    e.stopPropagation();
                }
                thisSelector.datalist.setValue(thisSelector.getSelectedValue());
                thisSelector.datalist.focus();
                thisSelector.hide();
            } else if(Datalist.isTabKey(e)){
                thisSelector.hide();
                e.stopPropagation();
            }
        };

    };


    DatalistSelector.prototype = {

        setSelectOptions : function (selectOptions) {
            this.allSelectOptions = selectOptions || [];
        },

        buildSelectOptionList : function (startingLetters) {
            if (! startingLetters) {
                startingLetters = "";
            }
            this.unselect();
            this.selectorElement.empty();
            this.selectedIndex = -1;
            var i;
            var selectOptions = this.allSelectOptions.filter(function(option){
                //選択肢として表示しない値を消去
                if (option === null || option === undefined) return false;
                //未入力の場合はすべての選択肢を表示
                //または１文字以上一致する。
                //※アルファベットで判別する場合はtoLowerCaseなど使用して、大文字小文字を同一とみる。
                return (! startingLetters.length || option.indexOf(startingLetters) > -1);
            });
            this.optionCount = selectOptions.length;
            var ulElement = jQuery('<ul></ul>').appendTo(this.selectorElement);
            for (i = 0; i < selectOptions.length; i++) {
                var $li = $('<li></li>').text(selectOptions[i]);
                ulElement.append($li);
            }
            var thisSelector = this;
            this.selectorElement.find('li').off("click",setValue).on("click", setValue);
            this.htmlClickHandler = function () {
                thisSelector.hide();
            };
            function setValue(e) {
                thisSelector.hide();
                var val = $(this).text();
                thisSelector.datalist.setValue(val);
                thisSelector.datalist.focus();
            }
        },

        show : function () {
            if (this.selectorElement.find('li').length < 1
                || this.selectorElement.is(':visible'))
            {
                return false;
            }
            jQuery('html').off("keydown").on("keydown", this.keypressHandler);
            this.selectorElement.slideDown('fast');
            jQuery('html').off("click").on("click",this.htmlClickHandler);
            return true;
        },

        hide : function () {
            jQuery('html').off('keydown', this.keypressHandler);
            jQuery('html').off('click', this.htmlClickHandler);
            this.selectorElement.off('click');
            this.unselect();
            this.selectorElement.hide();
        },

        selectNext : function () {
            var newSelectedIndex = this.selectedIndex + 1;
            if (newSelectedIndex > this.optionCount - 1) {
                newSelectedIndex = this.optionCount - 1;
            }
            this.select(newSelectedIndex);
        },

        selectPrevious : function () {
            var newSelectedIndex = this.selectedIndex - 1;
            if (newSelectedIndex < 0) {
                newSelectedIndex = 0;
            }
            this.select(newSelectedIndex);
        },

        select : function (index) {
            var elm = this.selectorElement.find('li');
            if(elm.hasClass('selected')){
                var liHeight = elm.outerHeight();
                var divHeight = this.selectorElement.outerHeight();
                if (liHeight * (index + 1) < divHeight){
                    this.selectorElement.scrollTop(0);
                }else{
                    this.selectorElement.scrollTop(liHeight * (index - 5));
                }
            }
            this.unselect();
            this.selectorElement.find('li:eq('+index+')').addClass('selected')
            this.selectedIndex = index;
        },

        unselect : function () {
            this.selectorElement.find('li').removeClass('selected');
            this.selectedIndex = -1;
        },

        getSelectedValue : function () {
            if(this.selectedIndex !== -1){
                return this.selectorElement.find('li').get(this.selectedIndex).innerHTML;
            } else {
                return this.datalist.textInputElement.val();
            }
        }

    };


})();