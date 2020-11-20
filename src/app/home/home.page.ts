import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, LoadingController } from '@ionic/angular';
import { BASE64 } from '../base64';

declare let window: any;
declare let cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  typeModal: HTMLIonModalElement;

  @Input() imagePaths: string[] = [];

  maxNumberOfImages = 10;
  itemLabel = 'Images';
  required = true;
  saveCopyToGallery = false;
  srcList: { imgPath: string; base64: string }[] = [];
  picturesDirectory = 'justPhotos';

  private panelExpand = false;
  private iconClicked = false;
  private panelID: string;

  croppedImagepath = '';
  isLoading = false;

  image = '';
  base64Image = '';

  constructor(
    public loadingCtrl: LoadingController,
    public router: Router,
    public modalController: ModalController
  ) {}
  ngOnInit(): void {
     // this.srcList.push({imgPath : '/assets/img/test.jpg', base64 : 'data:image/jpeg;base64,' + BASE64.BASE64_IMAGE});
     this.srcList.push({imgPath : '/assets/img/test.jpg', base64 : 'data:image/jpeg;base64,' + BASE64.BASE64_IMAGE});
  }

  printImagePaths(imagePaths: string[]) {
    if (imagePaths) {
      for (const val of imagePaths) {
        console.log(val);
      }
    }
  }
}
