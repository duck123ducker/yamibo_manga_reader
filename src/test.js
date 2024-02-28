function getReswwi1sbnmlc(){
    var url = 'data/attachment/forum/202301/26/013359rfw1eesldmlqdd1m.jpg';
    var timeout = 30000;
    var xhr = new XMLHttpRequest();
    xhr.open('undefined', url, true);
    xhr.timeout = timeout;
    xhr.responseType = 'blob';
    xhr.onload = function () {
        if (xhr.status === 200){
            var reader = new FileReader();
            reader.onloadend = function () {
                var result = reader.result;

                var img = new Image();
                img.onload = function() {
                    var width = this.naturalWidth;
                    var height = this.naturalHeight;
                    console.log(JSON.stringify({
                        'msgType': 'pic',
                        'msg': {
                            'hash': 'wwi1sbnmlc',
                            'url': 'data/attachment/forum/202301/26/013359rfw1eesldmlqdd1m.jpg',
                            'timeout': 30000,
                            'code': 200,
                            'result': result,
                            'width': width,
                            'height': height
                        }
                    }));
                };
                img.src = result;

            };
            reader.readAsDataURL(xhr.response);
        } else{
            console.log(JSON.stringify({
                'msgType': 'pic',
                'msg': {
                    'hash': 'wwi1sbnmlc',
                    'url': 'data/attachment/forum/202301/26/013359rfw1eesldmlqdd1m.jpg',
                    'timeout': 30000,
                    'code': xhr.status,
                    'result': String(xhr.status)
                }
            }));
        }
    };
    xhr.ontimeout = function () {
        console.log(JSON.stringify({
            'msgType': 'pic',
            'msg': {
                'hash': 'wwi1sbnmlc',
                'url': 'data/attachment/forum/202301/26/013359rfw1eesldmlqdd1m.jpg',
                'timeout': 30000,
                'code': 600, //timeout
                'result': 'timeoutError'
            }
        }));
    };
    xhr.onerror = function () {
        console.log(JSON.stringify({
            'msgType': 'pic',
            'msg': {
                'hash': 'wwi1sbnmlc',
                'url': 'data/attachment/forum/202301/26/013359rfw1eesldmlqdd1m.jpg',
                'timeout': 30000,
                'code': 601, //unknown
                'result': 'unknownError'
            }
        }));
    };
    xhr.send();
}
getReswwi1sbnmlc();
true;
