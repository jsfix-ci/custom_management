import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { CustomersService } from '../../../../service/customers.service';
import { MessageService } from '../../../../service/message.service';
import { Modal } from 'ngx-modal';
import { FileUploader } from 'ng2-file-upload';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { ComplaintTherapyModel } from '../../../../models/complaint-therapy-model';
import { UsersService } from '../../../../service/users.service';
import { formatDate } from '@telerik/kendo-intl';
import { DatePipe } from '@angular/common';
import { BaseOneModel } from '../../../../models/base-one-model';
import { BaseTwoModel } from 'src/app/models/base-two-model';
import { PhysicalModel } from 'src/app/models/physical-model';


@Component({
  selector: 'app-base-date',
  templateUrl: './base-date.component.html',
  styleUrls: ['./base-date.component.scss']
})
export class BaseDateComponent implements OnInit {
  public customer = false;
  @ViewChild('upload') upload: Modal;
  @Input() type;
  @Input() data;
  @Input() date;
  @Input() doctor;
  public complaint = false;
  public therapy = false;
  public maleImg = '../../../../../assets/images/users/male-patient.png';
  public femaleImg = '../../../../../assets/images/users/female-patient.png';
  public dialogOpened = false;
  public dialogComplaintOpened = false;
  public dialogTherapyOpened = false;
  public dialogDocumentOpened = false;
  public uploader: FileUploader;
  public documents: any;
  public language: any;
  //public url = 'http://localhost:3000/upload';
  public url = 'http://www.app-production.eu:3000/upload';
  public complaintValue: any;
  public complaintData = new ComplaintTherapyModel();
  public gridComplaint: any;
  public therapyValue: any;
  public gridTherapy: any;
  public stateValue: any;
  public loadingGrid: any;
  public loading = true;
  public currentTab = 'profile';
  public recommendationList: any;
  public baseDataOne: any;
  public baseDataTwo: any;
  public physicalIllness: any;
  public relationshipList: any;
  public socialList: any;
  public doctorList: any;
  public doctorsList: any;
  public selectedRecommendation: any;
  public operationMode = 'add';
  public selectedComplaint: any;
  public selectedTherapies: any;
  public selectedTherapiesPrevious: any;
  public currentComplaint: any;
  public selectedForDelete: string;

  constructor(
    public router: ActivatedRoute,
    public service: CustomersService,
    public message: MessageService,
    public usersService: UsersService
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.uploader = new FileUploader({
      url: this.url,
      additionalParameter: { comments: this.data.id }

    });

    this.language = JSON.parse(localStorage.getItem('language'))['user'];

    this.getParameters();
    this.getDocument();
    this.getComplaint();
    this.getTherapy();
  }

  getParameters() {
    this.service.getParameters('Complaint').subscribe(
      data => {
        this.complaintValue = data;
      }
    );

    this.service.getParameters('Therapy').subscribe(
      data => {
        console.log(data);
        this.therapyValue = data;
      }
    );

    this.stateValue = JSON.parse(localStorage.getItem('language'))['state'];
  }

  getComplaint() {
    this['loadingGridComplaint'] = true;
    this.service.getComplaintForCustomer(this.data.id).subscribe(data => {
      this.gridComplaint = data;
      this['loadingGridComplaint'] = false;
      this.loading = false;
    });
  }

