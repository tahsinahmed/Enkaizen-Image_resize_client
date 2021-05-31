import {Component, Input, OnInit} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {UserService} from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  fileName = '';
  uploadProgress: number;
  uploadSub: Subscription;
  image: any;
  myImage: any;
  imageList = [];
  showImage: boolean;

  constructor(private http: HttpClient,
              private userService: UserService) {}

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      const formData = new FormData();
      formData.append('image', file);

      const upload$ = this.http.post('http://localhost:8080/api/add-image', formData, {
        reportProgress: true,
        observe: 'events'
      })
        .pipe(
          finalize(() => this.reset())
        );

      // tslint:disable-next-line:no-shadowed-variable
      this.uploadSub = upload$.subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
          this.getAllImages();
        }
      });
    }
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

  ngOnInit(): void {
    this.getAllImages();
  }

  getAllImages() {
    this.http.get('http://localhost:8080/api/all-images').subscribe(res => {
      this.imageList = res['images'];
    });
  }

  onSelectImage(thumbnail: any) {
    this.http.get('http://localhost:8080/api/get-image?thumbnail=' + thumbnail).subscribe(res => {
      this.myImage = 'data:image/png;base64,' + res['encodedString'];
      this.showImage = true;
    });
  }

  disableImage() {
    this.showImage = false;
  }
}
