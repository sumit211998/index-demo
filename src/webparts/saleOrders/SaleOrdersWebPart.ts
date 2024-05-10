import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'SaleOrdersWebPartStrings';
import SaleOrders from './components/SaleOrders';
import { ISaleOrdersProps } from './components/ISaleOrdersProps';
import { Web, List, ItemAddResult } from "sp-pnp-js";
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse, } from '@microsoft/sp-http';

export interface ISaleOrdersWebPartProps {
  description: string;
}
export interface ISaleOrdersDetails {
  CustomerID: string;
  ProductID: string;
  UnitsSold: string;
  UnitPrice: string;
  SaleValue: number;
  Title: string;   //Order Status
  ID: number;
}
export interface ISaleOrdersDetails {
  value: ISaleOrdersDetails[];
}

export interface ICustomerDetails {
  Title: string; // customer Name
  CustomerID: string; //customer ID
  CustomerEmailAddress: string;
}
export interface ICustomerDetails {
  value: ICustomerDetails[];
}

export interface IProductDetails {
  Title: string; //Product Name
  ProductUnitPrice: number;
  ProductExpirydate: string;
  ProductID: string; //Product  ID
  ProductType: string;
}
export interface IProductDetails {
  value: IProductDetails[];
}
export interface IOrdersWebPartProps {
  description: string;
}

export default class SaleOrdersWebPart extends BaseClientSideWebPart<ISaleOrdersWebPartProps> {
  public customerList: ICustomerDetails[];
  public productList: IProductDetails[];
  public orderList: ISaleOrdersDetails[];
  public customer: ICustomerDetails;
  public product: IProductDetails;
  public init: boolean = true;
  public render(): void {
    this.CustomerList();
    this.ProductList();
    const element: React.ReactElement<ISaleOrdersProps> = React.createElement(
      SaleOrders,
      {
        description: this.properties.description
      }
    );
    ReactDom.render(element, this.domElement);
    this.setButtonEventListeners();
  }
  public siteUrl: string = "https://cdbcts.sharepoint.com/sites/OneAutomobile";

  public setButtonEventListeners(): void {
    this.CheckOrderListAsync();
    const webPart: SaleOrdersWebPart = this;
    document.getElementById("btnSave").style.display = 'none';
    document.getElementById("btnCancel").style.display = 'none';
    this.domElement.querySelector('#btnSubmit').addEventListener('click', () => {
      webPart.FormValidation();
    });
    console.log("Button linked");

    this.domElement.querySelector('#productName').addEventListener('change', () => {
      this.updatePage();
    });

    this.domElement.querySelector('#numberOfUnits').addEventListener('change', () => {
      this.updatePage();
    });

    this.domElement.querySelector('#btnEdit').addEventListener('click', () => {
      this.editOrders();
    });
    this.domElement.querySelector('#btnSave').addEventListener('click', () => {
      this.updateOrder();
    });
    this.domElement.querySelector('#btnDelete').addEventListener('click', () => {
      this.deleteOrder();
    });
    this.domElement.querySelector('#btnCancel').addEventListener('click', () => {
      document.getElementById("btnSave").style.display = 'none';
      document.getElementById("btnCancel").style.display = 'none';
      document.getElementById("btnSubmit").style.display = 'block';
      document.getElementById("btnReset").click();
    });
  }
  public price: number;
  private updatePage() {
    let item;
    console.log(this.productList);
    this.productList.forEach(element => {
      if (element.Title == this.domElement.querySelector<HTMLInputElement>('#productName').value) {
        item = element;
      }
    });
    this.domElement.querySelector('#productType').innerHTML = item.ProductType;
    this.domElement.querySelector('#productExpiryDate').innerHTML = (item.ProductExpirydate).substr(0, 10);
    this.domElement.querySelector('#productUnitValue').innerHTML = item.ProductUnitPrice;
    this.price = item.ProductUnitPrice * parseInt(this.domElement.querySelector<HTMLInputElement>('#numberOfUnits').value);

    console.log(this.customerList);
    if (isNaN(this.price))
      this.price = 0;
    this.domElement.querySelector('#saleValue').innerHTML = "Rs. " + this.price;
  }
  private FormValidation() {
    console.log("FromValidation");
    var alertMessage = "";
    if (document.getElementsByTagName("select")[0].value == "null") {
      alertMessage += " Select customer !\n";
    }
    if (document.getElementsByTagName("select")[1].value == "null") {
      alertMessage += " Select product !\n";
    }
    if (document.getElementsByTagName("input")[1].value == "") {
      alertMessage += " Minimum number of units should be 1 !\n";
    }
    if (alertMessage == "") {
      this.CheckOrderListAsync();
    }
    else {
      alert(alertMessage);
    }
  }

