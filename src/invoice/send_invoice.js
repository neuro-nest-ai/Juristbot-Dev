const fs = require('fs');
const PdfPrinter = require("pdfmake")
const path = require("path");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getAwsSecrets } = require('../utils/razorpayvalut'); 
require('dotenv').config();
const nodemailer = require("nodemailer");

const fonts = {
    Roboto: { 
      normal: path.join(__dirname,"Roboto-Regular.ttf"),
      bold: path.join(__dirname,"Roboto-Medium.ttf"),
      italics: path.join(__dirname,"Roboto-Italic.ttf"),
      bolditalics: path.join(__dirname,"Roboto-MediumItalic.ttf")
    }
  };

  const printer = new PdfPrinter(fonts);

const headerSVG = fs.readFileSync(path.join(__dirname,"invoice_header.svg"),"utf8")
const paidStampSVG = fs.readFileSync(path.join(__dirname,"paid_stamp.svg"),'utf8');
const footerSVG = fs.readFileSync(path.join(__dirname,"invoice_footer.svg"),'utf8')

function numToWords(n) {
  const num = "zero One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen".split(" ");
  const tens = "Twenty Thirty Forty Fifty Sixty Seventy Eighty Ninety".split(" ");

  if (0 <= n && n <= 999999999) {
      if (n < 20) {
          return num[n];
      }
      if (n < 100) {
          return tens[Math.floor(n / 10) - 2] + (n % 10 ? " " + num[n % 10] : "");
      }
      if (n < 1000) {
          return num[Math.floor(n / 100)] + " Hundred" + (n % 100 === 0 ? "" : " and " + numToWords(n % 100));
      }
      if (n < 100000) {
          return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 === 0 ? "" : " " + numToWords(n % 1000));
      }
      if (n < 10000000) {
          return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 === 0 ? "" : " " + numToWords(n % 100000));
      }

      return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 === 0 ? "" : " " + numToWords(n % 10000000));
  } else {
      console.log("Out of Bound Limits");
      return 0;
  }
}

