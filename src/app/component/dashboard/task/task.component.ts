import { CustomerModel } from "./../../../models/customer-model";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { CustomersService } from "../../../service/customers.service";
import { CustomersComponent } from "../customers/customers.component";
import { Modal } from "ngx-modal";
import { MessageService } from "../../../service/message.service";
import {
  CancelEvent,
  CrudOperation,
  EditMode,
  EventClickEvent,
  RemoveEvent,
  SaveEvent,
  SchedulerComponent,
  SlotClickEvent,
  CreateFormGroupArgs,
  SchedulerEvent
} from "@progress/kendo-angular-scheduler";
import "@progress/kendo-angular-intl/locales/de/all";
import { filter } from "rxjs/operators/filter";
import { StoreService } from "../../../service/store.service";
import { TaskService } from "../../../service/task.service";
import { isNumber } from "util";
import Swal from "sweetalert2";
import { ComplaintTherapyModel } from "src/app/models/complaint-therapy-model";
import { UsersService } from "src/app/service/users.service";

@Component({
  selector: "app-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class TaskComponent implements OnInit {
  @ViewChild("customerUserModal") customerUserModal: Modal;
  public customerModal = false;
  public selectedDate: Date = new Date();
  public formGroup: FormGroup;
  public events: SchedulerEvent[] = [];
  public customerUsers: any;
  public telephoneValue = "";
  public type: any;
  public customerComponent: CustomersComponent;
  public usersInCompany: any = [];
  public colorTask: any;
  public zIndex: string;
  public theme: string;
  public selected = "#cac6c3";
  public palette: any[] = [];
  public colorPalette: any;
  public selectedColorId: any;
  public language: any;
  public languageUser: any;
  public resources: any[] = [];
  public customerUser = new CustomerModel();
  public data = {
    id: "",
    shortname: "",
    firstname: "",
    lastname: "",
    gender: "",
    street: "",
    streetnumber: "",
    city: "",
    telephone: "",
    mobile: "",
    email: "",
    birthday: "",
    attention: "",
    physicalComplaint: "",
    storeId: "",
    superadmin: localStorage.getItem('superadmin')
  };
  public value: any = [];
  public store: any;
  public calendars: any = [];
  public loading = true;
  public createFormLoading: boolean;
  public height = 92;
  public orientation = "horizontal";
  public workTime: any[] = [];
  public selectedStoreId: number;
  public splitterSizeFull = 100;
  public splitterSize: number;
  public dateEvent: string;
  public selectedViewIndex = 0;
  public currentDate = new Date();
  public startWork = "08:00";
  public endWork = "22:00";
  public timeDuration = "60";
  public therapyDuration = 1;
  public loopIndex = 0;
  public valueLoop: any;
  public size = [];
  public customerUserModal2 = false;
  public selectedButtonIndex = [false, false, false, false, false, false];
  public selectedButtonIndexStyle = ["", "", "", "", "", ""];
  public imagePath = "defaultUser";
  public therapyValue: any;
  public treatmentValue: any;
  public complaintValue: any;
  public complaintData = new ComplaintTherapyModel();
  public stateValue: any;
  public selectedComplaint: any;
  public selectedTherapies: any;
  public selectedTreatments: any;
  public baseDataIndicator = false;
  public allUsers: any;
  public selectedUser: any;
  public userWidth = '72%';
  public id: number;

  constructor(
    public formBuilder: FormBuilder,
    public service: TaskService,
    public customer: CustomersService,
    public message: MessageService,
    public storeService: StoreService,
    public usersService: UsersService
  ) {
    this.createFormGroup = this.createFormGroup.bind(this);
  }

  ngOnInit() {
    this.loading = true;
    this.type = Number(localStorage.getItem("type"));
    this.id = Number(localStorage.getItem('idUser'));
    console.log(this.events);
    this.calendars = [];
    this.height = 92;

    this.customer.getCustomers(localStorage.getItem("superadmin"), val => {
      console.log(val);
      this.customerUsers = val;
      this.loading = false;
    });

    this.message.getTheme().subscribe(mess => {
      console.log(mess);
      setTimeout(() => {
        this.changeTheme(mess);
      }, 50);
    });

    setTimeout(() => {
      this.changeTheme(localStorage.getItem("theme"));
    }, 50);

    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"))["calendar"];
      this.languageUser = JSON.parse(localStorage.getItem("language"))["user"];
      this.stateValue = JSON.parse(localStorage.getItem("language"))["state"];
    } else {
      this.message.getLanguage().subscribe(mess => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"))[
            "calendar"
          ];
          console.log(this.language);
        }, 10);
      });
    }

    this.service.getTaskColor().subscribe(data => {
      console.log(data);
      const resourcesObject = {
        name: "Rooms",
        data: data,
        field: "colorTask",
        valueField: "id",
        textField: "text",
        colorField: "color"
      };
      this.resources.push(resourcesObject);
      this.colorPalette = data;
      for (let i = 0; i < data["length"]; i++) {
        this.palette.push(data[i].color);
      }
    });


    this.storeService.getStore(localStorage.getItem("superadmin"), val => {
      this.store = val;
      this.language.selectStore += this.store[0].storename + ')';
      if(this.type === 3) {
        this.selectedStoreId = Number(localStorage.getItem('storeId' + this.id));
      }
      if (!isNaN(this.selectedStoreId) && this.selectedStoreId !== undefined) {
        this.startWork = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        ).start_work;
        this.endWork = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        ).end_work;
        this.timeDuration = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        ).time_duration;
        if (
          Number(this.timeDuration) >
          Number(
            this.getStartEndTimeForStore(this.store, this.selectedStoreId)
              .time_therapy
          )
        ) {
          this.therapyDuration =
            Number(this.timeDuration) /
            Number(
              this.getStartEndTimeForStore(this.store, this.selectedStoreId)
                .time_therapy
            );
        } else {
          this.therapyDuration =
            Number(
              this.getStartEndTimeForStore(this.store, this.selectedStoreId)
                .time_therapy
            ) / Number(this.timeDuration);
        }
      }
    });

    if (
      localStorage.getItem("selectedStore-" + this.id) !== null &&
      localStorage.getItem("selectedUser-" + this.id) !== null && this.type !== 3
    ) {
      this.calendars = [];
      this.selectedStoreId = Number(localStorage.getItem("selectedStore-" + this.id));
      this.value = JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      );
      // this.selectedStore(this.selectedStoreId);
      if (this.value !== null) {
        this.getTaskForSelectedUsers(this.value);
      }
      this.getUserInCompany(this.selectedStoreId);
    } else if (localStorage.getItem("selectedStore-" + this.id) &&  this.type !== 3) {
      this.calendars = [];
      this.selectedStoreId = Number(localStorage.getItem("selectedStore-" + this.id));
      this.selectedStore(this.selectedStoreId);
    } else {
      if (localStorage.getItem("type") === "3") {
        this.service
          .getWorkandTasksForUser(localStorage.getItem("idUser"))
          .subscribe(data => {
            console.log(data);
            this.events = [];
            this.workTime = this.pickWorkTimeToTask(data["workTime"]);
            this.pickModelForEvent(data["events"]);
            const objectCalendar = {
              name: null,
              events: this.events,
              workTime: this.workTime
            };
            this.calendars.push(objectCalendar);
            this.height += this.height;
            console.log(this.splitterSize);
            this.loading = false;
            console.log(this.calendars);
          });
        /*this.service
          .getTasksForUser(localStorage.getItem('idUser'))
          .subscribe(data => {
            this.events = [];
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            this.workTime = [];
            this.service.getWorkTimeForUser(localStorage.getItem('idUser')).subscribe(
              data => {
                console.log(data);
                this.workTime.push(this.pickWorkTimeToTask(data));
                console.log(this.workTime);
                const objectCalendar = {
                  name: null,
                  events: this.events,
                  workTime: this.workTime
                };
                console.log(objectCalendar);
                this.calendars.push(objectCalendar);
                this.height += this.height;
                console.log(this.calendars);
                this.loading = false;
              });
          });*/
        this.size = [];
        this.size.push("100%");
      } else {
        this.service.getTasks(localStorage.getItem('superadmin')).subscribe(data => {
          console.log(data);
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            console.log(this.events);
            const objectCalendar = {
              name: null,
              events: this.events
            };
            this.calendars.push(objectCalendar);
            this.height += this.height;
            this.loading = false;
          } else {
            this.calendars.push({ name: null, events: [] });
          }
          console.log(this.calendars);
          this.size = [];
          this.size.push("100%");
        });
      }
    }

    if (localStorage.getItem("calendarView") !== null) {
      this.selectedViewIndex = Number(localStorage.getItem("calendarView"));
      this.selectedButtonIndex[this.selectedViewIndex] = true;
      setTimeout(() => {
        this.selectedButtonIndexStyle[this.selectedViewIndex] =
          "activeButton" + this.theme;
      }, 50);
    } else {
      this.selectedButtonIndex[0] = true;
      setTimeout(() => {
        this.selectedButtonIndexStyle[0] = "activeButton" + this.theme;
      }, 50);
    }

    this.getParameters();
  }

  clearAllSelectedData() {
    this.customerUser = new CustomerModel();
    this.selectedComplaint = null;
    this.selectedTherapies = null;
    this.selectedTreatments = null;
    this.telephoneValue = "";
    this.complaintData = new ComplaintTherapyModel();
  }

  public createFormGroup(args: CreateFormGroupArgs): FormGroup {
    this.baseDataIndicator = false;
    if (
      (this.selectedStoreId === null || this.selectedStoreId === undefined) &&
      this.type !== 3
    ) {
      Swal.fire({
        title: this.language.selectStoreIndicatorTitle,
        text: this.language.selectStoreIndicatorText,
        timer: 3000,
        type: "error"
      });

      this.createFormLoading = false;
      return this.createFormGroup.bind(this);
    } else {
      this.createFormLoading = false;
      const dataItem = args.dataItem;
      // this.clearAllSelectedData();
      /*this.customerUser = new CustomerModel();
      this.customerUser.attention = '';
      this.customerUser.physicalComplaint = '';*/
      /*this.customerUser.attention = '';
      this.customerUser.physicalComplaint = '';*/
      if (
        typeof dataItem.customer_id === "number" &&
        dataItem.customer_id !== null
      ) {
        console.log(dataItem.customer_id);
        this.customer
          .getCustomerWithId(dataItem.customer_id)
          .subscribe(data => {
            console.log(data);
            this.customerUser = data[0];
            this.baseDataIndicator = true;
            this.userWidth = '49%';
          });
      }

      let timeDurationInd = 0;
      let timeDuration = 0;
      if (!isNaN(this.selectedStoreId)) {
        if (dataItem.id === undefined || dataItem.id === null) {
          timeDurationInd =
            Number(
              this.getStartEndTimeForStore(this.store, this.selectedStoreId)
                .time_therapy
            ) !== Number(this.timeDuration)
              ? 1
              : 0;
          timeDuration = Number(
            this.getStartEndTimeForStore(this.store, this.selectedStoreId)
              .time_therapy
          );
        } else {
          if (
            dataItem.end.getTime() - dataItem.start.getTime() !==
            Number(
              this.getStartEndTimeForStore(this.store, this.selectedStoreId)
                .time_therapy
            ) *
            60000
          ) {
            timeDuration =
              (dataItem.end.getTime() - dataItem.start.getTime()) / 60000;
          } else {
            timeDurationInd =
              Number(
                this.getStartEndTimeForStore(this.store, this.selectedStoreId)
                  .time_therapy
              ) !== Number(this.timeDuration)
                ? 1
                : 0;
            timeDuration = Number(
              this.getStartEndTimeForStore(this.store, this.selectedStoreId)
                .time_therapy
            );
          }
        }
      }

      if (
        this.customerUser !== undefined &&
        this.customerUser !== null &&
        this.customerUser.id !== undefined
      ) {
        this.baseDataIndicator = true;
        this.userWidth = '49%';
      }

      this.formGroup = this.formBuilder.group({
        id: args.isNew ? this.getNextId() : dataItem.id,
        start: [dataItem.start, Validators.required],
        end: [
          timeDurationInd
            ? new Date(dataItem.start.getTime() + timeDuration * 60000)
            : dataItem.end,
          Validators.required
        ],
        startTimezone: [dataItem.startTimezone],
        endTimezone: [dataItem.endTimezone],
        isAllDay: dataItem.isAllDay,
        colorTask: dataItem.colorTitle,
        creator_id: Number(localStorage.getItem("idUser")),
        user: this.customerUser,
        therapy_id: dataItem.therapy_id,
        telephone: dataItem.telephone,
        superadmin: dataItem.superadmin,
        description: dataItem.description,
        recurrenceRule: dataItem.recurrenceRule,
        recurrenceId: dataItem.recurrenceId
      });

      setTimeout(() => {
        if (dataItem.therapy_id !== undefined) {
          this.customer.getTherapy(dataItem.therapy_id).subscribe(data => {
            console.log(data);
            if (data["length"] !== 0) {
              this.splitToValue(
                data[0].complaint,
                data[0].therapies,
                data[0].therapies_previous
              );
              /*this.usersService.getUserWithId(data[0].em, val => {
                this.selectedUser = val[0];
              });*/
              this.complaintData = data[0];
            }
            this.createFormLoading = true;
          });
        } else {
          this.createFormLoading = true;
        }

        console.log(dataItem.colorTask);
        if (dataItem.colorTask !== undefined) {
          this.selected = this.IdMapToColor(dataItem.colorTask);
          console.log(this.selected);
        }

        if (dataItem.telephone !== undefined) {
          this.telephoneValue = dataItem.telephone;
        }

        this.changeTheme(localStorage.getItem("theme"));
      }, 100);
      return this.formGroup;
    }
  }

  public isEditingSeries(editMode: EditMode): boolean {
    return editMode === EditMode.Series;
  }

  public getNextId(): number {
    const len = this.events.length;

    return len === 0 ? 1 : this.events[this.events.length - 1].id + 1;
  }

  public saveHandler(
    { sender, formGroup, isNew, dataItem, mode },
    selectedUser
  ): void {
    console.log(formGroup);
    console.log(sender);
    console.log(dataItem);
    console.log(selectedUser);
    if (formGroup.valid) {
      let formValue = formGroup.value;
      formValue.colorTask = this.selected;
      formValue.telephone = this.telephoneValue;
      formValue.user = this.customerUser;
      formValue.title =
        this.customerUser["firstname"] +
        " " +
        this.customerUser["lastname"] +
        "+" +
        this.complaintData.complaint_title;
      formValue.superadmin = localStorage.getItem('superadmin');
      if (this.type !== 3 && selectedUser !== undefined) {
        formValue.creator_id = selectedUser;
      } else {
        formValue.creator_id = localStorage.getItem('idUser');
      }
      console.log(formValue);
      if (isNew) {
        formValue = this.colorMapToId(formValue);
        this.addTherapy(this.customerUser["id"]);
        formValue.title =
          this.customerUser["firstname"] +
          " " +
          this.customerUser["lastname"] +
          "+" +
          this.complaintData.complaint_title;
        this.complaintData.date = this.formatDate(
          formValue.start,
          formValue.end
        );
        this.customer.addTherapy(this.complaintData).subscribe(data => {
          if (data["success"]) {
            formValue.therapy_id = data["id"];
            this.service.createTask(formValue, val => {
              console.log(val);
              if (val.success) {
                this.service.create(formValue);
                Swal.fire({
                  title: this.language.successUpdateTitle,
                  text: this.language.successUpdateText,
                  timer: 3000,
                  type: "success"
                });
              } else {
                Swal.fire({
                  title: this.language.unsuccessUpdateTitle,
                  text: this.language.unsuccessUpdateText,
                  timer: 3000,
                  type: "error"
                });
              }
            });

            console.log(this.data);
            const customerAttentionAndPhysical = {
              id: this.customerUser["id"],
              attention: this.customerUser["attention"],
              physicalComplaint: this.customerUser["physicalComplaint"]
            };
            console.log(customerAttentionAndPhysical);
            this.customer
              .updateAttentionAndPhysical(customerAttentionAndPhysical)
              .subscribe(data => {
                console.log(data);
              });
          } else {
            Swal.fire({
              title: this.language.unsuccessUpdateTitle,
              text: this.language.unsuccessUpdateText,
              timer: 3000,
              type: "error"
            });
          }
          /*this.selectedComplaint = [];
          this.selectedTherapies = [];
          this.selectedTreatments = [];*/
        });
      } else {
        formValue = this.colorMapToId(formValue);
        this.addTherapy(this.customerUser["id"]);
        formValue.title =
          this.customerUser["firstname"] +
          " " +
          this.customerUser["lastname"] +
          "+" +
          this.complaintData.complaint_title;
        this.complaintData.date = this.formatDate(
          formValue.start,
          formValue.end
        );
        this.customer.updateTherapy(this.complaintData).subscribe(data => {
          if (data) {
            this.service.updateTask(formValue, val => {
              console.log(val);
              if (val.success) {
                this.handleUpdate(dataItem, formValue, mode);
                Swal.fire({
                  title: this.language.successUpdateTitle,
                  text: this.language.successUpdateText,
                  timer: 3000,
                  type: "success"
                });
              } else {
                Swal.fire({
                  title: this.language.unsuccessUpdateTitle,
                  text: this.language.unsuccessUpdateText,
                  timer: 3000,
                  type: "error"
                });
              }
            });
            const customerAttentionAndPhysical = {
              id: this.customerUser["id"],
              attention: this.customerUser["attention"],
              physicalComplaint: this.customerUser["physicalComplaint"]
            };
            console.log(customerAttentionAndPhysical);
            this.customer
              .updateAttentionAndPhysical(customerAttentionAndPhysical)
              .subscribe(data => {
                console.log(data);
              });
          } else {
            Swal.fire({
              title: this.language.unsuccessUpdateTitle,
              text: this.language.unsuccessUpdateText,
              timer: 3000,
              type: "error"
            });
          }
          /*this.selectedComplaint = [];
          this.selectedTherapies = [];
          this.selectedTreatments = [];*/
        });
      }

      this.closeEditor(sender);
    } else {
      Swal.fire({
        title: this.language.unsuccessUpdateTitle,
        text: this.language.unsuccessUpdateText,
        timer: 3000,
        type: "error"
      });
    }
  }

  formatDate(start, end) {
    const dd = String(start.getDate()).padStart(2, "0");
    const mm = String(start.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = start.getFullYear();
    const hhStart = start.getHours();
    const minStart = start.getMinutes();
    const hhEnd = end.getHours();
    const minEnd = end.getMinutes();
    return (
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hhStart === 0 ? "00" : hhStart) +
      ":" +
      (minStart < 10 ? "0" + minStart : minStart) +
      "-" +
      (hhEnd === 0 ? "00" : hhEnd) +
      ":" +
      (minEnd < 10 ? "0" + minEnd : minEnd)
    );
  }

  addTherapy(customerId) {
    this.complaintData.customer_id = customerId;
    this.complaintData.date =
      new Date().getDay() +
      "." +
      new Date().getMonth() +
      "." +
      new Date().getFullYear() +
      ".";
    // this.initializeParams();

    this.complaintData.complaint = this.pickToModel(
      this.selectedComplaint,
      this.complaintValue
    ).value;
    this.complaintData.complaint_title = this.pickToModel(
      this.selectedComplaint,
      this.complaintValue
    ).title;

    this.complaintData.therapies = this.pickToModel(
      this.selectedTherapies,
      this.therapyValue
    ).value;
    this.complaintData.therapies_title = this.pickToModel(
      this.selectedTherapies,
      this.therapyValue
    ).title;

    this.complaintData.therapies_previous = this.pickToModel(
      this.selectedTreatments,
      this.therapyValue
    ).value;
    this.complaintData.therapies_previous_title = this.pickToModel(
      this.selectedTreatments,
      this.therapyValue
    ).title;
  }

  public handleUpdate(item: any, value: any, mode?: EditMode): void {
    const service = this.service;
    console.log("update!");
    if (mode === EditMode.Occurrence) {
      if (service.isException(item)) {
        service.update(item, value);
      } else {
        service.createException(item, value);
      }
    } else {
      // The item is non-recurring or we are editing the entire series.
      service.update(item, value);
    }
  }

  public closeEditor(scheduler: SchedulerComponent): void {
    console.log("close!");
    scheduler.closeEvent();

    this.formGroup = undefined;
  }

  onValueChange(event) {
    console.log(event);
    if (event !== undefined) {
      this.customerUser = event;
      this.telephoneValue = event.telephone;
      this.baseDataIndicator = true;
      this.userWidth = '49%';
    } else {
      this.customerUser = {
        attention: "",
        physicalComplaint: ""
      };
      this.telephoneValue = null;
      this.baseDataIndicator = false;
      this.userWidth = '72%';
    }
  }

  newCustomer() {
    // this.zIndex = 'zIndex';
    this.customerModal = true;
  }

  closeNewCustomer() {
    this.zIndex = "";
    this.customerModal = false;
  }

  createCustomer(form) {
    console.log(this.data);
    this.data.storeId = localStorage.getItem("storeId-" + this.id);
    this.customer.createCustomer(this.data, val => {
      console.log(val);
      if (val) {
        this.data.id = val.id
        this.customerUser = this.data;
        this.baseDataIndicator = true;
        this.userWidth = '49%';
        this.reloadNewCustomer();
        this.customerModal = false;
        // form.reset();
      }
    });
  }

  changeTheme(theme: string) {
    console.log(theme);
    if (localStorage.getItem("allThemes") !== undefined) {
      const allThemes = JSON.parse(localStorage.getItem("allThemes"));
      console.log(allThemes);
      let items = document.querySelectorAll(".k-dialog-titlebar");
      for (let i = 0; i < items.length; i++) {
        const clas = items[i].classList;
        for (let j = 0; j < allThemes.length; j++) {
          const themeName = allThemes[j]["name"];
          console.log(clas);
          clas.remove("k-dialog-titlebar-" + themeName);
          clas.add("k-dialog-titlebar-" + theme);
        }
      }

      items = document.querySelectorAll(".k-button-icontext");
      for (let i = 0; i < items.length; i++) {
        const clas = items[i].classList;
        for (let j = 0; j < allThemes.length; j++) {
          const themeName = allThemes[j]["name"];
          clas.remove("k-button-icontext-" + themeName);
          clas.add("k-button-icontext-" + theme);
        }
      }

      items = document.querySelectorAll(".k-primary");
      for (let i = 0; i < items.length; i++) {
        const clas = items[i].classList;
        for (let j = 0; j < allThemes.length; j++) {
          const themeName = allThemes[j]["name"];
          clas.remove("k-primary-" + themeName);
          clas.add("k-primary-" + theme);
        }
      }

      items = document.querySelectorAll(".k-state-selected");
      for (let i = 0; i < items.length; i++) {
        const clas = items[i].classList;
        for (let j = 0; j < allThemes.length; j++) {
          const themeName = allThemes[j]["name"];
          console.log(themeName);
          clas.remove("k-state-selected-" + themeName);
          clas.add("k-state-selected-" + theme);
        }
      }
      this.theme = theme;
    }
  }

  valueChange(event) {
    console.log(event);
  }

  colorMapToId(task) {
    for (let i = 0; i < this.colorPalette.length; i++) {
      if (this.colorPalette[i].color === task.colorTask) {
        task.colorTask = Number(this.colorPalette[i].id);
      }
    }
    return task;
  }

  IdMapToColor(id) {
    for (let i = 0; i < this.colorPalette.length; i++) {
      if (this.colorPalette[i].id === id) {
        return this.colorPalette[i].color;
      }
    }
    return null;
  }

  baseDataForUser() {
    // this.zIndex = 'zIndex';
    // this.customerUserModal.open();
    this.customerUserModal2 = true;
  }

  closebaseDataForUser() {
    // this.zIndex = '';
    // this.customerUserModal.close();
    this.customerUserModal2 = false;
  }

  public handleValue(selected) {
    console.log(selected);
    if (selected.length <= 3) {
      this.value = selected;
    } else {
      this.value = this.value.map(item => item);
    }
    localStorage.setItem("selectedUser-" + this.id, JSON.stringify(this.value));
    localStorage.setItem(
      "usersFor-" + this.selectedStoreId + "-" + this.id,
      JSON.stringify(this.value)
    );
    this.getTaskForSelectedUsers(this.value);
  }

  getTaskForSelectedUsers(value) {
    this.loading = true;
    console.log(value);
    this.calendars = [];
    this.height = 92;
    if (value.length === 0) {
      this.service.getTasks(localStorage.getItem('superadmin')).subscribe(data => {
        this.events = [];
        for (let i = 0; i < data.length; i++) {
          data[i].start = new Date(data[i].start);
          data[i].end = new Date(data[i].end);
          this.events.push(data[i]);
        }
        const objectCalendar = {
          name: null,
          events: this.events
        };
        this.calendars.push(objectCalendar);
        this.size = [];
        this.size.push("100%");
        this.loading = false;
      });
    } else {
      this.calendars = [];
      let index = 0;

      this.loopIndex = 0;
      this.valueLoop = value;
      this.myLoop();
      /*for (let i = 0; i < value.length; i++) {
        this.service.getWorkandTasksForUser(value[i].id).subscribe(
          data => {
            console.log(data, value[i]);
            this.events = [];
            this.workTime = this.pickWorkTimeToTask(data['workTime']);
            const objectCalendar = {
              userId: value[index].id,
              name: value[index].shortname,
              events: this.pickModelForEvent(data['events']),
              workTime: this.workTime
            };
            this.calendars.push(objectCalendar);
            this.height += this.height;
            index++;
            this.splitterSize = this.splitterSizeFull / value.length;
            console.log(this.splitterSize);
            console.log(this.calendars);
            if (value.length === index) {
              this.loading = false;
            }
          });
      }*/
    }
  }

  myLoop() {
    setTimeout(() => {
      this.service
        .getWorkandTasksForUser(this.valueLoop[this.loopIndex].id)
        .subscribe(data => {
          console.log(data, this.valueLoop[this.loopIndex]);
          this.events = [];
          this.workTime = this.pickWorkTimeToTask(data["workTime"]);
          const objectCalendar = {
            userId: this.valueLoop[this.loopIndex].id,
            name: this.valueLoop[this.loopIndex].shortname,
            events: this.pickModelForEvent(data["events"]),
            workTime: this.workTime
          };
          this.calendars.push(objectCalendar);
          this.height += this.height;
          this.loopIndex++;
          this.splitterSize = this.splitterSizeFull / this.valueLoop.length;
          console.log(this.splitterSize);
          console.log(this.calendars);
          this.size = [];
          if (this.valueLoop.length === this.loopIndex) {
            const sizePannel = 100 / this.loopIndex + "%";
            for (let i = 0; i < this.valueLoop.length - 1; i++) {
              console.log("usao sam ovde!");
              this.size.push(sizePannel);
            }
            this.size.push("");
            this.loading = false;
          }
          if (this.loopIndex < this.valueLoop.length) {
            this.myLoop();
          }
        });
    }, 100);
  }

  pickModelForEvent(data) {
    this.events = [];
    for (let i = 0; i < data.length; i++) {
      data[i].start = new Date(data[i].start);
      data[i].end = new Date(data[i].end);
      this.events.push(data[i]);
    }
    return this.events;
  }

  selectedStore(event) {
    this.value = [];
    // localStorage.removeItem('selectedUser');
    this.loading = true;
    this.calendars = [];
    if (
      localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id) !== null &&
      event !== undefined
    ) {
      this.value = JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      );
      this.getTaskForSelectedUsers(this.value);
      this.getUserInCompany(event);
      this.setStoreWork(event);
      localStorage.setItem("selectedStore-" + this.id, event);
    } else {
      this.value = [];
      if (event !== undefined) {
        this.service.getTasksForStore(this.selectedStoreId).subscribe(data => {
          this.events = [];
          this.calendars = [];
          for (let i = 0; i < data.length; i++) {
            data[i].start = new Date(data[i].start);
            data[i].end = new Date(data[i].end);
            this.events.push(data[i]);
          }
          const objectCalendar = {
            name: null,
            events: this.events,
            workTime: undefined
          };
          if (!isNaN(event)) {
            this.setStoreWork(event);
          } else {
            this.startWork = "08:00";
            this.endWork = "22:00";
            this.timeDuration = "60";
            this.therapyDuration = 1;
          }
          this.calendars.push(objectCalendar);
          this.loading = false;
        });
        this.getUserInCompany(event);
      } else {
        this.service.getTasks(localStorage.getItem('superadmin')).subscribe(data => {
          console.log(data);
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            console.log(this.events);
            const objectCalendar = {
              name: null,
              events: this.events,
              workTime: undefined
            };
            this.calendars.push(objectCalendar);
            this.height += this.height;
          } else {
            this.calendars.push({ name: null, events: [] });
          }
          localStorage.removeItem("selectedStore-" + this.id);
          this.usersInCompany = [];
          this.startWork = "08:00";
          this.endWork = "22:00";
          this.timeDuration = "60";
          this.therapyDuration = 1;
          this.loading = false;
          this.size = [];
          this.size.push("100%");
        });
      }
    }

    this.size = [];
    this.size.push("100%");
  }

  setStoreWork(event) {
    this.startWork = this.getStartEndTimeForStore(
      this.store,
      this.selectedStoreId
    ).start_work;
    this.endWork = this.getStartEndTimeForStore(
      this.store,
      this.selectedStoreId
    ).end_work;
    this.timeDuration = this.getStartEndTimeForStore(
      this.store,
      this.selectedStoreId
    ).time_duration;
    if (
      Number(this.timeDuration) >
      Number(
        this.getStartEndTimeForStore(this.store, this.selectedStoreId)
          .time_therapy
      )
    ) {
      this.therapyDuration =
        Number(this.timeDuration) /
        Number(
          this.getStartEndTimeForStore(this.store, this.selectedStoreId)
            .time_therapy
        );
    } else {
      this.therapyDuration =
        Number(
          this.getStartEndTimeForStore(this.store, this.selectedStoreId)
            .time_therapy
        ) / Number(this.timeDuration);
    }

    localStorage.setItem("selectedStore-" + this.id, event);
  }

  getStartEndTimeForStore(data, id) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        // tslint:disable-next-line: max-line-length
        return {
          start_work:
            new Date(data[i].start_work).getHours() +
            ":" +
            new Date(data[i].start_work).getMinutes(),
          end_work:
            new Date(data[i].end_work).getHours() +
            ":" +
            new Date(data[i].end_work).getMinutes(),
          time_duration: data[i].time_duration,
          time_therapy: data[i].time_therapy
        };
      }
    }
    return null;
  }

  getUserInCompany(storeId) {
    this.service.getUsersInCompany(storeId, val => {
      this.usersInCompany = val;
      this.language.selectedUsers += this.usersInCompany[0].shortname;
      this.loading = false;
    });
  }

  dragEndHandler(event) {
    console.log(event);
    const formValue = this.colorMapToId(event.dataItem);
    setTimeout(() => {
      this.service.updateTask(formValue, val => {
        console.log(val);
      });
    }, 50);
  }

  resizeEndHandler(event) {
    const formValue = this.colorMapToId(event.dataItem);
    setTimeout(() => {
      this.service.updateTask(formValue, val => {
        console.log(val);
      });
    }, 50);
  }

  removeHandler({ sender, dataItem }: RemoveEvent): void {
    this.service.deleteTask(dataItem.id).subscribe(data => {
      if (data) {
        this.customer
          .deleteTherapy(dataItem.therapy_id)
          .subscribe(data_therapy => {
            console.log(data_therapy);
          });
      }
    });
  }

  cancelHandler(event) {
    console.log(event);
  }

  dateFormat(date, i, j) {
    if (
      // tslint:disable-next-line: max-line-length
      new Date(this.calendars[i].workTime[j].change) <= new Date(date) &&
      (j + 1 <= this.calendars[i].workTime.length - 1
        ? new Date(date) < new Date(this.calendars[i].workTime[j + 1].change)
        : true) &&
      new Date(date).getDay() - 1 < 5 &&
      new Date(date).getDay() !== 0
    ) {
      if (
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1].end >
          new Date(date).getHours()) ||
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start2 <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
            .end2 > new Date(date).getHours())
      ) {
        return "workTime";
      } else {
        return "none";
      }
    } else {
      return "noTime";
    }
  }

  convertNumericToDay(numeric) {
    let day = null;
    if (numeric === 1) {
      day = this.language.monday.toString().toLowerCase();
    } else if (numeric === 2) {
      day = this.language.tuesday.toLowerCase();
    } else if (numeric === 3) {
      day = this.language.wednesday.toLowerCase();
    } else if (numeric === 4) {
      day = this.language.thursday.toLowerCase();
    } else if (numeric === 5) {
      day = this.language.friday.toLowerCase();
    }
    return day;
  }

  pickWorkTimeToTask(workTime) {
    let workTimeArray = [];
    const allWorkTime = [];
    let workTimeObject = null;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < workTime.length; i++) {
      workTimeArray = [];
      for (let j = 1; j < 6; j++) {
        workTimeObject = {
          day: Number(workTime[i][this.convertNumericToDay(j)].split("-")[0]),
          start: workTime[i][this.convertNumericToDay(j)].split("-")[1],
          end: workTime[i][this.convertNumericToDay(j)].split("-")[2],
          start2: workTime[i][this.convertNumericToDay(j)].split("-")[3],
          end2: workTime[i][this.convertNumericToDay(j)].split("-")[4]
        };
        workTimeArray.push(workTimeObject);
      }
      allWorkTime.push({
        change: workTime[i].dateChange,
        color: workTime[i].color,
        times: workTimeArray
      });
    }
    console.log(allWorkTime);
    return allWorkTime;
  }

  dateEventChange(event: string) {
    /*this.loading = true;
    setTimeout(() => {
      for (let i = 0; i < this.calendars.length; i++) {
        this.calendars[i]['dateChange'] = event;
      }
      this.loading = false;
    }, 50);
    console.log(this.calendars);*/
    this.message.sendViewChange(event);
  }

  changeHandler(event) {
    console.log(event);
  }

  selectedViewCalendar(index) {
    // this.selectedViewIndex = null;
    // setTimeout(() => {
    this.selectedButtonIndex[this.selectedViewIndex] = false;
    this.selectedButtonIndexStyle[this.selectedViewIndex] = "";
    this.selectedViewIndex = index;
    this.selectedButtonIndex[this.selectedViewIndex] = true;
    this.selectedButtonIndexStyle[this.selectedViewIndex] =
      "activeButton" + this.theme;
    localStorage.setItem("calendarView", index);
    //}, 50);
  }

  chageDate(event) {
    console.log(event);
    this.message.sendDateChange(event);
  }

  getParameters() {
    this.customer.getParameters("Complaint").subscribe((data: []) => {
      console.log(data);
      this.complaintValue = data.sort(function (a, b) {
        return a['sequence'] - b['sequence']
      });
    });

    this.customer.getParameters("Therapy").subscribe((data: []) => {
      console.log(data);
      this.therapyValue = data.sort(function (a, b) {
        return a['sequence'] - b['sequence']
      });
    });

    this.customer.getParameters("Treatment").subscribe((data: []) => {
      console.log(data);
      this.treatmentValue = data.sort(function (a, b) {
        return a['sequence'] - b['sequence']
      });
    });

    this.service.getCompanyUsers(localStorage.getItem("idUser"), val => {
      this.allUsers = val;
    });
  }

  pickToModel(data: any, titleValue) {
    let value = "";
    for (let i = 0; i < data.length; i++) {
      value += data[i] + ";";
    }
    value = value.substring(0, value.length - 1);

    let stringToArray = [];
    if (value.split(";") !== undefined) {
      stringToArray = value.split(";").map(Number);
    } else {
      stringToArray.push(Number(value));
    }
    const title = this.getTitle(titleValue, stringToArray);
    return { value, title };
  }

  getTitle(data, idArray) {
    let value = "";
    for (let i = 0; i < idArray.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (data[j].id === idArray[i]) {
          value += data[j].title + ";";
        }
      }
    }
    return value;
  }

  splitToValue(complaint, therapies, therapies_previous) {
    if (complaint.split(";") !== undefined) {
      this.selectedComplaint = complaint.split(";").map(Number);
    } else {
      this.selectedComplaint = Number(complaint);
    }

    if (therapies.split(";") !== undefined) {
      this.selectedTherapies = therapies.split(";").map(Number);
    } else {
      this.selectedTherapies = Number(therapies);
    }

    if (therapies_previous.split(";") !== undefined) {
      this.selectedTreatments = therapies_previous.split(";").map(Number);
    } else {
      this.selectedTreatments = Number(therapies_previous);
    }
  }

  reloadNewCustomer() {
    this.customerUsers = null;
    setTimeout(() => {
      this.customer.getCustomers(localStorage.getItem("storeId-" + this.id), val => {
        console.log(val);
        this.customerUsers = val;
        this.loading = false;
      });
    }, 100);
  }

  onValueUserEmChange(event) {
    this.complaintData.em = event.id;
    this.complaintData.em_title = event.lastname + " " + event.firstname;
  }
}
