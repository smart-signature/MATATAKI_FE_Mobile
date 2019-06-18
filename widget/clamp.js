/*!
* Clamp.js 0.5.1
*
* Copyright 2011-2013, Joseph Schmitt http://joe.sh
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*/

(function () {
  /**
   * Clamps a text node.
   * @param {HTMLElement} element. Element containing the text node to clamp.
   * @param {Object} options. Options to pass to the clamper.
   */
  function clamp(element, options) {
    options = options || {};

    const self = this;
    const win = window;
    const opt = {
      clamp: options.clamp || 2,
      useNativeClamp: typeof (options.useNativeClamp) !== 'undefined' ? options.useNativeClamp : true,
      splitOnChars: options.splitOnChars || ['.', '-', '–', '—', ' '], // Split on sentences (periods), hypens, en-dashes, em-dashes, and words (spaces).
      animate: options.animate || false,
      truncationChar: options.truncationChar || '…',
      truncationHTML: options.truncationHTML,
    };

    const sty = element.style;
    const originalText = element.innerHTML;

    const supportsNativeClamp = typeof (element.style.webkitLineClamp) !== 'undefined';
    let clampValue = opt.clamp;
    const isCSSValue = clampValue.indexOf && (clampValue.indexOf('px') > -1 || clampValue.indexOf('em') > -1);
    let truncationHTMLContainer;

    if (opt.truncationHTML) {
      truncationHTMLContainer = document.createElement('span');
      truncationHTMLContainer.innerHTML = opt.truncationHTML;
    }


    // UTILITY FUNCTIONS __________________________________________________________

    /**
       * Return the current style for an element.
       * @param {HTMLElement} elem The element to compute.
       * @param {string} prop The style property.
       * @returns {number}
       */
    function computeStyle(elem, prop) {
      if (!win.getComputedStyle) {
        win.getComputedStyle = function (el, pseudo) {
          this.el = el;
          this.getPropertyValue = function (prop) {
            const re = /(\-([a-z]){1})/g;
            if (prop == 'float') prop = 'styleFloat';
            if (re.test(prop)) {
              prop = prop.replace(re, function () {
                return arguments[2].toUpperCase();
              });
            }
            return el.currentStyle && el.currentStyle[prop] ? el.currentStyle[prop] : null;
          };
          return this;
        };
      }

      return win.getComputedStyle(elem, null).getPropertyValue(prop);
    }

    /**
       * Returns the maximum number of lines of text that should be rendered based
       * on the current height of the element and the line-height of the text.
       */
    function getMaxLines(height) {
      const availHeight = height || element.clientHeight;
      const lineHeight = getLineHeight(element);

      return Math.max(Math.floor(availHeight / lineHeight), 0);
    }

    /**
       * Returns the maximum height a given element should have based on the line-
       * height of the text and the given clamp value.
       */
    function getMaxHeight(clmp) {
      const lineHeight = getLineHeight(element);
      return lineHeight * clmp;
    }

    /**
       * Returns the line-height of an element as an integer.
       */
    function getLineHeight(elem) {
      let lh = computeStyle(elem, 'line-height');
      if (lh == 'normal') {
        // Normal line heights vary from browser to browser. The spec recommends
        // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
        lh = parseInt(computeStyle(elem, 'font-size')) * 1.2;
      }
      return parseInt(lh);
    }


    // MEAT AND POTATOES (MMMM, POTATOES...) ______________________________________
    let splitOnChars = opt.splitOnChars.slice(0);
    let splitChar = splitOnChars[0];
    let chunks;
    let lastChunk;

    /**
       * Gets an element's last child. That may be another node or a node's contents.
       */
    function getLastChild(elem) {
      // Current element has children, need to go deeper and get last child as a text node
      if (elem.lastChild.children && elem.lastChild.children.length > 0) {
        return getLastChild(Array.prototype.slice.call(elem.children).pop());
      }
      // This is the absolute last child, a text node, but something's wrong with it. Remove it and keep trying
      if (!elem.lastChild || !elem.lastChild.nodeValue || elem.lastChild.nodeValue == '' || elem.lastChild.nodeValue == opt.truncationChar) {
        elem.lastChild.parentNode.removeChild(elem.lastChild);
        return getLastChild(element);
      }
      // This is the last child we want, return it

      return elem.lastChild;
    }

    /**
       * Removes one character at a time from the text until its width or
       * height is beneath the passed-in max param.
       */
    function truncate(target, maxHeight) {
      if (!maxHeight) { return; }

      /**
           * Resets global variables.
           */
      function reset() {
        splitOnChars = opt.splitOnChars.slice(0);
        splitChar = splitOnChars[0];
        chunks = null;
        lastChunk = null;
      }

      const nodeValue = target.nodeValue.replace(opt.truncationChar, '');

      // Grab the next chunks
      if (!chunks) {
        // If there are more characters to try, grab the next one
        if (splitOnChars.length > 0) {
          splitChar = splitOnChars.shift();
        }
        // No characters to chunk by. Go character-by-character
        else {
          splitChar = '';
        }

        chunks = nodeValue.split(splitChar);
      }

      // If there are chunks left to remove, remove the last one and see if
      // the nodeValue fits.
      if (chunks.length > 1) {
        // console.log('chunks', chunks);
        lastChunk = chunks.pop();
        // console.log('lastChunk', lastChunk);
        applyEllipsis(target, chunks.join(splitChar));
      }
      // No more chunks can be removed using this character
      else {
        chunks = null;
      }

      // Insert the custom HTML before the truncation character
      if (truncationHTMLContainer) {
        target.nodeValue = target.nodeValue.replace(opt.truncationChar, '');
        element.innerHTML = `${target.nodeValue} ${truncationHTMLContainer.innerHTML}${opt.truncationChar}`;
      }

      // Search produced valid chunks
      if (chunks) {
        // It fits
        if (element.clientHeight <= maxHeight) {
          // There's still more characters to try splitting on, not quite done yet
          if (splitOnChars.length >= 0 && splitChar != '') {
            applyEllipsis(target, chunks.join(splitChar) + splitChar + lastChunk);
            chunks = null;
          }
          // Finished!
          else {
            return element.innerHTML;
          }
        }
      }
      // No valid chunks produced
      else {
        // No valid chunks even when splitting by letter, time to move
        // on to the next node
        if (splitChar == '') {
          applyEllipsis(target, '');
          target = getLastChild(element);

          reset();
        }
      }

      // If you get here it means still too big, let's keep truncating
      if (opt.animate) {
        setTimeout(() => {
          truncate(target, maxHeight);
        }, opt.animate === true ? 10 : opt.animate);
      } else {
        return truncate(target, maxHeight);
      }
    }

    function applyEllipsis(elem, str) {
      elem.nodeValue = str + opt.truncationChar;
    }


    // CONSTRUCTOR ________________________________________________________________

    if (clampValue == 'auto') {
      clampValue = getMaxLines();
    } else if (isCSSValue) {
      clampValue = getMaxLines(parseInt(clampValue));
    }

    let clampedText;
    if (supportsNativeClamp && opt.useNativeClamp) {
      sty.overflow = 'hidden';
      sty.textOverflow = 'ellipsis';
      sty.webkitBoxOrient = 'vertical';
      sty.display = '-webkit-box';
      sty.webkitLineClamp = clampValue;

      if (isCSSValue) {
        sty.height = `${opt.clamp}px`;
      }
    } else {
      const height = getMaxHeight(clampValue);
      if (height <= element.clientHeight) {
        clampedText = truncate(getLastChild(element), height);
      }
    }

    return {
      original: originalText,
      clamped: clampedText,
    };
  }

  window.$clamp = clamp;
}());
