function addToQueue(data) {
  if ((typeof data == 'object') && (data.__proto__ !== Blob.prototype)) {
    data = JSON.stringify(data);
  }
  queue.enqueue(data);
  console.log("Added to Queue");
}

function convertDataURIToBlob(dataURI, mimetype) {
  if (!dataURI) {
    return new Uint8Array(0);
  }

  var BASE64_MARKER = ';base64,';
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var uInt8Array = new Uint8Array(raw.length);

  for (var i = 0; i < uInt8Array.length; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], {type: mimetype});
}