const sendInvoiceToEmail = async ({ email, doc, filename }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_USERPASSWORD
      }
    });

    const mailOptions = {
      from: '"JuristBot" <noreply@juristbot.ai>',
      to: email,
      bcc: 'accounts@neuronestai.in',
      subject: 'Invoice Bill',
      text: 'Here you can find the attached invoice of JuristBot for the current month payment.',
      attachments: [
        {
          filename,
          content: doc, 
          contentType: 'application/pdf',
          encoding: 'base64'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent:', info.messageId);
    return info.messageId;

  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    throw error;
  }
};



let s3Client;
let awsSecrets;
const initializeS3 = async () => {
  if (!s3Client || !awsSecrets) {
    awsSecrets = await getAwsSecrets();
    s3Client = new S3Client({
      region: awsSecrets.region,
      credentials: {
        accessKeyId: awsSecrets.accessKeyId,
        secretAccessKey: awsSecrets.secretAccessKey,
      },
    });
  }
};

const uploadToS3 = async (bucket, key, buffer) => {
  await initializeS3();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf'
  });

  return await s3Client.send(command);
};

  const sendInvoice=async({buyerDetails,invoiceDetails,lineItems,taxPercent})=>{
  const invoiceNo = invoiceDetails.invoiceNo
  const tableBody = [
    ["Description","HSN/SAC Code","Units","Rate","Amount"],
    ]
    let summaryValues={taxableAmount:0,total:0}
    lineItems = lineItems.map((line)=>{
      summaryValues.taxableAmount+=line[4];
      summaryValues.total+=line[4];
      line.rate = `₹ `+line[4];
      line.amount = `₹ `+ line[4]
      return line;
    });
    
  tableBody.splice(1,0,...lineItems)
  let taxList=[];
  if(buyerDetails?.state?.toLowerCase().includes("tamil")){
    taxList = ["CGST","SGST"]
  }else{
    taxList = ["IGST"]
  }

  let totalTaxAmount= 0
 
  const taxRows = taxList.map((txType)=>{
    const curr_tax_percent = taxPercent/taxList.length
    const curr_tax_amt = (curr_tax_percent/100)*summaryValues.total
    
    totalTaxAmount += curr_tax_amt;
    return ['','','',`${txType} ${curr_tax_percent}%`,`₹ ${curr_tax_amt}`]
  })

// Round off logic
    const rawFinalAmount = summaryValues.total + totalTaxAmount;
    const roundedFinalAmount = Math.round(rawFinalAmount);
    const roundOff = parseFloat((roundedFinalAmount - rawFinalAmount).toFixed(2)); // Could be +ve or -ve

    const summaryRows = [
      ['', '', '', 'Total', `₹ ${summaryValues.total.toFixed(2)}`],
      ['', '', '', 'Taxable Amount', `₹ ${summaryValues.taxableAmount.toFixed(2)}`],
      ...taxRows,
      ['', '', '', 'Round Off', `₹ ${roundOff >= 0 ? roundOff.toFixed(2) : `(${Math.abs(roundOff).toFixed(2)})`}`],
      [
        { text: numToWords(roundedFinalAmount), alignment: "left", colSpan: 3 }, '', '',
        { text: "Total Amount INR:" }, { text: `₹ ${roundedFinalAmount.toFixed(2)}`, alignment: 'right' }
      ]
    ];

  summaryRows.splice(2,0,...taxRows)
  
  const invoiceDefinition = {
    pageSize: "A4",
    fontF:"Roboto",
    fontSize: 11,
    pageMargins: [40,60,40,300],
    fontName: "normal",
    compress:false,
    header:{
      compress:false,
      margin: [15,10],
      svg: headerSVG
    },
    
    content: [ 
      { style:["topTable"],
      table: {
          // Define each column width
          widths: ['*', 'auto'],
          body: [
              [
                  // First cell for the left column
                  {   
                    border: [false,true,true,false],
                    borderColor:[false,"#D7DAE0","#D7DAE0",false],
                    stack: [
                          {
                            text: 'Neuronest AI Private Limited',
                            style: 'header'
                          },
                          {
                            stack: [
                              {
                                text: [
                                  '3G, A block, Pioneer Apartments,\n',
                                  'Avinashi Rd, Coimbatore 641018\n',
                                  'Tamil Nadu.\n',
                                  '965-544-2477\n',
                                ],
                                style: "info1"
                              },
                              {
                                text: [
                                'info@neuronestai.in\n',
                                'PAN: AAJCN3143M\n',
                                'GST: 33AAJCN3143M1ZC'   
                                ],
                                style: "info2"
                              }
                            ]
                          },
                          
                      ],
                      style: 'leftCol'
                  },
                  // Second cell for the right column
                  {   
                      border: [false,true,false,true],
                      borderColor: ["","#D7DAE0","","#D7DAE0"],
                      rowSpan:2,
                      lineWidth: 0.5,
                      table: {
                          widths: ["*","*"],
                          body: [
                            [ { text: "Invoice Date",style:"label" },{text: "Invoice Number",style:"label"} ],
                            [ { text: invoiceDetails.invoiceDate,style:"value" },{text: invoiceNo,style:"value"} ],
                            [ {text: "Billing Period",style: "label"},{text:"Order Ref",style:"label"} ],
                            [ { text: invoiceDetails.billPeriod ,style:"value" },{text: invoiceDetails.orderNo,style:"value"} ],
                            [ {text: "Payment Ref",style: "label"},{text:"Payment Terms",style:"label"} ],
                            [ { text: invoiceDetails.payRef,style:"value" },{svg:paidStampSVG,style:{margin:0,lineWidth:1}} ],
                          ],
                        },
                      layout: "noBorders",
                      style: 'rightCol'
                  }
              ],
              [
                {
                  border: [false,true,true,true],
                  borderColor: ["","#D7DAE0","#D7DAE0","#D7DAE0"],
                  stack:[
                    {
                      text: ['Buyer\n',"\n"+buyerDetails.username],
                      style: 'subHeader'
                  },
                  {   
                      text: [
                         
                        `${buyerDetails.town}\n`,
                        `${buyerDetails.state}\n`,
                        `${buyerDetails.mobile_no}\n`,
                        `${buyerDetails.gst_number || buyerDetails.email}\n`,
                      ],
                      style: 'info1'
                  }
                  ],
                  style: "leftCol"
                }
              ]
          ],
      },
      layout: {
        defaultBorder:"noBorders",// Removes borders from table
      } 
    },{
      style: "mainTable",
      table: {
        headerRows:1,
        width: ['*',"*","*","*","*"],
        body: tableBody,
        dontBreakRows: true,
        keepWithHeaderRows: 2
      },
      layout: "lightHorizontalLines"
    }
  ],
  "styles":{
        mainTable: {
          "margin": [0,20,0,0],
          alignment: "center",
        },
        topTable: {
          "margin": [0,10,0,0],
        },
        footerTable: {
          italics:true,
          margin: [10,0],
          fontSize: 11
        },
        header: {
          // fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 10]
      },
      subHeader: {
          // fontSize: 12,
          bold: true,
          color: 'black',
          margin: [0, 0, 0, 5]
      },
      info1: {
          color: "grey",
          margin: [0, 2, 0, 2]
      },
      info2: {
          margin: [0, 2, 0, 2]
      },
      value: {
          color: 'grey',
          width: '50%',
          lineHeight:2.5,
          // fontSize: 10
        },
        label: {
          width: '50%',
          bold: true,
          lineHeight:2.5,
          // fontSize: 10
      },
      leftCol: {
        margin: [0, 0, 0, 0] // Right margin for space between columns
      },
      rightCol: {
          alignment: "left",
          margin: [20, 0, 0, 0] // Left margin for space between columns
      }
      },
      defaultStyle: {
        columnGap: 10
      },
    footer: function(currentPage, pageCount) {
      let isLastPage = currentPage === pageCount;
  
      // Setup footer content dynamically
      let footerContents = [
          {
              svg: footerSVG,
              width: 510,
              alignment: 'center',
              margin: [0, 0, 0, 0] // Adjust as needed
          },
          {
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: 'center',
              italics: true,
              fontSize: 10
          }
      ];
  
        // Conditionally add summary table on the last page
        if (isLastPage) {
            footerContents.unshift({
              style: "footerTable",
                table: {
                    widths: ['*', 'auto', 'auto', '*', '*'],
                    body: summaryRows,
                  },
                alignment: "right",
                layout: 'noBorders'
            });
        }
      
      return {
          stack: footerContents,
          margin: [40, isLastPage ?  0 : 100, 40, 0] 
      };
    }
  }
  const pdfDoc = printer.createPdfKitDocument(invoiceDefinition)
  const pdfChunks=[]

  pdfDoc.on('data', chunk => pdfChunks.push(chunk));
  pdfDoc.on('end', async () => {
    const pdfBuffer = Buffer.concat(pdfChunks);
  const sanitizeFilename = (name) => {
  const sanitized = name.replace(/[\/\\?%*:|"<>#;]/g, '_');
   return sanitized.startsWith('_') ? sanitized.slice(1) : sanitized;
    };
   const sanitizedInvoiceName = sanitizeFilename(invoiceDetails.invoiceNo);
   const s3Key = `invoicepdf/${sanitizedInvoiceName}.pdf`;
    try {
        await uploadToS3('jurist-bot', s3Key, pdfBuffer);
        sendInvoiceToEmail({
            email: buyerDetails.email,
            doc: pdfBuffer,
            filename: sanitizedInvoiceName
        });
    } catch (error) {
        console.error('Error uploading to S3 or sending email:', error);
    }
});
  
  pdfDoc.end()
}
module.exports = sendInvoice