import * as React from 'react';
import styles from './SaleOrders.module.scss';
import { ISaleOrdersProps } from './ISaleOrdersProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class SaleOrders extends React.Component<ISaleOrdersProps, {}> {
  public render(): React.ReactElement<ISaleOrdersProps> {
    return (
      <div className='container'>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
        <div className='jumbotron'>
          <p className='display-4 text-center'>Order Form</p>
          <form>
            <table className='table'>
              <tr>
                <td>Customer Name</td>
                <td><select id="customerName">
                <option value='null'>Choose Customer...</option>
                </select> </td>
              </tr>

              <tr>
                <td>Product Name</td>
                <td><select id="productName">
                    <option value='null'>Choose Product...</option>
                </select> </td>
              </tr>

              <tr>
                <td>Product Type : </td>
                <td><p id='productType'> </p></td>
              </tr>

              <tr>
                <td>Product Expiry Date : </td>
                <td><p id='productExpiryDate'> </p></td>
              </tr>

              <tr>
                <td>Product Unit value : </td>
                <td><p id='productUnitValue'> </p></td>
              </tr>

              <tr>
                <td>Number of Units</td>
                <td><input type='number' id='numberOfUnits' min='1' /></td>
              </tr>

              <tr>
                <td>Sale Value : </td>
                <td><p id='saleValue'> </p></td>
              </tr>   

              <tr>
                <td><input type='button' className='btn btn-success' value='Add' id='btnSubmit' /></td>
                <td><input type='button' className='btn btn-success' value='Save' id='btnSave' /></td>
                <td><input type='button' className='btn btn-danger' value='Cancel' id='btnCancel' /></td>
                <td><input type='button' className='btn btn-warning' value='Edit' id='btnEdit' /></td>
                <td><input type='button' className='btn btn-danger' value='Delete' id='btnDelete' /></td>
                <td><input type='reset' className='btn btn-info' value='Reset' id='btnReset' /></td>
              </tr>           
            </table>
          </form>
        </div>
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      </div>
    );
  }
}