  private CheckOrderListAsync(): void {
    console.log("CheckOrderListAsync");
    this.getListData().then((response) => { this.CheckOrderList(response.value); });
  }
  private CheckOrderList(items: ISaleOrdersDetails[]): void {
    console.log("CheckOrderList");
    var count = 0;
    items.forEach((item: ISaleOrdersDetails) => {
      console.log(item);
    });
    this.orderList = items;
    if (count == 0) {
      this.AddItem();
    }
  }
  private getListData(): Promise<ISaleOrdersDetails> {
    console.log("getListData");
    return this.context.spHttpClient.get(this.siteUrl + "/_api/web/lists/GetByTitle('Orders')/Items", SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
      return response.json();
    });
  }

  protected AddItem(): void {
    if (this.init) {
      this.init = false;
      return;
    }
    console.log("AddItem");
    const web: Web = new Web(this.siteUrl);
    console.log(web);
    this.setCustomerProduct();
    web.lists.getByTitle("Orders").items.add({
      'CustomerID': "" + this.customer.CustomerID,
      'ProductID': "" + this.product.ProductID,
      'UnitsSold': "" + document.getElementsByTagName("input")[1].value,
      'UnitPrice': "" + this.product.ProductUnitPrice,
      'SaleValue': "" + this.price,
      'Title': 'Pending'
    }).then((result: ItemAddResult): void => {
      alert("Booking completed successfully");
    });
  }
  // Customer ---------------------
  private CustomerList(): void {
    console.log("CustomerList");
    this.GetCustomerListData().then((response) => { this.CustomerOrderList(response.value); });
  }
  private CustomerOrderList(items: ICustomerDetails[]): void { //Render
    console.log("CustomerOrderList");
    var select = document.getElementById("customerName");
    items.forEach((item: ICustomerDetails) => {
      console.log(item);
      var el = document.createElement("option");
      el.textContent = item.Title;
      el.value = item.CustomerEmailAddress;
      select.appendChild(el);
    });
    this.customerList = items;
  }
  private GetCustomerListData(): Promise<ICustomerDetails> {
    console.log("GetCustomerListData");
    return this.context.spHttpClient.get(this.siteUrl + "/_api/web/lists/GetByTitle('Customers')/Items", SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
      return response.json();
    });
  }

  // Product ---------------------
  private ProductList(): void {
    console.log("ProductList");
    this.GetProductListData().then((response) => { this.ProductOrderList(response.value); });
  }
  private ProductOrderList(items: IProductDetails[]): void { //Render
    console.log("ProductOrderList");
    var select = document.getElementById("productName");
    items.forEach((item: IProductDetails) => {
      console.log(item);
      var el = document.createElement("option");
      el.textContent = item.Title;
      el.value = item.Title;
      select.appendChild(el);
    });
    this.productList = items;
  }
  private GetProductListData(): Promise<IProductDetails> {
    console.log("GetProductListData");
    return this.context.spHttpClient.get(this.siteUrl + "/_api/web/lists/GetByTitle('Products')/Items", SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
      return response.json();
    });
  }
  private setCustomerProduct() {
    this.productList.forEach(element => {
      if (element.Title == this.domElement.querySelector<HTMLInputElement>('#productName').value) {
        this.product = element;
      }
    });
    this.customerList.forEach(element => {
      if (element.CustomerEmailAddress == this.domElement.querySelector<HTMLInputElement>('#customerName').value) {
        this.customer = element;
      }
    });
  }
  public orderId;
  private editOrders() {
    this.orderId = prompt("Enter order ID");
    let found = false;
    this.orderList.forEach(element => {
      if (element.ID == parseInt(this.orderId))
        found = true;
    });
    if (found) {
      //show hide buttons
      document.getElementById("btnSave").style.display = 'block';
      document.getElementById("btnCancel").style.display = 'block';
      document.getElementById("btnSubmit").style.display = 'none';
      //map values in form
      let item: ISaleOrdersDetails;
      this.orderList.forEach(element => {
        if (element.ID == this.orderId) {
          item = element;
          console.log(item);
        }
      });
    }
    else {
      alert("Order not found !");
    }
  }
  private updateOrder() {
    //click save - update on same record
    this.setCustomerProduct();
    const url: string = this.siteUrl + "/_api/web/lists/getbytitle('Orders')/items(" + this.orderId + ")";
    const itemBody: any = {
      'CustomerID': "" + this.customer.CustomerID,
      'ProductID': "" + this.product.ProductID,
      'UnitsSold': "" + document.getElementsByTagName("input")[1].value,
      'UnitPrice': "" + this.product.ProductUnitPrice,
      'SaleValue': "" + this.price,
      'Title': 'Pending'
    };

    const headers: any = {
      "X-HTTP-Method": "MERGE",
      "IF-MATCH": "*",
    };

    const spHttpClientOptions: ISPHttpClientOptions = {
      "headers": headers,
      "body": JSON.stringify(itemBody)
    };

    this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
      .then((response: SPHttpClientResponse) => {
        if (response.status === 204) {
          alert("Order has been updated successfully.");
        } else {
          alert("Order updation failed. " + response.status + " - " + response.statusText);
        }
      });
    //after success hide form and click on reset
    document.getElementById("btnSave").style.display = 'none';
    document.getElementById("btnCancel").style.display = 'none';
    document.getElementById("btnSubmit").style.display = 'block';
    document.getElementById("btnReset").click();
  }

  private deleteOrder(): void {

    this.orderId = prompt("Enter order ID");
    let found = false;
    this.orderList.forEach(element => {
      if (element.ID == parseInt(this.orderId))
        found = true;
    });
    if (found) {
    const url: string = this.siteUrl + "/_api/web/lists/getbytitle('Orders')/items(" + this.orderId + ")";
    const headers: any = { "X-HTTP-Method": "DELETE", "IF-MATCH": "*" };

    const spHttpClientOptions: ISPHttpClientOptions = {
      "headers": headers
    };

    this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
      .then((response: SPHttpClientResponse) => {
        if (response.status === 204) {
          alert("Order has been deleted successfully.");

        } else {
          alert("Failed to Delete..." + response.status + " - " + response.statusText);
        }
      });
    }
    else {
      alert("Order not found !");
    }
  }
  protected get DataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
