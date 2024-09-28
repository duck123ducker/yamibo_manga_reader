import React, {createRef, memo, useState} from "react";
import {appStore} from "../store/appStore";
import {getPicByWebView} from "../utils";
import {WebView} from "react-native-webview";
import {SWIPER_MIN_CSS, SWIPER_MIN_JS} from "../constants/swiper";
import {ENUM_ROW_DIRECTION} from "../constants/types";

const WebViewReaderRow: React.FC = ({imageList, paging, readRowDirection}) => {
  const webViewRef = createRef<WebView>();
  const [html, setHtml] = useState((() => {
    let tmp = ''
    imageList.forEach((item, index) => {
      tmp += `    
        <div class="swiper-slide">
          <div id="${index}" class="swiper-zoom-container">
            <div class="swiper-zoom-target" style="height: calc(100vw * 24 / 17); width: 100vw; font-size: 6vw; display: flex; align-items: center; justify-content: center;">
              ${index + 1}
            </div>
          </div>
        </div>
      `
    })
    const tmpHtml = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Title</title>
          <script>
            ${SWIPER_MIN_JS}
          </script>
          <style>
            ${SWIPER_MIN_CSS}
          </style>
          <style>
            .container {
              position: relative;
            }
            .click-warapper {
              z-index: 100;
              position: fixed;
              height: 100vh;
              width: 100vw;
              background: black;
              opacity: 0;
              pointer-events: auto;
              display: flex;
              flex-direction: row;
            }
            .swiper-slide img {
              min-width: 100vw;
            }
            .slider-container {
              position: fixed;
              bottom: 0;
              width: 100vw;
              background: #434343;
              z-index: 10;
              height: 10vw;
              display: none;
              align-items: center;
              color: #ffffff;
            }
            .progress-text {
              font-size: 3vw;
              margin: 0 3vw;
            }
            
            #slider {
              flex: 1;
            }
         
          </style>
        </head>
        <body style="padding: 0; margin: 0;">
          <div ${readRowDirection === ENUM_ROW_DIRECTION.R_TO_L ? 'dir="rtl"' : ''} class="swiper mySwiper swiper-h" style="background: #000000;">
            <div class="swiper-wrapper">
              ${tmp}
            </div>
          </div>
          <div class="slider-container" id="slider-container">
            <div class="progress-text" id="value">1</div>
            <input type="range" id="slider" min="1" max="${imageList.length}" step="1" value="1">
            <div class="progress-text">${imageList.length}</div>
          </div>
          
          
          <script>
            let swipping = false
            const sliderContainer = document.getElementById('slider-container');
            const slider = document.getElementById('slider');
            const valueDisplay = document.getElementById('value');
            const swiper = new Swiper('.mySwiper', {
              autoplay: false,
              slidesPerView: 1,
              zoom: true,
            })
            swiper.on('slideChange', function (swiper) {
              setInputTest(swiper.activeIndex + 1);

              ReactNativeWebView.postMessage(JSON.stringify({
                'msgType': 'scrollProgress',
                'msg': {
                  'top': swiper.activeIndex,
                  'bottom': swiper.activeIndex
                }
              }));
            });
            swiper.on('slideChangeTransitionStart', function () {
              swipping = true
            });
            swiper.on('slideChangeTransitionEnd', function () {
              swipping = false
            });
            function leftClick(){
              !swipping && swiper.slide${readRowDirection === ENUM_ROW_DIRECTION.R_TO_L ? "Next" : "Prev"}()
            }
            function rightClick() {
              !swipping && swiper.slide${readRowDirection === ENUM_ROW_DIRECTION.R_TO_L ? "Prev" : "Next"}()
            }
            function centerClick() {
              sliderContainer.style.display = sliderContainer.style.display === "flex" ? "none" : "flex"
            }
            function setInputTest(val) {
              const event = new Event('input');
              slider.value = val;
              slider.dispatchEvent(event);
            }
            // 更新显示的值
            slider.addEventListener('input', function () {
              // 四舍五入确保滑块停在整数位置
              const val = Math.round(slider.value)
              valueDisplay.textContent = String(val);
              swiper.slideTo(val - 1)
            });
            document.addEventListener('click', function(event) {
              const screenWidth = window.innerWidth;
              const x = event.clientX;
              if(x < screenWidth * 0.3) leftClick()
              else if (x > screenWidth * 0.7) rightClick()
              else centerClick()
            });
          </script>
        </body>
      </html>
    `
    return tmpHtml
  })());
  const onLoadEnd = async () => {
    appStore.reading = true
    for (const [index, link] of imageList.entries()) {
      if (appStore.reading) {
        const picData = await getPicByWebView(link)
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            try{
              var divElement = document.querySelector('div[id="${index}"]');
              var imgElement = document.createElement('img');
              imgElement.src = '${picData.result}';
              while (divElement.firstChild) {
                divElement.removeChild(divElement.firstChild);
              }
              divElement.appendChild(imgElement);
            }catch(e){
            // ReactNativeWebView.postMessage(e.toString())
            }
            true;
          `)
        }
      }
    }
  }
  const onError = () => {
    console.log('error')
  }
  const onMessage = (e) => {
    const data = JSON.parse(e.nativeEvent.data)
    switch (data.msgType) {
      case 'scrollProgress': {
        paging(data.msg)
        break
      }
      default:
        console.log(data)
    }
  }

  console.log('rerender')
  return (
    <WebView
      ref={webViewRef}
      // style={{width:px2dp(700)}}
      source={{html: html}}
      onLoadEnd={onLoadEnd}
      onError={onError}
      onMessage={onMessage}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      allowFileAccessFromFileURLs={true}
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
      setBuiltInZoomControls={false}
    />
  )
}

export default memo(WebViewReaderRow)
