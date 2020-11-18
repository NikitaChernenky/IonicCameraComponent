import { Injectable } from '@angular/core';
// import {WebView} from '@ionic-native/ionic-webview/ngx';

declare let window: any;
declare let cordova: any;

@Injectable({
  providedIn: 'root',
})
export class FileWriterService {
  constructor() {}
  // constructor(private webview: WebView) {}

  b64toBlob(b64Data: string, contentType: string, sliceSize: number) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  Base64ToFile(imgName, b64Str, pixDir): Promise<any> {
    const self = this;
    const dataBlob = this.b64toBlob(b64Str, null, null);

    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(
        cordova.file.dataDirectory,
        function(fileSys) {
          fileSys.filesystem.root.getDirectory(
            pixDir,
            { create: true },
            function(directory) {
              directory.getFile(imgName, { create: true }, function(file) {
                file.createWriter(function(fileWriter) {
                  fileWriter.onwrite = function() {
                    resolve(file.toInternalURL());
                  };

                  fileWriter.onerror = reject;
                  fileWriter.write(dataBlob);
                }, reject);
              });
            },
            reject
          );
        },
        reject
      );
    });
  }
}
