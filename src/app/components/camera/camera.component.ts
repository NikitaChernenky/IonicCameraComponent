import {Component, Output, Input, EventEmitter, AfterViewInit, OnInit} from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { ActionSheetController } from '@ionic/angular';
import * as $ from 'jquery';
import { DomSanitizer } from '@angular/platform-browser';
import { base64ToFile } from 'ngx-image-cropper';

declare let window: any;
declare let cordova: any;

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit, AfterViewInit {
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
  private tempSchemeImagePath: any;
  private imagePaths = [];

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private file: File,
    private alertCtrl: AlertController,
    private sanitizer: DomSanitizer
  ) {
    this.panelID = Math.random().toString(36).substring(2);
  }

  ngOnInit() { // load image paths from srcList into imagePaths
    if (this.srcList.length > 0) {
    this.initializeImagePaths();
    }
  }

  ngAfterViewInit() { // if srcLsit contains images then toggle panel
    if (this.srcList.length > 0) {
      this.togglePanel();
    }
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
        const imagePath = await this.saveBase64File(
          imgName,
          base64ImageBlob,
          dataDirectoryPath
        );
        this.appendPhoto(imagePath, base64Image);
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
          this.alertCtrl.create({
              header: 'Limit Reached',
              message:
                'A maximum of ' + this.maxNumberOfImages + ' images are allowed.',
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

  saveBase64File(imgName, b64ImageBlob, dataDirectory): Promise<any> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(
        dataDirectory,
        (dir) => {
          dir.getDirectory(
            this.picturesDirectory,
            { create: true },
            (picturesDirectory) => {

              picturesDirectory.getFile(
                imgName,
                { create: true },
                (file) => {
                  file.createWriter(
                    (fileWriter) => {
                      fileWriter.write(b64ImageBlob); // write blob into the file
                      this.tempSchemeImagePath = window.Ionic['WebView'].convertFileSrc(file.toURL());
                      resolve(this.tempSchemeImagePath);
                    },
                    (err) => {
                      reject('Encountered error in FileWriter');
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

  emitImagePaths() {
    this.emitImagePathsChange.emit(this.imagePaths);
  }

  async sanitizeURL(originalURL: string) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => { // await for the link to sanitize before the image is loaded
        resolve(this.sanitizer.bypassSecurityTrustResourceUrl(originalURL));
      }, 300);
    });
  }

  async initializeImagePaths() {
    for (let i = 0; i < this.srcList.length; i++) {
      this.imagePaths[i] = await this.sanitizeURL(this.srcList[i].imgPath);
    }
    this.emitImagePaths();
  }

  async appendPhoto(imagePath: string, base64Image: string) {
    const imgRes = { imgPath: imagePath, base64: base64Image };
    this.srcList.push(imgRes);
    const sanitizedURL = await this.sanitizeURL(imagePath);
    this.imagePaths.push(sanitizedURL);
    this.emitImagePaths();
  }

  deletePhoto(index) {
    this.srcList.splice(index, 1);
    this.imagePaths.splice(index, 1);
    this.emitImagePaths();
  }
}
