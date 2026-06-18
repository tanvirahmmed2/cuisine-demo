// components/buttons/PrintOrder.jsx
'use client'
import React from 'react'
import { FaPrint } from "react-icons/fa";
import { Context } from '../context/Context';

const PrintOrder = ({ order }) => {
  const { siteData } = React.useContext(Context)

  const printOrder = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const receiptContent = `
      <html>
        <head>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm;
              margin: 0 auto;
              padding: 5mm 2mm;
              font-size: 13px;
              color: #000;
              line-height: 1.2;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin: 5px 0; }
            th { border-bottom: 1px solid #000; text-align: left; padding-bottom: 2px; }
            .qty { width: 15%; }
            .name { width: 55%; }
            .price { width: 30%; text-align: right; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .grand-total { font-size: 16px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; }
            .footer-msg { margin-top: 15px; font-size: 11px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin:0; font-size: 18px; text-transform: uppercase;">${siteData?.name || 'Restaurant'}</h2>
            <p style="margin:2px 0;">${siteData?.address || ''}</p>
            ${siteData?.phone ? `<p style="margin:2px 0;">Tel: ${siteData.phone}</p>` : ''}
            <div class="divider"></div>
            <p style="margin:2px 0;">ORDER: #${order.id?.toString().slice(-6).toUpperCase()}</p>
            <p style="margin:2px 0;">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>

          <div style="margin: 10px 0 5px 0;">
            <div>Customer: <span class="bold">${order.name || 'Guest'}</span></div>
            <div>Type: <span class="bold">${order.delivery_method?.toUpperCase()}</span></div>
            ${order.delivery_method === 'takein' ? `<div>Table: <span class="bold">${order.table_no}</span></div>` : ''}
            <div>Status: <span class="bold" style="text-transform: uppercase;">${order.status || 'confirmed'}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="qty">Qty</th>
                <th class="name">Item</th>
                <th class="price">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td class="qty">${item.quantity}</td>
                  <td class="name">${item.title}</td>
                  <td class="price">${(Number(item.price - (item.discount || 0)) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${Number(order.sub_total).toFixed(2)}</span>
            </div>
            ${order.total_discount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${Number(order.total_discount).toFixed(2)}</span>
            </div>` : ''}
            <div class="total-row bold grand-total">
              <span>TOTAL:</span>
              <span>BDT ${Number(order.total_price).toFixed(2)}</span>
            </div>
          </div>

          <div class="center footer-msg">
            <p style="margin:0;">Payment: ${order.payment_method?.toUpperCase()} (${order.payment_status?.toUpperCase()})</p>
            <div class="divider" style="border-top-style: dotted;"></div>
            <p>Thank you for dining with us!</p>
            <p style="font-size: 9px; opacity: 0.8;">Powered by Disibin</p>
          </div>
        </body>
      </html>
    `;

    const pri = iframe.contentWindow;
    pri.document.open();
    pri.document.write(receiptContent);
    pri.document.close();

    setTimeout(() => {
      pri.focus();
      pri.print();
      document.body.removeChild(iframe);
    }, 500);
  }

  return (
    <button 
      onClick={printOrder} 
      className='w-full px-2 rounded-lg hover:bg-pink-500/10 p-2 cursor-pointer flex flex-row items-center justify-center gap-4 transition-colors border border-transparent active:border-pink-500/20'
    >
      <FaPrint className="text-gray-700 hover:text-pink-600" />
      <span className="font-medium">Print Receipt</span>
    </button>
  )
}

export default PrintOrder