  convertStringToArray(data) {
    let arrayData = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].complaint.split(';') !== undefined) {
        arrayData.push(data[i].complaint.split(';').map(Number));
      } else {
        arrayData.push(Number(data[i].complaint));
      }
    }
    return arrayData;
  }

  getTherapy() {
    this['loadingGridTherapy'] = true;
    this.service.getTherapyForCustomer(this.data.id).subscribe(data => {
      this.gridTherapy = data;
      this['loadingGridTherapy'] = false;
      this.loading = false;
    });
  }

  getDocument() {
    this['loadingGridDocument'] = true;
    this.service.getDocuments(this.data.id, val => {
      this.documents = val;
      this['loadingGridDocument'] = false;
      this.loading = false;
    });
  }

  formatingData(data) {
    console.log(data);
    const datePipe = new DatePipe('en-US');
    for (let i = 0; i < data['length']; i++) {
      data[i].date = datePipe.transform(data[i].date, 'dd/MM/yyyy');
      const stringToArray = [];
      if (data[i].complaint.split(';') !== undefined) {
        stringToArray.push(data[i].complaint.split(';').map(Number));
      } else {
        stringToArray.push(Number(data[i].complaint));
      }
      let complaintString = '';
      for (let j = 0; j < stringToArray.length; j++) {
        complaintString += this.getTitle(this.complaintValue, stringToArray[j]);
      }
      data[i].complaint = complaintString;
    }
    return data;
  }

  getTitle(data, idArray) {
    let value = '';
    for (let i = 0; i < idArray.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (data[j].id === idArray[i]) {
          value += data[j].title + ';';
        }
      }
    }
    return value;
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  open(component, id) {
    this[component + 'Opened'] = true;
    this.selectedForDelete = id;
  }

  action(event) {
    console.log(event);
    if (event === 'yes') {
      console.log(this.data);
      this.service.deleteCustomer(this.data.id, val => {
        console.log(val);
        this.message.sendDeleteCustomer();
        this.dialogOpened = false;
      });
    } else {
      this.dialogOpened = false;
    }
  }

  deleteComplaint(event) {
    console.log(event);
    if (event === 'yes') {
      console.log(this.data);
      this.service.deleteComplaint(this.selectedForDelete).subscribe(
        data => {
          console.log(data);
          if (data) {
            this.getComplaint();
          }
        }
      );
    }
    this.dialogComplaintOpened = false;
  }

  editCustomer() {
    this.date.birthday = new Date(this.date.birthday);
    this.customer = true;
  }

  updateCustomer(customer) {
    console.log(this.data);
    console.log(customer);
    this.service.updateCustomer(this.data, val => {
      console.log(val);
      if (val.success) {

        this.customer = false;
        Swal.fire({
          title: this.language.successUpdateTitle,
          text: this.language.successUpdateText
            .toString()
            .replace('{content}', this.data.shortname),
          timer: 3000,
          type: 'success',
          onClose: () => {
            console.log('done!');
          }
        });
      }
    });
  }

  downloadFile(filename: string) {
    console.log(filename);
    this.service
      .downloadFile(filename)
      .subscribe(data => saveAs(data, filename), error => console.error(error));
  }

  deleteDocument(event) {
    if (event === 'yes') {
      console.log(this.data);
      const pathSplit = this.selectedForDelete['path'].replace(new RegExp('\\\\', 'gi'), '/');
      const object = {
        path: this.selectedForDelete['path'].replace(new RegExp('\\\\', 'gi'), '/')
      };
      this.service.deleteDocument(object).subscribe(
        data => {
          console.log(data);
        }
      );
      this.service.deleteDocumentFromDatabase(this.selectedForDelete['id']).subscribe(
        data => {
          if (data) {
            this.getDocument();
          }
        }
      );
    }
    this.dialogDocumentOpened = false;
  }

  previewDocument(document) {
    console.log(document);
  }

  backToGrid() {
    this.message.sendBackToCustomerGrid();
  }

  openComplaintModal() {
    this.selectedComplaint = [];
    this.selectedTherapies = [];
    this.selectedTherapiesPrevious = [];
    this.complaintData = new ComplaintTherapyModel();
    this.complaintData.complaint = '';
    this.complaintData.therapies = '';
    this.operationMode = 'add';
    // this.complaintValue = JSON.parse(localStorage.getItem('language'))['complaint'];
    // this.therapyValue = JSON.parse(localStorage.getItem('language'))['therapy'];
    this.service.getParameters('Therapy').subscribe(
      data => {
        console.log(data);
        this.therapyValue = data;
      }
    );
    this.service.getParameters('Complaint').subscribe(
      data => {
        this.complaintValue = data;
      }
    );
    this.complaint = true;
  }

  openTherapyModal() {
    this.selectedComplaint = [];
    this.selectedTherapies = [];
    this.selectedTherapiesPrevious = [];
    this.complaintData.state = null;
    this.complaintData = new ComplaintTherapyModel();
    this.complaintData.complaint = '';
    this.complaintData.therapies = '';
    this.operationMode = 'add';
    /*this.complaintValue = JSON.parse(localStorage.getItem('language'))[
      'complaint'
    ];
    this.therapyValue = JSON.parse(localStorage.getItem('language'))['therapy'];*/
    this.service.getParameters('Therapy').subscribe(
      data => {
        console.log(data);
        this.therapyValue = data;
      }
    );
    this.service.getParameters('Complaint').subscribe(
      data => {
        this.complaintValue = data;
      }
    );
    this.therapy = true;
  }

  /*selectComplaint(event) {
    console.log(event);
    this.complaintData.complaint = '';
    event.forEach(element => {
      console.log(element);
      this.complaintData.complaint += element.title + ';';
    });
  }

  selectTherapies(event) {
    console.log(event);
    this.complaintData.therapies = '';
    event.forEach(element => {
      console.log(element);
      this.complaintData.therapies += element.title + ';';
    });
  }*/

  selectedState(event) {
    this.complaintData.state = event;
  }

  addComplaint(event) {
    this.complaintData.customer_id = this.data.id;
    this.complaintData.date = this.getTodayDate();

    this.complaintData.complaint = this.pickToModel(this.selectedComplaint, this.complaintValue).value;
    this.complaintData.complaint_title = this.pickToModel(this.selectedComplaint, this.complaintValue).title;

    this.complaintData.therapies = this.pickToModel(this.selectedTherapies, this.therapyValue).value;
    this.complaintData.therapies_title = this.pickToModel(this.selectedTherapies, this.therapyValue).title;

    if (localStorage.getItem('username') === null) {
      this.usersService.getMe(localStorage.getItem('idUser'), val => {
        console.log(val);
        localStorage.setItem('username', val[0]['shortname']);
        this.complaintData.employee_name = 'Dr. ' + val[0]['shortname'];
        console.log(this.complaintData);
        this.service.addComplaint(this.complaintData).subscribe(data => {
          if (data) {
            this.getComplaint();
            this.complaint = false;
            Swal.fire({
              title: 'Successfull!',
              text: 'New complaint is successfull added!',
              timer: 3000,
              type: 'success'
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: 'New complaint is not added!',
              timer: 3000,
              type: 'error'
            });
          }
        });
      });
    } else {
      this.complaintData.employee_name = localStorage.getItem('username');
      this.service.addComplaint(this.complaintData).subscribe(data => {
        if (data) {
          this.getComplaint();
          this.complaint = false;
          Swal.fire({
            title: 'Successfull!',
            text: 'New complaint is successfull added!',
            timer: 3000,
            type: 'success'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'New complaint is not added!',
            timer: 3000,
            type: 'error'
          });
        }
      });
      this.selectedComplaint = [];
      this.selectedComplaint = [];
    }
  }

  getTodayDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return dd + '.' + mm + '.' + yyyy + '.';
  }

  pickToModel(data: any, titleValue) {
    let value = '';
    for (let i = 0; i < data.length; i++) {
      value += data[i] + ';';
    }
    value = value.substring(0, value.length - 1);

    let stringToArray = [];
    if (value.split(';') !== undefined) {
      stringToArray = value.split(';').map(Number);
    } else {
      stringToArray.push(Number(value));
    }
    const title = this.getTitle(titleValue, stringToArray);
    return { value, title };
  }

  updateComplaint(complaint) {
    this.complaintData.complaint = this.pickToModel(this.selectedComplaint, this.complaintValue).value;
    this.complaintData.complaint_title = this.pickToModel(this.selectedComplaint, this.complaintValue).title;

    this.complaintData.therapies = this.pickToModel(this.selectedTherapies, this.therapyValue).value;
    this.complaintData.therapies_title = this.pickToModel(this.selectedTherapies, this.therapyValue).title;

    this.service.updateComplaint(this.complaintData).subscribe(data => {
      if (data) {
        this.getComplaint();
        this.complaint = false;
        Swal.fire({
          title: 'Successfull!',
          text: 'Complaint is successfull updated!',
          timer: 3000,
          type: 'success'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Complaint is not updated!',
          timer: 3000,
          type: 'error'
        });
      }
      this.selectedComplaint = [];
      this.selectedTherapies = [];
    });
  }

  addTherapy(therapy) {
    this.complaintData.customer_id = this.data.id;
    this.complaintData.date = this.getTodayDate();
    // this.initializeParams();

    this.complaintData.complaint = this.pickToModel(this.selectedComplaint, this.complaintValue).value;
    this.complaintData.complaint_title = this.pickToModel(this.selectedComplaint, this.complaintValue).title;

    this.complaintData.therapies = this.pickToModel(this.selectedTherapies, this.therapyValue).value;
    this.complaintData.therapies_title = this.pickToModel(this.selectedTherapies, this.therapyValue).title;

    this.complaintData.therapies_previous = this.pickToModel(this.selectedTherapiesPrevious, this.therapyValue).value;
    this.complaintData.therapies_previous_title = this.pickToModel(this.selectedTherapiesPrevious, this.therapyValue).title;

    this.service.addTherapy(this.complaintData).subscribe(data => {
      if (data['success']) {
        this.getTherapy();
        this.therapy = false;
        Swal.fire({
          title: 'Successfull!',
          text: 'New therapy is successfull added!',
          timer: 3000,
          type: 'success'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'New therapy is not added!',
          timer: 3000,
          type: 'error'
        });
      }
      this.selectedComplaint = [];
      this.selectedTherapies = [];
    });
  }

  updateTherapy(event) {
    this.complaintData.complaint = this.pickToModel(this.selectedComplaint, this.complaintValue).value;
    this.complaintData.complaint_title = this.pickToModel(this.selectedComplaint, this.complaintValue).title;

    this.complaintData.therapies = this.pickToModel(this.selectedTherapies, this.therapyValue).value;
    this.complaintData.therapies_title = this.pickToModel(this.selectedTherapies, this.therapyValue).title;

    this.complaintData.therapies_previous = this.pickToModel(this.selectedTherapiesPrevious, this.therapyValue).value;
    this.complaintData.therapies_previous_title = this.pickToModel(this.selectedTherapiesPrevious, this.therapyValue).title;

    this.service.updateTherapy(this.complaintData).subscribe(data => {
      if (data) {
        this.getTherapy();
        this.therapy = false;
        Swal.fire({
          title: 'Successfull!',
          text: 'Therapy is successfull updated!',
          timer: 3000,
          type: 'success'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Therapy is not updated!',
          timer: 3000,
          type: 'error'
        });
      }
      this.selectedComplaint = [];
      this.selectedTherapies = [];
      this.selectedTherapiesPrevious = [];
    });
  }

  editTherapy(event) {
    this.complaintData = event;
    if (event.complaint.split(';') !== undefined) {
      this.selectedComplaint = event.complaint.split(';').map(Number);
    } else {
      this.selectedComplaint = Number(event.complaint);
    }
    if (event.therapies.split(';') !== undefined) {
      this.selectedTherapies = event.therapies.split(';').map(Number);
    } else {
      this.selectedTherapies = Number(event.therapies);
    }
    if (event.therapies_previous.split(';') !== undefined) {
      this.selectedTherapiesPrevious = event.therapies_previous.split(';').map(Number);
    } else {
      this.selectedTherapiesPrevious = Number(event.therapies_previous);
    }
    this.operationMode = 'edit';
    this.therapy = true;
  }

  deleteTherapy(event) {
    if (event === 'yes') {
      console.log(this.data);
      this.service.deleteTherapy(this.selectedForDelete).subscribe(
        data => {
          console.log(data);
          if (data) {
            this.getTherapy();
          }
        }
      );
    }
    this.dialogTherapyOpened = false;
  }

  initializeParams() {
    this.complaintData.comment = '';
    this.complaintData.cs = '';
    this.complaintData.em = '';
  }

  changeTab(tab) {
    this.currentTab = tab;
    // this.baseData = null;
    if (tab === 'base_one') {
      this.initializeBaseOneData();
    } else if (tab === 'base_two') {
      this.service.getBaseDataTwo(this.data.id).subscribe(
        data => {
          if (data['length'] !== 0) {
            this.baseDataTwo = data[0];
            this.baseDataTwo.birthday = new Date(this.baseDataTwo.birthday);
            this.operationMode = 'edit';
          } else {
            if (this.isEmptyObject(this.baseDataTwo) || this.baseDataTwo === undefined) {
              this.baseDataTwo = new BaseTwoModel();
            }
            this.operationMode = 'add';
          }
        }
      );
    } else {
      this.service.getPhysicallIllness(this.data.id).subscribe(
        data => {
          if (data['length'] !== 0) {
            this.physicalIllness = data[0];
            this.operationMode = 'edit';
          } else {
            if (this.isEmptyObject(this.physicalIllness) || this.physicalIllness === undefined) {
              this.physicalIllness = new PhysicalModel();
            }
            this.operationMode = 'add';
          }
        });
    }
  }

  getTranslate(title) {
    if (title === 'profile') {
      return this.language.profile;
    } else if (title === 'base_one') {
      return this.language.baseDataOne;
    } else if (title === 'base_two') {
      return this.language.baseDataTwo;
    } else if (title === 'physical_illness') {
      return this.language.physicalIllness;
    } else if (title === 'add') {
      return this.language.addComplaint;
    } else if (title === 'edit') {
      return this.language.updateComplaint;
    } else if (title === 'addTherapy') {
      return this.language.addTherapy;
    } else if (title === 'editTherapy') {
      return this.language.updateTherapy;
    }
    return null;
  }

  initializeBaseOneData() {

    this.service.getCustomerList('Recommendation').subscribe(
      data => {
        console.log(data);
        this.recommendationList = data;
      });

    this.service.getCustomerList('Relationship').subscribe(
      data => {
        this.relationshipList = data;
      }
    );

    this.service.getCustomerList('Social').subscribe(
      data => {
        this.socialList = data;
      }
    );

    this.service.getCustomerList('Doctor').subscribe(
      data => {
        console.log(data);
        this.doctorList = data;
      }
    );
    this.service.getCustomerList('Doctors').subscribe(
      data => {
        console.log(data);
        this.doctorsList = data;
      }
    );

    this.service.getBaseDataOne(this.data.id).subscribe(
      data => {
        console.log(data);
        if (data['length'] !== 0) {
          this.baseDataOne = data[0];
          if (this.baseDataOne.recommendation.split(';') !== undefined) {
            this.selectedRecommendation = this.baseDataOne.recommendation.split(';').map(Number);
          } else {
            this.selectedRecommendation = Number(this.baseDataOne.recommendation);
          }
          this.baseDataOne.first_date = new Date(this.baseDataOne.first_date);
          this.operationMode = 'edit';
        } else {
          if (this.isEmptyObject(this.baseDataOne) || this.baseDataOne === undefined) {
            this.baseDataOne = new BaseOneModel();
          }
          this.operationMode = 'add';
        }
      }
    );
  }

  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  addBaseDataOne(base) {
    let recommendation = '';
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.selectedRecommendation.length; i++) {
      recommendation += this.selectedRecommendation[i] + ';';
    }
    recommendation = recommendation.substring(0, recommendation.length - 1);
    this.baseDataOne.customer_id = this.data.id;
    this.baseDataOne.recommendation = recommendation;
    this.service.addBaseDataOne(this.baseDataOne).subscribe(
      data => {
        if (data) {
          Swal.fire({
            title: this.language.successAddDataTitle,
            text: this.language.successAddDataText,
            timer: 3000,
            type: 'success'
          });
          this.customer = false;
        }
      }
    );
    console.log(this.baseDataOne);
  }

  updateBaseDataOne(base) {
    console.log(this.baseDataOne);
    let recommendation = '';
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.selectedRecommendation.length; i++) {
      recommendation += this.selectedRecommendation[i] + ';';
    }
    recommendation = recommendation.substring(0, recommendation.length - 1);
    this.baseDataOne.customer_id = this.data.id;
    this.baseDataOne.recommendation = recommendation;
    this.service.updateBaseDataOne(this.baseDataOne).subscribe(
      data => {
        if (data) {
          Swal.fire({
            title: this.language.successUpdateTitle,
            text: this.language.successUpdateData,
            timer: 3000,
            type: 'success'
          });
          this.customer = false;
        }
      }
    );
  }

  addBaseDataTwo(base) {
    console.log(this.baseDataTwo);
    this.baseDataTwo.customer_id = this.data.id;
    this.service.addBaseDataTwo(this.baseDataTwo).subscribe(
      data => {
        if (data) {
          Swal.fire({
            title: this.language.successAddDataTitle,
            text: this.language.successAddDataText,
            timer: 3000,
            type: 'success'
          });
          this.customer = false;
        }
      }
    );
  }

  updateBaseDataTwo(base) {
    console.log(this.baseDataTwo);
    this.baseDataTwo.customer_id = this.data.id;
    this.service.updateBaseDataTwo(this.baseDataTwo).subscribe(
      data => {
        console.log(data);
        if (data) {
          Swal.fire({
            title: this.language.successUpdateTitle,
            text: this.language.successUpdateData,
            timer: 3000,
            type: 'success'
          });
          this.customer = false;
        }
      }
    );
  }

  addPhysicalIllness(physical) {
    this.physicalIllness.customer_id = this.data.id;
    this.service.addPhysicalIllness(this.physicalIllness).subscribe(
      data => {
        if (data) {
          Swal.fire({
            title: this.language.successAddDataTitle,
            text: this.language.successAddDataText,
            timer: 3000,
            type: 'success'
          });
          this.customer = false;
        }
      }
    );
  }

  updatePhysicalIllness(physical) {
    this.physicalIllness.customer_id = this.data.id;
    this.service.updatePhysicalIllness(this.physicalIllness).subscribe(
      data => {
        if (data) {
          Swal.fire({
            title: this.language.successUpdateTitle,
            text: this.language.successUpdateData,
            timer: 3000,
            type: 'success'
          });
          this.customer = false;
        }
      }
    );
  }

  editMode() {
    this.operationMode = 'edit';
  }

  mapToInt(data: string) {
    console.log(data);
    return data.split(';').map(Number);
  }

  onPanelChange(event) {
    if (this.baseDataOne === undefined) {
      this.initializeBaseOneData();
    }
  }

  editComplaint(event) {
    this.complaintData = event;
    if (event.complaint.split(';') !== undefined) {
      this.selectedComplaint = event.complaint.split(';').map(Number);
    } else {
      this.selectedComplaint = Number(event.complaint);
    }
    if (event.therapies.split(';') !== undefined) {
      this.selectedTherapies = event.therapies.split(';').map(Number);
    } else {
      this.selectedTherapies = Number(event.therapies);
    }
    this.operationMode = 'edit';
    this.complaint = true;
  }

  closeUploadModal() {
    this.getDocument();
    this.upload.close();
  }

}
