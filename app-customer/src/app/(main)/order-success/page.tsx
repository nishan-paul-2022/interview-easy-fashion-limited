'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { getFullSizeName } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderData {
  id: string;
  date: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedOrder = sessionStorage.getItem('easyfashion_order_success');
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch {
        router.push('/cart');
      }
    } else {
      router.push('/cart');
    }
  }, [router]);

  if (!mounted || !order) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Icon name="Search" size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to print/download your invoice.');
      return;
    }

    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px;">${item.name} (Size: ${getFullSizeName(item.size)})</td>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; padding: 20px; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, .05); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #00bcd4; padding-bottom: 20px; }
            .logo-area { display: flex; align-items: center; gap: 8px; }
            .logo-text { font-size: 28px; font-weight: bold; color: #00bcd4; }
            .details { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .shipping-info, .order-info { font-size: 14px; }
            .title { font-weight: bold; margin-bottom: 5px; text-transform: uppercase; font-size: 12px; color: #888; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f9f9f9; text-align: left; padding: 10px; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #666; border-bottom: 2px solid #eaeaea; }
            .totals { margin-top: 30px; margin-left: auto; width: 300px; font-size: 14px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .grand-total { font-size: 20px; font-weight: bold; margin-top: 10px; color: #00bcd4; border-top: 2px solid #00bcd4; padding-top: 10px; }
            .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="logo-area">
                <span class="logo-text">EasyFashion</span>
              </div>
              <div style="text-align: right; font-size: 14px;">
                <span style="font-size: 20px; font-weight: bold; color: #666;">INVOICE</span><br>
                <strong>Date:</strong> ${order.date}
              </div>
            </div>
            
            <div class="details">
              <div class="shipping-info">
                <div class="title">Shipping Address</div>
                <div style="white-space: pre-line;">${order.address}</div>
              </div>
              <div class="order-info" style="text-align: right;">
                <div class="title">Order Reference</div>
                <strong>ID:</strong> ${order.id}<br>
                <strong>Payment:</strong> Cash on Delivery
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="totals-row">
                <span style="color: #666;">Subtotal</span>
                <span>$${order.subtotal.toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span style="color: #666;">Shipping</span>
                <span>${order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div class="totals-row">
                <span style="color: #666;">Tax (8%)</span>
                <span>$${order.tax.toFixed(2)}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Grand Total</span>
                <span>$${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              Thank you for shopping with EasyFashion!<br>
              If you have any questions about this invoice, please contact support@easyfashion.com
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16">
      {/* Success Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="CheckCircle" size={48} />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-text">Order Placed Successfully!</h1>
        <p className="mb-4 text-muted">
          Thank you for your purchase. Your order has been received.
        </p>
        <div className="rounded-lg bg-surface px-6 py-3 border border-muted/20">
          <span className="text-sm text-muted">Order ID: </span>
          <span className="font-bold text-accent">{order.id}</span>
        </div>
      </div>

      <div className="w-full flex-col gap-8 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8">
        {/* Order Details Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-text">Shipping Address</h3>
            <p className="whitespace-pre-line text-sm text-muted">{order.address}</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-text">Order Date</h3>
            <p className="text-sm text-muted">{order.date}</p>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-muted/20" />

        {/* Ordered Items Summary */}
        <h3 className="mb-4 font-semibold text-text">Order Summary</h3>
        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/10">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col text-sm text-muted">
                <span className="font-semibold text-text line-clamp-1 mb-1.5">{item.name}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-muted/10 border border-muted/20 text-muted">
                    Size: {getFullSizeName(item.size)}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-muted/10 border border-muted/20 text-muted">
                    Quantity: {item.quantity}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-muted/10 border border-muted/20 text-muted">
                    Price: ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="my-6 h-px w-full bg-muted/20" />

        {/* Totals */}
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium text-text">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="font-medium text-text">
              {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span className="font-medium text-text">${order.tax.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-muted/20 pt-4 text-lg font-bold">
            <span className="text-text">Grand Total</span>
            <span className="text-text">${order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/products" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full">
            Continue Shopping
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={handleDownloadInvoice}
          className="w-full sm:w-auto"
        >
          Download Invoice
        </Button>
      </div>
    </div>
  );
}
