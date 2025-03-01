const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


const { PassThrough } = require("stream");

const generatePDF = (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = new PassThrough();

        let buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });

        doc.on("error", (err) => reject(err));

        // **📝 Add Content to the PDF**
        doc.fontSize(20).text("Appointment Confirmation", { align: "center" }).moveDown(1);
        doc.fontSize(14).text(`Patient Name: ${data.patientname}`);
        doc.text(`Phone No: ${data.phoneno}`);
        doc.text(`Description: ${data.description}`);
        doc.text(`Problem: ${data.problem}`);
        doc.text(`Doctor: ${data.doctor}`);
        doc.text(`Appointment Date: ${data.createdat}`);
        doc.text(`Token Number: ${data.nextTokenNumber}`);
        
        // Finalize PDF
        doc.end();
    });
};

module.exports = generatePDF;

