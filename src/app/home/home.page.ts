import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, LoadingController } from '@ionic/angular';


declare let window: any;
declare let cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  typeModal: HTMLIonModalElement;

  maxNumberOfImages = 10;
  itemLabel = 'Images';
  required = false;
  saveCopyToGallery = false;
  srcList: { imgPath: string; base64: string }[] = [];
 // @Input() saveLocation = '';


  private panelExpand = false;
  private iconClicked = false;
  private panelID: string;


  public pixDirectory = 'AppPhotos';

  croppedImagepath = '';
  isLoading = false;

  image = '';
  base64Image = '';

  constructor(
    public loadingCtrl: LoadingController,
    public router: Router,
    public modalController: ModalController,
  ) {
  }

}
