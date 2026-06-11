import { Image } from 'react-native';

const PROFORMA_EVENT_NAME = '9th Edition of International Health & Wellness Expo (IHWE Global Edition)';
const PROFORMA_PLACE_OF_SUPPLY = 'Hall Nos. 8, 9 & 10, Pragati Maidan, New Delhi - 110001, Bharat';
const PROFORMA_EVENT_GST_NO = '08AAFCN9238F1Z6';

function toWords(n: number) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (n === 0) return 'Zero';
    const convert = (num: number): string => {
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
        if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
        if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
        return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
    };
    const intPart = Math.floor(n);
    return convert(intPart) + ' Rupees Only.';
}

export const generateInvoiceHtml = (data: any, type: string, headerImgUrl: string, settings?: any, bankDetails?: any, sigBase64?: string, stampBase64?: string) => {
    if (!data) return '';

    // Determine context
    const isEstimate = type === 'estimate';
    const isReceipt = type === 'receipt';

    // Fallback data mapping based on API response
    // When fetching directly from /api/estimates/:id, data IS the document
    const doc = data.estimate || data.invoice || data;

    // For receipts, synthesize a single item for the payment
    const items = isReceipt ? [{
        description: `Payment Received - Mode: ${doc.payment_mode} ${doc.cheque_no || doc.utr_no || doc.card_transaction_no || ''}`,
        hsn: '-',
        qty: 1,
        rate: parseFloat(doc.f_amount) || 0,
        amount: parseFloat(doc.f_amount) || 0,
        tax: 0,
        disc: 0
    }] : doc?.items || [];

    const company = data.company || {};
    const c1 = company?.contacts?.[0] || {};

    // Fallback data mapping based on API response
    const invoiceNo = isEstimate ? doc?.est_no : isReceipt ? (doc?.cash_receipt_no || doc?._id) : doc?.inv_no;
    const invoiceDate = doc?.added || doc?.payment_date ? new Date(doc.payment_date || doc.added).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    // Receipt won't have company data inside the API response typically, so fallback to empty
    const clientCompanyName = doc?.company_name || company?.companyName || '—';
    const clientCompanyAddress = doc?.company_addr || [company?.address, company?.city, company?.pincode ? `- ${company.pincode}` : '', company?.state, company?.country].filter(Boolean).join(', ');
    const clientGstNo = doc?.company_gst_no || doc?.gst_no || company?.gst || '';

    // Calculations
    const totalTaxable = isReceipt ? (parseFloat(doc.f_amount) || 0) : items.reduce((sum: number, item: any) => {
        const amt = parseFloat(item.amount) || 0;
        const disc = parseFloat(item.disc) || 0;
        return sum + (amt - disc);
    }, 0);
    const subTotal = totalTaxable;

    const taxValue = isReceipt ? 0 : items.reduce((sum: number, item: any) => sum + (parseFloat(item.tax) || 0), 0);
    const totalAmount = isReceipt ? subTotal : (subTotal + taxValue);

    const isIgst = company?.state && company.state.toLowerCase() !== 'delhi';

    const sigUrl = sigBase64 || null;
    const stampUrl = stampBase64 || null;    const eventName = doc?.event_name || doc?.consignee_name || '9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO (IHWE GLOBAL EDITION)';
    const eventPlaceOfSupply = doc?.event_place_of_supply || doc?.consignee_addr || 'Hall Nos. 8, 9 & 10, Pragati Maidan, New Delhi - 110001, Bharat';
    const eventGstNo = doc?.event_gst_no || '09AAFCN9238F1Z6';

    const createdDateTime = doc?.added ? new Date(doc.added).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // HTML Template
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=850, initial-scale=1.0" />
        <style>
            body { font-family: Calibri, Arial, sans-serif; font-size: 11px; color: #000; padding: 20px; margin: 0; background: #fff; min-width: 800px; }
            .invoice-box { max-width: 1000px; margin: auto; padding: 30px; border: 1px solid #ccc; background: #fff; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            th, td { border: 1px solid #ccc; padding: 4px 8px; }
            th { background: #0d1f3c; color: #fff; border: 1px solid #0d1f3c; padding: 3px 2px; text-align: center; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .no-border td { border: none !important; padding: 1px 4px 1px 0 !important; }
            .bold { font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .uppercase { text-transform: uppercase; }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div style="margin-bottom: 8px; text-align: center;">
                <img src="${headerImgUrl}" alt="Header" style="width: 100%; max-width: 100%; display: block;" />
            </div>

            <div style="text-align: center; margin-bottom: 4px; padding-top: 2px; padding-bottom: 2px;">
                <div style="font-weight: 400; font-size: 18px; color: #0d1f3c; text-transform: uppercase;">
                    ${isEstimate ? 'PROFORMA INVOICE' : isReceipt ? 'RECEIPT' : 'TAX INVOICE'}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 38%; text-align: center;">CLIENT NAME & ADDRESS</th>
                        <th style="width: 38%; text-align: center;">SHIPMENT DETAILS</th>
                        <th style="width: 24%; text-align: center;">${isEstimate ? 'PROFORMA INVOICE' : isReceipt ? 'RECEIPT' : 'INVOICE'} DETAILS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="vertical-align: top; font-size: 11px; line-height: 1.2;">
                            <div style="font-weight: 700; text-transform: uppercase;">${clientCompanyName}</div>
                            <div style="margin-top: 2px; text-transform: capitalize;">${clientCompanyAddress}</div>
                            <table class="no-border" style="width: 100%; margin-top: 4px;">
                                <tbody>
                                    <tr><td style="width: 1%; white-space: nowrap;">Contact Person</td><td style="width: 1%;">:</td><td>${c1.name || '—'}</td></tr>
                                    <tr><td style="width: 1%; white-space: nowrap;">Contact No.</td><td style="width: 1%;">:</td><td>${c1.mobile || '—'}</td></tr>
                                    <tr><td style="width: 1%; white-space: nowrap;">Email</td><td style="width: 1%;">:</td><td>${c1.email || '—'}</td></tr>
                                    <tr><td style="width: 1%; white-space: nowrap;">GSTIN.</td><td style="width: 1%;">:</td><td>${clientGstNo || '—'}</td></tr>
                                </tbody>
                            </table>
                        </td>
                        <td style="vertical-align: top; font-size: 11px; line-height: 1.2;">
                            <div style="font-weight: 700; text-transform: uppercase;">${eventName}</div>
                            <div style="margin-top: 2px;">${eventPlaceOfSupply}</div>
                            <table class="no-border" style="width: 100%; margin-top: 4px;">
                                <tbody>
                                    <tr><td style="width: 1%; white-space: nowrap;">Contact Person</td><td style="width: 1%;">:</td><td>${c1.name || '—'}</td></tr>
                                    <tr><td style="width: 1%; white-space: nowrap;">Contact No.</td><td style="width: 1%;">:</td><td>${c1.mobile || '—'}</td></tr>
                                    <tr><td style="width: 1%; white-space: nowrap;">GSTIN.</td><td style="width: 1%;">:</td><td>${eventGstNo}</td></tr>
                                </tbody>
                            </table>
                        </td>
                        <td style="vertical-align: top; font-size: 10px; padding: 6px 8px;">
                            <table class="no-border" style="width: 100%;">
                                <tbody>
                                    <tr><td class="bold" style="white-space: nowrap;">${isEstimate ? 'Proforma Invoice' : 'Invoice'} No.</td><td class="bold" style="width: 1%;">:</td><td class="text-right" style="white-space: nowrap;">${invoiceNo || '—'}</td></tr>
                                    <tr><td class="bold" style="white-space: nowrap;">${isEstimate ? 'Proforma Invoice' : 'Invoice'} Date</td><td class="bold" style="width: 1%;">:</td><td class="text-right" style="white-space: nowrap;">${invoiceDate || '—'}</td></tr>
                                    <tr><td class="bold" style="white-space: nowrap;">Created Date</td><td class="bold" style="width: 1%;">:</td><td class="text-right" style="white-space: nowrap;">${createdDateTime}</td></tr>
                                    <tr><td class="bold" style="white-space: nowrap;">Created By</td><td class="bold" style="width: 1%;">:</td><td class="text-right" style="white-space: nowrap; text-transform: capitalize;">${doc?.added_by || 'Admin'}</td></tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

        <table>
            <thead>
                <tr>
                    <th style="width: 4%">S.NO.</th>
                    <th style="width: 40%">ITEM DESCRIPTION</th>
                    <th style="width: 8%">HSN CODE</th>
                    <th style="width: 5%">QTY.</th>
                    <th style="width: 6%">AREA</th>
                    <th style="width: 5%">SIZE</th>
                    <th style="width: 5%">UNIT</th>
                    <th style="width: 9%">RATE</th>
                    <th style="width: 7%">DISCOUNT</th>
                    <th style="width: 11%">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item: any, idx: number) => {
        const amt = parseFloat(item.amount) || 0;
        const disc = parseFloat(item.disc) || 0;
        return `
                    <tr>
                        <td class="text-center" style="vertical-align: top; padding-top: 8px;">${idx + 1}</td>
                        <td style="vertical-align: top; padding-top: 8px;">
                            <div class="bold" style="margin-bottom: 2px;">9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO (IHWE GLOBAL EDITION)</div>
                            <div style="color: #555;">${item.description || ''}</div>
                        </td>
                        <td class="text-center" style="vertical-align: top; padding-top: 8px;">${item.hsn || '-'}</td>
                        <td class="text-center" style="vertical-align: top; padding-top: 8px;">${item.qty || 1}</td>
                        <td class="text-center" style="vertical-align: top; padding-top: 8px;">${item.area || '-'}</td>
                        <td class="text-center" style="vertical-align: top; padding-top: 8px;">${item.size || '-'}</td>
                        <td class="text-center" style="vertical-align: top; padding-top: 8px;">${item.unit || 'Sqm'}</td>
                        <td class="text-right" style="vertical-align: top; padding-top: 8px;">${Number(item.rate || item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td class="text-center" style="vertical-align: top; padding-top: 8px;">${item.disc ? item.disc + '%' : '0%'}</td>
                        <td class="text-right bold" style="vertical-align: top; padding-top: 8px;">${Number(amt - disc).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    `;
    }).join('')}
                <!-- Add empty rows to match UI -->
                ${[...Array(4)].map(() => `
                <tr>
                    <td style="height: 20px;"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                `).join('')}
                
                <tr>
                    <td colspan="9" class="text-right bold" style="background: #f8fafc;">TAXABLE VALUE</td>
                    <td class="text-right bold">${Number(subTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            </tbody>
        </table>

        <table>
            <thead>
                <tr>
                    <th style="width: 4%">S.NO.</th>
                    <th style="width: 10%">HSN/SAC NO.</th>
                    <th style="width: 12%">ITEM VALUE</th>
                    <th style="width: 6%">QTY.</th>
                    <th style="width: 9%">CGST(%)</th>
                    <th style="width: 11%">AMOUNT</th>
                    <th style="width: 9%">SGST(%)</th>
                    <th style="width: 11%">AMOUNT</th>
                    <th style="width: 9%">IGST(%)</th>
                    <th style="width: 11%">AMOUNT</th>
                    <th style="width: 8%">TOTAL TAX</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item: any, idx: number) => {
        const itemTaxable = (parseFloat(item.amount) || 0) - (parseFloat(item.disc) || 0);
        const gstRate = parseFloat(item.gstRate) || 18;
        const halfGst = gstRate / 2;
        const gstAmt = parseFloat(item.tax) || 0;
        const halfGstAmt = gstAmt / 2;
        return `
                    <tr>
                        <td class="text-center">${idx + 1}</td>
                        <td class="text-center">${item.hsn || '997331'}</td>
                        <td class="text-center">${Number(itemTaxable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td class="text-center">${item.qty || 1}</td>
                        <td class="text-center">${!isIgst ? halfGst + '%' : '-'}</td>
                        <td class="text-center">${!isIgst ? Number(halfGstAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-center">${!isIgst ? halfGst + '%' : '-'}</td>
                        <td class="text-center">${!isIgst ? Number(halfGstAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-center">${isIgst ? gstRate + '%' : '-'}</td>
                        <td class="text-center">${isIgst ? Number(gstAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-right bold">${Number(gstAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    `;
    }).join('')}
                <tr style="background: #f8fafc;">
                    <td colspan="3" class="bold" style="text-transform: uppercase;">GST AMOUNT IN WORDS</td>
                    <td colspan="6" style="text-transform: uppercase;">${toWords(Math.round(taxValue)).toUpperCase()}</td>
                    <td class="bold" style="text-transform: uppercase;">TOTAL GST AMOUNT</td>
                    <td class="text-right bold">${Number(taxValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td colspan="3" class="bold" style="text-transform: uppercase;">AMOUNT IN WORDS</td>
                    <td colspan="6" style="text-transform: uppercase;">${toWords(Math.round(totalAmount)).toUpperCase()}</td>
                    <td class="bold" style="text-transform: uppercase;">GRAND TOTAL</td>
                    <td class="text-right bold">${Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            </tbody>
        </table>

        <table>
            <tbody>
                <tr>
                    <td style="width: 60%; vertical-align: top; background: #fafafa;">
                        <div class="bold" style="margin-bottom: 2px;">Terms and Conditions:</div>
                        <div style="font-size: 10px; line-height: 1.3;">
                            1. Payment must be made in favor of Namo Gange Wellness Pvt. Ltd. via Cheque / DD / RTGS / NEFT / UPI only.<br/>
                            2. Full payment is due within the stipulated invoice period.<br/>
                            3. Delay in payment shall attract interest @24% per annum.<br/>
                            4. Booking / services shall be confirmed only after receipt of payment.<br/>
                            5. Cancellation or amendments shall be subject to company policy and management approval.<br/>
                            6. All disputes are subject to Delhi Jurisdiction only.
                        </div>
                    </td>
                    <td style="width: 40%; vertical-align: top; background: #fafafa;">
                        <div class="bold" style="margin-bottom: 2px;">Payment Conditions:</div>
                        <div style="font-size: 10px;">1. 100% Advance Payment.</div>
                    </td>
                </tr>
            </tbody>
        </table>

        <table>
            <thead>
                <tr>
                    <th style="width: 33%;">NGWPL Bank Details</th>
                    <th style="width: 33%;">Client Signature</th>
                    <th style="width: 34%;">For Namo Gange Wellness Pvt. Ltd.</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="vertical-align: top; font-size: 10px;">
                        <table class="no-border" style="line-height: 1.3;">
                            <tr><td class="bold" style="white-space: nowrap;">Bank Name</td><td class="bold">:</td><td style="white-space: nowrap;">${bankDetails?.bankname || 'Kotak Mahindra Bank'}</td></tr>
                            <tr><td class="bold" style="white-space: nowrap;">Account Name</td><td class="bold">:</td><td style="white-space: nowrap;">${bankDetails?.accountname || 'Namo Gange Wellness Pvt. Ltd.'}</td></tr>
                            <tr><td class="bold" style="white-space: nowrap;">Account No.</td><td class="bold">:</td><td style="white-space: nowrap;">${bankDetails?.accountno || '6812013962'}</td></tr>
                            <tr><td class="bold" style="white-space: nowrap;">IFSC Code</td><td class="bold">:</td><td style="white-space: nowrap;">${bankDetails?.ifsccode || 'KKBK0004584'}</td></tr>
                            <tr><td class="bold" style="white-space: nowrap;">Branch Name</td><td class="bold">:</td><td style="white-space: nowrap;">${bankDetails?.bankbranch || 'Mayur Vihar Ph-2, Delhi'}</td></tr>
                        </table>
                    </td>
                    <td style="vertical-align: bottom; text-align: center; font-size: 10px; padding-bottom: 8px;">
                        <div style="height: 60px;"></div>
                        <div style="border-top: 1px solid #000; width: 60%; margin: 0 auto; padding-top: 4px; font-weight: 700;">Auth. Signatory</div>
                    </td>
                    <td style="vertical-align: bottom; text-align: center; font-size: 10px; padding-bottom: 8px;">
                        <div style="height: 80px; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 16px;">
                            ${sigUrl ? `<img src="${sigUrl}" alt="Signature" style="max-height: 60px; max-width: 130px;" />` : ''}
                            ${stampUrl ? `<img src="${stampUrl}" alt="Stamp" style="max-height: 60px; max-width: 60px;" />` : ''}
                        </div>
                        <div style="border-top: 1px solid #000; width: 60%; margin: 0 auto; padding-top: 4px; font-weight: 700;">Auth. Signatory</div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 12px; text-align: center; color: #666; margin-top: 8px; padding-top: 6px;">
            <b>Registered Address:</b> First Floor, E-1, Opposite KFC, Kalkaji Main Market, South Delhi-110019, Delhi, India
        </div>
        <div style="font-size: 11px; text-align: center; color: #999; margin-top: 4px;">
            This is a computer generated document and does not require a physical signature.
        </div>
    </body>
    </html>
    `;
};
