import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { ActionSheetController } from '@ionic/angular';
import * as $ from 'jquery';

declare let window: any;
declare let cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private panelExpand = false;
  private iconClicked = false;
  private panelID: string;

  private required = true;
  private itemLabel = 'Images of some sort';

  public pixDirectory = 'AppPhotos';

  croppedImagepath = '';
  isLoading = false;

  image = '';
  base64Image = '';

  srcList: { imgPath: string; base64: string }[] = [];
  maxNumberOfImages = 10;

  imagePickerOptions = {
    maximumImagesCount: 1,
    quality: 50,
  };

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private file: File,
    private alertCtrl: AlertController
  ) {
    this.panelID = Math.random().toString(36).substring(2);
  }

  pickImage(sourceType) {
    const options: CameraOptions = {
      quality: 100,
      sourceType,
      targetWidth: 1000,
      targetHeight: 1000,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      // saveToPhotoAlbum: true
    };

    const onSuccess = async (imageB64) => {
      try {
        const imgName = new Date().getTime() + '.jpg';
        const imagePath = await this.Base64ToFile(
          imgName,
          imageB64,
          this.pixDirectory
        );
        const base64Image = 'data:image/jpeg;base64,' + imageB64;
        const imgRes = { imgPath: imagePath, base64: base64Image };
        this.srcList.push(imgRes);
        console.log(this.srcList);
      } catch (ex) {
        console.log(ex);
        this.showErrorMessage(ex);
      }
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        if (!this.panelExpand) {
          this.togglePanel();
        }
        if (this.srcList.length < this.maxNumberOfImages) {
          onSuccess(imageData);
        } else {
          this.alertCtrl
            .create({
              header: 'Limit Reached',
              message:
                'A maximum of ' +
                this.maxNumberOfImages +
                ' images are allowed.',
              buttons: ['Dismiss'],
            })
            .then((ele) => ele.present());
        }
      },
      (err) => {
        console.log(`ERR -> ${JSON.stringify(err)}`);
        // Handle error
      }
    );
  }

  // Method I used to convert base64 data to blob data
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

  // here is the method is used to write a file in storage
  Base64ToFile(imgName, b64Str, pixDir): Promise<any> {
    const self = this;
    const dataBlob = this.b64toBlob(b64Str, null, null);

    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(
        cordova.file.dataDirectory,
        (fileSys) => {
          fileSys.filesystem.root.getDirectory(
            pixDir,
            { create: true },
            (directory) => {
              directory.getFile(imgName, { create: true }, (file) => {
                file.createWriter((fileWriter) => {
                  fileWriter.onwrite = () => {
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

  public showErrorMessage(Error: string): void {
    console.log(Error);
    this.alertCtrl
      .create({
        header: 'Photo Manager Error',
        message: Error,
        buttons: ['Dismiss'],
      })
      .then((ele) => ele.present());
  }

  public onClickItem() {
    if (!this.iconClicked) {
      this.togglePanel();
    }
    this.iconClicked = false;
  }
  public togglePanel() {
    $('#picture-Panel-' + this.panelID).slideToggle(500);
    this.panelExpand = !this.panelExpand;
  }

  deletePhoto(index) {
    this.srcList.splice(index, 1);
  }
}
