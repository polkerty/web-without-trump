// ==UserScript==
// @name         Remove Trump From the Internet
// @namespace    *
// @version      0.1
// @description  the masked man rides again
// @author       Me
// @match      *://*/*
// @grant        none
// @run-at       document-ready
// @downloadUrl  https://github.com/polkerty/web-without-trump/raw/main/src/web-without-trump.user.js
// @updateUrl  https://github.com/polkerty/web-without-trump/raw/main/src/web-without-trump.user.js

// ==/UserScript==
(async () => {
    'use strict';
    const remove = [
        // You can customize this list if you'd like!
        /trump/i,
        /biden/i,
        /republican/i,
        /democrat/i,
        /election/i,
        /white house/i,
        /president/i,
        /senate/i,
        /representatives/i
    ]

    const sub = `<span class="usr_censored" >%s</span>`;
    document.body.style.visibility = 'hidden';
    const css = `
.usr_censored {
    background: black !important;
    color: black !important;
}
    `
    const styleEl = document.createElement('style');
    document.head.append(styleEl);
    styleEl.appendChild(document.createTextNode(css));


    const replacer = function(text, node) {
        let is_bad = false;
        for (const pattern of remove) {
            if (text.match(pattern)) is_bad = true;
        }
        if (is_bad) {
            return sub.replace('%s', text);
        }
        return text;
    }
    const blacklist = ["SCRIPT", "STYLE", "HEAD", "TITLE", "META", "SVG"];
    const parentBlacklist = ["SCRIPT", "STYLE"];
    const nodeHandler = node => {
        if (node.innerHTML.includes('usr_censored')) return;
        let tot = 1;
        let textVal = node.innerText || node.textContent || '';
        if (node._cacheText === textVal) return tot;
        node._cacheText = textVal;
        let okElType = !blacklist.includes(node.nodeName.toUpperCase()) && (!node.parentNode || !parentBlacklist.includes(node.parentNode.nodeName.toUpperCase()));
        if (okElType && !node.childElementCount && textVal && textVal.length) {
            let repl = replacer(textVal, node);
            if (node.nodeType === 1) {
                node.innerHTML = repl;
            } else if (node.nodeType === 3) {
                node.textContent = repl;
            }
        } else if (okElType && node.childElementCount) {
            for (const kid of node.children) {
                tot += nodeHandler(kid);
            }
        }
        return tot;
    };
    // Update anything available at script run time:
    nodeHandler(document.body);
    document.body.style.visibility = 'visible';
    // Check for future updates
    const observer = new MutationObserver(mutations => {
        let tot = 0;
        mutations.forEach(m => {
            [...m.addedNodes].filter(x => !(x.farthestViewportElement && x.farthestViewportElement.nodeName === 'SVG')).forEach(x => tot += nodeHandler(x));
        })
        console.log("Checked " + tot + " elements");
    })
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})()
