import {
  Component,
  Output,
  Input,
  EventEmitter,
  AfterViewInit,
  OnInit
} from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { ActionSheetController } from '@ionic/angular';
import * as $ from 'jquery';
import { DomSanitizer } from '@angular/platform-browser';
import { base64ToFile } from 'ngx-image-cropper';
import { FileHelper } from 'cordova-file-helper';

declare let window: any;
declare let cordova: any;

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements AfterViewInit {
  @Input() maxNumberOfImages = 10;
  @Input() itemLabel = 'Images';
  @Input() required = false;
  @Input() saveCopyToGallery = false;
  @Input() srcList: { imgPath: string; base64: string }[] = [];
  @Input() picturesDirectory = 'AppPhotos';
  @Input() saveLocation = '';
  @Output() emitImagePathsChange: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  private panelExpand = false;
  private iconClicked = false;
  private panelID: string;

  private tempImagePath: any;
  private tempSchemeImagePath: any;
  private folderPath: string;

  imagePaths = [];

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private file: File,
    private alertCtrl: AlertController,
    private sanitizer: DomSanitizer,
    private helper: FileHelper
  ) {
    this.panelID = Math.random().toString(36).substring(2);
  }

  ngAfterViewInit() {
    if (this.srcList.length > 0) {
      console.log('srcList loaded successfully');
      this.togglePanel();
    }
  }

  ngOnInit() {
    this.updateImagePath();
    // for (let i = 0; i < this.srcList.length; i++) {
     // this.srcList
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
      saveToPhotoAlbum: this.saveCopyToGallery,
    };

    const onSuccess = async (imageB64) => {
      try {
        const imgName = new Date().getTime() + '.jpg';
        const base64Image = 'data:image/jpeg;base64,' + imageB64;
        const base64ImageBlob: Blob = base64ToFile(base64Image);
        const dataDirectoryPath = cordova.file.dataDirectory;
        console.log('initial path: ' + dataDirectoryPath);
        const imagePath = await this.saveBase64File(imgName, base64ImageBlob, dataDirectoryPath);

        // const newimagePath = await this.tempSchemeImagePath;
        console.log('What Im pushing: ');
        console.log(imagePath);
        const imgRes = { imgPath: imagePath, base64: base64Image };
        console.log(imgRes);
        this.srcList.push(imgRes);
        console.log('pushed');
        console.log(this.srcList);
        this.updateImagePath();
        console.log('src:');
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
        console.log(`ERR -> ${JSON.stringify(err)}`); // Error handling
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

  // method used to write a file in storage Base64ToFile

   saveBase64File(imgName, b64ImageBlob, dataDirectory): Promise<any> {
    return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(dataDirectory, (dir) => {
      // console.log('Access to the directory granted succesfully');
      dir.getDirectory(
        this.picturesDirectory,
        { create: true },
         (picturesDirectory) => {
          // console.log('photos directory successfully created');
          this.folderPath = picturesDirectory.toInternalURL();
          console.log('in pictures directory');
          // this.helper = new FileHelper(this.folderPath);
          // await this.helper.waitInit();
          picturesDirectory.getFile(imgName, { create: true }, (file) => { // create empty file imgName
           // console.log('File created succesfully.');
            file.createWriter(
                (fileWriter) => {
                fileWriter.write(b64ImageBlob); // write blob into the file

                // console.log(this.helper.exists(this.picturesDirectory));

                // console.log('in pics dir:');
                // console.log(this.helper.pwd());
                // console.log(this.helper.ls());
                // console.log(this.helper.stats(imgName));
                console.log('what Im trying to push: ');
                this.tempSchemeImagePath = window.Ionic.WebView.convertFileSrc(file.toURL());
                console.log(this.tempSchemeImagePath);
                resolve(this.tempSchemeImagePath);
              },
              () => {
                alert('Encountered error in FileWriter');
              }
            );
          },
          (onErrorCreateFile) => {
            reject('Encountered error when creating the imgFile');
          }
          );
        },
        (err) => {
          reject('Encountered error when creating the pictures folder');
        }
      );
    },
        (err) => {
          reject('Encountered error when accessing dataDirectory path');
        }
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
    this.updateImagePath();
  }

  updateImagePath() {
    console.log('in update imgpath');
    this.imagePaths = []; // reset array
    for (let i = 0; i < this.srcList.length; i++) {
      setTimeout(
        () => {this.imagePaths[i] = this.sanitizer.bypassSecurityTrustResourceUrl(this.srcList[i].imgPath); } , 100
      );
    }
    console.log('now let us see the strange array we want');
    console.log(this.imagePaths);
    this.emitImagePaths();
  }

  emitImagePaths() {
    console.log('emitting ^_^');
    this.emitImagePathsChange.emit(this.imagePaths);
  }
}
