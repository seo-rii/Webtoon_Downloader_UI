require('./js/frameLess.js');
const setting = require('electron-settings');

function getTheme() {
    return false;
    if (!setting.get('atheme')) {
        return window.matchMedia('(prefers-color-scheme:dark)').matches;
    } else {
        return !!setting.get('dtheme');
    }
}

function loadTheme() {
    if (getTheme()) document.getElementById("theme").href = "./css/theme/dark.css";
    else document.getElementById("theme").href = "./css/theme/light.css";
}

let nowMainEl, nextMainEl, updatingFrame = false, nowPage;
let loadedPage = {};

const fs = require('fs');
const path = require('path');
const urlParams = new URLSearchParams(window.location.search);
const locale = urlParams.get('locale');


async function loadHTML(html) {
    if (updatingFrame) return;
    updatingFrame = true;
    let render;
    try {
        render = fs.readFileSync(path.join(__dirname, 'frame', locale, html), { encoding: 'utf8', flag: 'r' });
    } catch (e) {
        showToast('오류가 발생했습니다 :(', '프로그램 재시작', 'restart');
        updatingFrame = false;
        return;
    }
    const parser = new DOMParser();
    const childrenArray = parser.parseFromString(render, 'text/html').querySelector('body').childNodes;
    nextMainEl = document.createElement('DIV');
    nextMainEl.id = "main";
    nextMainEl.appendChild(childrenArray[0]);
    nextMainEl.classList.add('hiddenContent');
    nowMainEl.classList.add('hideContent');
    try {
        window[nowPage.split('.html')[0].split('/').reverse()[0] + '_exit']();
    } catch (e) {

    }
    setTimeout(() => {
        document.body.removeChild(nowMainEl);
        document.body.appendChild(nextMainEl);
        childrenArray.forEach(item => {
            if (item.nodeName == "SCRIPT" && !(html in loadedPage)) {
                let jsItem = document.createElement('script');
                jsItem.innerHTML = item.innerHTML;
                document.getElementById('main').appendChild(jsItem);
            } else document.getElementById('main').appendChild(item);
        });
        nextMainEl.querySelectorAll('a').forEach(el => {
            el.addEventListener("click", e => {
                e.preventDefault();
                loadHTML(el.getAttribute('href'));
            });
        });
        loadedPage[html] = true;
        try {
            window[html.split('.html')[0].split('/').reverse()[0] + '_init']();
        } catch (e) {

        }
        setTimeout(() => {
            nextMainEl.classList.remove('hiddenContent');
            updatingFrame = false;
        }, 100);
        nowMainEl = nextMainEl;
        nowPage = html;
    }, 500);
}

let isToastShowing = false, currentStat = 0;

function toastWorker(msg, nowStat, time) {
    let delay = 0;
    if (isToastShowing) delay = 300;
    document.getElementById('toast').style.marginTop = '0px';
    setTimeout(() => {
        document.getElementById('toast').innerHTML = msg;
        document.getElementById('toast').style.marginTop = '-40px';
        isToastShowing = true;
        setTimeout(() => {
            if (currentStat !== nowStat) return;
            document.getElementById('toast').style.marginTop = '0px';
            isToastShowing = false;
        }, time);
    }, delay);
}

function showToast(msg, customMsg = '닫기', customEvent = 'closeToast();', time = 7000) {
    ++currentStat;
    toastWorker(msg + ` <span style="float: right;cursor:pointer;" onclick="${customEvent}">${customMsg}</span>`, currentStat, time);
}

function closeToast() {
    document.getElementById('toast').style.marginTop = '0px';
    isToastShowing = false;
}

function init() {
    loadHTML('index.html');
    showToast('경고 : 다운로드한 웹툰을 인터넷상으로 공유하는 행위는 저작권법을 위반하는 행위입니다.');
}

window.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(()=>{
        loadTheme();
        nowMainEl = document.getElementById('main')
        init();
    }, 500)
});


function restart() {
    loadedPage = {};
    updatingFrame = false;
    require('electron').ipcRenderer.send('restart');
}

window.onerror = function errorHandler(errorMsg, url, lineNumber) {
    showToast('오류가 발생했습니다 :(', '프로그램 재시작', 'restart');
    return false;
}
