import { Component, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { ReqeustDemoAccount } from "src/app/models/request-demo-account";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import {
  Elements,
  Element as StripeElement,
  ElementsOptions,
  StripeService,
} from "ngx-stripe";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-request-demo",
  templateUrl: "./request-demo.component.html",
  styleUrls: ["./request-demo.component.scss"],
})
export class RequestDemoComponent implements OnInit {
  @ViewChild("paymentForm") paymentForm: Modal;
  public language: any;
  public data = new ReqeustDemoAccount();
  public required = false;
  public success = false;
  private package: string;
  elements: Elements;
  card: StripeElement;
  elementsOptions: ElementsOptions = {
    locale: "en",
  };

  constructor(
    private callApi: DynamicService,
    private helpService: HelpService,
    private stripeService: StripeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.language = this.helpService.getLanguageForLanding();
    this.package = this.route.snapshot.paramMap.get("package");
    // this.initializePaymentCard();
  }

  sendReqestForDemoAccount() {
    this.required = false;
    this.success = false;
    if (
      !this.data.name ||
      !this.data.email ||
      !this.data.phone ||
      !this.data.nameOfCompany ||
      !this.data.countOfEmployees
    ) {
      this.required = true;
    } else {
      this.submitPayment();
      // this.callApi
      //   .callApiPost("/api/sendReqestForDemoAccountFull", this.data)
      //   .subscribe((data) => {
      //     if (data) {
      //       this.success = true;
      //       this.data = new ReqeustDemoAccount();
      //     }
      //   });
      // this.submitPayment();
    }
  }

  sendEventForChangeLanguage(event: any) {
    this.language = this.helpService.getLanguageForLanding();
  }

  initializePaymentCard() {
    this.stripeService.elements(this.elementsOptions).subscribe((elements) => {
      this.elements = elements;
      if (!this.card) {
        this.card = this.elements.create("card", {
          iconStyle: "solid",
          style: {
            base: {
              iconColor: "#666EE8",
              color: "#31325F",
              lineHeight: "40px",
              fontWeight: 300,
              fontFamily: '"Helverica Neue", Helvetica, sans-serif',
              fontSize: "18px",
              "::placeholder": {
                color: "#CFD7E8",
              },
            },
          },
        });
        this.card.mount("#card-element");
      }
    });
  }

  submitPayment() {
    this.stripeService
      .createToken(this.card, { name: this.data.name })
      .subscribe((result) => {
        if (result.token) {
          this.data["token"] = result.token;
          this.callApi
            .callApiPost("/api/payment/create-payment", this.data)
            .subscribe((res) => {
              if (res["success"]) {
                alert("Uspesno!");
              } else {
                alert("Neuspesno!");
              }
            });
        }
      });
  }

  openPaymentForm() {
    this.paymentForm.open();
    setTimeout(() => {
      this.stripeService
        .elements(this.elementsOptions)
        .subscribe((elements) => {
          this.elements = elements;
          if (!this.card) {
            this.card = this.elements.create("card", {
              iconStyle: "solid",
              style: {
                base: {
                  iconColor: "#666EE8",
                  color: "#31325F",
                  lineHeight: "40px",
                  fontWeight: 300,
                  fontFamily: '"Helverica Neue", Helvetica, sans-serif',
                  fontSize: "18px",
                  "::placeholder": {
                    color: "#CFD7E8",
                  },
                },
              },
            });
            this.card.mount("#card-element");
          }
        });
    }, 20);
  }

  selectPackage(event) {
    console.log(event);
  }
}
