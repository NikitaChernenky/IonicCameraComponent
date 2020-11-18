import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { ActionSheetController } from '@ionic/angular';
import * as $ from 'jquery';
import { FileWriterService } from '../providers/file-writer.service';

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
    private fileWriter: FileWriterService,
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
        const imagePath = await this.fileWriter.Base64ToFile(
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

  // here is the method is used to write a file in storage

  // here is the method is used to get content type of an bas64 data

  // here is the method I used to convert base64 data to blob data

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
