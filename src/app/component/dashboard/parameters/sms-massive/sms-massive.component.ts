import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { SmsReminderModel } from "src/app/models/sms-reminder-model";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { ParameterItemService } from "src/app/service/parameter-item.service";

@Component({
  selector: "app-sms-massive",
  templateUrl: "./sms-massive.component.html",
  styleUrls: ["./sms-massive.component.scss"],
})
export class SmsMassiveComponent implements OnInit {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  public path = "parameters";
  public file = "sms-massive";
  public mailReminderData = new SmsReminderModel();
  public loading = true;
  public type: number;
  public id: number;
  public data: any;
  public changeData: any;
  public showDialog = false;
  public configField: any;
  public language: any;

  constructor(
    private service: ParameterItemService,
    private helpService: HelpService,
    private dynamicService: DynamicService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.initialization();
  }

  initialization() {
    this.id = this.helpService.getMe();

    this.dynamicService
      .getConfiguration(this.path, this.file)
      .subscribe((config) => {
        this.configField = config;
        this.getData(this.id);
      });
  }

  getData(id) {
    this.service.getSmsMassiveMessage(id).subscribe((data) => {
      this.data = data;
      if (data && data["length"] > 0) {
        this.packValue(data);
      }
      this.loading = false;
    });
  }

  packValue(data) {
    for (let i = 0; i < this.configField.length; i++) {
      this.configField[i].value = this.helpService.convertValue(
        data[0][this.configField[i].field],
        this.configField[i].type
      );
    }
  }

  submitEmitter(event) {
    this.changeData = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
      this.changeData["superadmin"] = this.helpService.getMe();
      if (this.data && this.data.length) {
        this.service
          .updateSmsMassiveMessage(this.changeData)
          .subscribe((data) => {
            if (data) {
              this.helpService.successToastr(
                this.language.successExecutedActionTitle,
                this.language.successExecutedActionText
              );
            } else {
              this.helpService.errorToastr(
                this.language.errorExecutedActionTitle,
                this.language.errorExecutedActionText
              );
            }
          });
      } else {
        this.data = [this.changeData];
        this.service
          .createSmsMassiveMessage(this.changeData)
          .subscribe((data) => {
            if (data) {
              this.helpService.successToastr(
                this.language.successExecutedActionTitle,
                this.language.successExecutedActionText
              );
            } else {
              this.helpService.errorToastr(
                this.language.errorExecutedActionTitle,
                this.language.errorExecutedActionText
              );
            }
          });
      }
    }
    this.showDialog = false;
  }
}
